# Fix: Redirecting to localhost after Google Login on Vercel

## The Problem

After deploying to Vercel and logging in with Google, you're being redirected to:
```
http://localhost:3000/?code=xxxxx
```

This happens because Supabase is still configured to redirect to localhost instead of your Vercel deployment.

## The Solution

You need to update **TWO** places:

### 1. Update Supabase Site URL (CRITICAL)

1. Go to: https://supabase.com/dashboard/project/hipbwejveviqglbrtdbv
2. Click **Authentication** → **URL Configuration**
3. Update **Site URL** to your Vercel deployment URL:
   ```
   https://your-app-name.vercel.app
   ```
   (Replace `your-app-name` with your actual Vercel app name)

4. In **Redirect URLs**, add:
   ```
   https://your-app-name.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
   Keep both URLs so it works in development AND production

5. Click **Save**

### 2. Update Google OAuth Console (if needed)

1. Go to: https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   ```
   https://your-app-name.vercel.app
   ```
5. Click **Save**

## Test the Fix

1. Clear your browser cookies/cache (or use incognito mode)
2. Go to your Vercel URL: `https://your-app-name.vercel.app`
3. Click "Continue with Google"
4. After logging in, you should be redirected back to your Vercel app, NOT localhost

## Still Having Issues?

### Check Environment Variables in Vercel

Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

To check/update:
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Verify all three variables are set correctly
4. If you change them, **Redeploy** your app

### Verify the Redirect URL

Your Supabase redirect URL in the Google provider settings should be:
```
https://hipbwejveviqglbrtdbv.supabase.co/auth/v1/callback
```

This is the Google → Supabase callback. Then Supabase redirects to your app based on the Site URL you set.

## How OAuth Flow Works

1. User clicks "Continue with Google" on your Vercel app
2. User is sent to Google to login
3. Google redirects to Supabase: `https://[project].supabase.co/auth/v1/callback`
4. Supabase redirects to your app's Site URL with the auth code: `https://your-app.vercel.app/auth/callback?code=...`
5. Your app exchanges the code for a session

The redirect to localhost happens in step 4 if the Site URL is not updated!
