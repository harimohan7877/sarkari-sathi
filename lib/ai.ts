import { Exam, type UserProfile } from "./eligibility";
import examsData from "@/data/exams.json";
import { getAdminSettings } from "./supabase";

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
- "कब मिलेगी?" → "Exact नहीं बता सकता, site check karo"

Free YouTube (Rajasthan exam के लिए):
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

  // 1. Load active AI provider and key from admin settings (DB with env fallback)
  const settings = await getAdminSettings();
  const provider = settings.active_provider;

  // Decide if we need a smarter model based on query complexity
  const needsSonnet =
    lastMessage.includes('step') ||
    lastMessage.includes('kaise') ||
    lastMessage.includes('guide') ||
    lastMessage.length > 150;

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

  // 2. Dispatch to the correct AI Provider
  if (provider === 'gemini') {
    const key = settings.gemini_key || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini API Key is not configured in Admin Settings or env.");

    const modelName = "gemini-2.0-flash";
    
    // Format messages for Gemini API
    const contents = apiMessages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens
        }
      })
    });

    if (!res.ok) {
      const errTxt = await res.text();
      console.error("Gemini API error:", res.status, errTxt);
      throw new Error(`Gemini API error: ${res.status} - ${errTxt.substring(0, 200)}`);
    }

    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts||[]).map((p: any) => p.text||'').join('');
    return {
      response: text,
      model: modelName
    };
  }

  if (provider === 'openai') {
    const key = settings.openai_key || process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OpenAI API Key is not configured in Admin Settings or env.");

    const modelName = needsSonnet ? "gpt-4o" : "gpt-4o-mini";

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: apiMessages,
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const errTxt = await res.text();
      console.error("OpenAI API error:", res.status, errTxt);
      throw new Error(`OpenAI API error: ${res.status} - ${errTxt.substring(0, 200)}`);
    }

    const data = await res.json();
    return {
      response: data.choices[0].message.content,
      model: modelName
    };
  }

  if (provider === 'claude') {
    const key = settings.claude_key || process.env.CLAUDE_API_KEY;
    if (!key) throw new Error("Claude API Key is not configured in Admin Settings or env.");

    const modelName = needsSonnet ? "claude-3-5-sonnet-20241022" : "claude-3-5-haiku-20241022";

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: apiMessages.filter(m => m.role !== 'system').map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });

    if (!res.ok) {
      const errTxt = await res.text();
      console.error("Claude API error:", res.status, errTxt);
      throw new Error(`Claude API error: ${res.status} - ${errTxt.substring(0, 200)}`);
    }

    const data = await res.json();
    const text = (data.content||[]).map((b: any) => b.text||'').join('');
    return {
      response: text,
      model: modelName
    };
  }

  // Default: OpenRouter
  const key = settings.openrouter_key || settings.openai_key || process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OpenRouter API Key is not configured in Admin Settings or env.");

  const modelName = needsSonnet ? "openai/gpt-4o" : "openai/gpt-4o-mini";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://sarkari-saathi.vercel.app",
      "X-Title": "Sarkari Saathi",
    },
    body: JSON.stringify({
      model: modelName,
      messages: apiMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter API error:", response.status, errorText);
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    model: modelName
  };
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