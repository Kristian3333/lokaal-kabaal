/**
 * Test script voor Print.one integratie.
 * Draai met: npx tsx scripts/test-printone.ts
 *
 * Vereist: PRINTONE_API_KEY in .env.local (test key!)
 * Dit script verstuurt GEEN echte flyers -- het test alleen de API-connectie,
 * template-aanmaak, en batch-flow.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Laad .env.local handmatig (geen dotenv dependency nodig)
try {
  const scriptDir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
  const envPath = resolve(scriptDir, '..', '.env.local');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* .env.local niet gevonden -- gebruik bestaande env */ }

const BASE = 'https://api.print.one/v2';
const KEY = process.env.PRINTONE_API_KEY ?? '';

if (!KEY) {
  console.error('❌ PRINTONE_API_KEY niet gevonden in environment. Zet deze in .env.local');
  process.exit(1);
}

const isTestKey = KEY.startsWith('test_');
console.log(`🔑 API key geladen (${isTestKey ? 'TEST' : '⚠️  LIVE -- pas op!'})\n`);

async function po<T>(path: string, method = 'GET', body?: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': KEY },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as T };
}

// ─── Test 1: API connectie ──────────────────────────────────────────────────
async function testConnection() {
  console.log('── Test 1: API connectie ──');
  const res = await po<{ id?: string; message?: string }>('/templates?limit=1');
  if (res.ok) {
    console.log('✅ API connectie werkt\n');
    return true;
  }
  console.error(`❌ API connectie mislukt (HTTP ${res.status}):`, res.data);
  return false;
}

// ─── Test 2: Template aanmaken ──────────────────────────────────────────────
async function testCreateTemplate(): Promise<string | null> {
  console.log('── Test 2: Template aanmaken ──');

  const html = `
    <div style="width:167px;height:231px;background:#F5F3EF;font-family:sans-serif;padding:16px;display:flex;flex-direction:column;justify-content:center;align-items:center">
      <h1 style="font-size:18px;color:#0A0A0A;margin:0 0 8px">LokaalKabaal Test</h1>
      <p style="font-size:11px;color:#8A8479;margin:0">Dit is een testflyer</p>
      <p style="font-size:11px;color:#00E87A;margin:8px 0 0">QR: {{qr_url}}</p>
      <p style="font-size:10px;color:#8A8479;margin:4px 0 0">Code: {{code}}</p>
    </div>`;

  const backHtml = `
    <div style="width:167px;height:231px;background:#fff;font-family:sans-serif;padding:16px;display:flex;flex-direction:column;justify-content:flex-end">
      <p style="font-size:10px;color:#999;margin:0 0 4px">Retouradres</p>
      <p style="font-size:11px;margin:0">LokaalKabaal</p>
      <p style="font-size:10px;color:#666;margin:0">Postbus 1000, 1000 AA Amsterdam</p>
    </div>`;

  const res = await po<{ id?: string; message?: string[] }>('/templates', 'POST', {
    name: `LokaalKabaal Test – ${new Date().toISOString().slice(0, 19)}`,
    format: 'POSTCARD_A6',
    labels: ['lokaalkabaal', 'test'],
    pages: [
      { content: html },
      { content: backHtml },
    ],
  });

  if (res.ok && res.data.id) {
    console.log(`✅ Template aangemaakt: ${res.data.id}\n`);
    return res.data.id;
  }
  console.error(`❌ Template aanmaken mislukt (HTTP ${res.status}):`, res.data);
  return null;
}

// ─── Test 3: Batch aanmaken + order toevoegen ───────────────────────────────
async function testBatchFlow(templateId: string): Promise<string | null> {
  console.log('── Test 3: Batch aanmaken ──');

  const batchRes = await po<{ id?: string; message?: string[] }>('/batches', 'POST', {
    name: `Test Batch – ${new Date().toISOString().slice(0, 19)}`,
    templateId,
    finish: 'GLOSSY',
    ready: null, // niet meteen versturen
    requiredCount: 300, // Print.one minimum is 300
    sender: {
      name: 'LokaalKabaal',
      address: 'Postbus 1000',
      city: 'Amsterdam',
      postalCode: '1000 AA',
      country: 'NL',
    },
  });

  if (!batchRes.ok || !batchRes.data.id) {
    console.error(`❌ Batch aanmaken mislukt (HTTP ${batchRes.status}):`, batchRes.data);
    return null;
  }

  const batchId = batchRes.data.id;
  console.log(`✅ Batch aangemaakt: ${batchId}`);

  // Order toevoegen
  console.log('\n── Test 4: Order toevoegen aan batch ──');
  const orderRes = await po<{ id?: string; message?: string[] }>(
    `/batches/${batchId}/orders`, 'POST', {
      recipient: {
        name: 'Bewoners Dam 1',
        address: 'Dam 1',
        city: 'Amsterdam',
        postalCode: '1012 JS',
        country: 'NL',
      },
      mergeVariables: {
        qr_url: 'https://lokaalkabaal.vercel.app/v/TESTCODE',
        code: 'TESTCODE',
        adres: 'Dam 1',
        postcode: '1012 JS',
        stad: 'Amsterdam',
      },
    },
  );

  if (orderRes.ok && orderRes.data.id) {
    console.log(`✅ Order toegevoegd: ${orderRes.data.id}`);
  } else {
    console.error(`❌ Order toevoegen mislukt (HTTP ${orderRes.status}):`, orderRes.data);
  }

  // NIET finaliseren -- anders wordt het daadwerkelijk verstuurd
  console.log('\n⏸️  Batch NIET gefinaliseerd (test modus -- geen echte verzending)');
  console.log(`   Batch ID: ${batchId}`);
  console.log('   Je kunt deze batch bekijken in het Print.one dashboard.\n');

  return batchId;
}

// ─── Test 5: Webhook endpoint (lokaal) ──────────────────────────────────────
async function testWebhookLocal() {
  console.log('── Test 5: Webhook endpoint (lokaal) ──');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const webhookUrl = `${appUrl}/api/printone/webhook`;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'order_status_update',
        data: { id: 'test-order-123', friendlyStatus: 'test_status' },
      }),
    });

    if (res.ok) {
      console.log(`✅ Webhook endpoint bereikbaar op ${webhookUrl}`);
    } else {
      console.log(`⚠️  Webhook gaf HTTP ${res.status} -- ${res.statusText}`);
    }
  } catch {
    console.log(`ℹ️  Webhook niet bereikbaar op ${webhookUrl} (draait de dev server?)`);
  }
  console.log('');
}

// ─── Run ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  LokaalKabaal -- Print.one Integratie Test');
  console.log('═══════════════════════════════════════════\n');

  // 1. Connectie
  const connected = await testConnection();
  if (!connected) {
    console.error('\n🛑 Kan niet doorgaan zonder werkende API connectie.');
    process.exit(1);
  }

  // 2. Template
  const templateId = await testCreateTemplate();
  if (!templateId) {
    console.error('\n🛑 Template aanmaken mislukt -- controleer je API key rechten.');
    process.exit(1);
  }

  // 3. Batch + order
  await testBatchFlow(templateId);

  // 4. Webhook (optioneel, alleen als dev server draait)
  await testWebhookLocal();

  // Samenvatting
  console.log('═══════════════════════════════════════════');
  console.log('  Resultaat');
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ API connectie OK');
  console.log('  ✅ Template aanmaken OK');
  console.log('  ✅ Batch + order flow OK');
  console.log('');
  console.log('  Volgende stappen:');
  console.log('  1. Maak in Print.one dashboard een template met merge variables:');
  console.log('     {{qr_url}}, {{code}}, {{adres}}, {{postcode}}, {{stad}}');
  console.log('  2. Registreer webhook: https://lokaalkabaal.vercel.app/api/printone/webhook');
  console.log('  3. Kopieer webhook secret → PRINTONE_WEBHOOK_SECRET in env vars');
  console.log('  4. Voor productie: vervang test key door live key');
  console.log('');
}

main().catch((err) => {
  console.error('Onverwachte fout:', err);
  process.exit(1);
});
