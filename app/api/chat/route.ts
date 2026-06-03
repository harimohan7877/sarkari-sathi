import { NextRequest } from "next/server";
import { streamChatMessage, type ChatMessage } from "@/lib/ai";
import { getExamById } from "@/lib/eligibility";
import { getUserTier, incrementMessageCount, saveChatMessages, verifyUserSession } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, examId, userProfile, userId, guestToken, customApiProvider, customApiKey } = body;

    if (!messages || !examId || !userProfile) {
      return new Response(JSON.stringify({ error: "कृपया सभी जानकारी भरें" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (userId) {
      const isValid = await verifyUserSession(req, userId);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const effectiveUserId = userId || null;
    const effectiveGuestToken = guestToken || null;
    const { tier, messagesUsed, limit } = await getUserTier(effectiveUserId, effectiveGuestToken);

    const hasCustomKey = customApiKey && customApiProvider;

    if (!hasCustomKey && messagesUsed >= limit) {
      return new Response(
        JSON.stringify({ error: "LIMIT_REACHED", tier, messagesUsed, limit }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const exam = getExamById(examId);
    if (!exam) {
      return new Response(JSON.stringify({ error: "भर्ती नहीं मिली" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chatMessages = messages as ChatMessage[];
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {}
        };

        let fullResponse = "";
        let modelUsed = "unknown";

        try {
          send({ type: "start", tier, limit });

          const gen = streamChatMessage(
            chatMessages,
            userProfile,
            exam,
            customApiProvider,
            customApiKey
          );
          for await (const chunk of gen) {
            fullResponse += chunk;
            send({ type: "chunk", content: chunk });
          }
          modelUsed = "streamed";

          // Increment counter and persist
          const newUsedCount = messagesUsed + 1;
          try {
            await incrementMessageCount(effectiveUserId, effectiveGuestToken, messagesUsed);
          } catch (e) {
            console.error("Increment failed:", e);
          }

          if (effectiveUserId && fullResponse) {
            try {
              const lastUserMsg = messages[messages.length - 1]?.content || "";
              await saveChatMessages(effectiveUserId, examId, lastUserMsg, fullResponse);
            } catch (e) {
              console.error("Save failed:", e);
            }
          }

          const remaining = limit - newUsedCount;
          send({
            type: "done",
            messagesUsed: newUsedCount,
            limit,
            tier,
            remaining,
            model: modelUsed,
          });
          controller.close();
        } catch (err: any) {
          console.error("Stream error:", err);
          send({ type: "error", error: err.message || "Server error" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
