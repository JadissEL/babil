# Home page — LCP and hero images (catalogue D.65)

## LCP candidate

The primary **Largest Contentful Paint** candidate on `/` is the **hero world carousel** ([`components/home/HeroWorldCarousel.tsx`](../components/home/HeroWorldCarousel.tsx)): full-width `next/image` with `fill` and `object-cover`.

## Current implementation (adequate baseline)

- **`next/image`** is used for all carousel slides (remote URLs from curated data / merged travel highlights).
- **First slide** uses **`priority={slideIndex === 0}`**, which opts into eager loading for the LCP image.
- **`sizes="(max-width: 768px) 100vw, 896px"`** constrains the requested intrinsic size appropriately for responsive layout.

## Trade-off: crossfade vs. network

All slides are **mounted in the DOM** at once (stacked layers with opacity) to support the crossfade. Browsers may still **fetch** images for off-screen layers because those `<img>` elements are in the layout viewport. If bandwidth becomes an issue, a follow-up would be to render **at most two** image layers (current + previous) or prefetch only the next slide — at the cost of more complex transition code.

## Follow-ups (backlog, not blocking D.65)

- Compress or serve smaller **hero** assets at the CDN/source where possible.
- Revisit **multi-slide mounting** if Lighthouse reports excessive image bytes on the home URL.
