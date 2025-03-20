# GolfRivals

GolfRivals is a simple web application for tracking golf match results and maintaining player rankings. Players can record match results, and the application automatically updates a leaderboard based on wins.

## Features

- Record results of golf matches with 2-4 players
- Automatically update player rankings
- View real-time leaderboard
- Responsive design for mobile and desktop

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **API**: Next.js API Routes
- **Database**: Google Sheets (as a simple data store)
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Google account with access to Google Sheets
- A Google Cloud Platform account to create service account credentials

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-from-url
```

### Google Sheets Setup

1. Create a new Google Spreadsheet
2. Create two sheets named "MatchResults" and "Rankings"
3. In the "MatchResults" sheet, add headers: Timestamp, Winner, Player2, Player3, Player4, PlayerCount
4. In the "Rankings" sheet, add headers: Player, Score

### Google Cloud Platform Setup

1. Create a new project in Google Cloud Platform
2. Enable the Google Sheets API
3. Create a service account with "Editor" access to Google Sheets
4. Download the JSON key file and extract the `client_email` and `private_key` values
5. Share your Google Spreadsheet with the service account email address

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/golfrivals.git
cd golfrivals

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application running.

## Deployment to Cloudflare Pages

1. Set up a Cloudflare Pages project
2. Connect your GitHub repository
3. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `out`
4. Add your environment variables in the Cloudflare Pages dashboard
5. Deploy your application

## License

MIT
