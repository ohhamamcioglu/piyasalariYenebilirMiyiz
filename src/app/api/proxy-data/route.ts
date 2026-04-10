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

  for (const url of urls) {
    try {
      const headers: Record<string, string> = {};
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
      }

      console.log(`[Proxy] Trying URL: ${url}`);
      
      const response = await fetch(url, {
        headers,
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        console.warn(`[Proxy] Failed with status ${response.status} for ${url}`);
      }
    } catch (err) {
      console.error(`[Proxy] Fetch error for ${url}:`, err);
    }
  }

  return NextResponse.json({ 
    error: 'File not found in root or history',
    attemptedRepo: `${REPO_OWNER}/${REPO_NAME}`,
    file: file
  }, { status: 404 });
}
