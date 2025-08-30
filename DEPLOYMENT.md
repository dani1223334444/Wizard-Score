# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### 1. Prepare Your Code
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/wizard-score.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project"
4. Import your `wizard-score` repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click "Deploy"

### 3. Set Up Supabase Database
1. Go to your Supabase project
2. Run the SQL from `supabase-setup.sql` in the SQL editor
3. Your app will now sync games to the cloud!

## Alternative: Netlify

### 1. Build Locally
```bash
npm run build
```

### 2. Deploy
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `.next` folder
3. Add environment variables in site settings
4. Your app is live!

## Environment Variables Needed

Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Free Tier Limits

- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Supabase**: 500MB database, 2GB bandwidth/month

## Custom Domain (Optional)

1. Buy a domain (e.g., wizardscore.com)
2. In Vercel/Netlify settings, add your domain
3. Update DNS records as instructed
4. Your app will be live on your custom domain!

## Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json`
- **Environment variables**: Make sure they're set in your deployment platform
- **Database errors**: Verify Supabase setup and SQL script execution
