# User Invites Feature Setup

This document explains how to set up and use the user invites feature in the Aviation Logbook application.

## Database Setup

1. **Run the SQL migration** to create the invites table:
   - Connect to your Supabase project dashboard
   - Go to the SQL Editor
   - Run the SQL script from `create-user-invites.sql`

This will create:
- The `invites` table to track user invitations
- Appropriate indexes for performance
- Row Level Security (RLS) policies so only admins can manage invites

## How It Works

### Current Implementation (Manual)

1. **Admin creates an invite:**
   - Admin navigates to Admin Panel → Users tab
   - Clicks "Invite User" button
   - Fills in email, full name, and optionally grants admin privileges
   - Submits the form

2. **System creates invite record:**
   - A record is created in the `invites` table
   - The invite expires in 7 days
   - A signup link is generated

3. **Admin shares the link:**
   - The admin copies the generated signup link
   - Manually sends it to the invited user via email, Slack, etc.

4. **User signs up:**
   - User clicks the link and signs up
   - The system can validate the email against the invites table

### Future Enhancement: Automated Email Sending

To implement automated invite emails, you have several options:

#### Option 1: Supabase Edge Function (Recommended)

Create a Supabase Edge Function to send emails:

```typescript
// supabase/functions/send-invite/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { email, full_name, signup_url } = await req.json()

  // Use a service like SendGrid, Mailgun, or AWS SES
  // Send email with the signup link

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Then update the `handleInviteUser` function to call this edge function.

#### Option 2: Supabase Auth Invites

Use Supabase's built-in invite functionality:

1. Set up a backend service with the service_role key
2. Call `supabase.auth.admin.inviteUserByEmail()`
3. Configure email templates in Supabase dashboard

#### Option 3: Third-party Email Service

Integrate directly with services like:
- SendGrid
- Mailgun
- AWS SES
- Postmark

## Managing Invites

### View Pending Invites

In the Admin Panel → Users tab, you'll see a "Pending Invites" section showing:
- Invited user's name and email
- When the invite was created
- When it expires
- Who sent the invite

### Cancel an Invite

Click the "Cancel" button next to a pending invite to expire it.

## Security Considerations

1. **RLS Policies:** Only users with `is_admin = true` can view, create, or manage invites
2. **Email Validation:** The system validates email format before creating invites
3. **Duplicate Prevention:** Cannot create multiple pending invites for the same email
4. **Expiration:** Invites automatically expire after 7 days
5. **Service Role Key:** Keep your Supabase service_role key secure on the backend only

## Troubleshooting

### "An invite has already been sent to this email"

- Check the Pending Invites section
- Cancel the existing invite if needed
- Create a new invite

### User can't see invited email

- Make sure the `email` field is populated in the `profiles` table during signup
- Check that the signup process creates a profile record

### Invites table doesn't exist

- Run the SQL migration from `create-user-invites.sql` in your Supabase SQL Editor

## Future Enhancements

- [ ] Automated email sending via Supabase Edge Functions
- [ ] Resend invite functionality
- [ ] Custom invite expiration periods
- [ ] Bulk invite import from CSV
- [ ] Invite templates for different user roles
- [ ] Invite acceptance tracking
