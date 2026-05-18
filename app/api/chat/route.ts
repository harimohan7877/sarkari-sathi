import { NextRequest, NextResponse } from "next/server";
import { sendChatMessageSmart, type ChatMessage } from "@/lib/ai";
import { getExamById } from "@/lib/eligibility";
import { getUserTier, incrementMessageCount, saveChatMessages, supabaseAdmin } from "@/lib/supabase";

const AUTO_LOGIN_PROMPT = `
Yeh user ka 4th question hai (guest tier).
Jawab dene ke baad HAMESHA yeh add karo (natural tarike se):

---
💡 **आपके लिए एक सुझाव:**
आपके पास अभी 1 और FREE सवाल बचा है। Login करने पर 5 और FREE सवाल मिलेंगे — साथ ही पूरा Syllabus, Previous Year Papers और Study Material भी।

Login बिल्कुल आसान है — सिर्फ email और एक OTP।
---
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, examId, userProfile, userId, guestToken } = body;

    if (!messages || !examId || !userProfile) {
      return NextResponse.json({ error: "कृपया सभी जानकारी भरें" }, { status: 400 });
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

    // Add auto-login prompt for guest's 4th message
    let chatMessages = messages as ChatMessage[];
    if (tier === 'guest' && messagesUsed === 3) {
      chatMessages = [...chatMessages];
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg && lastMsg.role === 'user') {
        lastMsg.content = lastMsg.content + '\n\n[SYSTEM NOTE: ' + AUTO_LOGIN_PROMPT + ']';
      }
    }

    const { response, model } = await sendChatMessageSmart(chatMessages, userProfile, exam);

    // Increment counter
    await incrementMessageCount(effectiveUserId, effectiveGuestToken, messagesUsed);

    // Save chat history for logged-in users
    if (effectiveUserId) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      await saveChatMessages(effectiveUserId, examId, lastUserMsg, response);
    }

    const remaining = limit - messagesUsed - 1;
    const warning = remaining <= 2 ? `REMAINING_${remaining}` : null;

    return NextResponse.json({
      response,
      model_used: model,
      remaining,
      warning,
      tier
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