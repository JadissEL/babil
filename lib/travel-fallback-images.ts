/**
 * Stable travel imagery when a country has no API highlight — avoids deprecated
 * `source.unsplash.com` redirects. All URLs use images.unsplash.com (see next.config remotePatterns).
 */

export const TRAVEL_AMBIENCE_IMAGE_URLS: readonly string[] = [
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1552832230-c0197dd771b6?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1555881400-74d453aca0b6?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1517935701353-4b5219354e08?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1531366937837-27bf6d5c1198?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1534351590667-13e3e96b5017?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1524492412937-b280c872990d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1552465011-b4e21bf619e9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1523906834657-45e01ef652fe?auto=format&fit=crop&w=1600&q=80',
]

export function travelAmbienceImageForSeed(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return TRAVEL_AMBIENCE_IMAGE_URLS[h % TRAVEL_AMBIENCE_IMAGE_URLS.length]!
}
