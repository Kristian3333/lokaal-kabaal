import { NextRequest, NextResponse } from 'next/server';

// This route is called by Vercel Cron on the 25th of each month at 06:00 CET
// It processes all active packages and triggers the address lookup + flyer dispatch

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const maand = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  // In a real implementation:
  // 1. Fetch all active packages from the database
  // 2. For each package, make 1 POST to /api/addresses with all PC4 codes
  // 3. Queue flyer print + dispatch jobs
  // 4. Log results

  console.log(`[CRON] Maandelijkse adressen pull gestart — ${maand}`);

  // Simulated response for now
  const result = {
    gestart: now.toISOString(),
    maand,
    pakketten: 0, // would be actual count from DB
    status: 'gesimuleerd — geen database verbonden',
    message: 'Elke actieve klant krijgt 1 API call naar Altum met alle PC4-codes van zijn pakket.',
  };

  console.log('[CRON] Klaar:', result);
  return NextResponse.json(result);
}
