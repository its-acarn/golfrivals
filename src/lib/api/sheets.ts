import { google, sheets_v4 } from 'googleapis';

// Initialize the Google Sheets API client
export async function getGoogleSheetsClient(): Promise<sheets_v4.Sheets> {
  // This approach is for server-side usage only
  try {
    // For production, you would use environment variables for these secrets
    const auth = new google.auth.GoogleAuth({
      // In production, these would come from environment variables
      // and you would use proper authentication methods
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      // Placeholder for credentials that would be properly configured in production
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
    });

    // No need to get the client if we're using the auth object directly
    // Fix for the sheets API initialization
    return google.sheets({
      version: 'v4',
      auth: auth
    });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
}

// The spreadsheet ID would come from your Google Sheet's URL
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const RESULTS_SHEET_NAME = 'MatchResults';
const RANKINGS_SHEET_NAME = 'Rankings';

// Record a match result
export async function recordMatchResult(players: string[]): Promise<void> {
  if (!players.length || players.length < 2 || players.length > 4) {
    throw new Error('Invalid number of players');
  }

  const winner = players[0];
  const losers = players.slice(1);
  
  try {
    const sheets = await getGoogleSheetsClient();
    const timestamp = new Date().toISOString();

    // Record match result in the Results sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${RESULTS_SHEET_NAME}!A:E`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          timestamp,
          winner,
          ...losers,
          losers.length + 1 // Total number of players
        ]],
      },
    });

    // Update rankings
    await updateRankings(sheets, winner, losers);
    
  } catch (error) {
    console.error('Error recording match result:', error);
    throw new Error('Failed to record match result');
  }
}

// Get the current rankings
export async function getRankings(): Promise<{ name: string, score: number }[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${RANKINGS_SHEET_NAME}!A:B`,
    });

    const rows = response.data.values || [];
    
    // Skip header row if it exists
    const rankings = rows.slice(1).map(row => ({
      name: row[0] as string,
      score: parseInt(row[1] as string, 10) || 0,
    }));

    // Sort by score (descending)
    return rankings.sort((a, b) => b.score - a.score);
    
  } catch (error) {
    console.error('Error getting rankings:', error);
    throw new Error('Failed to get rankings');
  }
}

// Helper function to update player rankings
async function updateRankings(
  sheets: sheets_v4.Sheets, 
  winner: string, 
  losers: string[]
): Promise<void> {
  // Get current rankings
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${RANKINGS_SHEET_NAME}!A:B`,
  });

  const rows = response.data.values || [];
  const rankings = new Map<string, number>();
  
  // Create map of existing rankings
  rows.slice(1).forEach(row => {
    rankings.set(row[0] as string, parseInt(row[1] as string, 10) || 0);
  });

  // Update winner's score
  rankings.set(winner, (rankings.get(winner) || 0) + 1);
  
  // Make sure all players are in the rankings (with at least 0 points)
  losers.forEach(loser => {
    if (!rankings.has(loser)) {
      rankings.set(loser, 0);
    }
  });

  // Prepare the updated rankings
  const updatedRankings = Array.from(rankings.entries()).map(([name, score]) => [name, score]);
  
  // Clear existing rankings and write updated ones
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${RANKINGS_SHEET_NAME}!A2:B`,
  });
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${RANKINGS_SHEET_NAME}!A2:B`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: updatedRankings,
    },
  });
} 