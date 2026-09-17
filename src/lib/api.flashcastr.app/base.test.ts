import { beforeEach, describe, expect, it, vi } from "vitest";
import { BaseApi } from "./base";

class TestApi extends BaseApi {
  public callGraphql<T>(query: string, variables?: Record<string, unknown>, config?: Record<string, unknown>): Promise<T> {
    return this.graphql<T>(query, variables, config);
  }
}

describe("BaseApi.graphql", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_FLASHCASTR_API_URL = "https://api.flashcastr.test";
  });

  it("resolves to the unwrapped data payload on success", async () => {
    const api = new TestApi();
    const post = vi.fn().mockResolvedValue({
      data: { data: { flashes: [{ flash_id: 1 }] } },
    });
    Object.assign(api, { api: { post } });

    const result = await api.callGraphql("query Flashes { flashes { flash_id } }");

    expect(result).toEqual({ flashes: [{ flash_id: 1 }] });
  });

  it("throws with the GraphQL error message when the response carries errors", async () => {
    const api = new TestApi();
    const post = vi.fn().mockResolvedValue({
      data: { errors: [{ message: "flash_id not found" }] },
    });
    Object.assign(api, { api: { post } });

    await expect(api.callGraphql("query Flash { flash { flash_id } }")).rejects.toThrow(
      "flash_id not found"
    );
  });

  it("passes the optional axios config through to the underlying post call", async () => {
    const api = new TestApi();
    const post = vi.fn().mockResolvedValue({ data: { data: { ok: true } } });
    Object.assign(api, { api: { post } });
    const config = { headers: { "X-API-KEY": "secret" } };

    await api.callGraphql("mutation { noop }", undefined, config);

    expect(post).toHaveBeenCalledWith("/graphql", expect.any(Object), config);
  });
});
