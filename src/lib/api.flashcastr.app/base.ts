import axios, { AxiosInstance } from "axios";

export abstract class BaseApi {
  protected readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "https://api.flashcastr.app",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
