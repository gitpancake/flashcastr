import { describe, expect, it, vi } from "vitest";
import { getImageUrl } from "./getImageUrl";

describe("getImageUrl", () => {
  it("returns flash.image_url when present", () => {
    const result = getImageUrl({ image_url: "https://api.flashcastr.app/i/42" });

    expect(result).toBe("https://api.flashcastr.app/i/42");
  });

  it("returns an empty string when image_url is null", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = getImageUrl({ image_url: null });

    expect(result).toBe("");
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });

  it("returns an empty string when image_url is undefined", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = getImageUrl({});

    expect(result).toBe("");
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });
});
