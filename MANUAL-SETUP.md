# 🚀 Manual Setup Instructions

Follow these steps **in your terminal** to complete the setup:

## Step 1: Login to Supabase
```bash
npx supabase login
```
This will open your browser - login with your Supabase account.

## Step 2: Link Your Project
```bash
npx supabase link --project-ref dybbumvwengcwspornih
```

## Step 3: Set Up Database
1. Go to [your Supabase dashboard](https://supabase.com/dashboard/project/dybbumvwengcwspornih)
2. Click **SQL Editor**
3. Open the file `supabase-schema.sql` from this folder
4. Copy all the SQL and paste it in the SQL Editor
5. Click **Run** to create all tables

## Step 4: Get API Keys

### OpenAI API Key:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account / login
3. Go to **API Keys** → **Create new secret key**
4. Copy the key (starts with `sk-`)

### Cloudinary Setup:
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free
3. Go to **Dashboard** and note:
   - Cloud name (e.g., `dz8example`)
   - API Key
   - API Secret
4. Go to **Settings** → **Upload** → **Upload presets**
5. Click **Add upload preset**
6. Name it `stories` 
7. Set **Signing Mode** to "Unsigned"
8. Save and copy the preset name

## Step 5: Set Environment Variables
Replace the values with your actual keys:

```bash
npx supabase secrets set OPENAI_API_KEY=sk-your-actual-openai-key-here
npx supabase secrets set CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
npx supabase secrets set CLOUDINARY_UPLOAD_PRESET=your-upload-preset-name
```

## Step 6: Deploy Edge Function
```bash
npx supabase functions deploy generate-story
```

## Step 7: Test It!
1. Open your website (double-click `index.html`)
2. Login to your app
3. Click "Skapa en magisk berättelse"
4. Fill out the form and upload a test image
5. Submit and watch the magic happen! ✨

---

## 🎉 What Happens Next?

When a user creates a story:
1. **Real-time progress** shows: Processing → Writing Story → Generating Images → Complete
2. **GPT-4** writes a 10-page personalized Swedish story
3. **DALL-E 3** creates beautiful illustrations for pages without user drawings
4. **Final result**: A complete storybook that can be printed

## ❓ Need Help?

If something doesn't work:
1. Check the browser console (F12) for errors
2. Check Supabase function logs: `npx supabase functions logs generate-story`
3. Verify your API keys work independently

**Ready to create magical stories!** 🧙‍♂️✨