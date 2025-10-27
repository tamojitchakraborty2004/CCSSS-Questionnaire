# Combined College Student Stress Scale (CCSSS)

## Overview
An immersive, cinematic interactive questionnaire website that assesses college student stress levels through an adaptive assessment flow. The application features stunning visual design with glassmorphism UI, animated gradients, floating particles, and dynamic transitions.

## Project Goals
- Provide a visually engaging stress assessment experience
- Adapt questionnaire modules based on initial responses
- Generate personalized stress level insights
- Export results as PDF reports and CSV data

## Current State
**Phase 1 Complete**: Full frontend implementation with all components, animations, and adaptive logic.

## Recent Changes
- **2025-10-27**: Initial development - Created complete frontend with:
  - Hero section with animated gradient background and floating particles
  - 10 core questions with glassmorphism cards and glowing rating buttons
  - Adaptive module system (Academic, Health, Financial, Social)
  - Results dashboard with circular gauge animation and category breakdowns
  - Progress visualization and typewriter effects
  - CSV data export functionality
  - Module-specific gradient theming

## Technology Stack

### Frontend
- **React** with TypeScript
- **Framer Motion** for animations and transitions
- **Tailwind CSS** for styling
- **Wouter** for routing
- **TanStack Query** for state management
- **Zod** for schema validation

### Design System
- **Fonts**: Poppins SemiBold for headings, Inter Regular for body text
- **Colors**: Deep gradients (indigo→turquoise, violet→coral, module-specific palettes)
- **UI Pattern**: Glassmorphism with backdrop blur and translucent backgrounds
- **Animations**: Framer Motion for card entrances, gauge fills, particle effects

### Backend
- **Express.js** (minimal - primarily for serving static assets)
- All questionnaire logic handled client-side

## Project Architecture

### Data Models (`shared/schema.ts`)
- Core questions (10 questions, 0-4 rating scale)
- Module questions (4 modules × 5 questions each)
- Assessment results with scoring and categorization
- Module definitions with themes and gradients

### Components
- **Hero**: Landing page with animated gradient and call-to-action
- **QuestionCard**: Glassmorphism card with question and rating buttons
- **RatingButtons**: 0-4 scale with glow effects and hover animations
- **ModuleHeader**: Animated module introduction with themed gradients
- **ProgressBar**: Gradient-filled progress indicator
- **CircularGauge**: Animated circular progress with color morphing
- **CategoryBar**: Animated horizontal bars for category breakdowns
- **ResultsDashboard**: Complete results view with gauge, categories, and actions
- **ParticleBackground**: Canvas-based floating particle system

### Adaptive Logic
1. **Core Assessment**: 10 questions, scored 0-4 each
2. **Module Trigger**: If core score > 13, show adaptive modules
3. **Module Selection**:
   - Academic: Heavy workload ≥2 AND Pressure for grades ≥2
   - Health: Poor sleep ≥2
   - Financial: Financial difficulties ≥2
   - Social: Always shown to all users
4. **Results Calculation**:
   - Total = Core (0-40) + Modules (0-80)
   - Percentage determines stress level: Low (0-33%), Moderate (34-66%), High (67-100%)

### User Flow
1. **Hero** → Start button reveals assessment
2. **Core Questions** → 10 questions with progress tracking
3. **Adaptive Branch**:
   - Score ≤ 13: Skip to results
   - Score > 13: Show relevant modules
4. **Module Intros** → Animated headers before each module
5. **Module Questions** → 5 questions per module with themed backgrounds
6. **Results Dashboard** → Circular gauge, category breakdown, typewriter message
7. **Export Options** → Download PDF report or CSV data

## Key Features

### Visual Excellence
- Animated gradient backgrounds that shift with progress
- Floating particle effects throughout
- Glassmorphism cards with blur and translucency
- Smooth Framer Motion animations for all transitions
- Glow effects on interactive elements
- Module-specific color theming

### User Experience
- Responsive design for all screen sizes
- Smooth page transitions with no abrupt jumps
- Progress visualization at all stages
- Typewriter effect for result messages
- Confetti animation on results reveal
- Intuitive 0-4 rating scale with visual feedback

### Data Export
- CSV export with all responses and results
- PDF report generation (to be implemented)
- Timestamped assessment completion

## Development Notes

### Styling Approach
- Tailwind CSS with custom gradients
- Poppins for headings (font-heading)
- Inter for body text (font-sans)
- Glassmorphism: `bg-white/10 backdrop-blur-lg`
- Glow effects: Box shadows with color/opacity

### Animation Patterns
- Card entrances: Slide-up + fade with stagger
- Gauge fill: Easing animation over 2 seconds
- Typewriter: Character-by-character reveal
- Progress bars: Width animation with gradient fill
- Hover states: Scale transforms (1.05x-1.1x)

### State Management
- Local React state for assessment flow
- No backend persistence (client-side only)
- Responses stored in arrays until completion
- Adaptive module selection based on core responses

## Next Steps
1. Implement PDF report generation
2. Add optional backend for assessment tracking
3. Enhance analytics and insights
4. Add email delivery for results
5. Implement data persistence for progress saving
