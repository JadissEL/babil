import Script from 'next/script';
import React from 'react';

interface AdProps {
  slot: string; // AdSense numeric slot id (string form)
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

const GoogleAd: React.FC<AdProps> = ({ slot, format = 'auto', className }) => {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  // Dev / missing config: render nothing (keeps public UX clean).
  if (!client) return null;

  return (
    <div className={['my-8 flex justify-center w-full', className].filter(Boolean).join(' ')}>
      <Script
        id="adsbygoogle-init"
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
        crossOrigin="anonymous"
      />

      <Script id={`adsbygoogle-push-${slot}`} strategy="afterInteractive">
        {`(window.adsbygoogle=window.adsbygoogle||[]).push({});`}
      </Script>

      <ins
        className="adsbygoogle w-full"
        style={{ display: 'block', minHeight: 100 }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;
