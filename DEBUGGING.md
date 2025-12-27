# Debugging Guide

This guide helps you troubleshoot issues with the Open Interview application, especially connection problems with the Gemini API.

## Where to See Application Logs

All application logs are output to the **browser's Developer Console**. This includes:
- Connection status messages
- API errors (quota, authentication, network issues)
- Detailed error information
- Debug messages

### How to Open Browser Console

**Chrome/Edge/Brave:**
- Press `F12` or `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (Mac)
- Or right-click → "Inspect" → Click "Console" tab

**Firefox:**
- Press `F12` or `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Option+K` (Mac)
- Or right-click → "Inspect Element" → Click "Console" tab

**Safari:**
- Press `Cmd+Option+C` (Mac)
- Or Enable Developer menu: Safari → Preferences → Advanced → "Show Develop menu in menu bar"

### What Logs to Look For

When starting an interview, you should see logs like:

```
[InterviewSession] Starting session...
[InterviewSession] API Key present: true Using custom key: false
[InterviewSession] Step 1: Setting up Audio Contexts...
[InterviewSession] Step 2: Requesting media stream...
[InterviewSession] Step 3: Initializing GoogleGenAI...
[InterviewSession] Step 4: Connecting to Live API...
[InterviewSession] Session promise created, waiting for connection...
```

**On Success:**
```
[InterviewSession] ✅ Connection opened successfully!
```

**On Error:**
```
[InterviewSession] ❌ Session Error (onerror callback): ...
[InterviewSession] Error Type: QUOTA_EXCEEDED
[InterviewSession] Quota exceeded: ...
```

## Common Issues and Solutions

### Connection Opens Then Immediately Closes

**Symptoms:** Connection opens successfully (`✅ Connection opened successfully!`) but then immediately closes (`⚠️ Connection closed`)

**This usually indicates:**
- **API quota exceeded** - Most common cause. Connection opens but gets rejected by API
- **Invalid API key** - API accepts connection but rejects due to invalid key
- **Permission/authentication issues** - API rejects after initial handshake
- **Network instability** - Connection drops immediately

**What to check:**
1. **Browser Console:**
   - Look for close event details (code, reason, wasClean)
   - Check if error message appears after close

2. **Network Tab:**
   - Open Developer Tools → Network tab
   - Filter by "WS" (WebSocket)
   - Look for the WebSocket connection
   - Check the close frame details (status code)
   - Common close codes:
     - `1000` = Normal closure
     - `1001` = Going away
     - `1006` = Abnormal closure (connection lost)
     - `4001`+ = API-specific errors

3. **API Quota:**
   - Go to Google Cloud Console → APIs & Services → Dashboard
   - Check Gemini API usage/quota
   - Free tier has very limited quotas

4. **API Key:**
   - Verify API key is correct and active
   - Check API key has Gemini API enabled
   - Check API key restrictions

**Solutions:**
- Wait for quota to reset (if quota exceeded)
- Regenerate API key (if invalid)
- Check Google Cloud Console for detailed error logs
- Try with a different API key (if available)

### App Stuck in "CONNECTING..." State

If your app is stuck in "CONNECTING..." when starting an interview:

1. **Check Browser Console** (F12 → Console tab)
   - Look for error messages starting with `[InterviewSession] ❌`
   - Check for error types like `QUOTA_EXCEEDED`, `INVALID_API_KEY`, `NETWORK_ERROR`, etc.

2. **Common Causes:**

   **A. API Quota Exceeded** (Most Likely if you see no errors)
   - **Symptoms:** App stuck in "CONNECTING...", no error messages in console
   - **Error Type:** `QUOTA_EXCEEDED`
   - **What to check:**
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Navigate to "APIs & Services" → "Dashboard"
     - Check your Gemini API usage/quota
     - Free tier typically has rate limits (requests per minute/day)
   - **Solutions:**
     - Wait for quota to reset (usually hourly or daily)
     - Upgrade to paid tier if needed
     - Use a different API key with available quota

   **B. Invalid API Key**
   - **Symptoms:** Error message: "Invalid API key"
   - **Error Type:** `INVALID_API_KEY`
   - **Solutions:**
     - Verify API key in `.env.local` file
     - Ensure API key starts with "AIza..."
     - Regenerate API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
     - Check that Gemini API is enabled for your project

   **C. Network/Connection Error**
   - **Symptoms:** Error message about network or connection
   - **Error Type:** `NETWORK_ERROR`
   - **Solutions:**
     - Check internet connection
     - Check browser console for detailed network errors
     - Try again after a few seconds
     - Check if firewall/proxy is blocking connections

   **D. Connection Timeout**
   - **Symptoms:** After 15 seconds, should see timeout error
   - **Error Type:** Connection timeout (15 seconds)
   - **Solutions:**
     - Check API key validity
     - Check network connection
     - Check API quota (might be silently failing)
     - Check browser console for detailed errors

3. **If No Errors in Console:**

   If you don't see ANY error messages in the console:
   - **Check if console is filtering messages** (make sure "All levels" or "Errors" are visible)
   - **Check for warnings** (yellow text) - these might contain clues
   - **Check Network tab** (F12 → Network) for failed requests
     - Look for requests to Google/Gemini APIs
     - Check status codes (429 = quota, 401/403 = auth, etc.)
   - **Try using a different browser** to rule out browser-specific issues

### Checking API Quota

To check if you've exceeded your API quota:

1. **Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Navigate to "APIs & Services" → "Dashboard"
   - Look for "Generative Language API" or "Gemini API"
   - Check quota/usage metrics

2. **API Key Restrictions:**
   - Go to "APIs & Services" → "Credentials"
   - Click on your API key
   - Check "API restrictions" and "Application restrictions"
   - Ensure Gemini API is enabled

3. **Billing:**
   - Check if billing is enabled (required for higher quotas)
   - Free tier has very limited quotas

### Debugging Steps

1. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache entirely

2. **Check Environment Variables:**
   - Verify `.env.local` file exists
   - Check that `GEMINI_API_KEY` is set correctly
   - Restart dev server after changing `.env.local`

3. **Test API Key Directly:**
   - Try making a simple API call using curl or Postman
   - Or use Google AI Studio to test your key

4. **Check Browser Permissions:**
   - Camera and microphone permissions should be granted
   - Check browser address bar for permission icons

5. **Check Network Tab:**
   - Open Developer Tools (F12)
   - Go to "Network" tab
   - Try starting interview again
   - Look for failed requests (red entries)
   - Check request headers and response status codes

### Understanding Error Messages

The application categorizes errors into types:

- **QUOTA_EXCEEDED**: API usage limit reached
- **INVALID_API_KEY**: API key is incorrect or invalid
- **AUTH_ERROR**: Authentication failed
- **PERMISSION_DENIED**: API key doesn't have required permissions
- **NETWORK_ERROR**: Connection/network issues
- **UNKNOWN_ERROR**: Generic error (check console for details)

Each error includes:
- User-friendly message (displayed in UI)
- Detailed log message (in console)
- Full error details (in console)

### Getting More Detailed Logs

If you need even more detailed debugging:

1. **Enable Verbose Logging:**
   - All logs are already enabled in development mode
   - Look for console messages starting with `[InterviewSession]`

2. **Check Network Requests:**
   - Open Developer Tools → Network tab
   - Filter by "WS" (WebSocket) to see Live API connections
   - Filter by "Fetch/XHR" to see HTTP requests
   - Check response status codes and error messages

3. **Check for Console Errors:**
   - Look for red error messages
   - Look for yellow warnings
   - Expand error objects to see full details

## Still Stuck?

If you're still having issues:

1. **Check the console for errors** - this is the most important step
2. **Share the console output** - especially any errors starting with `[InterviewSession]`
3. **Check your API quota** in Google Cloud Console
4. **Verify your API key** is correct and has Gemini API enabled
5. **Try with a fresh API key** to rule out quota issues

## Quick Checklist

- [ ] Browser console is open (F12)
- [ ] Console shows logs when starting interview
- [ ] No errors in console (check all log levels)
- [ ] API key is set in `.env.local`
- [ ] Dev server restarted after setting API key
- [ ] Camera/microphone permissions granted
- [ ] API quota checked in Google Cloud Console
- [ ] Network tab checked for failed requests

