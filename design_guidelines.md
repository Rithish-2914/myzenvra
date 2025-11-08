# myzenvra Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from luxury e-commerce (H&M elegance) + Gen-Z platforms (Instagram, Pinterest aesthetic) to create a modern "Old Money meets Streetwear" brand identity.

## Core Design Principles
1. **Luxury Minimalism**: Clean layouts with generous whitespace, letting products breathe
2. **Gen-Z Energy**: Bold typography, smooth animations, interactive elements
3. **Premium Accessibility**: Upscale feel while maintaining approachable, modern UX

## Color System
- **Primary**: Beige (#F5F1E8) for backgrounds and soft sections
- **Accent Gold**: (#D4AF37) for CTAs, highlights, premium badges
- **Neutral Dark**: Black (#0A0A0A) for text, headers, navigation
- **Pure White**: (#FFFFFF) for cards, overlays, clean sections
- **Supporting**: Soft grays for borders and subtle elements

## Typography Hierarchy

**Headings**:
- H1 (Hero): 64px/56px mobile, bold, tracking-tight, luxury serif or modern display font
- H2 (Section): 48px/40px mobile, semibold
- H3 (Cards): 28px/24px mobile, medium weight

**Body**:
- Large: 18px for hero subtext, important descriptions
- Base: 16px for general content
- Small: 14px for captions, labels

**Font Pairing**: Combine elegant serif (Playfair Display, Cormorant) for headers with clean sans-serif (Inter, Manrope) for body text.

## Layout System
**Spacing Scale**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24, 32 for consistent rhythm (p-4, mb-8, gap-6, etc.)

**Container Max-Widths**:
- Full sections: max-w-7xl (1280px)
- Content: max-w-6xl (1152px)
- Text/Forms: max-w-4xl (896px)

## Page-Specific Layouts

### Home Page
**Hero Section** (100vh):
- Full-width luxury lifestyle image (model wearing oversized streetwear in upscale setting)
- Centered content overlay with blur-backdrop buttons
- Large headline: "Old Money Meets Modern Drip"
- CTA button: "Customize Your Drip" (gold, prominent)
- Secondary CTA: "Shop Collection"

**Featured Categories** (2x2 grid lg, stack mobile):
- Large image cards: Hoodies, Tees, Pants, Accessories
- Hover: scale + overlay fade effect

**Customization Showcase** (asymmetric 2-column):
- Left: "Design Your Own" heading + description + CTA
- Right: Interactive preview mockup or carousel

**Testimonials** (3-column cards, carousel mobile):
- Customer photos, quotes, star ratings
- Soft beige background section

**Social Proof Footer Add-on**:
- Instagram feed grid (6 images)
- "Follow @myzenvra" heading
- Social icons (Instagram, Twitter, Pinterest)

### Shop Page
**Filter Sidebar** (1/4 width desktop, drawer mobile):
- Category checkboxes
- Size, Color selectors
- Price range slider
- "Customizable" toggle

**Product Grid** (3-column lg, 2-column md, 1-column mobile):
- Cards: Image, Title, Price, Quick "Customize" badge
- Hover: image zoom + "Quick View" overlay + shadow lift
- "Add to Cart" appears on hover

### Customize Page
**Split Layout** (50/50):
- Left: Live product preview (updates in real-time)
- Right: Customization form
  - Upload image area (drag-drop + file picker)
  - Color swatches (visual selector)
  - Size buttons (XS-3XL)
  - Text input with font/color options
  - Price calculator (updates live)
  - "Add to Cart" CTA

### About Page
**Founder Story**:
- Hero: Team photo (3 VIT students in their designs)
- Timeline/narrative sections alternating left-right
- "Why Old Money + Streetwear" manifesto
- Values grid (3-column): Quality, Customization, Gen-Z First

### Blog/FAQ/Contact
**Blog**: Magazine-style featured post + 3-column grid
**FAQ**: Accordion sections with + icons, expand/collapse
**Contact**: 2-column (form left, info/map right)

### Cart/Checkout
**Cart**: Table view desktop, card stack mobile
**Checkout**: Single-column form, progress indicator top

### Bulk Orders
**Enterprise Feel**: Form-focused, pricing tiers table, use case examples

## Component Library

**Buttons**:
- Primary: Gold background, black text, rounded-lg, px-8 py-4
- Secondary: Black background, white text
- Outline: Border-2 gold, transparent bg
- All: Backdrop-blur when on images

**Cards**:
- Product: White bg, shadow-lg, rounded-xl, overflow-hidden
- Content: Beige bg, border gold, rounded-lg

**Navigation**:
- Sticky header: White bg, shadow on scroll
- Logo left, nav center, cart/account right
- Mobile: Hamburger → full-screen overlay menu

**Forms**:
- Inputs: Border-2, rounded-lg, focus:gold ring
- Labels: Uppercase, tracking-wide, text-sm

## Animations (Framer Motion)

**Page Transitions**: Fade + slide up (0.3s)
**Product Cards**: Scale 1.05 + shadow increase on hover
**Hero**: Parallax scroll on background image
**Cart**: Slide-in drawer from right
**Add to Cart**: Bounce + success checkmark

**Scroll Animations**:
- Fade in + slide up for sections (stagger children)
- Number counters for stats
- Image reveals with clip-path

## Images

**Hero Image**: Lifestyle shot of models in oversized streetwear in luxury setting (mansion, classic car, upscale cafe). High-contrast, cinematic.

**Category Images**: Clean product shots on beige/white backgrounds with subtle shadows

**About Page**: Candid team photos, behind-the-scenes of design process

**Customization Preview**: Mockup templates (front/back view of apparel)

**Blog**: Featured images for articles, mix of lifestyle and product shots

**Testimonials**: Customer photos (circular crops)

## Responsive Breakpoints
- Mobile: < 768px (stack everything, larger tap targets)
- Tablet: 768-1024px (2-column grids)
- Desktop: > 1024px (full multi-column layouts)

## Performance
- Lazy load images below fold
- Optimize hero image (WebP, multiple sizes)
- Framer Motion: useReducedMotion respect
- Minimize animation on mobile for performance