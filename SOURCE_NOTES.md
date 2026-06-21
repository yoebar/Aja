# Aja Alloys Website Source Notes

This site uses the supplied Aja logo and temporary placeholder industrial images. Replace the placeholders with factory photographs when available.

## Image Optimisation (2026-06-21)

- The heavy source PNGs (hero, company, export images, 2.1 to 2.7 MB each) were converted to optimised WebP at quality 80. Total image weight dropped from about 17 MB to about 1.3 MB. The `<img>` references now point to the `.webp` files; the original `.png` files are retained in `assets/` as un-referenced source copies and can be deleted if not needed.
- The `.quality` section background previously hotlinked an external Unsplash image. This was replaced with the local `assets/company-furnace-hall.webp` and the Unsplash `preconnect` was removed, so the site no longer depends on any external image host.
- All images now carry intrinsic `width`/`height` (to prevent layout shift) and below-the-fold images use `loading="lazy"`.

## Logo

- Source file: `/Users/jt.social/Library/CloudStorage/ProtonDrive-go.jime@proton.me-folder/Work/FDI/LOGO/Aja Logo SVG.svg`
- Local site copy: `assets/aja-logo.svg`

## Temporary Image Sources

- Molten metal hero image, Unsplash, Morteza Mohammadi:
  `https://unsplash.com/photos/a-large-piece-of-metal-being-poured-into-a-container-l0QB40LUoXA`
- Industrial pipework image, Unsplash, Peter Herrmann:
  `https://unsplash.com/it/foto/un-grande-edificio-industriale-con-tubi-e-tubazioni-SHTkq0lK96g`
- Ferroalloy lumps image, Unsplash, SRG Group:
  `https://unsplash.com/photos/a-pile-of-coal-sitting-on-top-of-a-table-ncZftJvT6nY`
- Micro Silica powder image, HSA Microsilica:
  `https://microsilica-fume.com/silica-fume-properties.html`

## Content Items To Confirm Later

- Final Ferro Silicon chemical specifications.
- Annual production capacity.
- Final packing sizes and dispatch terms.
- Certification status, including BIS, ISO, laboratory testing, and export documentation.
- Final sales, procurement, and HR contact routing.
