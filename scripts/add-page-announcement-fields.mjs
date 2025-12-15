/**
 * Page Announcement Fields Setup
 *
 * The "page" model in Builder.io is a built-in model that requires manual configuration
 * through the Builder.io admin interface.
 *
 * To add the announcement fields to your pages, follow these steps in Builder.io:
 *
 * 1. Go to https://builder.io
 * 2. Navigate to Models (in the left sidebar)
 * 3. Click on the "page" model
 * 4. Click "+ Add field" or "New field"
 * 5. Add a field with the following settings:
 *
 *    Field name: paginaAankondiging
 *    Field type: Object
 *    Helper text: Optionele aankondiging die alleen op deze pagina verschijnt
 *
 *    Then add these subfields to the object:
 *
 *    a) actief (Boolean)
 *       - Default: false
 *       - Helper text: Aankondiging tonen op deze pagina
 *
 *    b) tekst (Text)
 *       - Helper text: De tekst van de aankondiging
 *
 *    c) type (Text with enum)
 *       - Enum values: info, waarschuwing, belangrijk
 *       - Default: info
 *       - Helper text: Type aankondiging: info (blauw), waarschuwing (oranje), belangrijk (paars)
 *
 *    d) link (URL)
 *       - Helper text: Optionele link URL
 *
 *    e) linkTekst (Text)
 *       - Helper text: Tekst voor de link (bijv. "Meer info")
 *
 * 6. Save the model
 *
 * After this setup, each page in Builder.io will have a "paginaAankondiging" section
 * where content editors can configure page-specific announcements.
 */

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           Page Announcement Fields Setup Instructions             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  The "page" model in Builder.io requires manual configuration.   ║
║                                                                  ║
║  Please follow these steps in Builder.io:                        ║
║                                                                  ║
║  1. Go to https://builder.io                                     ║
║  2. Navigate to Models → page                                    ║
║  3. Click "+ Add field"                                          ║
║  4. Create an Object field called "paginaAankondiging"           ║
║                                                                  ║
║  Add these subfields to the object:                              ║
║                                                                  ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ Field        │ Type         │ Default    │ Notes            │ ║
║  ├─────────────────────────────────────────────────────────────┤ ║
║  │ actief       │ Boolean      │ false      │ Toggle on/off    │ ║
║  │ tekst        │ Text         │ -          │ Message text     │ ║
║  │ type         │ Text (enum)  │ info       │ info/waarschuwing│ ║
║  │              │              │            │ /belangrijk      │ ║
║  │ link         │ URL          │ -          │ Optional URL     │ ║
║  │ linkTekst    │ Text         │ -          │ Link button text │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                  ║
║  5. Save the model                                               ║
║                                                                  ║
║  Announcement types:                                             ║
║  • info       → Blue background (informational)                  ║
║  • waarschuwing → Orange background (warning)                    ║
║  • belangrijk → Purple/primary background (important)            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);
