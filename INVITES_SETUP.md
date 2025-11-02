# User Invites Feature Setup

This document explains how to set up and use the user invites feature in the Aviation Logbook application.

## Database Setup

### Initial Setup (If not already done)

1. **Run the SQL migration** to create the invites table:
   - Connect to your Supabase project dashboard
   - Go to the SQL Editor
   - Run the SQL script from `create-user-invites.sql`

This will create:
- The `invites` table to track user invitations
- Appropriate indexes for performance
- Row Level Security (RLS) policies so only admins can manage invites

### Update for is_admin Field (Required)

2. **Add the is_admin column** to support admin privilege grants:
   - Go to the SQL Editor in Supabase
   - Run the SQL script from `add-invites-is-admin.sql`

This adds the `is_admin` boolean field to track whether the invite grants admin privileges.

## How It Works

### Current Implementation ✅

1. **Admin creates an invite:**
   - Admin navigates to Admin Panel → Users tab
   - Clicks "Invite User" button
   - Fills in email, full name, and optionally grants admin privileges
   - Submits the form

2. **System creates invite record:**
   - A record is created in the `invites` table with `is_admin` flag
   - The invite expires in 7 days
   - A unique signup link is generated (e.g., `/?invite=user@example.com`)

3. **Automated email delivery:**
   - System attempts to send invitation email via Supabase Edge Function
   - If email service is configured, user receives email with signup link
   - If email service is not configured, admin receives the link to share manually
   - Fallback: Admin can always copy the link and share it manually

4. **User receives invitation:**
   - User receives email with personalized invitation
   - Email includes direct signup link and invite details
   - Link is valid for 7 days

5. **User signs up via invite link:**
   - User clicks the link (`/?invite=email@example.com`)
   - Registration form opens with email pre-filled and locked
   - User enters their name and password
   - System validates the invite exists and is not expired
   - User account is created

6. **Automatic configuration:**
   - Invite status is marked as 'accepted'
   - User's email is saved to their profile
   - If invite granted admin privileges, user gets `is_admin = true`
   - User can immediately access the system with appropriate permissions

### Email Sending Setup (Recommended)

**Good News!** The invite system now uses **Supabase's built-in email system** - the same one already sending your signup confirmation emails. No external services needed!

**Setup is simple:**
1. Deploy the Edge Function: `supabase functions deploy send-invite`
2. That's it! Emails will use your existing Supabase email configuration

For detailed setup instructions, see **[SUPABASE_EMAIL_SETUP.md](./SUPABASE_EMAIL_SETUP.md)** which includes:
- One-command deployment
- Email template customization
- Troubleshooting tips
- Production SMTP setup (optional)

**Quick Deploy:**
```bash
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy send-invite
```

**Without Email Function Deployed:**
- Invites still work perfectly
- Admin gets the signup link to share manually
- No email will be sent automatically

**Alternative:** If you need to use external email providers instead, see [EMAIL_SETUP.md](./EMAIL_SETUP.md) for Resend, SendGrid, and AWS SES options.

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

## Implementation Status

### ✅ Completed Features
- [x] Complete invite creation and management UI
- [x] Email validation and duplicate prevention
- [x] Pending invites display with expiration dates
- [x] Cancel invite functionality
- [x] Automated signup link generation
- [x] URL parameter handling for invite links
- [x] Pre-filled and locked email fields for invites
- [x] Invite validation during registration
- [x] Automatic invite acceptance tracking
- [x] Admin privilege assignment via invites
- [x] Email saved to profiles during signup
- [x] Supabase Edge Function for email sending (ready to configure)
- [x] Graceful fallback when email is not configured
- [x] Comprehensive error handling and user feedback

### 🔄 Ready to Configure
- [ ] Email provider integration (see EMAIL_SETUP.md)
- [ ] Custom email templates and branding
- [ ] Email delivery monitoring

### 💡 Future Enhancement Ideas
- [ ] Resend invite functionality (one-click resend)
- [ ] Custom invite expiration periods (currently fixed at 7 days)
- [ ] Bulk invite import from CSV
- [ ] Multiple invite templates for different user roles
- [ ] Invite analytics dashboard
- [ ] SMS invite option
- [ ] Multi-language invite emails
