// File: propmint-frontend/src/app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

const RPC_URL = 'https://rpc.uni.junonetwork.io';

// This is the POST function we already had
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy POST failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}

// This is the NEW function we are adding to handle status checks
export async function GET(request: NextRequest) {
  try {
    // We just forward the GET request to the real RPC
    const response = await fetch(`${RPC_URL}${request.nextUrl.search}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy GET failed with status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}