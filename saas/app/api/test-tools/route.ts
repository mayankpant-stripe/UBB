import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'ElevenLabs Tools Test Endpoint',
    tools: [
      'redirectToPayment',
      'redirectToStarterPlan', 
      'redirectToAdvancedPlan',
      'redirectToStarterPayment',
      'redirectToAdvancedPayment'
    ],
    instructions: [
      '1. Open browser console (F12)',
      '2. Type: window.testElevenLabsTools()',
      '3. Verify all functions show as "function"',
      '4. Test individual tool: window.redirectToStarterPlan()'
    ],
    status: 'ready'
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action, parameters } = await request.json();
    
    return NextResponse.json({
      success: true,
      action,
      parameters,
      message: `Received test action: ${action}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request format',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
} 