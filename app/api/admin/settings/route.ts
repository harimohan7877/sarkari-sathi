import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, getAdminSettings } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await getAdminSettings();
  
  // Mask keys for security
  const maskKey = (key?: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  return NextResponse.json({
    active_provider: settings.active_provider,
    gemini_key: maskKey(settings.gemini_key),
    openai_key: maskKey(settings.openai_key),
    claude_key: maskKey(settings.claude_key),
    openrouter_key: maskKey(settings.openrouter_key),
  });
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { active_provider, gemini_key, openai_key, claude_key, openrouter_key } = body;

    const existing = await getAdminSettings();

    const updateObj: Record<string, string> = {
      active_provider: active_provider || 'openrouter'
    };

    const processKey = (newKey: string, oldKey: string) => {
      if (newKey && !newKey.includes('••••')) return newKey.trim();
      return oldKey;
    };

    updateObj.gemini_key = processKey(gemini_key, existing.gemini_key);
    updateObj.openai_key = processKey(openai_key, existing.openai_key);
    updateObj.claude_key = processKey(claude_key, existing.claude_key);
    updateObj.openrouter_key = processKey(openrouter_key, existing.openrouter_key);

    const { data: existingRows } = await supabaseAdmin
      .from('admin_settings')
      .select('id')
      .limit(1);

    if (existingRows && existingRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('admin_settings')
        .update(updateObj)
        .eq('id', existingRows[0].id);
      
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('admin_settings')
        .insert([updateObj]);
      
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save admin settings error:', error);
    return NextResponse.json({ error: 'Database update failed: ' + error.message }, { status: 500 });
  }
}
