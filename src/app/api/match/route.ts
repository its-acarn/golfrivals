import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

export async function POST(request: NextRequest) {
  try {
    const { players, groupCode } = await request.json();

    if (!groupCode) {
      return NextResponse.json(
        { error: 'Group code is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(players) || players.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 players are required' },
        { status: 400 }
      );
    }

    // Get current rankings
    const rankingsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Group_${groupCode}!A:B`,
    });

    const rows = rankingsResponse.data.values || [];
    const currentRankings = new Map(
      rows.slice(1).map((row) => [row[0], parseInt(row[1], 10)])
    );

    // Update scores based on match results
    const winner = players[0];
    const currentScore = currentRankings.get(winner) || 0;
    currentRankings.set(winner, currentScore + 1);

    // Prepare data for update
    const updateData = Array.from(currentRankings.entries())
      .map(([name, score]) => [name, score])
      .sort((a, b) => (b[1] as number) - (a[1] as number)); // Sort by score in descending order

    // Update the rankings sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Group_${groupCode}!A2:B${updateData.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: updateData,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match results' },
      { status: 500 }
    );
  }
} 