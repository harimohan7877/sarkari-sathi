import { NextRequest, NextResponse } from "next/server";
import { getUserTier, verifyUserSession } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const guestToken = searchParams.get('guestToken');

  if (!userId && !guestToken) {
    return NextResponse.json({ tier: 'guest', messagesUsed: 0, limit: 5 });
  }

  // Secure backend: Verify user session if userId is provided
  if (userId) {
    const isValid = await verifyUserSession(req, userId);
    if (!isValid) {
      return NextResponse.json({ error: "अनाधिकृत प्रवेश (Unauthorized Access)" }, { status: 401 });
    }
  }

  try {
    const tierInfo = await getUserTier(userId || undefined, guestToken || undefined);
    return NextResponse.json(tierInfo);
  } catch (error) {
    console.error("Error fetching tier:", error);
    return NextResponse.json({ tier: 'guest', messagesUsed: 0, limit: 5 }, { status: 500 });
  }
}
