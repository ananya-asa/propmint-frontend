// File: propmint-frontend/src/app/api/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Pointing our receptionist to the stable Juno RPC
const RPC_URL = 'https://rpc.uni.junonetwork.io';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Vercel's server makes the call to the real server
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Proxy request failed with status ${response.status}: ${errorText}`);
    }

    // Vercel gets the data and sends it back to your browser
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}