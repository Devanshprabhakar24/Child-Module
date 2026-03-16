import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // Call backend to check demo mode status
    const response = await fetch(`${API_BASE}/payments/test-mode-status`);
    
    if (!response.ok) {
      return NextResponse.json({ demoMode: false });
    }

    const data = await response.json();
    return NextResponse.json({ 
      demoMode: data.demoMode || false,
      testMode: data.testMode || false 
    });

  } catch (error) {
    console.error('Demo mode check error:', error);
    return NextResponse.json({ demoMode: false });
  }
}