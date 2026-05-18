'use client';

interface MessageCounterProps {
  used: number;
  limit: number;
  tier: 'guest' | 'registered' | 'paid';
  onLoginClick?: () => void;
  onPayClick?: () => void;
}

export default function MessageCounter({ used, limit, tier, onLoginClick, onPayClick }: MessageCounterProps) {
  if (tier === 'paid') return null;

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
      {remaining <= 2 && remaining > 0 && tier === 'guest' && (
        <button
          onClick={onLoginClick}
          className="text-[#FF6B00] font-medium text-xs hover:underline"
          style={{ fontFamily: 'var(--font-noto)' }}
        >
          Login → 5 और FREE
        </button>
      )}
      {remaining <= 2 && remaining > 0 && tier === 'registered' && (
        <button
          onClick={onPayClick}
          className="text-[#FF6B00] font-medium text-xs hover:underline"
          style={{ fontFamily: 'var(--font-noto)' }}
        >
          ₹30 → Unlimited
        </button>
      )}
    </div>
  );
}
