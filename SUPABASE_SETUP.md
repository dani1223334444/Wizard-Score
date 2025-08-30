# 🚀 Supabase Setup for Wizard Score App

## 📋 Prerequisites
- [Supabase account](https://supabase.com) (free tier is sufficient)
- Your Wizard Score app code

## 🛠️ Step-by-Step Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended)
4. Create new project:
   - **Name**: `wizard-score-app`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Wait for setup (~2 minutes)

### 2. Get API Keys
1. In your project dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklm.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### 3. Set Environment Variables
1. Create `.env.local` file in your project root:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the placeholder values with your actual Supabase credentials

### 4. Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-setup.sql`
3. Paste and run the SQL script
4. Verify the `games` table was created in **Table Editor**

### 5. Test the Integration
1. Restart your Next.js development server
2. Check the header shows "☁️ Cloud Sync Enabled"
3. Create a new game and verify it saves
4. Check your Supabase dashboard to see the saved data

## 🔧 Database Schema

The `games` table stores:
- **id**: Unique game identifier
- **name**: Game name (e.g., "Wizard Game - 2024-01-15")
- **players**: JSON array of player data
- **rounds**: JSON array of completed rounds
- **current_round**: Current round number
- **total_rounds**: Total rounds in the game
- **is_complete**: Whether the game is finished
- **rules**: Game rules (edition, custom rules)
- **created_at**: When the game was created
- **updated_at**: When the game was last updated

## 🚨 Troubleshooting

### "Supabase not configured" Error
- Check your `.env.local` file exists
- Verify environment variable names are correct
- Restart your development server

### Database Connection Issues
- Check your Supabase project is active
- Verify API keys are correct
- Check Row Level Security policies

### Data Not Saving
- Check browser console for errors
- Verify database table exists
- Check Supabase logs in dashboard

## 🔒 Security Notes

- The current setup allows all operations (public access)
- For production, consider adding user authentication
- You can restrict access using Row Level Security policies
- API keys are safe to expose in client-side code (they're designed for this)

## 📱 Benefits

✅ **Cloud Storage**: Access games from any device  
✅ **Data Safety**: Automatic backups and versioning  
✅ **Real-time**: Future multiplayer potential  
✅ **Scalable**: Handles unlimited games  
✅ **Free**: Generous free tier (500MB, 50K users/month)  

## 🎯 Next Steps

After setup, you can:
- Add user authentication
- Implement real-time game updates
- Add game sharing between players
- Create game statistics and analytics
- Build a mobile app using the same backend

---

**Need help?** Check the [Supabase documentation](https://supabase.com/docs) or create an issue in your project repository.
