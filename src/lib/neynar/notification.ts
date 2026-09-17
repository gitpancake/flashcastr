import { FrameNotificationSender, SendFrameNotificationResult } from "~/lib/notificationSender";
import neynarClient from "./client";

const neynarFrameNotificationSender: FrameNotificationSender = {
  async send({ fid, title, body }): Promise<SendFrameNotificationResult> {
    try {
      const targetFids = [fid];
      const notification = {
        title,
        body,
        target_url: process.env.NEXT_PUBLIC_URL!,
      };
      const result = await neynarClient.publishFrameNotifications({
        targetFids,
        notification,
      });

      if (result.notification_deliveries.length > 0) {
        return { state: "success" };
      } else if (result.notification_deliveries.length === 0) {
        return { state: "no_token" };
      } else {
        return { state: "error", error: result || "Unknown error" };
      }
    } catch (error) {
      return { state: "error", error };
    }
  },
};

export async function sendNeynarFrameNotification({ fid, title, body }: { fid: number; title: string; body: string }): Promise<SendFrameNotificationResult> {
  return neynarFrameNotificationSender.send({ fid, title, body });
}
