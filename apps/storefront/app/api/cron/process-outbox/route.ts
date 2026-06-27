import { NextResponse, connection, after } from "next/server";
import { orderService } from "@nhatnang/database/services";
import { env as dbEnv } from "@nhatnang/database";
import { env as appEnv } from "@/env";
import { HTTP_STATUS } from "@nhatnang/shared/constants";
import { resend } from "@nhatnang/database/auth";

export async function POST(request: Request) {
  await connection();
  try {
    // 1. Authenticate with CRON_SECRET token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${appEnv.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: HTTP_STATUS.UNAUTHORIZED },
      );
    }

    // 2. Parse dynamic limit parameter (max 50, default 10)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    // Fetch and lock pending outbox events via database service (limit, skip locked)
    const pendingEvents = await orderService.fetchPendingOutboxEvents(limit);
    if (pendingEvents.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending outbox events to process.",
        processedCount: 0,
      });
    }

    // 3. Process each event in parallel in the background
    after(async () => {
      try {
        await Promise.all(
          pendingEvents.map(async (event) => {
            let success = false;
            let lastError: string | null = null;

            try {
              if (event.eventType === "SEND_MAIL") {
                const payload = event.payload as {
                  to: string;
                  subject: string;
                  body: string;
                };
                const senderEmail =
                  dbEnv.EMAIL_FROM || "Hyundai Nhat Nang <onboarding@resend.dev>";

                const mailRes = await resend.emails.send({
                  from: senderEmail,
                  to: payload.to,
                  subject: payload.subject,
                  html: payload.body,
                });

                if (mailRes.error) {
                  throw new Error(`Resend error: ${JSON.stringify(mailRes.error)}`);
                }
                success = true;
              } else if (event.eventType === "SEND_TELEGRAM_ALERT") {
                const payload = event.payload as {
                  message: string;
                  channelId?: string;
                };
                const botToken = appEnv.TELEGRAM_BOT_TOKEN;
                const adminChatId =
                  payload.channelId || appEnv.TELEGRAM_ADMIN_CHAT_ID;

                if (!botToken || !adminChatId) {
                  throw new Error(
                    "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID env variables.",
                  );
                }

                const telegramRes = await fetch(
                  `https://api.telegram.org/bot${botToken}/sendMessage`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: adminChatId,
                      text: payload.message,
                      parse_mode: "HTML",
                    }),
                  },
                );

                if (!telegramRes.ok) {
                  const errorText = await telegramRes.text();
                  throw new Error(
                    `Telegram API returned status ${telegramRes.status}: ${errorText}`,
                  );
                }
                success = true;
              } else {
                // Skip other event types (ZNS/SMS) for simplicity
                success = true;
              }
            } catch (err) {
              lastError = err instanceof Error ? err.message : String(err);
              console.error(
                `[process-outbox] Error processing event ${event.id}:`,
                err,
              );
            }

            // Update database status via database service
            if (success) {
              await orderService.updateOutboxEventStatus(event.id, "PROCESSED");
            } else {
              const newRetryCount = event.retryCount + 1;
              const isFailed = newRetryCount >= 3;
              const nextStatus = isFailed ? "FAILED" : "PENDING";

              await orderService.updateOutboxEventStatus(
                event.id,
                nextStatus,
                lastError || undefined,
              );

              // If failed, trigger Telegram alert to admin channel (Human backstop)
              if (isFailed) {
                const botToken = appEnv.TELEGRAM_BOT_TOKEN;
                const adminChatId = appEnv.TELEGRAM_ADMIN_CHAT_ID;
                if (botToken && adminChatId) {
                  try {
                    await fetch(
                      `https://api.telegram.org/bot${botToken}/sendMessage`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          chat_id: adminChatId,
                          text: `🚨 <b>ALERT: Outbox Event Failure</b>\nEvent ID: <code>${event.id}</code> failed after 3 retries.\nError: <code>${lastError}</code>\nManual intervention required.`,
                          parse_mode: "HTML",
                        }),
                      },
                    );
                  } catch (alertErr) {
                    console.error(
                      "[process-outbox] Failed to send failure alert to Telegram:",
                      alertErr,
                    );
                  }
                }
              }
            }
          })
        );
      } catch (error) {
        console.error("[process-outbox:after error]", error);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Outbox processing initiated in the background.",
      processedCount: pendingEvents.length,
    });
  } catch (error) {
    console.error("[cron:process-outbox error]", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
