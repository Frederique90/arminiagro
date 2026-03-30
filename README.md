# arminiagro.com — Traceability System

**Fazenda Recanto dos Pássaros** · Lajedão, Bahia, Brasil  
Premium Conilon Coffee & Black Pepper · Export Traceability

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3 |
| Language | TypeScript 5 |
| Fonts | Cormorant Garamond + Barlow Condensed (Google Fonts) |
| QR Code | qrcode.react |
| Data (MVP) | Static JSON in `/public/data/lots/` |
| Data (future) | Supabase (zero-refactor swap — see Architecture) |

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/armini/arminiagro.git
cd arminiagro
npm install

# 2. Run development server
npm run dev

# 3. Open in browser
# Black Pepper lot:  http://localhost:3000/traceability/LOT-2025-PP-042
# Conilon Coffee:   http://localhost:3000/traceability/LOT-2025-CLN-018
# English version:  ?lang=en (default)
# Portuguese:       ?lang=pt
```

---

## Project Structure

```
arminiagro/
├── app/
│   ├── layout.tsx                    # Root layout — fonts, metadata
│   ├── globals.css                   # Tailwind + print styles
│   └── traceability/
│       └── [lotId]/
│           └── page.tsx              # Dynamic route — main page
│
├── components/traceability/
│   ├── LotHero.tsx                   # Hero section with parallax
│   ├── LotData.tsx                   # Specification cards grid + tooltips
│   ├── QualityMetrics.tsx            # Animated gauges + bar charts
│   ├── FarmOrigin.tsx                # Map, farm data, timeline, certifications
│   ├── CustodyChain.tsx              # Vertical custody timeline
│   ├── Documents.tsx                 # Downloadable document cards
│   ├── ContactCTA.tsx                # Contact form + WhatsApp + Email
│   ├── LotFooter.tsx                 # Footer with auto-generated QR
│   └── LanguageToggle.tsx            # PT/EN switcher
│
├── lib/
│   └── lots.ts                       # Data repository (swap here for API)
│
├── types/
│   └── lot.ts                        # Full TypeScript types
│
├── public/
│   └── data/lots/
│       ├── LOT-2025-PP-042.json      # Black Pepper example
│       └── LOT-2025-CLN-018.json     # Conilon Coffee example
│
├── messages/
│   ├── en.json                       # English translations
│   └── pt.json                       # Portuguese translations
│
├── tailwind.config.ts                # Custom fonts + colors
├── next.config.js                    # Image domains, cache headers
└── tsconfig.json
```

---

## Adding a New Lot

### 1. Create the JSON file

```bash
cp public/data/lots/LOT-2025-PP-042.json public/data/lots/LOT-2025-PP-043.json
```

Edit the fields. Required fields:

```jsonc
{
  "lotId": "LOT-2025-PP-043",        // must match filename
  "product": "Black Pepper",
  "productKey": "pepper",            // "pepper" | "coffee"
  "variety": "Kottanadan",
  "harvestDate": "2025-12-01",       // ISO format
  "harvestEpoch": "December 2025",   // human-readable
  "weight": 1800,
  "weightUnit": "kg",
  "moisture": 12.2,
  "moistureMax": 14.0,
  "processing": "Sun-dried, machine-sorted",
  "exportStandard": "ASTA Grade 1 / EU MRL compliant",
  "status": "Available",             // Available | In Transit | Delivered | Processing
  "statusPt": "Disponível",
  "description": "...",
  "descriptionPt": "...",
  "conversionRatio": 4.3,
  "greenWeight": 7740,
  "coordinates": { "lat": -17.53, "lng": -40.13 },
  "farm": { ... },                   // copy from existing lot
  "chain": [ ... ],                  // chain of custody steps
  "documents": [ ... ],
  "certifications": [ ... ]
}
```

### 2. The page is immediately live at:
```
https://arminiagro.com/traceability/LOT-2025-PP-043
```
No code change needed — `generateStaticParams` picks up all JSON files automatically.

---

## Migrating to Supabase (when ready)

The `lib/lots.ts` file uses a **Repository pattern**. To migrate:

```typescript
// lib/lots.ts — replace the singleton at the bottom:

// CURRENT (MVP — static JSON):
const repo: LotRepository = new StaticJsonLotRepository()

// FUTURE (Supabase):
import { createClient } from '@supabase/supabase-js'

class SupabaseLotRepository implements LotRepository {
  private client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

  async getById(lotId: string): Promise<LotData> {
    const { data, error } = await this.client
      .from('lots')
      .select('*')
      .eq('lot_id', lotId)
      .single()
    if (error || !data) notFound()
    return data as LotData
  }

  async listIds(): Promise<string[]> {
    const { data } = await this.client.from('lots').select('lot_id')
    return (data ?? []).map((r: any) => r.lot_id)
  }
}

const repo: LotRepository = new SupabaseLotRepository()
// Zero changes to any component — they all use getLotData(lotId)
```

---

## Generating & Printing QR Codes for Bags

### Option A — From the Traceability Admin Panel (recommended)
The `rastreabilidade_armini.html` file (already built) has a **"QR Code" button** in each lot row that opens a print-ready label with:
- Full lot data
- Auto-generated QR code pointing to `arminiagro.com/traceability/{lotId}`
- Logo + product color theme
- Button: 🖨 Print / Save as PDF

### Option B — Bulk QR generation script

```bash
# Install qrcode CLI
npm install -g qrcode

# Generate for all lots
for lot in LOT-2025-PP-042 LOT-2025-CLN-018; do
  qrcode "https://arminiagro.com/traceability/$lot" \
    --output "qrcodes/$lot.png" \
    --width 400 \
    --error-correction H \
    --color.dark "#1A3323" \
    --color.light "#FDFAF4"
done
```

### Option C — From the Next.js page itself
Each traceability page has a **footer QR code** that auto-generates from the lot URL using `qrcode.js`. Users can:
1. Open `arminiagro.com/traceability/LOT-2025-PP-042`
2. Press `Ctrl+P` / `Cmd+P`
3. The `@media print` CSS produces a clean 1-page printable version

### QR Code Specs for Bag Labels
| Spec | Value |
|------|-------|
| Minimum size | 2cm × 2cm |
| Error correction | Level H (30%) — survives dirt/damage |
| Color | Dark: `#1A3323` · Light: white |
| Format | PNG 400×400px minimum |
| URL format | `https://arminiagro.com/traceability/{lotId}` |

---

## Contact Form Integration

The `ContactCTA.tsx` uses a placeholder async submit. To activate:

### With EmailJS (zero backend):
```bash
npm install emailjs-com
```
```typescript
// In ContactCTA.tsx handleSubmit:
import emailjs from 'emailjs-com'

await emailjs.send(
  'service_XXXXXXX',    // from emailjs.com dashboard
  'template_XXXXXXX',   // create template with {{name}}, {{country}}, {{volume}}, {{product}}, {{message}}, {{lotId}}
  { ...form, lotId: lot.lotId, lotUrl: `https://arminiagro.com/traceability/${lot.lotId}` },
  'user_XXXXXXXXXXXXXXX'
)
```

### With Resend (recommended for production):
```bash
npm install resend
```
Create `app/api/contact/route.ts`:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  await resend.emails.send({
    from: 'traceability@arminiagro.com',
    to: 'export@arminiagro.com',
    subject: `Inquiry: ${body.lotId} — ${body.product}`,
    html: `<p>Name: ${body.name}</p><p>Country: ${body.country}</p><p>Volume: ${body.volume}kg</p><p>Message: ${body.message}</p>`
  })
  return Response.json({ ok: true })
}
```

---

## WhatsApp & Email Config

Update in `ContactCTA.tsx`:
```typescript
const WHATSAPP_NUMBER = '+5527XXXXXXXXX'  // with country code, digits only
const EMAIL = 'export@arminiagro.com'
```

---

## Deployment (Vercel — recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables (add in Vercel dashboard):
# RESEND_API_KEY=re_...         (if using Resend)
# SUPABASE_URL=https://...      (if using Supabase)
# SUPABASE_ANON_KEY=eyJ...      (if using Supabase)
```

The static JSON approach means **zero cold starts** — pages are pre-rendered at build time.  
When migrating to Supabase, use `export const dynamic = 'force-dynamic'` in page.tsx.

---

## Performance Targets

| Metric | Target | Achieved with static JSON |
|--------|--------|--------------------------|
| LCP | < 2.5s | ✓ (static pre-render) |
| CLS | < 0.1 | ✓ (no layout shift) |
| FID | < 100ms | ✓ |
| Lighthouse | > 90 | ✓ |
| Mobile | 375px+ | ✓ full responsive |

---

## Roadmap

- [ ] Supabase integration (producer panel → database)
- [ ] Mapbox static map embed for farm location
- [ ] next-intl full i18n (Arabic / Japanese for Mideast/Japan buyers)
- [ ] PWA manifest + service worker for offline QR scanning
- [ ] Automated QR code generation CLI for bulk bag printing
- [ ] Admin dashboard (producer panel) with Next.js + Supabase Auth
- [ ] Webhook to notify buyer when customs status updates

---

*Armini Batista Agro Ltda · Lajedão, Bahia, Brasil · arminiagro.com*
