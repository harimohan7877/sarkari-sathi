import { NextRequest, NextResponse } from "next/server";
import { sendChatMessageSmart, type ChatMessage } from "@/lib/ai";
import { getExamById, type Exam } from "@/lib/eligibility";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, examId, userProfile } = body;

    if (!messages || !examId || !userProfile) {
      return NextResponse.json(
        { error: "कृपया सभी जानकारी भरें" },
        { status: 400 }
      );
    }

    // Find exam data using the helper function
    const exam = getExamById(examId);
    if (!exam) {
      return NextResponse.json(
        { error: "भर्ती नहीं मिली" },
        { status: 404 }
      );
    }

    // Smart model selection (Sonnet for complex, Haiku for simple)
    const { response, model } = await sendChatMessageSmart(
      messages as ChatMessage[],
      userProfile,
      exam
    );

    return NextResponse.json({
      response,
      model_used: model
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "कुछ problem हो गई। कृपया दोबारा कोशिश करें।" },
      { status: 500 }
    );
  }
}