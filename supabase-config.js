// Supabase configuration
// IMPORTANT: Replace these with your actual values from Supabase dashboard

const SUPABASE_URL = "https://dybbumvwengcwspornih.supabase.co"; // Replace with your Project URL (like: https://abc123.supabase.co)
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YmJ1bXZ3ZW5nY3dzcG9ybmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDQzNzEsImV4cCI6MjA3MTg4MDM3MX0.wDImXKw_m5b5grYtvYUb4eJCTYc4zvWsISymJIg85GU"; // Replace with your anon public key (starts with eyJ...)

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it available globally
window.supabaseClient = supabase;
