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
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the request body
    const { user_id, email } = await req.json()

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'user_id and email are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log(`Deleting user: ${email} (${user_id})`)

    // Delete from database tables (in order due to foreign key constraints)
    // The CASCADE deletes should handle most of this, but we'll be explicit

    // 1. Delete logbook entries
    const { error: entriesError } = await supabaseAdmin
      .from('logbook_entries')
      .delete()
      .eq('user_id', user_id)

    if (entriesError) {
      console.error('Error deleting entries:', entriesError)
      // Continue anyway - might not exist
    }

    // 2. Delete user aircraft
    const { error: aircraftError } = await supabaseAdmin
      .from('user_aircraft')
      .delete()
      .eq('user_id', user_id)

    if (aircraftError) {
      console.error('Error deleting aircraft:', aircraftError)
    }

    // 3. Delete supervisors
    const { error: supervisorsError } = await supabaseAdmin
      .from('supervisors')
      .delete()
      .eq('user_id', user_id)

    if (supervisorsError) {
      console.error('Error deleting supervisors:', supervisorsError)
    }

    // 4. Delete employment history
    const { error: employmentError } = await supabaseAdmin
      .from('employment_history')
      .delete()
      .eq('user_id', user_id)

    if (employmentError) {
      console.error('Error deleting employment:', employmentError)
    }

    // 5. Delete addresses
    const { error: addressesError } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('user_id', user_id)

    if (addressesError) {
      console.error('Error deleting addresses:', addressesError)
    }

    // 6. Delete from profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user_id)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      throw new Error(`Failed to delete profile: ${profileError.message}`)
    }

    // 7. Delete from auth.users using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      user_id
    )

    if (authError) {
      console.error('Error deleting auth user:', authError)
      throw new Error(`Failed to delete auth user: ${authError.message}`)
    }

    console.log(`Successfully deleted user: ${email} (${user_id})`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User and all associated data deleted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
