import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupCode = searchParams.get('groupCode');

    if (!groupCode) {
      return NextResponse.json(
        { error: 'Group code is required' },
        { status: 400 }
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `Group_${groupCode}!A:B`, // Assuming columns A and B contain name and score
    });

    const rows = response.data.values || [];
    
    // Skip header row and get just the player names
    const players = rows.slice(1).map((row) => row[0]);

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
} 