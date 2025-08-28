#!/bin/bash
# Supabase Setup Script for Magiska Berättelser
# Run this script manually in your terminal

echo "🚀 Setting up Supabase for Magiska Berättelser..."
echo ""

# Step 1: Login to Supabase
echo "📝 Step 1: Login to Supabase"
echo "Run this command and follow the browser login:"
echo "npx supabase login"
echo ""
echo "Press Enter when you've completed login..."
read

# Step 2: Link project
echo "🔗 Step 2: Linking to your Supabase project..."
npx supabase link --project-ref dybbumvwengcwspornih

if [ $? -eq 0 ]; then
    echo "✅ Project linked successfully!"
else
    echo "❌ Project linking failed. Please check your login status."
    exit 1
fi

# Step 3: Deploy database schema
echo ""
echo "🗄️ Step 3: Deploying database schema..."
echo "Please run this SQL in your Supabase dashboard SQL Editor:"
echo ""
cat supabase-schema.sql
echo ""
echo "👆 Copy the SQL above and run it in your Supabase SQL Editor"
echo "Press Enter when you've run the SQL..."
read

# Step 4: Check if Edge Function exists
echo ""
echo "🔧 Step 4: Checking Edge Function..."
if [ -f "supabase/functions/generate-story/index.ts" ]; then
    echo "✅ Edge Function file exists"
else
    echo "❌ Edge Function file missing!"
    exit 1
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Get your API keys:"
echo "   - OpenAI: https://platform.openai.com/api-keys"
echo "   - Cloudinary: https://cloudinary.com/console"
echo ""
echo "2. Set environment variables:"
echo "   npx supabase secrets set OPENAI_API_KEY=your_key_here"
echo "   npx supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud_name"
echo "   npx supabase secrets set CLOUDINARY_UPLOAD_PRESET=your_preset_name"
echo ""
echo "3. Deploy Edge Function:"
echo "   npx supabase functions deploy generate-story"
echo ""
echo "📖 See the full instructions in the README!"