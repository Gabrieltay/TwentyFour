# Google Authentication Setup

This app uses Google OAuth for authentication via Supabase. Follow these steps to configure it:

## 1. Enable Google Provider in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hipbwejveviqglbrtdbv
2. Click on **Authentication** in the left sidebar
3. Click on **Providers**
4. Find **Google** and click to expand it
5. Toggle **Enable Sign in with Google** to ON

## 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** for User Type
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `email` and `profile`
   - Save and continue
6. Back in Credentials, create OAuth client ID:
   - Application type: **Web application**
   - Name: TwentyFour Game
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `https://hipbwejveviqglbrtdbv.supabase.co/auth/v1/callback`
     - (Copy this from Supabase - it's shown in the Google provider settings)
   - Click **Create**

7. Copy the **Client ID** and **Client Secret**

## 3. Configure Supabase with Google Credentials

1. Go back to Supabase Dashboard → Authentication → Providers → Google
2. Paste the **Client ID** in the "Client ID" field
3. Paste the **Client Secret** in the "Client Secret" field
4. (Optional) Add authorized domains if needed
5. Click **Save**

## 4. Configure Site URL in Supabase (IMPORTANT for Production)

**This step is REQUIRED for your Vercel deployment to work:**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Update **Site URL** to your Vercel deployment URL:
   - Example: `https://your-app.vercel.app`
   - This tells Supabase where to redirect users after OAuth
3. Add your Vercel URL to **Redirect URLs**:
   - Add: `https://your-app.vercel.app/auth/callback`
   - Keep the localhost URL for development: `http://localhost:3000/auth/callback`
4. Click **Save**

## 5. Update Google OAuth Authorized Origins (for Production)

When you deploy your app to Vercel, also update Google OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add your Vercel URL to **Authorized JavaScript origins**:
   - Add: `https://your-app.vercel.app`
5. Click **Save**

## 6. Test the Authentication

1. Start your dev server: `pnpm dev`
2. Go to http://localhost:3000/login
3. Click "Continue with Google"
4. You should be redirected to Google's login page
5. After successful login, you'll be redirected back to the game

## Troubleshooting

### "redirect_uri_mismatch" error

- Make sure the redirect URI in Google Console matches exactly what Supabase provides
- The URI should be: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

### "Access blocked" error

- Make sure you've published your OAuth consent screen in Google Console
- Or add your test email to the test users list

### User not redirecting after login

- Check that `/auth/callback` route is working
- Check browser console for errors
- Verify your Supabase credentials in `.env` file

## Database Sync

The User table in your database will automatically sync with Google OAuth users:

- User ID will be their Supabase Auth ID (UUID)
- Email will be populated from their Google account
- First time users are automatically created in the database via the API

That's it! Your Google authentication should now be working.
