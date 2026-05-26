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

  // Check if groq_key column is present in the database table
  let hasGroqColumn = false;
  try {
    const { data } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    hasGroqColumn = data ? ('groq_key' in data) : false;
  } catch (e) {
    console.error("Column check error in GET:", e);
  }

  return NextResponse.json({
    active_provider: settings.active_provider,
    gemini_key: maskKey(settings.gemini_key),
    openai_key: maskKey(settings.openai_key),
    claude_key: maskKey(settings.claude_key),
    openrouter_key: maskKey(settings.openrouter_key),
    groq_key: maskKey(settings.groq_key),
    db_missing_groq: !hasGroqColumn
  });
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { active_provider, gemini_key, openai_key, claude_key, openrouter_key, groq_key } = body;

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

    // Dynamic database column check for groq_key
    let hasGroqColumn = false;
    try {
      const { data } = await supabaseAdmin
        .from('admin_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      hasGroqColumn = data ? ('groq_key' in data) : false;
    } catch (e) {
      console.error("Column check error in POST:", e);
    }

    if (hasGroqColumn) {
      updateObj.groq_key = processKey(groq_key, existing.groq_key);
    }

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

    return NextResponse.json({ success: true, db_missing_groq: !hasGroqColumn });
  } catch (error: any) {
    console.error('Save admin settings error:', error);
    return NextResponse.json({ error: 'Database update failed: ' + error.message }, { status: 500 });
  }
}
