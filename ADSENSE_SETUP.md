# Google AdSense Setup Guide

This guide explains how to configure Google AdSense for the Open Interview application deployed at `https://www.idatagear.com/interview`.

## Prerequisites

✅ Your domain `www.idatagear.com` is already approved for Google AdSense

## Setup Steps

### 1. Get Your AdSense Publisher ID

1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign in with your Google account
3. Navigate to **Account** → **Account Information**
4. Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXX`)

### 2. Update the AdSense Script

✅ **Already configured** - Your Publisher ID (`ca-pub-8396981938969998`) has been set in:
- `index.html` - AdSense auto-ads script
- `components/AdSenseAd.tsx` - Manual ad placements component

No further changes needed for basic setup.

### 3. Create Ad Units (Optional - for Manual Ad Placements)

If you want to control where ads appear (instead of using auto-ads):

1. Go to [Google AdSense](https://www.google.com/adsense)
2. Navigate to **Ads** → **By ad unit**
3. Click **+ New ad unit**
4. Choose ad format:
   - **Display ads** - Standard banner ads
   - **In-article ads** - Ads within content
   - **In-feed ads** - Ads in feed/list views
   - **Responsive ads** - Automatically adjust size (recommended)
5. Name your ad unit (e.g., "Interview Home Page Banner")
6. Click **Create**
7. Copy the **Ad unit ID** (format: `1234567890`)

### 4. Configure Ad Placements

The application has ad placements configured in these locations:

#### Automatic Ads (Recommended)
- **Location**: `index.html` - AdSense auto-ads script
- **Behavior**: Google automatically places ads on your pages
- **Configuration**: Just update the Publisher ID in `index.html`

#### Manual Ad Placements
If you want specific ad placements, you can use the `AdSenseAd` component:

**Home Page (Job Listings):**
- **Top Banner**: Above job listings
- **Bottom Banner**: Below job listings
- **Location**: `App.tsx` - `renderHome()` function

**Footer:**
- **Location**: `App.tsx` - Footer section
- **Format**: Responsive auto

**To use manual ad placements:**
1. Get your Ad Unit ID from AdSense (step 3 above)
2. Update `App.tsx` and replace the `AdSenseAd` components with your ad slot IDs:
   ```tsx
   <AdSenseAd 
     adSlot="1234567890"  // Replace with your Ad Unit ID
     format="auto"
     className="w-full"
   />
   ```

### 5. Update Publisher ID in Code

✅ **Already configured** - Your Publisher ID has been set:
- **Publisher ID**: `ca-pub-8396981938969998`
- **Location 1**: `index.html` (AdSense auto-ads script) ✅
- **Location 2**: `components/AdSenseAd.tsx` (Manual ad component) ✅

No changes needed - ready to deploy!

### 6. Build and Deploy

After updating the Publisher ID:

```bash
npm run build
```

Then deploy the `dist/` folder to your server.

### 7. Verify Ads Are Showing

1. Visit `https://www.idatagear.com/interview`
2. Wait a few minutes for AdSense to crawl and approve the pages
3. Check that ads appear on the page
4. Use [AdSense Preview Tool](https://www.google.com/adsense/preview) to verify

## Ad Placement Locations

### Current Ad Placements:

1. **Home Page - Top Banner**
   - Location: Above job listings grid
   - Format: Responsive auto
   - Component: `<AdSenseAd format="auto" />`

2. **Home Page - Bottom Banner**
   - Location: Below job listings grid
   - Format: Responsive auto
   - Component: `<AdSenseAd format="auto" />`

3. **Footer**
   - Location: Site footer
   - Format: Responsive auto
   - Component: `<AdSenseAd format="auto" />`

### Adding More Ad Placements

To add ads to other pages (e.g., Job Details, Profile Page, Interview Session):

1. Import the component:
   ```tsx
   import { AdSenseAd } from './components/AdSenseAd';
   ```

2. Add the component where you want ads:
   ```tsx
   <AdSenseAd 
     adSlot="YOUR_AD_UNIT_ID"  // Optional: for specific ad units
     format="auto"              // auto, rectangle, vertical, horizontal
     className="w-full mb-4"    // Optional: styling
   />
   ```

## AdSense Policies

Make sure your ads comply with Google AdSense policies:

- ✅ **No click fraud**: Don't click your own ads
- ✅ **Valid traffic**: Ensure genuine user traffic
- ✅ **Content quality**: Maintain quality content around ads
- ✅ **Layout**: Ads should be clearly distinguishable from content
- ✅ **Mobile-friendly**: Ensure ads display correctly on mobile

## Troubleshooting

### Ads Not Showing

1. **Wait for approval**: New pages can take 24-48 hours for ads to appear
2. **Check Publisher ID**: Verify it's correct in both locations
3. **Check domain approval**: Ensure `www.idatagear.com` is approved
4. **Use Preview Tool**: Check [AdSense Preview](https://www.google.com/adsense/preview)
5. **Check AdSense account**: Ensure your account is in good standing
6. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
7. **Check ad blockers**: Disable ad blockers to test

### Ads Showing in Development but Not Production

- **Domain mismatch**: Ensure you're testing on the approved domain
- **HTTPS required**: AdSense requires HTTPS in production
- **Subdirectory**: Ads should work fine under `/interview/` path

### Console Errors

- **"adsbygoogle.push() error"**: Normal during development, should work in production
- **"No ad slots"**: Make sure Publisher ID is set correctly

## Best Practices

1. **Don't block ads**: Avoid blocking ad scripts with content blockers
2. **Responsive design**: Use `format="auto"` for responsive ads
3. **Performance**: Ads are loaded asynchronously, won't block page load
4. **User experience**: Place ads where they don't interfere with functionality
5. **Testing**: Use AdSense Preview Tool instead of clicking ads yourself

## Monitoring

1. **AdSense Dashboard**: Monitor earnings and performance
2. **Ad Performance**: Check which ad placements perform best
3. **Revenue**: Track revenue per page/placement
4. **Policy compliance**: Regularly check for policy violations

## Support

- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)

