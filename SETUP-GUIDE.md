# 🧙‍♂️ Magiska Berättelser - Setup Guide

This guide will help you set up the AI-powered story generation feature for your app.

## 🎯 Overview

Your app will:
1. Accept child information + drawings via modal
2. Generate a 10-page personalized story using OpenAI GPT-4
3. Use user drawings for first pages, generate AI images for remaining pages
4. Display a beautiful story book with real-time progress updates

## 🔑 Prerequisites

You need accounts for:
- [OpenAI](https://platform.openai.com) (for GPT-4 + DALL-E 3)
- [Cloudinary](https://cloudinary.com) (for image storage)
- [Supabase](https://supabase.com) (already set up)

## 📋 Step-by-Step Setup

### Step 1: Get API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up/login
3. Navigate to **API Keys**
4. Click **+ Create new secret key**
5. Copy the key (starts with `sk-`)
6. **Important**: Add payment method to avoid rate limits

#### Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Go to **Dashboard**, note these values:
   - **Cloud name** (e.g., `your-cloud-name`)
   - **API Key**
   - **API Secret**
4. Create upload preset:
   - Go to **Settings** → **Upload** → **Upload presets**
   - Click **Add upload preset**
   - Set **Signing Mode** to "Unsigned"
   - Set folder to `stories` (optional)
   - Save and copy the preset name

### Step 2: Database Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/dybbumvwengcwspornih)
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL to create tables

### Step 3: Supabase CLI Setup

Open Terminal and run these commands:

```bash
# 1. Login to Supabase
npx supabase login

# 2. Link your project
npx supabase link --project-ref dybbumvwengcwspornih

# 3. Set environment variables for Edge Function
npx supabase secrets set OPENAI_API_KEY=your_openai_key_here
npx supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud_name_here
npx supabase secrets set CLOUDINARY_UPLOAD_PRESET=your_preset_name_here

# 4. Deploy the Edge Function
npx supabase functions deploy generate-story
```

### Step 4: Update Frontend

Add these lines to your `index.html` before the closing `</body>` tag:

```html
<script src="story-generation.js"></script>
<link rel="stylesheet" href="story-styles.css">
```

Update the story form in the modal to use the new async handler:

```html
<form id="storyForm" onsubmit="handleStoryFormAsync(event)">
```

## 🧪 Testing

1. Open your website locally
2. Login with a test account
3. Click "Skapa en magisk berättelse"
4. Fill in child information
5. Upload 1-3 test drawings
6. Submit and watch the real-time progress!

## 📊 Expected Costs (1000 users/month)

- **OpenAI**: ~$50-100/month (GPT-4 + DALL-E 3)
- **Cloudinary**: ~$89/month (Plus plan for storage)
- **Supabase**: ~$25/month (Pro plan for database)
- **Total**: ~$165-215/month

## 🔧 Technical Architecture

```
Frontend (HTML/JS) 
    ↓
Supabase Edge Function 
    ↓
OpenAI GPT-4 (story) + DALL-E 3 (images)
    ↓
Cloudinary (permanent storage)
    ↓
Supabase DB (metadata + story data)
    ↓
Real-time updates back to frontend
```

## 🚨 Troubleshooting

### Edge Function Deployment Issues
```bash
# Check function logs
npx supabase functions logs generate-story

# Redeploy if needed
npx supabase functions deploy generate-story --no-verify-jwt
```

### Database Issues
- Ensure RLS policies are enabled
- Check user authentication in browser dev tools
- Verify database tables were created correctly

### API Key Issues
- Verify keys are set correctly: `npx supabase secrets list`
- Check OpenAI billing and usage limits
- Ensure Cloudinary preset is "unsigned"

## 📁 File Structure

```
├── index.html (updated with new scripts)
├── script.js (existing functionality)
├── story-generation.js (new: async story handling)
├── story-styles.css (new: progress & story display)
├── supabase-schema.sql (database tables)
├── supabase/
│   └── functions/
│       └── generate-story/
│           └── index.ts (Edge Function)
└── SETUP-GUIDE.md (this file)
```

## 🎉 Success Indicators

When everything works:
1. Modal submits without errors
2. Progress page shows with real-time updates
3. User sees: Processing → Writing → Generating Images → Complete
4. Final story displays with 10 pages
5. User drawings appear on first pages
6. AI-generated images fill remaining pages
7. Story text is in Swedish, age-appropriate

## 🆘 Need Help?

If you run into issues:
1. Check browser console for errors
2. Check Supabase function logs
3. Verify all environment variables are set
4. Test API keys independently

Ready to create magical stories! ✨