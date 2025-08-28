// Supabase Edge Function for generating magical stories
// File: supabase/functions/generate-story/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Types
interface ChildData {
  childName: string
  childAge: number
  childHeight?: string
  favoriteFood: string
  favoriteActivity: string
  bestMemory: string
  personality?: string
}

interface StoryPage {
  page: number
  text: string
  imagePrompt?: string
}

interface StoryResponse {
  title: string
  pages: StoryPage[]
}

// Constants
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { childData, drawings }: { childData: ChildData, drawings: File[] } = await req.json()

    // Validate required fields
    if (!childData.childName || !childData.childAge || !childData.favoriteFood || 
        !childData.favoriteActivity || !childData.bestMemory) {
      return new Response(
        JSON.stringify({ error: 'Missing required child data fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create story record
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        child_name: childData.childName,
        child_age: childData.childAge,
        child_height: childData.childHeight,
        favorite_food: childData.favoriteFood,
        favorite_activity: childData.favoriteActivity,
        best_memory: childData.bestMemory,
        personality: childData.personality,
        status: 'processing'
      })
      .select()
      .single()

    if (storyError || !story) {
      console.error('Error creating story:', storyError)
      return new Response(
        JSON.stringify({ error: 'Failed to create story record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Start async processing (don't wait for completion)
    processStoryGeneration(story.id, childData, drawings, supabase)

    // Return immediately with story ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        storyId: story.id,
        status: 'processing',
        message: 'Story generation started. You will receive updates in real-time.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-story function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Async function to process story generation
async function processStoryGeneration(
  storyId: string, 
  childData: ChildData, 
  drawings: File[], 
  supabase: any
) {
  try {
    console.log(`Starting story generation for story ID: ${storyId}`)

    // Update status to generating_story
    await supabase
      .from('stories')
      .update({ status: 'generating_story' })
      .eq('id', storyId)

    // Step 1: Upload user drawings to Cloudinary
    const uploadedDrawings = await uploadDrawingsToCloudinary(drawings, storyId, supabase)

    // Step 2: Generate story with OpenAI GPT-4
    const storyContent = await generateStoryWithOpenAI(childData)

    // Update story with generated content
    await supabase
      .from('stories')
      .update({ 
        story_data: storyContent,
        status: 'generating_images'
      })
      .eq('id', storyId)

    // Step 3: Generate AI images for pages without user drawings
    await generateMissingImages(storyId, storyContent, uploadedDrawings.length, childData, supabase)

    // Mark as completed
    await supabase
      .from('stories')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', storyId)

    console.log(`Story generation completed for story ID: ${storyId}`)

  } catch (error) {
    console.error(`Error processing story ${storyId}:`, error)
    
    // Mark as failed
    await supabase
      .from('stories')
      .update({ 
        status: 'failed',
        error_message: error.message || 'Unknown error occurred'
      })
      .eq('id', storyId)
  }
}

// Upload drawings to Cloudinary
async function uploadDrawingsToCloudinary(drawings: File[], storyId: string, supabase: any) {
  const uploadedDrawings = []
  
  for (let i = 0; i < Math.min(drawings.length, 10); i++) { // Max 10 pages
    const drawing = drawings[i]
    
    // Convert File to base64 for Cloudinary upload
    const base64 = await fileToBase64(drawing)
    
    const uploadData = {
      file: base64,
      upload_preset: Deno.env.get('CLOUDINARY_UPLOAD_PRESET'),
      folder: `stories/${storyId}`,
      public_id: `drawing_${i + 1}`,
      resource_type: 'auto'
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${Deno.env.get('CLOUDINARY_CLOUD_NAME')}/upload`,
      {
        method: 'POST',
        body: JSON.stringify(uploadData),
        headers: { 'Content-Type': 'application/json' }
      }
    )

    const result = await response.json()
    
    if (result.secure_url) {
      // Save to database
      await supabase
        .from('user_drawings')
        .insert({
          story_id: storyId,
          original_filename: drawing.name,
          cloudinary_url: result.secure_url,
          cloudinary_public_id: result.public_id,
          file_size: drawing.size,
          file_type: drawing.type,
          page_assignment: i + 1
        })

      // Also create story_images record
      await supabase
        .from('story_images')
        .insert({
          story_id: storyId,
          page_number: i + 1,
          image_type: 'user_drawing',
          image_url: result.secure_url,
          cloudinary_public_id: result.public_id
        })

      uploadedDrawings.push({
        page: i + 1,
        url: result.secure_url,
        publicId: result.public_id
      })
    }
  }
  
  return uploadedDrawings
}

// Generate story with OpenAI GPT-4
async function generateStoryWithOpenAI(childData: ChildData): Promise<StoryResponse> {
  const prompt = `Du är en magisk berättarfé som skapar personliga barnböcker! Skapa en underbar berättelse på svenska som blir till en riktig bok.

🌟 BARNETS MAGISKA PROFIL:
- Hjältens namn: ${childData.childName}
- Ålder: ${childData.childAge} år gamla
- Personlighet: ${childData.personality || 'Ett glatt och nyfiket barn som älskar äventyr'}
- Älskar att: ${childData.favoriteActivity}
- Favoritmat: ${childData.favoriteFood}
- Härligt minne: ${childData.bestMemory}

🏰 MAGISKA REGLER FÖR BERÄTTELSEN:
- Exakt 10 sidor (som en riktig barnbok!)
- Exakt 2 meningar per sida (perfekt för ${childData.childAge}-åringar)
- ${childData.childName} är den modiga huvudkaraktären
- Berättelsen ska vara full av magi, vänskap och glädje
- Inkludera ${childData.childName}s intressen naturligt i äventyret
- Helt familjevänlig - bara kärlek, vänskap och glädje
- Positiv slutsats där ${childData.childName} lär sig något viktigt eller hjälper andra
- Använd enkla, vackra ord som ${childData.childAge}-åringar förstår och älskar

🎨 BILDERNAS MAGI:
För varje sida, beskriv vad som ska synas i bilden (på engelska för AI-konstnären).
Tänk på färgglada, vänliga bilder som barn älskar - inga läskiga saker!

🌈 BERÄTTELSENS ÅR:
Skapa en saga om ${childData.childName}s fantastiska äventyr där hen:
- Använder sin kärlek för ${childData.favoriteActivity} på ett magiskt sätt
- Möter vänliga varelser eller andra barn
- Löser problem med vänlighet och kreativitet
- Kanske får en magisk förmåga relaterad till ${childData.favoriteFood} eller ${childData.favoriteActivity}
- Kommer hem som en hjälte med ny visdom

Svara ENDAST med perfekt JSON:
{
  "title": "En magisk titel som lockar barn",
  "pages": [
    {
      "page": 1,
      "text": "Första meningen med ${childData.childName}s namn. Andra meningen som bygger spänning.",
      "imagePrompt": "Cheerful children's book illustration showing [happy scene with specific details, colorful, friendly, magical atmosphere]"
    }
  ]
}

Kom ihåg: Detta ska bli ${childData.childName}s alldeles egna magiska bok! 🎁✨`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.8
    })
  })

  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`)
  }

  try {
    const storyContent = JSON.parse(data.choices[0].message.content)
    return storyContent
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', data.choices[0].message.content)
    throw new Error('Failed to parse story content from OpenAI')
  }
}

// Generate AI images for pages without user drawings
async function generateMissingImages(
  storyId: string, 
  storyContent: StoryResponse, 
  userDrawingsCount: number,
  childData: ChildData,
  supabase: any
) {
  const pagesToGenerate = storyContent.pages.slice(userDrawingsCount)
  
  for (const page of pagesToGenerate) {
    try {
      const enhancedPrompt = `Professional children's book illustration in watercolor and digital art style: ${page.imagePrompt}

Main character: A happy, friendly ${childData.childAge}-year-old child named ${childData.childName}
Art style: Bright, cheerful, whimsical children's book illustration with soft edges
Colors: Warm, vibrant, family-friendly palette with magical touches
Quality: Professional children's book illustration, high resolution, publication ready
Mood: Joyful, magical, safe, and inspiring - perfect for young children
Details: Include magical sparkles or gentle fantasy elements, avoid any scary or dark themes`

      // Generate image with DALL-E 3
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      })

      const imageData = await imageResponse.json()
      
      if (!imageResponse.ok) {
        console.error(`DALL-E API error for page ${page.page}:`, imageData.error)
        continue
      }

      const imageUrl = imageData.data[0].url
      
      // Upload to Cloudinary for permanent storage
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${Deno.env.get('CLOUDINARY_CLOUD_NAME')}/upload`,
        {
          method: 'POST',
          body: JSON.stringify({
            file: imageUrl,
            upload_preset: Deno.env.get('CLOUDINARY_UPLOAD_PRESET'),
            folder: `stories/${storyId}`,
            public_id: `ai_page_${page.page}`,
          }),
          headers: { 'Content-Type': 'application/json' }
        }
      )

      const cloudinaryResult = await cloudinaryResponse.json()
      
      if (cloudinaryResult.secure_url) {
        // Save to story_images table
        await supabase
          .from('story_images')
          .insert({
            story_id: storyId,
            page_number: page.page,
            image_type: 'ai_generated',
            image_url: cloudinaryResult.secure_url,
            cloudinary_public_id: cloudinaryResult.public_id,
            image_prompt: enhancedPrompt
          })
      }

    } catch (error) {
      console.error(`Error generating image for page ${page.page}:`, error)
    }
  }
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return 'data:' + file.type + ';base64,' + btoa(binary)
}