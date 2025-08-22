# YouTube SEO Optimizer

A full-stack web application that analyzes YouTube videos and generates optimized SEO content using Google's Gemini AI.

## Features

- **YouTube Video Analysis**: Extract video data including title, description, view count, and channel information
- **AI-Powered SEO Generation**: Generate optimized titles, descriptions, tags, and thumbnail tips using Google Gemini
- **Real-time Analysis**: Get instant SEO recommendations for your YouTube videos
- **Export Functionality**: Export analysis results to text files
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini API
- **External APIs**: YouTube Data API v3
- **Build Tools**: Vite, ESBuild

## Recent Fixes Applied

The following issues have been resolved:

1. **Path Case Sensitivity**: Fixed directory path issues in `package.json` and `tsconfig.json`
   - Changed `server/index.ts` to `Server/index.ts`
   - Updated TypeScript include paths to use correct capitalization

2. **TypeScript Errors**: Resolved compilation errors
   - Fixed Set iteration issue in `SEOResults.tsx` using `Array.from()`
   - Removed duplicate component declarations in `form.tsx`

3. **Vite Configuration**: Updated base path configuration
   - Changed from `/Webapp/` to `/` for proper development setup

4. **File Cleanup**: Removed unnecessary files
   - Deleted empty `Server/services/1` file

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   - `YOUTUBE_API_KEY`: Your YouTube Data API v3 key
   - `GEMINI_API_KEY`: Your Google Gemini API key

### Running the Application

#### Development Mode
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

#### Production Build
```bash
npm run build
npm start
```

### API Endpoints

- `POST /api/analyze-video`: Analyze a YouTube video and generate SEO content
- `GET /api/video-preview/:videoId`: Get video preview data
- `GET /api/analyses`: Get analysis history
- `GET /api/analysis/:id`: Get specific analysis

## Usage

1. Enter a YouTube video URL in the input field
2. Click "Analyze Video" to start the analysis
3. View the generated SEO recommendations
4. Copy or export the results

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `DATABASE_URL` | Database connection string | No (uses in-memory storage) |
| `PORT` | Server port | No (defaults to 5000) |

## Project Structure

```
├── client/                 # Frontend React application
│   ├── SRC/
│   │   ├── Component/      # React components
│   │   ├── Pages/         # Page components
│   │   ├── lib/           # Utilities and configurations
│   │   └── main.tsx       # Entry point
│   └── index.html         # HTML template
├── Server/                # Backend Express application
│   ├── services/          # External API services
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage layer
├── Shared/                # Shared TypeScript types
└── package.json           # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run check`
5. Submit a pull request

## License

MIT License
