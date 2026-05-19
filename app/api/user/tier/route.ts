import { NextRequest, NextResponse } from "next/server";
import { getUserTier } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const guestToken = searchParams.get('guestToken');

  if (!userId && !guestToken) {
    return NextResponse.json({ tier: 'guest', messagesUsed: 0, limit: 5 });
  }

  try {
    const tierInfo = await getUserTier(userId || undefined, guestToken || undefined);
    return NextResponse.json(tierInfo);
  } catch (error) {
    console.error("Error fetching tier:", error);
    return NextResponse.json({ tier: 'guest', messagesUsed: 0, limit: 5 }, { status: 500 });
  }
}
