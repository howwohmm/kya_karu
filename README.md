# Kya Karu - AI Personal Recommendation System

An AI-powered personal recommendation system using Google's Gemini models to provide personalized suggestions for meals, entertainment, travel, and more.

## Features

- Text-based recommendation generation
- Image analysis for visual recommendations
- Category-specific recommendations
- Chat-based interface
- Dashboard with category filters

## Setup Instructions

1. Clone the repository
   ```bash
   git clone https://github.com/howwohmm/kya_karu.git
   cd kya_karu
   ```

2. Install dependencies
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` to add your API keys.

4. Run the development server
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Keys

### Required:
- **Google Gemini API Key**: Get one at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Optional (for image search):
- **Google Custom Search API Key**: Create one at [Google Cloud Console](https://console.cloud.google.com/)
- **Google Custom Search Engine ID**: Create at [Programmable Search Engine](https://programmablesearch.google.com/create/new)

## Important Security Note

Never commit your API keys to the repository! The `.env.local` file is included in `.gitignore` to prevent this.

## Technologies

- Next.js
- TypeScript
- Google Gemini API
- Tailwind CSS
- Framer Motion 