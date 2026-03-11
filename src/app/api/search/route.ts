import { NextRequest, NextResponse } from 'next/server';
import { jiraFetch } from '@/lib/jira';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const project = process.env.JIRA_PROJECT_KEY ?? '';

  if (!q) return NextResponse.json([]);

  try {
    // Se parece uma chave de issue (ex: PROJ-123), busca diretamente
    const isKey = /^[A-Z]+-\d+$/i.test(q);
    const jql = isKey
      ? `key = "${q.toUpperCase()}"`
      : `project = "${project}" AND issuetype in subTaskIssueTypes() AND summary ~ "${q}*" ORDER BY updated DESC`;

    const data = await jiraFetch(
      `/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=20&fields=summary,status,parent`,
    );

    const results = (data.issues as Array<{
      key: string;
      fields: { summary: string; status: { name: string }; parent?: { key: string } };
    }>).map((i) => ({
      key: i.key,
      summary: i.fields.summary,
      status: i.fields.status.name,
      parent: i.fields.parent?.key ?? '',
    }));

    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
