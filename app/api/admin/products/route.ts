import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: products, error } = await supabaseAdmin
      .from('marketplace_products')
      .select('*, group:marketplace_groups(name)')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback to mock data
      const { default: mockProducts } = await import('@/data/products_mock.json');
      return NextResponse.json(mockProducts.map(p => ({
        ...p,
        group: { name: p.groupName },
      })));
    }

    return NextResponse.json(products || []);
  } catch (error: unknown) {
    console.error('Admin products query error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, exam_name, group_id, type, price, sale_price, pages, language, file_url, is_active } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'Product ID and Title required' }, { status: 400 });
    }

    const productData: Record<string, unknown> = {
      id,
      title,
      exam_name: exam_name || title,
      group_id: group_id || null,
      type: type || 'Notes',
      price: price || 0,
      sale_price: sale_price || 0,
      pages: pages || null,
      language: language || 'Hindi',
      file_url: file_url || null,
      is_active: is_active !== undefined ? is_active : true,
    };

    const { data, error } = await supabaseAdmin
      .from('marketplace_products')
      .upsert(productData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Admin product create error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to save product: ' + message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('marketplace_products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Admin product delete error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete product: ' + message }, { status: 500 });
  }
}
