// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FadeInImage } from "./FadeInImage";

afterEach(() => {
  cleanup();
});

describe("FadeInImage", () => {
  it("renders the No Image placeholder when src is empty", () => {
    render(<FadeInImage src="" alt="Flash 1" fill />);

    expect(screen.getByText("No Image")).not.toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("falls back to the placeholder when the image fails to load", () => {
    render(<FadeInImage src="/img.png" alt="Flash 1" fill />);

    const img = screen.getByRole("img");
    fireEvent.error(img);

    expect(screen.getByText("No Image")).not.toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("does not log console errors or warnings for empty or valid src", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { unmount } = render(<FadeInImage src="" alt="Flash 1" fill />);
    unmount();
    render(<FadeInImage src="/img.png" alt="Flash 1" fill />);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
