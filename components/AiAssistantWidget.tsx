"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AiAssistantWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    education: "",
    category: "",
    hasRSCIT: false,
    hasCET_graduate: false,
    hasCET_senior: false,
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canGoNext = () => {
    if (step === 1) return !!formData.gender && !!formData.age;
    if (step === 2) return !!formData.education && !!formData.category;
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.age || !formData.education || !formData.category || !formData.gender) return;
    setLoading(true);
    // Dummy submit logic for now, redirect to results
    setTimeout(() => {
      sessionStorage.setItem('userProfile', JSON.stringify(formData));
      router.push("/results");
      setIsOpen(false);
      setLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-[hsl(348,83%,47%)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : ''}`}
      >
        <span className="text-2xl drop-shadow-md">🤖</span>
        {/* Notification dot */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-[hsl(142,70%,50%)] border-2 border-white rounded-full animate-pulse"></span>
      </button>

      {/* Widget Modal/Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/20 backdrop-blur-sm">
          <div className="w-full sm:w-[400px] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] animate-slide-up">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[hsl(222,47%,12%)] to-[hsl(348,83%,47%)] p-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold font-outfit leading-tight">AI Assistant</h3>
                  <p className="text-[10px] text-white/80 font-noto">Find jobs based on your eligibility</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-[hsl(210,40%,98%)]">
              {/* Progress Bar */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-[hsl(348,83%,47%)]' : 'bg-[hsl(214,32%,91%)]'}`} />
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-sm font-bold text-[hsl(222,47%,12%)]">Step 1: Personal Details</p>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(215,16%,40%)] mb-1">Gender *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => updateField('gender', 'male')} className={`py-2 rounded-xl text-sm font-semibold border-2 ${formData.gender === 'male' ? 'border-[hsl(348,83%,47%)] bg-[hsl(348,83%,97%)] text-[hsl(348,83%,47%)]' : 'border-[hsl(214,32%,91%)] bg-white text-[hsl(222,47%,12%)]'}`}>👨 Male</button>
                      <button type="button" onClick={() => updateField('gender', 'female')} className={`py-2 rounded-xl text-sm font-semibold border-2 ${formData.gender === 'female' ? 'border-[hsl(348,83%,47%)] bg-[hsl(348,83%,97%)] text-[hsl(348,83%,47%)]' : 'border-[hsl(214,32%,91%)] bg-white text-[hsl(222,47%,12%)]'}`}>👩 Female</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(215,16%,40%)] mb-1">Age *</label>
                    <input type="number" value={formData.age} onChange={(e) => updateField('age', e.target.value)} placeholder="e.g. 22" className="w-full h-11 border-2 border-[hsl(214,32%,91%)] rounded-xl px-3 bg-white outline-none focus:border-[hsl(348,83%,47%)] transition-colors" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-sm font-bold text-[hsl(222,47%,12%)]">Step 2: Qualifications</p>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(215,16%,40%)] mb-1">Highest Education *</label>
                    <select value={formData.education} onChange={(e) => updateField('education', e.target.value)} className="w-full h-11 border-2 border-[hsl(214,32%,91%)] rounded-xl px-3 bg-white outline-none focus:border-[hsl(348,83%,47%)]">
                      <option value="">-- Select --</option>
                      <option value="10th">10th Pass</option>
                      <option value="12th">12th Pass</option>
                      <option value="graduation">Graduation</option>
                      <option value="pg">Post Graduation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(215,16%,40%)] mb-1">Category *</label>
                    <select value={formData.category} onChange={(e) => updateField('category', e.target.value)} className="w-full h-11 border-2 border-[hsl(214,32%,91%)] rounded-xl px-3 bg-white outline-none focus:border-[hsl(348,83%,47%)]">
                      <option value="">-- Select --</option>
                      <option value="general_ews">General / EWS</option>
                      <option value="obc_sbc">OBC / SBC</option>
                      <option value="sc">SC</option>
                      <option value="st">ST</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-sm font-bold text-[hsl(222,47%,12%)]">Step 3: Extra Certificates (Optional)</p>
                  {[
                    { key: 'hasRSCIT', title: 'RS-CIT / Computer' },
                    { key: 'hasCET_graduate', title: 'CET Graduate' },
                    { key: 'hasCET_senior', title: 'CET Senior Secondary' },
                  ].map((c) => {
                    const selected = formData[c.key as keyof typeof formData];
                    return (
                      <button key={c.key} type="button" onClick={() => updateField(c.key, !selected)} className={`w-full text-left p-3 rounded-xl border-2 flex items-center gap-3 ${selected ? 'border-[hsl(348,83%,47%)] bg-[hsl(348,83%,97%)]' : 'border-[hsl(214,32%,91%)] bg-white'}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selected ? 'bg-[hsl(348,83%,47%)] border-[hsl(348,83%,47%)]' : 'border-[hsl(214,32%,80%)]'}`}>
                          {selected && <span className="text-white text-[10px]">✓</span>}
                        </div>
                        <span className="text-sm font-semibold text-[hsl(222,47%,12%)]">{c.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Buttons */}
            <div className="p-4 bg-white border-t border-[hsl(214,32%,91%)] flex gap-3 shrink-0">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="h-11 px-4 border-2 border-[hsl(214,32%,91%)] rounded-xl font-bold text-[hsl(215,16%,40%)]">
                  Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" disabled={!canGoNext()} onClick={() => setStep(step + 1)} className="flex-1 h-11 bg-[hsl(222,47%,12%)] text-white font-bold rounded-xl disabled:opacity-50">
                  Next
                </button>
              ) : (
                <button type="button" disabled={loading} onClick={handleSubmit} className="flex-1 h-11 bg-[hsl(348,83%,47%)] hover:bg-[hsl(348,83%,40%)] text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  {loading ? 'Searching...' : '🔍 Find Jobs'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
