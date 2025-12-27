import React, { useEffect } from 'react';

interface AdSenseAdProps {
  /**
   * Your AdSense Ad Unit ID (e.g., '1234567890')
   * Get this from Google AdSense dashboard after creating an ad unit
   */
  adSlot?: string;
  /**
   * Ad format (display, in-article, in-feed, etc.)
   * Default: 'auto' for responsive ads
   */
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  /**
   * Ad dimensions (for fixed-size ads)
   */
  style?: React.CSSProperties;
  /**
   * Custom className for styling
   */
  className?: string;
  /**
   * Whether to show a placeholder when ad is loading
   */
  showPlaceholder?: boolean;
}

/**
 * Google AdSense Ad Component
 * 
 * Usage:
 * <AdSenseAd adSlot="1234567890" format="auto" />
 * 
 * To get your ad slot ID:
 * 1. Go to https://www.google.com/adsense
 * 2. Create a new ad unit
 * 3. Copy the ad slot ID
 */
export const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  format = 'auto',
  style = {},
  className = '',
  showPlaceholder = false,
}) => {
  useEffect(() => {
    try {
      // Push ad to Google AdSense
      if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  const defaultStyle: React.CSSProperties = {
    display: 'block',
    textAlign: 'center',
    minHeight: format === 'auto' ? '250px' : undefined,
    ...style,
  };

  return (
    <div className={`adsense-container ${className}`} style={defaultStyle}>
      {showPlaceholder && (
        <div className="text-xs text-slate-400 p-2 bg-slate-50 rounded">
          Loading ad...
        </div>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...defaultStyle }}
        data-ad-client="ca-pub-8396981938969998"
        {...(adSlot && { 'data-ad-slot': adSlot })}
        data-ad-format={format}
        data-full-width-responsive={format === 'auto' ? 'true' : 'false'}
      />
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

