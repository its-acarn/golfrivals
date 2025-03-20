import { NextRequest, NextResponse } from 'next/server';
import { recordMatchResult } from '../../../lib/api/sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.players || !Array.isArray(body.players) || body.players.length < 2 || body.players.length > 4) {
      return NextResponse.json(
        { error: 'Invalid request. Expected 2-4 players.' },
        { status: 400 }
      );
    }

    // Validate all players have names
    if (body.players.some((player: unknown) => typeof player !== 'string' || !player.trim())) {
      return NextResponse.json(
        { error: 'All players must have names.' },
        { status: 400 }
      );
    }

    // Check for duplicate player names
    const uniqueNames = new Set(body.players.map((p: string) => p.trim()));
    if (uniqueNames.size !== body.players.length) {
      return NextResponse.json(
        { error: 'All player names must be unique.' },
        { status: 400 }
      );
    }

    // Record the match result
    await recordMatchResult(body.players);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling match result submission:', error);
    return NextResponse.json(
      { error: 'Failed to record match result.' },
      { status: 500 }
    );
  }
} 