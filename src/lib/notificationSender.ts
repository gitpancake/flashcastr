export type SendFrameNotificationResult =
  | {
      state: "error";
      error: unknown;
    }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

export interface FrameNotificationSender {
  send(params: { fid: number; title: string; body: string }): Promise<SendFrameNotificationResult>;
}
