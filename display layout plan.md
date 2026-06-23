# Aja Website Display Layout Plan

Last reviewed: 2026-06-23

## Purpose

This file records the display settings and layout rules already established for the Aja website. Use it before changing `index.html`, `styles.css`, `script.js`, `content/*.json`, or the local admin editor so future display changes stay consistent.

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

8. Keep text alignment left.
   Main copy, section descriptions, notice previews, product summaries, operations copy, and contact text should stay left aligned.

9. Preserve theme and navigation controls.
   The theme toggle is an icon-only circular button. The mobile navigation toggle uses the compact three-line button. Keep accessible labels and pressed or expanded states.

## Desktop Layout Rules

1. Use `100svh` desktop sections.
   For desktop screens above `980px`, main sections should have `height: 100svh`, `min-height: 100svh`, hidden overflow, and section-specific internal fitting.

2. Use fluid desktop sizing.
   Desktop layout should use clamp-based variables for page padding, section gaps, card gaps, card padding, headings, body text, small text, and controls. This keeps the site usable from normal laptop widths to very wide displays.

3. Keep content at the top of each section.
   Intro, products, quality, operations, information, FAQ, and contact sections should start below the header offset and align content to the top, not centre everything vertically.

4. Keep major two-column layouts balanced.
   Company, export, products, quality, operations, and contact layouts should use grid or flex structures that keep image and text columns visually balanced without forcing unnecessary vertical centring.

5. Keep the operations visual equal to the process cards on desktop.
   The operations section uses a stretched layout so the image column matches the height of the process-card column.

6. Keep the intro profile table in normal flow.
   The company profile table should not be absolutely pinned to the bottom. It should flow after the intro grid to avoid large empty gaps on tall screens.

7. Keep the contact footer pinned to the bottom of the final page.
   The contact section is a flex column, and the footer uses `margin-top: auto`.

8. Keep FAQ compact and readable.
   FAQ items are a grid list with restrained spacing. On very wide displays, FAQ width and typography scale up, but the list must not become full-width noise.

## Mobile Layout Rules

1. Use `max-width: 980px` as the mobile breakpoint.
   Mobile behaviour starts at `980px` and below.

2. Hide or compress non-essential elements on mobile.
   The hero panel, positioning strip, product section description, quality parameter table, contact section description, contact form intro, contact muted text, and form status text are hidden where needed to keep the mobile deck usable.

3. Use compact mobile image bands.
   Company slides, operation visuals, image bands, and product visuals use maximum heights tied to viewport height so images do not push critical text out of view.

4. Keep hero content focused.
   On mobile, the hero fills the viewport, moves the main content slightly down, hides the side panel, uses compact heading sizes, and keeps hero facts stacked.

5. Keep mobile forms usable but dense.
   Contact form fields use two columns where possible, wide fields span both columns, inputs are compact, and the captcha is compressed into a small grid.

6. Keep mobile contact cards compact.
   Contact cards sit in three equal columns, with small text and hidden muted details so the full contact section fits inside the viewport.

7. Allow internal scrolling inside sections.
   Mobile sections use `overflow-y: auto`, while the body itself stays locked. This preserves the deck-like feel without trapping long content.

8. Keep swipe navigation visible only on mobile.
   The previous and next section controls are hidden on desktop and shown only for mobile deck navigation.

## Information And Notice Rules

1. Information is controlled by split JSON files.
   The live display should read from `content/information.json`, `content/notices.json`, `content/vacancies.json`, and `content/tenders.json`, with `content/site.json` preserved as the legacy fallback.

2. Tabs must stay as Notices, Vacancies, and Tenders unless the business meaning changes.
   The current information section is a tabbed advert board with one panel per category.

3. Use `hideIntro` to control panel heading visibility.
   Notices currently hide the panel intro so the newest posts appear higher. Vacancies and tenders currently show their intro text.

4. Keep only the newest visible posts inside the information section.
   The information section is guarded so old or long posts do not push the page beyond one viewport. Older posts remain available through the pop-up.

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

2. Check mobile width below `980px`.
   Verify the body does not become a long scrolling page, each section fits as a deck screen, internal scroll works where needed, and horizontal swipe buttons move between sections.

3. Check the information section.
   Verify the newest visible posts fit, tabs switch correctly, notice title buttons open detail modals, and "Click for more" opens the full category modal.

4. Check contact.
   Verify contact cards fit, form fields fit, captcha is legible, footer stays at the bottom, and map modals open and close cleanly.

5. Check both themes.
   Verify dark theme remains the primary polished state and light theme still has readable text, borders, controls, and footer contrast.

6. Check content fallbacks.
   If JSON loading fails or a deployment serves old fallback content, visible text should still be coherent and not contradict the split content files.
