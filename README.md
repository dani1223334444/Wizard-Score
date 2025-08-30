# 🧙‍♂️ Wizard Score

A modern, mobile-first web app for scoring Wizard card games with cloud sync capabilities.

## Features

- **Mobile-First Design**: Optimized for phones and tablets
- **Real-Time Scoring**: Track bids, tricks, and penalties
- **25 Year Edition Support**: Includes Bomb card and 9¾ special function
- **Cloud Sync**: Save games to Supabase database
- **Penalty System**: Track mistakes with escalating penalties
- **Game History**: View past rounds and games
- **Wizard Theme**: Dark theme with purple accents

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Cloud database
- **Local Storage** - Offline fallback

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase URL and API key.

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Netlify
1. Build the app: `npm run build`
2. Deploy the `.next` folder

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Game Rules

- **Standard Edition**: Basic Wizard scoring
- **25 Year Edition**: Includes Bomb card and 9¾ special function
- **Custom Rules**: No round number bidding (total bids ≠ round number)

## License

MIT License