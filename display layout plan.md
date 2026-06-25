# Aja Website Display Layout Plan

Last reviewed: 2026-06-23

## Purpose

This file records the display settings and layout rules already established for the Aja website. Use it before changing `index.html`, `styles.css`, `script.js`, `content/*.json`, or the local admin editor so future display changes stay consistent.

## Responsive Website Rule

The website must be a fully responsive, dynamic, scroll-snap slideshow-style layout. It must adapt naturally to desktop landscape, tablet, square view, portrait tablet, and mobile screens.

1. Do not use fixed widths, fixed heights, or hardcoded layout sizes that break on different screens.
   Use responsive units and patterns such as `%`, `vw`, `vh`, `svh`, `rem`, `clamp()`, `minmax()`, `auto-fit`, `auto-fill`, CSS Grid, and Flexbox.

2. Treat each main section as a slide on larger screens.
   Each section should behave like one full-screen slide where possible. Users should move between sections through scroll, swipe, navigation links, or navigation arrows.

3. Relax the one-page slide rule when readability requires it.
   On tablet, square, portrait, and mobile views, content may scroll inside a section if it cannot fit comfortably on one screen. Never shrink text to an unreadable size just to force a section into one viewport.

4. Keep alignment exact.
   Images, text blocks, buttons, paragraph borders, content cards, and related panels must stay aligned. Text must not overlap images, borders, buttons, or neighbouring sections.

5. Prioritise readability and image clarity.
   The final behaviour should feel like a smooth responsive presentation on large screens and a clean scrollable mobile website on smaller screens.

## Core Display Rules

1. Keep the site as a full-screen section experience on desktop.
   Each main section should occupy one viewport on desktop, align to the top, and use vertical scroll snapping. The desktop rule is one clear page per section, not a long continuous landing page.

2. Use mobile as a swipeable section deck.
   On mobile, disable page-level vertical scroll snapping, make each section fill `100svh`, allow internal section scrolling where needed, and keep horizontal swipes for moving between adjacent sections.

3. Keep the fixed header visible and compact.
   The header remains fixed at the top, uses a dark translucent background, and shows active navigation state. On mobile, the brand text stays centred, the logo is hidden, the menu button sits on the left, and the theme toggle sits on the right.

4. Keep dark mode as the primary presentation.
   The default look is dark industrial, with amber accents, steel text, and restrained borders. Light mode may exist, but the dark theme is the main designed state and must remain polished.

5. Avoid decorative layout drift.
   Use real plant, product, furnace, laboratory, export, and office imagery. Do not replace the industrial identity with generic decoration.

6. Use tight industrial geometry.
   Cards, buttons, tabs, panels, and modals use small radii, generally `2px`, crisp borders, and no heavy shadows. Keep the interface clean, technical, and serious.

7. Keep text readable without letting it break layout.
   Body copy and list content use automatic hyphenation, normal word breaking, and `overflow-wrap: break-word`. Text should not overflow cards, tables, tabs, buttons, or panels.

8. Use dynamic font sizing.
   Headings, subheadings, paragraphs, buttons, captions, labels, and controls should use `clamp()` or other responsive sizing where scale is needed. Paragraph text must remain readable on tablet and mobile screens.

9. Keep text alignment left.
   Main copy, section descriptions, notice previews, product summaries, operations copy, and contact text should stay left aligned.

10. Preserve theme and navigation controls.
   The theme toggle is an icon-only circular button. The mobile navigation toggle uses the compact three-line button. Keep accessible labels and pressed or expanded states.

11. Avoid unnecessary blank spaces.
   Use flexible spacing, responsive grids, adaptive section height, and internal scrolling rather than leaving large empty gaps when the browser size changes.

## Image And Media Rules

1. Images must resize automatically without distortion.
   Use proportional scaling and `object-fit` so images remain visually balanced with their related content.

2. Preserve intended image orientation.
   Landscape images should remain landscape. Do not crop landscape images into portrait unless a specific page design requires it.

3. Preserve carousel image ratios.
   Image carousels should preserve the intended image ratio. If a carousel image is landscape, display it as landscape.

4. Keep images separated from text and controls.
   Images must not overlap text, borders, buttons, cards, modals, or other sections.

5. Use real business imagery.
   Prefer Aja plant, product, furnace, laboratory, export, and office imagery over generic decoration.

6. Use responsive image performance patterns for major images.
   For hero, carousel, product, and large section images, consider `srcset` and `sizes` when multiple image sizes are available. Mobile users should not be forced to download unnecessarily large desktop images.

7. Keep image dimensions declared.
   Where images are in HTML, keep meaningful `width`, `height`, `loading`, `decoding`, and `alt` attributes so layout space is predictable and accessibility remains intact.

## Text Block And Border Rules

1. Keep paragraph borders attached to their content.
   Borders around paragraph sections, content cards, and text boxes should grow or shrink with the related text. They must not detach, overflow, or overlap nearby images.

2. Match text blocks with their related images.
   When an image and paragraph are paired, the spacing, height, and border treatment should make them read as one unit.

3. Maintain consistent padding.
   Padding and gaps should be responsive, but the design should keep a consistent industrial rhythm across desktop, tablet, square, portrait, and mobile views.

## Desktop Layout Rules

1. Use `100svh` desktop sections.
   For desktop screens above `980px`, main sections should have `height: 100svh`, `min-height: 100svh`, hidden overflow, and section-specific internal fitting.

2. Use fluid desktop sizing.
   Desktop layout should use clamp-based variables for page padding, section gaps, card gaps, card padding, headings, body text, small text, and controls. This keeps the site usable from normal laptop widths to very wide displays.

3. Keep content at the top of each section.
   Intro, products, quality, operations, information, FAQ, and contact sections should start below the header offset and align content to the top, not centre everything vertically.

4. Use scroll snapping in desktop and landscape mode.
   Desktop and landscape screens should use `scroll-snap-type` and `scroll-snap-align` so each section locks neatly into view like a slideshow.

5. Keep major two-column layouts balanced.
   Company, export, products, quality, operations, and contact layouts should use grid or flex structures that keep image and text columns visually balanced without forcing unnecessary vertical centring.

6. Keep the operations visual equal to the process cards on desktop.
   The operations section uses a stretched layout so the image column matches the height of the process-card column.

7. Keep the intro profile table in normal flow.
   The company profile table should not be absolutely pinned to the bottom. It should flow after the intro grid to avoid large empty gaps on tall screens.

8. Keep the contact footer pinned to the bottom of the final page.
   The contact section is a flex column, and the footer uses `margin-top: auto`.

9. Keep FAQ compact and readable.
   FAQ items are a grid list with restrained spacing. On very wide displays, FAQ width and typography scale up, but the list must not become full-width noise.

## Tablet, Square, And Portrait Rules

1. Let the layout switch automatically.
   When the screen becomes smaller, square, or portrait, layouts should shift from wide multi-column arrangements to clearer stacked or simplified arrangements.

2. Collapse the menu when space is limited.
   Full navigation links belong on desktop. Use the hamburger menu on tablet and mobile when there is not enough room for the full navigation.

3. Allow internal section scrolling.
   In tablet, square, and portrait views, the strict one-page slide rule may be relaxed. Sections may scroll internally when content cannot fit comfortably.

4. Protect readable font sizes.
   Do not reduce text too far to preserve the slideshow effect. Readability takes priority over forcing every section to fit one page.

5. Preserve swipe navigation for touch devices.
   Tablet and touch devices should support swipe navigation where the viewport behaves like a deck.

## Mobile Layout Rules

1. Use `max-width: 980px` as the mobile breakpoint.
   Mobile behaviour starts at `980px` and below.

2. Hide or compress non-essential elements on mobile.
   The hero panel, positioning strip, product section description, quality parameter table, contact section description, contact form intro, contact muted text, and form status text are hidden where needed to keep the mobile deck usable.

3. Use compact mobile image bands.
   Company slides, operation visuals, image bands, and product visuals use maximum heights tied to viewport height so images do not push critical text out of view.

4. Keep hero content focused.
   On mobile, the hero fills the viewport, moves the main content slightly down, hides the side panel, uses compact heading sizes, and keeps hero facts stacked.

5. Stack content clearly.
   On mobile, image and text areas should stack vertically or use very simple grids, with clear separation between image, text, forms, and controls.

6. Keep mobile forms usable but dense.
   Contact form fields use two columns where possible, wide fields span both columns, inputs are compact, and the captcha is compressed into a small grid.

7. Keep mobile contact cards compact.
   Contact cards sit in three equal columns, with small text and hidden muted details so the full contact section fits inside the viewport.

8. Allow internal scrolling inside sections.
   Mobile sections use `overflow-y: auto`, while the body itself stays locked. This preserves the deck-like feel without trapping long content.

9. Keep swipe navigation visible only on mobile.
   The previous and next section controls are hidden on desktop and shown only for mobile deck navigation.

10. Support multiple movement methods.
    Mobile users should be able to move to the next section by scrolling inside the section where needed, swiping horizontally, using navigation arrows, or opening the hamburger menu.

11. Keep mobile text readable.
    Use a readable standard font size on mobile. Do not make paragraph text, buttons, captions, or form labels too small to read comfortably.

## Navigation Rules

1. Use full navigation links on desktop.
   Desktop and wide landscape layouts should show the full navigation where it fits cleanly.

2. Use the hamburger menu when space is limited.
   Tablet, square, portrait, and mobile views should collapse navigation into the menu when full links would crowd the header.

3. Keep slideshow movement controls.
   Use left and right arrows where suitable for section-to-section movement. Preserve swipe navigation for tablets and touch devices.

4. Keep navigation state visible.
   Active navigation links should reflect the current section, and controls should update disabled states when the user reaches the first or last section.

5. Keep touch targets comfortable.
   Hamburger buttons, arrow controls, tabs, modal close buttons, captcha refresh, form buttons, and notice item buttons should remain easy to tap on coarse pointers. Do not make interactive controls tiny just because a screen is small.

6. Support keyboard and non-touch users.
   Swipe and arrows should not be the only way to move. Navigation links, focus states, buttons, and modal close controls must remain usable with keyboard input.

## Technical CSS Rules

1. Use CSS Grid and Flexbox for layout.
   Page sections, cards, contact blocks, forms, tabs, and image-content pairings should use responsive grid or flex structures.

2. Use media queries for behaviour changes.
   The key current breakpoint is `980px`, but future refinements may add tablet, square, portrait, or landscape-specific queries where needed.

3. Use `clamp()` for scalable type and spacing.
   Font sizes, gaps, card padding, section padding, controls, and image bands should scale with the viewport while staying within readable limits.

4. Use scroll snapping intentionally.
   Use `scroll-snap-type` and `scroll-snap-align` for the large-screen slideshow experience. Disable or relax snapping where smaller screens need internal scrolling.

5. Use `object-fit` for images.
   Images should fill their intended containers proportionally without distortion.

6. Avoid fixed pixel layout except for small controls.
   Fixed pixel values are acceptable for small icons, minimum control sizes, borders, and minimum spacing. They should not control the main page layout.

7. Use responsive containers.
   Prefer flexible containers over fixed wrappers so the layout survives browser resizing, square windows, and rotated tablets.

8. Respect reduced-motion preferences.
   If animation, smooth movement, transitions, or slideshow effects are added, include a `prefers-reduced-motion` path that reduces or disables unnecessary motion.

9. Test pointer and hover assumptions.
   Where interaction sizing depends on device input, use media features such as `pointer`, `any-pointer`, `hover`, and `any-hover` rather than assuming mobile means touch and desktop means mouse.

## Accessibility And Reflow Rules

1. Support reflow at narrow widths.
   Ordinary content should reflow at narrow widths without requiring two-direction scrolling. Use 320 CSS pixels as a key narrow-width reference when testing.

2. Support browser zoom.
   The layout should remain readable and usable at increased zoom levels, including 200 percent where possible. Do not hide essential content simply because text becomes larger.

3. Do not force unreadable text to preserve the slide effect.
   If content cannot fit in one viewport with readable text, allow internal scrolling or simplify the section layout.

4. Keep focus visible.
   Buttons, links, tabs, form controls, modal close buttons, and navigation controls need visible focus states in both dark and light themes.

5. Keep modals accessible.
   Modals should lock the background, focus the close button or first useful control when opened, and return focus to the triggering element when closed.

## Information And Notice Rules

1. Information is controlled by split JSON files.
   The live display should read from `content/information.json`, `content/notices.json`, `content/vacancies.json`, and `content/tenders.json`, with `content/site.json` preserved as the legacy fallback.

2. Tabs must stay as Notices, Vacancies, and Tenders unless the business meaning changes.
   The current information section is a tabbed advert board with one panel per category.

3. Use `hideIntro` to control panel heading visibility.
   Notices currently hide the panel intro so the newest posts appear higher. Vacancies and tenders currently show their intro text.

4. Keep only the newest visible posts inside the information section.
   The information section shows the newest four posts in each tab. It is guarded so old or long posts do not push the page beyond one viewport. Older posts remain available through the pop-up.

5. Use "Click for more" as the full-list action.
   The panel button opens the modal for the full category list. Tenders may use a tender-specific enquiry label where appropriate in content settings, but the panel action should remain clear and short.

6. Notice item titles are buttons.
   Clicking a notice item title opens the item detail modal. This keeps preview cards short and moves long summaries, media, and PDFs into the pop-up.

7. Modal state must lock the background.
   Opening map, specification, or notice modals adds the modal-open body state and returns focus to the trigger after closing.

8. PDF and image media belong in post details.
   List previews should remain compact. Attachments, image sets, and PDF buttons should appear in the detailed modal view.

## Contact And Map Rules

1. Contact cards are content-driven.
   Contact display is controlled by `content/contact-cards.json` and rendered through `script.js`.

2. Map display should be modal-based.
   Address cards can open embedded Google Maps in a modal, with a separate directions link.

3. The contact form endpoint should remain `/api/contact-submit`.
   The local admin hint and content file already point to this live endpoint.

4. Keep enquiry types in the contact form concise.
   The form should guide buyers, tender enquiries, and general enquiries without becoming a long CRM form.

5. Preserve the captcha layout.
   The captcha uses a canvas prompt, compact refresh button, and answer input. On mobile it must remain legible and fit within the compressed contact form.

## Admin And Editing Rules

1. Use the task-based local admin editor for routine content updates.
   The durable local editing workflow is `admin/local.html` served by `tools/local_admin_server.py` at `127.0.0.1:8766`.

2. Keep post editor permissions simple.
   Admin users manage the full dashboard. Post editor users manage only notices, vacancies, and tender posts.

3. Keep panel settings separate from post editing.
   The admin editor keeps panel heading, intro, button text, enquiry email, subject, and `hideIntro` under "Admin panel settings".

4. Hide admin-only panel settings from post-editor mode.
   Post editor mode should show the post section only.

5. Update visible and fallback content together.
   When changing information, notices, vacancies, tenders, contact cards, or form content, update the split JSON source and check whether `content/site.json`, `index.html`, or `script.js` fallback content also needs the same change.

## Source Files To Check

1. `styles.css`
   Primary display, responsive, theme, section-fit, notice guard, contact, FAQ, modal, and mobile deck rules.

2. `script.js`
   Section snapping, mobile swipe navigation, active navigation state, modal behaviour, dynamic information rendering, contact rendering, captcha, and maps.

3. `index.html`
   Baseline markup, fallback section structure, nav order, hero structure, modals, and mobile swipe buttons.

4. `content/information.json`
   Information section heading and summary.

5. `content/notices.json`
   Notices tab content, `hideIntro`, contact label, media, and PDF metadata.

6. `content/vacancies.json`
   Vacancies tab content, `hideIntro`, contact label, media, and PDF metadata.

7. `content/tenders.json`
   Tenders tab content, `hideIntro`, enquiry label, media, and PDF metadata.

8. `content/contact-cards.json`
   Contact card text, map query, directions behaviour, and contact display order.

9. `content/contact-form.json`
   Contact form intro, enquiry types, endpoint, and form copy.

10. `admin/local-editor.js` and `admin/local-editor.css`
   Local admin layout, role display, panel settings, and editor form structure.

## Verification Checklist

1. Check desktop width above `980px`.
   Verify one section per viewport, header state, active nav, top-aligned sections, no clipped critical content, and no accidental horizontal scrolling.

2. Check laptop and short landscape views.
   Verify that the slideshow layout still works when the screen is wide but not tall. Watch for clipped contact forms, notice panels, product cards, and operation cards.

3. Check tablet landscape.
   Verify full navigation or collapsed navigation depending on available space, balanced image-text layout, clear carousels, and no overlapping cards.

4. Check square viewport.
   Verify that sections do not create large blank gaps or squeezed text. Layout should switch or scroll internally where needed.

5. Check tablet portrait.
   Verify stacked layouts, hamburger navigation, readable text, proportional images, and internal section scroll where needed.

6. Check mobile width below `980px`.
   Verify the body does not become a long scrolling page, each section fits as a deck screen, internal scroll works where needed, and horizontal swipe buttons move between sections.

7. Check mobile landscape.
   Verify that short-height screens do not hide critical controls, captions, form fields, or modal close buttons.

8. Check 320 CSS pixel reflow.
   Verify ordinary content does not require horizontal scrolling to read. Exceptions may apply to maps, tables, or inherently two-dimensional content.

9. Check 200 percent zoom.
   Verify text remains readable, controls remain reachable, and essential content is not clipped beyond use.

10. Check reduced motion.
    Verify the site remains usable when motion is reduced by user preference.

11. Check coarse pointer controls.
    Verify hamburger, arrows, tabs, buttons, captcha refresh, and modal close controls are comfortable to tap.

12. Check the information section.
   Verify the newest visible posts fit, tabs switch correctly, notice title buttons open detail modals, and "Click for more" opens the full category modal.

13. Check contact.
   Verify contact cards fit, form fields fit, captcha is legible, footer stays at the bottom, and map modals open and close cleanly.

14. Check both themes.
   Verify dark theme remains the primary polished state and light theme still has readable text, borders, controls, and footer contrast.

15. Check content fallbacks.
   If JSON loading fails or a deployment serves old fallback content, visible text should still be coherent and not contradict the split content files.
