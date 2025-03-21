import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Validate required environment variables
const requiredEnvVars = {
  SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID,
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// Function to check if a group code already exists
async function isGroupCodeUnique(code: string): Promise<boolean> {
  try {
    if (!SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID is not configured');
    }

    // First verify we can access the spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    if (!response.data.sheets) {
      console.error('No sheets found in spreadsheet');
      return false;
    }

    const exists = response.data.sheets.some(
      sheet => sheet.properties?.title === `Group_${code.toUpperCase()}`
    );

    console.log(`Checking code ${code}: ${exists ? 'exists' : 'unique'}`);
    return !exists;
  } catch (error) {
    console.error('Error checking group code uniqueness:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { groupCode, players } = await request.json();

    if (!groupCode || !players || !Array.isArray(players) || players.length < 2) {
      return NextResponse.json(
        { error: 'Invalid group data' },
        { status: 400 }
      );
    }

    // Validate that the group code is exactly 5 alphanumeric characters
    if (!/^[a-zA-Z0-9]{5}$/.test(groupCode)) {
      return NextResponse.json(
        { error: 'Group code must be exactly 5 characters (letters or numbers)' },
        { status: 400 }
      );
    }

    // Check if the group code is unique
    const isUnique = await isGroupCodeUnique(groupCode);
    if (!isUnique) {
      return NextResponse.json(
        { error: 'Group code already exists' },
        { status: 400 }
      );
    }

    // Create a new sheet for the group
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: `Group_${groupCode.toUpperCase()}`,
              },
            },
          },
        ],
      },
    });

    // Initialize the sheet with headers and players
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Group_${groupCode.toUpperCase()}!A1:B1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Player', 'Score']],
      },
    });

    // Add players with initial score of 0
    const playerData = players.map(player => [player, 0]);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Group_${groupCode.toUpperCase()}!A2:B${playerData.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: playerData,
      },
    });

    console.log(`Successfully created group with code ${groupCode.toUpperCase()}`);

    return NextResponse.json({ 
      success: true, 
      groupCode: groupCode.toUpperCase(),
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('Error creating group:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    return NextResponse.json(
      { 
        error: 'Failed to create group',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 