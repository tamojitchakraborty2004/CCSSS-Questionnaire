# Design Guidelines: Combined College Student Stress Scale (CCSSS)

## Design Approach
**Reference-Based Approach**: Cinematic wellness app inspired by immersive digital experiences like Headspace, Calm, and modern sci-fi interfaces. The design prioritizes emotional engagement and visual storytelling over traditional form patterns.

## Core Design Principles
- **Atmosphere**: Calm psychology meets sleek sci-fi minimalism
- **Motion**: Everything animated - no static elements, intentional movements throughout
- **Depth**: Layered visuals with parallax, particles, and glow effects
- **Tactility**: Every interaction feels responsive with hover effects, pulses, and transitions

## Typography
- **Headings**: Poppins SemiBold - used for titles, module names, and primary text
- **Body Text**: Inter Regular - used for questions, descriptions, and supporting content
- **Spacing**: Big, airy spacing throughout for a premium feel
- **Hierarchy**: Large prominent headings with clear visual separation from body text

## Layout & Spacing
- **Primary Units**: Use Tailwind spacing of 4, 6, 8, 12, 16, 20, 24, 32 for consistent rhythm
- **Section Padding**: py-20 to py-32 for desktop sections, py-12 to py-16 on mobile
- **Card Spacing**: p-8 to p-12 for glass card interiors
- **Button Spacing**: px-8 py-4 for primary actions, px-6 py-3 for secondary

## Visual Treatment

### Glassmorphism System
All interactive cards and containers use:
- Translucent backgrounds with backdrop blur
- Subtle inner glow/border highlights
- Semi-transparent whites/colors (opacity 10-20%)
- Shadow depth for floating appearance

### Gradient Palettes
**Hero/Default**: Deep indigo → turquoise, or cosmic violet → coral orange
**Academic Module**: Violet → blue spectrum
**Social Module**: Rose → pink spectrum  
**Financial Module**: Amber → gold spectrum
**Health Module**: Green → teal spectrum

Gradients animate slowly, creating living backgrounds that shift hue between questions.

### Glow Effects
- Buttons have soft outer glow that intensifies on hover
- Selected rating circles emit colored glow
- Progress indicators feature luminous fills
- Result gauge morphs color with glow (green → yellow → red)

## Component Library

### Hero Section (Full Viewport)
- Gradient motion background with slow waves or particle drift
- Central headline with fade-in animation
- Subtext reveals with delayed fade
- Large glowing CTA button (expands on hover, pulses gently)
- Smooth scroll/fade transition to questionnaire

### Question Cards
- Floating glass cards with animated entrance (slide-up + fade)
- Each question displayed individually
- 0-4 rating scale with circular buttons below question text
- Rating circles glow on hover/selection
- Progress bar/ring fills with color as user advances
- Motion blur fade-ins for question transitions

### Module Headers
- Animated title card appears before each module section
- Short label showing "Module X of Y" at top
- Background color theme shifts per module type

### Progress Visualization
- Circular or linear progress indicator
- Fills with animated easing
- Color transitions based on completion percentage
- Floating label showing current question number

### Result Dashboard
- Circular gauge with fill animation (0 → final score)
- Gauge color morphs based on stress level
- Small animated bars for category breakdowns (Academic/Social/Financial/Health)
- Typewriter animation for result message text
- Particle burst or confetti on results reveal
- Glowing action buttons (Download PDF, Retake)

### Footer Credits
- Soft ambient background continues
- Fade-in animation for credit text
- "Developed by Group 10 — Workplace Stress Resilience Prediction Project, Techno Main Salt Lake"

## Animations & Transitions

### Page Transitions
- Smooth fades between major sections (Hero → Questions → Results)
- No abrupt jumps - all transitions eased
- Background hue shifts every few questions

### Micro-Interactions
- Button pulse on idle
- Hover shimmer/glow intensification
- Soft scale transform on button hover (1.05x)
- Rating circle scale + glow on selection
- Card entrance: slide-up + fade with stagger
- Progress fill with elastic easing

### Environmental Effects
- Parallax layers on scroll
- Floating particles drifting across background
- Subtle lens-flare streaks on interactive element hover
- Continuous gradient motion

## User Flow Architecture

1. **Landing** → Full-screen hero with single CTA
2. **Core Assessment** → 10 questions, one at a time
3. **Conditional Branch**:
   - Score ≤ 13 → Results
   - Score > 13 → Adaptive modules unlock with flip animation
4. **Optional Modules** → Displayed based on core responses:
   - Heavy workload ≥2 AND Pressure ≥2 → Academic
   - Poor sleep ≥2 → Health & Lifestyle  
   - Financial difficulties ≥2 → Financial & Practical
   - Everyone → Social/Relationships
5. **Results Dashboard** → Animated score reveal with category breakdown
6. **Credits Footer** → Soft closure with team attribution

## Responsive Behavior
- Mobile: Single column, full-width cards, stacked elements
- Tablet: Maintain glassmorphism, reduce particle density
- Desktop: Full cinematic experience with all effects
- Maintain emotional impact across all breakpoints

## Images
No hero image required. The entire visual experience is created through:
- Animated gradient backgrounds
- Floating particles and parallax effects
- Glassmorphism cards and UI elements
- Glow effects and motion graphics

The design is intentionally illustration-free, relying on color, light, motion, and depth to create the cinematic atmosphere.