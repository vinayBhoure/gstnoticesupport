import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

// Brand colours are inlined here because ImageResponse (satori) cannot read
// CSS tokens or Tailwind — these mirror resources/ui/css/tokens.css.
const NAVY = '#0A2540';
const DEEP_BLUE = '#1B3A6B';
const GREEN = '#0B8B4E';

export const alt = `${SITE_NAME} — Expert GST Litigation Help`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, ${DEEP_BLUE} 100%)`,
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: GREEN,
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: '30px', fontWeight: 600, letterSpacing: '-0.5px' }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '68px',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              maxWidth: '900px',
            }}
          >
            GST Notice? Get Expert Legal Support in 24 Hours.
          </div>
          <div style={{ display: 'flex', fontSize: '30px', color: '#C7D3E3', maxWidth: '880px' }}>
            ICAI-registered CAs &amp; Bar Council-enrolled Advocates — replies, appeals &amp; representation. Fixed fee, pan-India.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', width: '40px', height: '4px', backgroundColor: GREEN, borderRadius: '2px' }} />
          <div style={{ display: 'flex', fontSize: '26px', color: '#9FB1C7' }}>gstnoticesupport.in</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
