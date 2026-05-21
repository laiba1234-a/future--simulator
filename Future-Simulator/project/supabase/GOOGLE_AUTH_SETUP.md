# Google sign-in setup

The app uses **Google's account picker** directly, then signs you into Supabase.

## Why you only see a JSON error page

If the browser shows:

`{"msg":"Unsupported provider: provider is not enabled"}`

**Google is still OFF in Supabase.** The app cannot open Google's picker through that redirect until you enable it below.

## Steps (do all of them)

### 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials**.
2. **Create credentials** → **OAuth client ID** → type **Web application**.
3. **Authorized JavaScript origins:** `http://localhost:5173`
4. **Authorized redirect URIs:** add the callback from Supabase (step 2), e.g.  
   `https://lamkbfxnchwxzwfezxkt.supabase.co/auth/v1/callback`
5. Copy the **Client ID** (ends with `.apps.googleusercontent.com`).

### 2. Supabase dashboard

1. [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Authentication** → **Providers** → **Google**.
3. Turn **Enable Sign in with Google** **ON**.
4. Paste the **Client ID** and **Client secret** from Google Cloud → **Save**.
5. **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173`

### 3. App `.env` file

In `project/.env` add (use the same Client ID as above):

```
VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

Restart the dev server after changing `.env`:

```
npm run dev
```

### 4. Test

1. Open `http://localhost:5173`
2. Click the official **Continue with Google** button (Google-branded button).
3. Google's account picker should open.
4. After choosing an account, you return to the app signed in.

## Still stuck?

- Hard refresh: `Ctrl+Shift+R`
- Confirm `.env` has `VITE_GOOGLE_CLIENT_ID` with no extra spaces
- Client ID in `.env`, Supabase Google provider, and Google Cloud must all match
- In Google Cloud, ensure the OAuth consent screen is configured (even for testing)
