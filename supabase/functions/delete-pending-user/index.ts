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
    const { user_id, email } = await req.json()

    // Validate required fields
    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or email' }),
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

    // 1. Mark invite as expired
    await supabase
      .from('invites')
      .update({ status: 'expired' })
      .eq('email', email)
      .eq('status', 'pending')

    // 2. Delete profile (only if pending)
    await supabase
      .from('profiles')
      .delete()
      .eq('id', user_id)
      .eq('account_status', 'pending')

    // 3. Delete from auth.users (requires service_role)
    const { error: authError } = await supabase.auth.admin.deleteUser(user_id)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      // Don't fail the whole operation - profile is already deleted
    }

    console.log('Pending user fully deleted:', email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pending user completely removed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error deleting pending user:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
