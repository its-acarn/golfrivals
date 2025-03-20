import { NextResponse } from 'next/server';
import { getRankings } from '../../../lib/api/sheets';

export async function GET() {
  try {
    const rankings = await getRankings();
    return NextResponse.json({ rankings });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings.' },
      { status: 500 }
    );
  }
} 