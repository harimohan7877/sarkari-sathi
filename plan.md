# 🏛️ सरकारी साथी (Sarkari Saathi) - UI/UX Redesign Specifications (Updated with Custom API Key & Mobile-First Design)

यह दस्तावेज़ **सरकारी साथी** पोर्टल के UI/UX को 2026 के सर्वश्रेष्ठ प्रोजेक्ट्स के अनुसार आधुनिक, आकर्षक, सुपर-मोबाइल-फ्रेंडली (Mobile-First) और व्यावसायिक (professional) बनाने के लिए एक विस्तृत तकनीकी विनिर्देश (Technical Specifications) प्रदान करता है।

इसमें उपयोगकर्ता द्वारा अनुरोधित **"Custom API Key"** सिस्टम को पुनः स्थापित करने और लेआउट को **अत्यंत मोबाइल-फ्रेंडली** बनाने के निर्देश शामिल हैं।

---

## 🎨 1. Global Design System (`app/globals.css`)

`app/globals.css` को 2026 की आधुनिक डिज़ाइन प्रवृत्तियों (Teal/Indigo gradients, Glassmorphism, Premium Shadows) के अनुसार अपडेट करें:

### 🌈 Color System (HSL Colors)
```css
:root {
  /* HSL Colors for smooth transitions */
  --primary-navy: hsl(222, 47%, 12%);      /* Deep Rich Navy */
  --primary-royal: hsl(217, 91%, 60%);     /* Electric Blue */
  --accent-saffron: hsl(24, 100%, 50%);    /* Glowing Saffron */
  --accent-saffron-hover: hsl(24, 100%, 43%);
  --accent-saffron-light: hsl(24, 100%, 97%);
  
  --success-green: hsl(142, 70%, 29%);     /* Tiranga Green */
  --success-green-light: hsl(142, 70%, 95%);
  
  /* Slate/Blue Greys instead of plain grey */
  --bg-app: hsl(210, 40%, 98%);
  --bg-card: hsl(0, 0%, 100%);
  --bg-input: hsl(210, 40%, 96%);
  
  /* Borders and Shadows */
  --border-glass: rgba(255, 255, 255, 0.4);
  --border-card: hsl(214, 32%, 91%);
  --shadow-premium: 0 10px 30px -10px rgba(15, 43, 91, 0.08), 0 1px 3px rgba(15, 43, 91, 0.02);
}
```

### 🔤 Typography & Imports
* Google Fonts से **Outfit** (संख्याओं और अंग्रेजी पाठ के लिए) तथा **Noto Sans Devanagari** (स्वच्छ हिंदी लेआउट के लिए) इम्पोर्ट करें:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;900&display=swap');
  ```

### 📱 Mobile-First Responsive Rules
* **Touch Targets**: मोबाइल पर सभी बटन कम से कम `48px` (h-12) ऊंचे होने चाहिए ताकि आसानी से टैप किया जा सके।
* **Responsive Layout**: डेस्कटॉप पर `max-w-7xl` और ग्रिड लेआउट, लेकिन मोबाइल पर यह एक प्रीमियम सिंगल-कॉलम नेटिव ऐप जैसा दिखना चाहिए।
* मोबाइल पर नीचे सुरक्षित क्षेत्र पैडिंग (`pb-safe`) और फ्लोटिंग बॉटम शीट का उपयोग करें।

---

## 🏛️ 2. Home / Landing Page (`app/page.tsx`)

होमपेज को मोबाइल-फर्स्ट और व्यावसायिक सरकारी जॉब पोर्टल के रूप में रिडिज़ाइन करें।

### 🌟 Hero & Quick Search
* **Hero Title**: *"🏛️ सरकारी साथी"* (Devanagari Bold, Saffron-to-Navy gradient text).
* **Subtitle**: *"राजस्थान सरकारी भर्ती पोर्टल - आपकी योग्यता, सही नौकरी"*
* **Integrated Search**: मोबाइल पर थम्ब-रीच (thumb-reach) के दायरे में एक सुंदर सर्च बार:
  `[ 🔍 परीक्षा या बोर्ड खोजें... ] ➡️ [खोजें]`

### 📊 Live Statistics Cards
* 3 ग्रिड कार्ड्स (मोबाइल पर हॉरिजॉन्टल स्क्रॉल होने योग्य):
  1. **सक्रिय भर्तियां**: "15+ लाइव भर्तियां" (सॉफ्ट ग्रीन पल्स एनीमेशन के साथ)।
  2. **सत्यापित बोर्ड्स**: "RPSC, RSMSSB, Police" (सत्यापित शील्ड आइकन)।
  3. **तैयारी सामग्री**: "50+ मुफ्त वीडियो और PYQs"।

### 📋 step-by-step Eligibility Wizard
पूरे फॉर्म को एक साथ दिखाने के बजाय 3-चरणों वाले विज़ार्ड (Step-by-Step Wizard) में विभाजित करें:
1. **चरण 1: व्यक्तिगत विवरण** (`step === 1`):
   * नाम (Name), शहर (City), लिंग (Gender - Male/Female बटन्स), आयु (Age - Input)।
2. **चरण 2: शैक्षणिक योग्यता** (`step === 2`):
   * शिक्षा स्तर (Education Dropdown), श्रेणी (Category Dropdown - General/EWS/OBC/SC/ST)।
3. **चरण 3: अतिरिक्त प्रमाणपत्र** (`step === 3`):
   * RS-CIT, CET Graduate Level, CET Senior Secondary Level (आकर्षक चेकबॉक्स कार्ड्स)।
* **Wizard Navigation Buttons**: `[🔙 पीछे]` और `[आगे बढ़ें ➡️ / 🔍 योग्य भर्तियाँ खोजें]`.

### 🏷️ Category Pills Quick Select
* यूजर फॉर्म भरने से पहले भी सीधे ब्राउज़ कर सके:
  * `[🎓 स्नातक पास]` `[💼 12वीं पास]` `[💻 कम्प्यूटर जॉब्स]` `[📋 CET आवश्यक]`

---

## 🔍 3. Results Page (`app/results/page.tsx`)

परिणामों को एक इंटरेक्टिव डैशबोर्ड के रूप में प्रस्तुत करें।

### 🖥️ Desktop Layout (Split-Screen)
* **Left Pane (30% width - Sticky Sidebar)**:
  * **"त्वरित बदलाव (Quick Adjust)"** फ़ॉर्म ताकि यूजर परिणाम देखते-देखते अपनी योग्यता बदल सके।
* **Right Pane (70% width)**:
  * योग्य परीक्षाओं का ग्रिड (`grid-cols-1` मोबाइल पर, `md:grid-cols-2` डेस्कटॉप पर)।

### 💳 Mobile-First Premium Exam Cards
* **Left Border Indicator**: कार्ड के बाईं ओर 6px चौड़ी कलर-कोडेड पट्टी (सक्रिय के लिए ग्रीन, आगामी के लिए सैफरॉन, समाप्त के लिए रेड)।
* **Apply Countdown**: `last_date` के आधार पर एक क्लीन प्रोग्रेस बार:
  * *"आवेदन बंद होने में 5 दिन शेष"* (लाल रंग का हल्का प्रोग्रेस बार)।
* **Interactive Button**: *"💬 चैट करें और तैयारी शुरू करें"* (हल्के सैफरॉन ग्रेडिएंट के साथ)।

---

## 🤖 4. AI Chat & Detail Workspace (`app/exam/[id]/page.tsx`)

यह ऐप का सबसे महत्वपूर्ण पेज है। इसे एक संपूर्ण मोबाइल-फ्रेंडली स्टडी वर्कस्पेस में बदलें।

### 🖥️ Dual-Pane Layout (Desktop)
* **Left Column (60% width) - Interactive AI Chat**:
  * चैट बबल्स:
    * **User Bubble**: `bg-gradient-to-r from-primary-navy to-primary-royal text-white rounded-2xl rounded-br-none`.
    * **AI Bubble**: `bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-none shadow-sm`.
* **Right Column (40% width) - Study Companion Pane**:
  * इसमें सुंदर टैब्स होंगे: `[📋 विवरण (Overview)]` `[📚 पाठ्यक्रम (Syllabus)]` `[📝 पुराने पेपर (PYQ)]` `[📄 दस्तावेज़]` `[🔗 लिंक]`
  * **लाभ**: यूजर बिना चैट बंद किए दाईं ओर सिलेबस देख सकता है।

### 📱 Mobile UI Layout & Floating Bottom Sheet
* मोबाइल पर डिफ़ॉल्ट रूप से AI चैट फुल-स्क्रीन दिखेगी।
* सबसे नीचे एक सुंदर **"Exam Study Material ⬆️"** स्लाइडर या बॉटम शीट (bottom sheet) होगी, जिसे स्वाइप अप करके पूरी जानकारी (Syllabus, PYQ, Links) दाईं ओर की तरह देखी जा सकेगी।

### 🔑 Custom API Key System (पुनः स्थापित करें)
* **Trigger Button**: चैट विंडो के हेडर में "Online" संकेतक के दाईं ओर एक `🔑 API Settings` बटन जोड़ें।
* **Key Input Modal**: जब यूजर इस बटन पर क्लिक करे, तो `showCustomKeyModal` को `true` करें और एक सुंदर मोडल दिखाएं जिसमें:
  * **प्रदाता (Provider) चयन**: Google Gemini, OpenAI, OpenRouter, Groq, Nvidia.
  * **API Key इनपुट**: प्रदाता के अनुसार चाबी डालने का स्थान।
  * **सहायता निर्देश (Help Links)**: प्रत्येक प्रदाता के लिए मुफ्त API Key बनाने का लिंक (जैसे Google AI Studio)।
* **Bypass Limit Logic**:
  * स्थानीय रूप से `localStorage.setItem("custom_user_keys")` में चाबियां सहेजें।
  * `sendMessage()` में, स्थानीय रूप से सहेजी गई कस्टम चाबी को लोड करें। यदि कस्टम चाबी मौजूद है, तो **दैनिक 5 मुफ्त संदेश की सीमा को बायपास (bypass)** करें और असीमित चैट की अनुमति दें।
  * `MessageCounter` घटक में `isCustomKeyActive={hasCustomKey}` पास करें ताकि यह प्रदर्शित हो सके: *"🔑 आपकी Custom API Key सक्रिय है (असीमित AI चैट)"*।

---

## 📊 5. Dashboard (`app/dashboard/page.tsx`)

डैशबोर्ड को छात्र के निजी तैयारी केंद्र (Personal Study Hub) के रूप में डिज़ाइन करें।

### 💍 Circular Limit Tracker
* AI उपयोग को दर्शाने के लिए एक सुंदर गोलाकार SVG प्रोग्रेस रिंग (Circular progress chart) बनाएं जो फ्री कोटा का प्रदर्शन करे।

### ⏳ Saved Exams Timeline
* सेव किए गए परीक्षाओं के आवेदन पत्र जमा करने की अंतिम तारीखों को एक सुंदर वर्टिकल टाइमलाइन (Vertical Timeline) के रूप में दिखाएं।

---

## 🔐 6. Auth Page (`app/auth/page.tsx`)

### 📱 Autogrow OTP Fields
* 6-अंकीय ओटीपी इनपुट को सिंगल टेक्स्ट बॉक्स के बजाय 6 अलग-अलग डिब्बों में विभाजित करें।
* जैसे ही उपयोगकर्ता एक अंक लिखे, फ़ोकस स्वचालित रूप से अगले इनपुट पर चला जाना चाहिए (`input.nextSibling.focus()`)।
* ओटीपी भेजने के बाद एक रीसेंड टाइमर (Resend Timer) दिखाएं: *"0:59 सेकंड में दोबारा भेजें"*.

---

## 🛠️ Claude Code के लिए कार्यान्वयन निर्देश (Implementation Sequence)

Claude Code को नीचे दिए गए क्रम में फाइलों को संशोधित करने का निर्देश दें:
1. **`app/globals.css`** ➡️ नए वेरिएबल्स, आउटफिट/देवनागरी फॉन्ट इम्पोर्ट और रेस्पॉन्सिव ग्रिड बेस सेट करें।
2. **`app/page.tsx`** ➡️ हीरो सर्च, लाइव स्टैट्स और 3-स्टेप एलिजिबिलिटी विज़ार्ड बनाएं।
3. **`app/results/page.tsx`** ➡️ डेस्कटॉप स्प्लिट-स्क्रीन लेआउट, प्रोग्रेस बार वाले एग्जाम कार्ड्स और टैब्ड कोर्स लिस्ट लागू करें।
4. **`app/exam/[id]/page.tsx`** ➡️ डुअल-पैनल वर्कस्पेस, मोबाइल बॉटम शीट, **Custom API Key Modal और सहेजने की लॉजिक** जोड़ें।
5. **`app/dashboard/page.tsx`** ➡️ सर्कुलर प्रोग्रेस बार और आगामी परीक्षाओं की डेडलाइन टाइमलाइन जोड़ें।
6. **`app/auth/page.tsx`** ➡️ 6-डिजिट ऑटो-फोकस ओटीपी बक्से और सुंदर साइड-पैनल लेआउट लगाएं।
7. **`components/MessageCounter.tsx`** ➡️ `isCustomKeyActive` के अनुसार असीमित चैट का संकेत प्रदर्शित करें।
