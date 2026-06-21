'use client';

interface MessageCounterProps {
  used: number;
  limit: number;
  tier: 'guest' | 'registered' | 'paid';
  isCustomKeyActive?: boolean;
}

export default function MessageCounter({ used, limit, tier, isCustomKeyActive }: MessageCounterProps) {
  if (tier === 'paid') return null;

  if (isCustomKeyActive) {
    return (
      <div className="px-4 py-2 flex items-center justify-between text-xs bg-green-50 text-green-700 font-bold border-t border-[#C5D0E0]/30" style={{ fontFamily: 'var(--font-noto)' }}>
        <span>🔑 आपकी Custom API Key सक्रिय है (असीमित AI चैट)</span>
      </div>
    );
  }

  const remaining = limit - used;

  return (
    <div className={`px-4 py-2 flex items-center justify-between text-sm ${
      remaining <= 2 ? 'bg-red-50' : 'bg-blue-50'
    }`}>
      <span
        className={`font-medium ${remaining <= 2 ? 'text-red-600' : 'text-[#1847A6]'}`}
        style={{ fontFamily: 'var(--font-noto)' }}
      >
        {remaining <= 0
          ? '❌ सवाल खत्म हो गए'
          : `💬 ${remaining} सवाल बाकी`
        }
        {tier === 'guest' && ' (Guest)'}
      </span>
    </div>
  );
}
