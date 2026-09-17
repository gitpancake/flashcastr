import { notificationDetailsSchema } from "@farcaster/frame-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "~/lib/apiGuard";
import { setUserNotificationDetails } from "~/lib/kv";
import { sendNeynarFrameNotification } from "~/lib/neynar/notification";
import { sendFrameNotification } from "~/lib/notifs";

const requestSchema = z.object({
  notificationDetails: notificationDetailsSchema,
});

export const POST = withApiGuard(
  async (request, { fid: sessionFid }) => {
    // If Neynar is enabled, we don't need to store notification details
    // as they will be managed by Neynar's system
    const neynarEnabled = process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID;

    const requestJson = await request.json();
    const requestBody = requestSchema.safeParse(requestJson);

    if (requestBody.success === false) {
      return NextResponse.json({ success: false, errors: requestBody.error.errors }, { status: 400 });
    }

    // Only store notification details if not using Neynar
    if (!neynarEnabled) {
      await setUserNotificationDetails(sessionFid, requestBody.data.notificationDetails);
    }

    // Use appropriate notification function based on Neynar status
    const sendNotification = neynarEnabled ? sendNeynarFrameNotification : sendFrameNotification;
    const sendResult = await sendNotification({
      fid: sessionFid,
      title: "Test notification",
      body: "Sent at " + new Date().toISOString(),
    });

    if (sendResult.state === "error") {
      return NextResponse.json({ success: false, error: sendResult.error }, { status: 500 });
    } else if (sendResult.state === "rate_limit") {
      return NextResponse.json({ success: false, error: "Rate limited" }, { status: 429 });
    }

    return NextResponse.json({ success: true });
  },
  { unauthorized: () => NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) }
);
