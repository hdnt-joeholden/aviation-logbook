import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { email, full_name, signup_url, invited_by_name } = await req.json()

    // Validate required fields
    if (!email || !full_name || !signup_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client with service_role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Use Supabase's built-in invite system
    // This creates a user immediately with status 'pending'
    // User will be marked 'active' when they complete registration
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: full_name,
        invited_by: invited_by_name,
        account_status: 'pending'  // Mark as pending until they complete signup
      },
      redirectTo: signup_url
    })

    if (error) {
      throw new Error(`Failed to generate invite link: ${error.message}`)
    }

    console.log('Invite email sent to:', email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation email sent successfully using Supabase Auth',
        data: {
          email,
          user: data.user
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending invite:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Make sure Supabase email is configured in your project settings'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
