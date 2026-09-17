import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export abstract class BaseApi {
  protected readonly api: AxiosInstance;

  constructor() {
    if (!process.env.NEXT_PUBLIC_FLASHCASTR_API_URL) {
      throw new Error("NEXT_PUBLIC_FLASHCASTR_API_URL is not set");
    }

    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_FLASHCASTR_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  protected async graphql<T>(
    query: string,
    variables?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.api.post("/graphql", { query, variables }, config);

    if (response.data.errors) {
      console.error("GraphQL errors:", response.data.errors);
      throw new Error(response.data.errors[0]?.message || "GraphQL query failed");
    }

    return response.data.data;
  }
}
