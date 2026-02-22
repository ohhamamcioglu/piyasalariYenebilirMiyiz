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
  
  // Attempt to fetch from root first, fallback to /history if needed
  const urls = [
    `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${file}`,
    `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/history/${file}`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw',
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (err) {
      console.warn(`Failed to fetch from ${url}:`, err);
    }
  }

  return NextResponse.json({ error: 'File not found in root or history' }, { status: 404 });
}
