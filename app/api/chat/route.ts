import { NextRequest, NextResponse } from "next/server";
import { sendChatMessageSmart, type ChatMessage } from "@/lib/ai";
import { getExamById } from "@/lib/eligibility";
import { getUserTier, incrementMessageCount, saveChatMessages, verifyUserSession } from "@/lib/supabase";

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { messages, examId, userProfile, userId, guestToken } = body;

    if (!messages || !examId || !userProfile) {
      return NextResponse.json({ error: "कृपया सभी जानकारी भरें" }, { status: 400 });
    }

    // Secure backend: Verify user session if userId is provided
    if (userId) {
      const isValid = await verifyUserSession(req, userId);
      if (!isValid) {
        return NextResponse.json({ error: "अनाधिकृत प्रवेश (Unauthorized Access)" }, { status: 401 });
      }
    }

    // Get user tier and check limits
    const effectiveUserId = userId || null;
    const effectiveGuestToken = guestToken || null;
    const { tier, messagesUsed, limit } = await getUserTier(effectiveUserId, effectiveGuestToken);

    if (messagesUsed >= limit) {
      return NextResponse.json({
        error: 'LIMIT_REACHED',
        tier,
        action: tier === 'guest' ? 'LOGIN' : tier === 'registered' ? 'PAYMENT' : null
      }, { status: 429 });
    }

    const exam = getExamById(examId);
    if (!exam) {
      return NextResponse.json({ error: "भर्ती नहीं मिली" }, { status: 404 });
    }

    const chatMessages = messages as ChatMessage[];

    const { response, model } = await sendChatMessageSmart(chatMessages, userProfile, exam);

    // Increment counter
    const newUsedCount = messagesUsed + 1;
    await incrementMessageCount(effectiveUserId, effectiveGuestToken, messagesUsed);

    // Save chat history for logged-in users
    if (effectiveUserId) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      await saveChatMessages(effectiveUserId, examId, lastUserMsg, response);
    }

    const remaining = limit - newUsedCount;
    const warning = remaining <= 2 ? `REMAINING_${remaining}` : null;

    return NextResponse.json({
      response,
      model_used: model,
      remaining,
      messagesUsed: newUsedCount,
      tier,
      limit,
      warning
    });
  } catch (error) {
    console.error("Chat route error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "कुछ problem हो गई। कृपया दोबारा कोशिश करें।", details: errorMessage },
      { status: 500 }
    );
  }
}