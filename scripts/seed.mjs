import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually
try {
  const envPath = resolve('.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    const key = trimmed.substring(0, index).trim();
    let val = trimmed.substring(index + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  });

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local");
    process.exit(1);
  }

  console.log(`🌐 Connecting to Supabase at: ${url}`);
  const supabase = createClient(url, key);

  async function seed() {
    console.log("⏳ Seeding marketplace_groups...");
    
    const groups = [
      { id: 'rajasthan-rsmssb-exams', name: 'Rajasthan RSMSSB Exams' },
      { id: 'rajasthan-police-security-exams', name: 'Rajasthan Police & Security Exams' },
      { id: 'rajasthan-teaching-school-exams', name: 'Rajasthan Teaching & School Exams' },
      { id: 'rajasthan-high-court-court-exams', name: 'Rajasthan High Court & Court Exams' },
      { id: 'rajasthan-general-government-exams', name: 'Rajasthan General Government Exams' }
    ];

    const { error: groupError } = await supabase
      .from('marketplace_groups')
      .upsert(groups, { onConflict: 'id' });

    if (groupError) {
      console.error("❌ Error seeding marketplace_groups:", groupError);
      return;
    }
    console.log("✅ marketplace_groups seeded successfully.");

    console.log("⏳ Seeding marketplace_products...");
    const productsData = JSON.parse(readFileSync(resolve('data/products_mock.json'), 'utf-8'));
    
    const groupSlugMap = {
      "Rajasthan RSMSSB Exams": "rajasthan-rsmssb-exams",
      "Rajasthan Police & Security Exams": "rajasthan-police-security-exams",
      "Rajasthan Teaching & School Exams": "rajasthan-teaching-school-exams",
      "Rajasthan High Court & Court Exams": "rajasthan-high-court-court-exams",
      "Rajasthan General Government Exams": "rajasthan-general-government-exams"
    };

    const products = productsData.map(p => ({
      id: p.id,
      title: p.title,
      exam_name: p.examName,
      group_id: groupSlugMap[p.groupName] || null,
      type: p.type,
      price: p.price,
      sale_price: p.salePrice,
      pages: p.pages || null,
      language: p.language,
      file_url: "https://drive.google.com/drive/folders/mock-folder-id-sarkari-saathi",
      is_active: true
    }));

    const { error: productError } = await supabase
      .from('marketplace_products')
      .upsert(products, { onConflict: 'id' });

    if (productError) {
      console.error("❌ Error seeding marketplace_products:", productError);
      return;
    }
    console.log("✅ marketplace_products seeded successfully.");
    console.log("🎉 Database seeding completed successfully!");
  }

  seed();

} catch (err) {
  console.error("❌ Script execution error:", err);
  process.exit(1);
}
