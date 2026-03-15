import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  redirect(`/verify/${params.code}`);
}
