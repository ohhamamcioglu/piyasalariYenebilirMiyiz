import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
  const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'ohhamamcioglu';
  const REPO_NAME = process.env.GITHUB_REPO_NAME || 'piyasaRadar';
  
  const urls = [
    `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${file}`,
    `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/history/${file}`
  ];

  console.log(`[Proxy] Fetching file: ${file} from repo: ${REPO_OWNER}/${REPO_NAME}`);

  const attemptedStatuses: Record<string, number> = {};

  for (const url of urls) {
    // Try with token if available
    if (GITHUB_TOKEN) {
      try {
        console.log(`[Proxy] Trying URL with token: ${url}`);
        const response = await fetch(url, {
          headers: { 'Authorization': `token ${GITHUB_TOKEN}` },
          cache: 'no-store'
        });
        attemptedStatuses[`${url} (with token)`] = response.status;
        if (response.ok) {
          return NextResponse.json(await response.json());
        }
      } catch (err) {
        console.error(`[Proxy] Token fetch error for ${url}:`, err);
      }
    }

    // Always try without token (fallback or for public repos)
    try {
      console.log(`[Proxy] Trying URL without token: ${url}`);
      const response = await fetch(url, { cache: 'no-store' });
      attemptedStatuses[`${url} (no token)`] = response.status;
      if (response.ok) {
        return NextResponse.json(await response.json());
      }
    } catch (err) {
      console.error(`[Proxy] No-token fetch error for ${url}:`, err);
    }
  }

  return NextResponse.json({ 
    error: 'File not found in root or history',
    attemptedRepo: `${REPO_OWNER}/${REPO_NAME}`,
    file: file,
    statuses: attemptedStatuses
  }, { status: 404 });
}
