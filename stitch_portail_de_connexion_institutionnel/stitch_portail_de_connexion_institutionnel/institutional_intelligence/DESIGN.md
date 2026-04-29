---
name: Institutional Intelligence
colors:
  surface: '#f6faff'
  surface-dim: '#d2dbe4'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf5fe'
  surface-container: '#e6eff8'
  surface-container-high: '#e0e9f2'
  surface-container-highest: '#dbe4ed'
  on-surface: '#141d23'
  on-surface-variant: '#424845'
  inverse-surface: '#293138'
  inverse-on-surface: '#e9f2fb'
  outline: '#727974'
  outline-variant: '#c1c8c3'
  surface-tint: '#486458'
  primary: '#324d42'
  on-primary: '#ffffff'
  primary-container: '#496559'
  on-primary-container: '#c2e1d2'
  inverse-primary: '#afcdbf'
  secondary: '#54615b'
  on-secondary: '#ffffff'
  secondary-container: '#d8e6de'
  on-secondary-container: '#5a6761'
  tertiary: '#613f3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#7b5653'
  on-tertiary-container: '#ffcfca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#caeada'
  primary-fixed-dim: '#afcdbf'
  on-primary-fixed: '#042017'
  on-primary-fixed-variant: '#314c41'
  secondary-fixed: '#d8e6de'
  secondary-fixed-dim: '#bccac2'
  on-secondary-fixed: '#121e19'
  on-secondary-fixed-variant: '#3d4944'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ebbbb7'
  on-tertiary-fixed: '#2e1412'
  on-tertiary-fixed-variant: '#603e3b'
  background: '#f6faff'
  on-background: '#141d23'
  surface-variant: '#dbe4ed'
typography:
  headline-xl:
    fontFamily: Public Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1280px
  gutter: 24px
  margin: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is anchored in the principles of precision, authority, and discretion. Designed for institutional environments where data integrity is paramount, the aesthetic avoids trend-driven flourishes in favor of a **Corporate Modern** approach. 

The visual language communicates "Premium Reliability" through generous whitespace, a sophisticated muted palette, and a high degree of legibility. It targets professional researchers, administrators, and field officers who require a tool that feels like a natural extension of their formal workflow. The interface remains quiet and unobtrusive, allowing the complexity of the data to take center stage without overwhelming the user.

## Colors

The palette is led by a deep, institutional green that evokes stability and growth. This primary color is used sparingly for call-to-actions and key status indicators to maintain its impact.

- **Primary Green (#496559):** Used for primary buttons, active states, and branding accents.
- **Secondary Green (#1F2B26):** A darker shade for high-contrast text and deep interactive states to ensure AA accessibility.
- **Background (#F8F9FA):** A bright, cool neutral that provides a clean canvas for data entry.
- **Surface Neutrals:** A range of grays used for borders (#DEE2E6) and secondary text (#6C757D) to create hierarchy without introducing new hues.

All color combinations for text and iconography must maintain a minimum contrast ratio of 4.5:1 against their respective backgrounds.

## Typography

This design system utilizes **Public Sans**, an typeface designed for government and institutional use. It is chosen for its neutrality, exceptional readability in data-heavy contexts, and its professional "official" character.

Typography follows a strict 4px baseline grid. Headlines use tighter letter spacing and heavier weights to establish clear section breaks. Body text is optimized for long-form reading with a 1.5 line-height ratio. Labels for inputs and data headers use slightly increased letter spacing and medium weights to differentiate them from user-entered content.

## Layout & Spacing

The design system employs a **Fixed Grid** model to ensure a sense of permanence and order across desktop environments. 

- **Grid:** A 12-column system with a 24px gutter. 
- **Rhythm:** An 8px spacing system dictates all vertical and horizontal increments. 
- **Containers:** Content is housed in centered containers with a maximum width of 1280px. 
- **Density:** Given the "institutional" nature, the system favors "Comfortable" density, using generous padding (24px to 32px) within cards and sections to prevent cognitive overload during complex data collection.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and tonal layering. The depth model is shallow to maintain a professional, flat aesthetic while providing enough visual cues for interactivity.

- **Level 0 (Base):** The #F8F9FA background.
- **Level 1 (Cards/Inputs):** White (#FFFFFF) surfaces with a subtle 1px border (#E9ECEF).
- **Level 2 (Shadows):** Used for elevated cards and dropdowns. Shadows are ultra-diffused: `0px 4px 20px rgba(73, 101, 89, 0.08)`. Note the subtle tint of the primary green within the shadow to create a cohesive atmosphere.
- **Interactivity:** Hover states for cards increase shadow spread slightly rather than moving the element, maintaining a stable layout.

## Shapes

The design system uses a **Rounded** shape language to soften the institutional nature of the app and make data entry feel less rigid.

- **Primary Radius:** 16px (1rem) for all major containers, cards, and input fields.
- **Small Radius:** 8px (0.5rem) for smaller components like tags, chips, and tooltips.
- **Consistency:** All interactive elements must share the same corner radius to create a unified visual rhythm. Sharp corners are strictly forbidden.

## Components

### Buttons
- **Primary:** Solid #496559 with white text. 16px radius.
- **Secondary:** Transparent background with a 1.5px border in #496559.
- **State Changes:** Use a 10% black overlay for hover and 20% for active states to maintain color integrity while showing feedback.

### Input Fields
- **Default:** White background, #DEE2E6 border, 16px radius.
- **Focus:** 1.5px border in #496559 with a 4px soft outer glow in the primary color at 10% opacity.
- **Labels:** Always persistent above the field in Label-MD styling.

### Cards
- **Structure:** White background, 16px radius, Level 2 ambient shadow.
- **Padding:** 24px internal padding is the standard. Data-dense cards may drop to 16px.

### Chips & Tags
- Used for status (e.g., "Pending", "Verified").
- Use a 12% opacity version of the status color (Green, Amber, Red) for the background and the full-saturation color for the text.

### Data Tables
- Row-based layout with no vertical borders. 
- 1px #E9ECEF horizontal separators.
- Header row uses a subtle #F1F3F5 background and Label-SM typography.