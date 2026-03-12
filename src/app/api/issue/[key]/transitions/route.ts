import { NextRequest, NextResponse } from 'next/server';
import { jiraFetch } from '@/lib/jira';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  try {
    const data = await jiraFetch(`/rest/api/3/issue/${key}/transitions?expand=transitions.fields`);
    // Retorna id, nome da transição e nome do status de destino
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transitions = (data.transitions as any[]).map((t: any) => ({
      id: t.id,
      name: t.name,
      toStatus: t.to?.name ?? t.name,
    }));
    return NextResponse.json(transitions);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const { transitionId } = await req.json() as { transitionId: string };
  try {
    await jiraFetch(`/rest/api/3/issue/${key}/transitions`, {
      method: 'POST',
      body: JSON.stringify({ transition: { id: transitionId } }),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
