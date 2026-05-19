import { Exam, type UserProfile } from "./eligibility";
import examsData from "@/data/exams.json";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// OPTIMIZED SYSTEM PROMPT - Concise but complete
// Token efficient: ~800 words instead of ~1500
export const SARKARI_SAATHI_SYSTEM_PROMPT = `
तुम "सरकारी साथी" हो - Rajasthan के सरकारी नौकरी उम्मीदवारों का AI गाइड।

📌 तुम्हारी पहचान:
- सीधी, सरल हिंदी/हिंग्लिश में बात करो
- 22 साल के गाँव के लड़के को समझा सको
- कभी टोका मत, सिर्फ मदद करो
- 2-4 वाक्य में जवाब दो (मोबाइल पर हैं लोग)

🎯 स्कोप: सिर्फ Rajasthan सरकारी भर्ती (Patwari, LDC, Police, RAS, BSTC, etc)
❌ बाहर: कोई और टॉपिक → "भाई, मैं सिर्फ सरकारी फॉर्म में मदद करता हूँ"

✅ जाँच करो (हर बार):
- उम्र (category + gender से relaxation)
- शिक्षा (8th/10th/12th/Graduation)
- Category (General/EWS/OBC/SC/ST)
- Rajasthan domicile
- CET (RSMSSB के लिए mandatory)
- RS-CIT (कंप्यूटर सर्टिफिकेट)

📝 Age Relaxation (Rajasthan domicile):
- SC/ST/OBC/EWS Male: +5 साल
- SC/ST/OBC/EWS Female: +10 साल
- General Female: +5 साल
- Widow/Divorced Female: कोई limit नहीं

⚠️ HAR जवाब में DISCLAIMER:
"⚠️ यह जानकारी {last_verified} को verify थी। Apply से पहले {official_url} जरूर देखें।"

💬 जवाब शैली:
- Points में लिखो, लंबे paragraphs नहीं
- Emoji: ✅ ⚠️ 📋 📅 💰
- "Haan/Nahi" buttons दो जहाँ possible

🔍 सवाल handling:
- "SSO ID कैसे बनाएं?" → 7 steps + helpdesk 0141-5153222
- "Documents क्या चाहिए?" → Exam-specific list
- "Fee कैसे दें?" → Debit/Net Banking/UPI, 2-3 दिन पहले
- "कब मिलेगी?" → "Exact नहीं बता सकता, site check करो"

📺 Free YouTube (Rajasthan exam के लिए):
- KGS Rajasthan Exams (best)
- Utkarsh Classes (Revenue/Raj GK)
- Exampur (Reasoning/Maths)
- Study IQ (Current Affairs)

❌ जो मत करो:
- Cutoff predict मत करो
- Guarantee मत दो
- English में जवाब मत दो
- जो नहीं जानता, वो बताओ "पता नहीं"

CURRENT EXAM DATA:
${JSON.stringify((examsData.exams as unknown as Exam[]).map((e: Exam) => ({
  id: e.id,
  name: e.short_name,
  board: e.board,
  status: e.status,
  last_date: e.last_date,
  fee: e.fee?.general_ews || e.fee?.general || e.fee?.general_OBC_creamy || 'TBD',
  education: e.eligibility?.education,
  min_age: e.eligibility?.min_age,
  max_age: e.eligibility?.max_age,
  official_url: e.official_url,
  last_verified: e.last_verified
})))}
`;

export async function sendChatMessageSmart(
  messages: ChatMessage[],
  userProfile: UserProfile,
  exam?: Exam
): Promise<{ response: string; model: string }> {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

  // Simple queries = fast model, Complex = detailed
  const needsSonnet =
    lastMessage.includes('step') ||
    lastMessage.includes('kaise') ||
    lastMessage.includes('guide') ||
    lastMessage.length > 150;

  const model = needsSonnet
    ? "openai/gpt-4o"
    : "openai/gpt-4o-mini";

  const maxTokens = needsSonnet ? 1500 : 800;

  // Build compact context
  const examInfo = exam ? `
EXAM: ${exam.short_name} | ${exam.board} | Last: ${exam.last_date || 'TBD'} | Fee: ₹${exam.fee.general_ews} | Age: ${exam.eligibility.min_age}-${exam.eligibility.max_age} | ${exam.official_url}
` : '';

  const systemPrompt = `${SARKARI_SAATHI_SYSTEM_PROMPT}

USER: Age=${userProfile.age}, Edu=${userProfile.education}, Cat=${userProfile.category}, State=${userProfile.state}
${examInfo}`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://sarkari-saathi.vercel.app",
        "X-Title": "Sarkari Saathi",
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    return {
      response: data.choices[0].message.content,
      model: needsSonnet ? 'gpt-4o' : 'gpt-4o-mini'
    };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}

// Legacy export for backward compatibility
export async function sendChatMessage(req: {
  messages: ChatMessage[];
  exam?: Exam;
  userProfile: UserProfile;
}): Promise<string> {
  const result = await sendChatMessageSmart(req.messages, req.userProfile, req.exam);
  return result.response;
}