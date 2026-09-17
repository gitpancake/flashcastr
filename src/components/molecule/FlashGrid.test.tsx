// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FlashGrid, type FlashCardData } from "./FlashGrid";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function buildItem(overrides: Partial<FlashCardData> = {}): FlashCardData {
  return {
    id: "1",
    flashId: 101,
    city: "Paris",
    player: "alice",
    imageSrc: "/img.png",
    timestampSeconds: Math.floor(Date.now() / 1000) - 30,
    onImageClick: vi.fn(),
    ...overrides,
  };
}

describe("FlashGrid", () => {
  it("renders a default card per item and fires onImageClick", () => {
    const onImageClick = vi.fn();
    const items = [buildItem({ flashId: 202, city: "Berlin", player: "bob", onImageClick })];

    render(<FlashGrid items={items} />);

    expect(screen.getByText("#202")).not.toBeNull();
    expect(screen.getByText("> Berlin")).not.toBeNull();
    expect(screen.getByText("@ bob")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "View flash #202" }));
    expect(onImageClick).toHaveBeenCalledTimes(1);
  });

  it("fires onPlayerClick when the player row is clicked", () => {
    const onPlayerClick = vi.fn();
    const items = [buildItem({ player: "carol", onPlayerClick })];

    render(<FlashGrid items={items} />);

    fireEvent.click(screen.getByRole("button", { name: "View profile of carol" }));
    expect(onPlayerClick).toHaveBeenCalledTimes(1);
  });

  it("shows SIGNAL LOST and calls onRetry when isError", () => {
    const onRetry = vi.fn();
    render(<FlashGrid items={[]} isError onRetry={onRetry} />);

    expect(screen.getByText("SIGNAL LOST")).not.toBeNull();
    fireEvent.click(screen.getByText("RETRY"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the empty state when items is empty", () => {
    render(<FlashGrid items={[]} />);

    expect(screen.getByText("NO FLASHES FOUND")).not.toBeNull();
    expect(screen.getByText("No flashes available")).not.toBeNull();
  });

  it("shows footer count and footerNote", () => {
    const items = [buildItem(), buildItem({ id: "2", flashId: 303 })];

    render(<FlashGrid items={items} footerNote="DATA SOURCE: FLASHCASTR API" />);

    expect(screen.getByText("SHOWING 2 FLASHES")).not.toBeNull();
    expect(screen.getByText("DATA SOURCE: FLASHCASTR API")).not.toBeNull();
  });

  it("uses renderCard override when provided", () => {
    const items = [buildItem({ flashId: 404 })];
    const renderCard = vi.fn((item) => (
      <div key={item.id} data-testid="custom-card">
        custom {item.flashId}
      </div>
    ));

    render(<FlashGrid items={items} renderCard={renderCard} />);

    expect(screen.getByTestId("custom-card").textContent).toBe("custom 404");
    expect(screen.queryByText("#404")).toBeNull();
    expect(renderCard).toHaveBeenCalledTimes(1);
  });

  it("does not create an IntersectionObserver when hasNextPage is undefined", () => {
    const items = Array.from({ length: 20 }, (_, index) =>
      buildItem({ id: String(index), flashId: index })
    );

    render(<FlashGrid items={items} />);

    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it("observes the sentinel item and calls fetchNextPage on intersection", () => {
    const fetchNextPage = vi.fn();
    const items = Array.from({ length: 20 }, (_, index) =>
      buildItem({ id: String(index), flashId: index })
    );

    render(
      <FlashGrid items={items} hasNextPage sentinelOffset={15} fetchNextPage={fetchNextPage} />
    );

    expect(MockIntersectionObserver.instances).toHaveLength(1);
    const [observerInstance] = MockIntersectionObserver.instances;
    expect(observerInstance.observe).toHaveBeenCalledTimes(1);

    observerInstance.callback([{ isIntersecting: true } as IntersectionObserverEntry], observerInstance as unknown as IntersectionObserver);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
