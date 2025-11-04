import { createClient } from '@supabase/supabase-js'

// Create a safe getter that only initializes at runtime
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // During build time or when vars are missing, return a mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return mock client with valid JWT format
    return createClient(
      'https://placeholder.supabase.co', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  // During build time or when vars are missing, return a mock client
  if (!supabaseUrl || !supabaseServiceKey) {
    // Return mock client with valid JWT format
    return createClient(
      'https://placeholder.supabase.co', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjgwMCwiZXhwIjoxOTYwNzY4ODAwfQ.placeholder'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Export clients
export const supabase = createSupabaseClient()
export const supabaseAdmin = createSupabaseAdminClient()