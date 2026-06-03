"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@nhatnang/ui/components/ui/card";
import { Button } from "@nhatnang/ui/components/ui/button";
import { Textarea } from "@nhatnang/ui/components/ui/textarea";
import { toast } from "@nhatnang/ui/components/ui/sonner";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import type { ComplexQuote } from "@nhatnang/database/services";
import { sendQuoteMessageAction } from "../actions";

interface QuoteNegotiationChatProps {
  quote: ComplexQuote;
  currentUserId: string;
}

export const QuoteNegotiationChat = ({
  quote,
  currentUserId,
}: QuoteNegotiationChatProps) => {
  const t = useTranslations("AdminQuotes");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [messageText, setMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sortedMessages = [...quote.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const isFinalized =
    quote.status === "approved" ||
    quote.status === "rejected" ||
    quote.status === "expired";

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;

    startTransition(async () => {
      const res = await sendQuoteMessageAction(quote.id, messageText.trim());
      if (res.success) {
        setMessageText("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to send message");
      }
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [quote.messages]);

  return (
    <Card className="flex h-[calc(100vh-280px)] min-h-112.5 flex-col gap-0 pb-0">
      <CardHeader className="shrink-0 border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          {t("negotiationChat")}
        </CardTitle>
        <CardDescription>{t("timelineChatDescription")}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
        {sortedMessages.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            {t("noMessages")}
          </div>
        ) : (
          sortedMessages.map((msg) => {
            const isSystem = msg.message.startsWith("[SYSTEM]");
            if (isSystem) {
              const displayMsg = msg.message.replace("[SYSTEM]", "").trim();
              return (
                <div key={msg.id} className="my-2 flex justify-center">
                  <div className="bg-muted text-muted-foreground max-w-[85%] rounded-md border px-3 py-1.5 text-center font-mono text-xs">
                    <span className="text-tertiary mr-1 font-semibold">
                      {t("timelineSystem")}:
                    </span>
                    {displayMsg}
                  </div>
                </div>
              );
            }

            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-muted-foreground mb-1 px-1 text-[10px]">
                  {msg.sender.name} •{" "}
                  {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white dark:bg-blue-700"
                      : "bg-muted text-foreground border"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </CardContent>

      <CardFooter className="bg-muted/20 shrink-0 border-t p-3!">
        <div className="flex w-full items-center justify-center gap-2">
          <Textarea
            placeholder={
              isFinalized
                ? "Quote negotiation is finalized and locked"
                : t("typeMessage")
            }
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={isFinalized || isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="h-11 max-h-20 min-h-11 resize-none py-2.5 focus-visible:ring-blue-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isFinalized || isPending || messageText.trim() === ""}
            size="icon"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
