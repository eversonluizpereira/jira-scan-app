import { NextRequest, NextResponse } from 'next/server';
import { jiraFetch } from '@/lib/jira';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const { fieldId, value } = await req.json() as { fieldId: string; value: string };
  try {
    // Tenta formato {value: "..."} primeiro (select fields)
    await jiraFetch(`/rest/api/3/issue/${key}`, {
      method: 'PUT',
      body: JSON.stringify({
        fields: { [fieldId]: { value } },
      }),
    });
    return NextResponse.json({ ok: true });
  } catch {
    try {
      // Fallback: string direta
      await jiraFetch(`/rest/api/3/issue/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ fields: { [fieldId]: value } }),
      });
      return NextResponse.json({ ok: true });
    } catch (e2) {
      return NextResponse.json({ error: String(e2) }, { status: 500 });
    }
  }
}
