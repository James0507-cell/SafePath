# SafePath Project Plan

SafePath is a dual-platform (Web & Mobile) maps application designed to prioritize user safety through community-driven safety ratings, reviews, and intelligent navigation.

## 1. Core Objectives
- Provide a high-performance mapping interface.
- Enable community-driven safety reporting and verification.
- Offer "Safe-Routing" that avoids dangerous areas based on real-time data.
- Facilitate trip planning with AI-driven activity suggestions.

## 2. Key Features

### Phase 1: Foundation & Mapping
- **Interactive Map**: Integration of OpenStreetMap (OSM) via MapLibre GL.
- **Place Search & Markers**: Basic POI (Point of Interest) discovery.
- **User Authentication**: Secure login/signup via Supabase Auth.

### Phase 2: Safety & Reviews
- **Safety Markers/Areas**: Ability for users to mark areas with a safety level (1-5).
- **Evidence Uploads**: Supabase Storage integration for "proofs" (photos/videos).
- **Social Interaction**: Reactions (thumbs up/down, etc.) and threaded comments on reviews and safety reports.

### Phase 3: Intelligent Navigation
- **Safe Routing Engine**: Directions that filter routes based on user-defined safety thresholds.
- **Route Visualization**: Clear indicators of why a route was chosen (e.g., "Avoiding low-safety area").

### Phase 4: Trip Planning & Event Maker
- **Trip Itinerary**: Create trips with multiple destinations.
- **Activity Suggestion Engine**: Integration point for a custom AI model to provide activity and product recommendations based on trip locations.
- **Advanced Filters**: Apply safety levels per trip/leg of a journey.

## 3. Tech Stack & Services
- **Frontend**: Next.js 16 (React 19) + Tailwind CSS 4.
- **Mobile**: Capacitor 8.3 (iOS/Android).
- **Database**: Supabase (PostgreSQL + PostGIS extension for spatial queries).
- **Mapping**: MapLibre GL JS + OpenStreetMap tiles.
- **Storage**: Supabase Storage for user proofs and media.
- **AI Backend**: Custom AI Model (to be integrated via a secure API endpoint).

## 4. Database Schema (Preliminary)
- `profiles`: User information and settings.
- `places`: Cached POI data and custom place entries.
- `reviews`: Textual reviews, ratings, and foreign keys to places.
- `safety_reports`: Polygon/Point data for safety zones, descriptions, and safety levels.
- `trips`: Itinerary data, planned routes, and activity descriptions.
- `social_interactions`: Reactions and comments on reviews/safety reports.

## 5. Verification & Testing
- **Unit Testing**: Vitest for core logic (routing algorithms).
- **Integration Testing**: Playwright for end-to-end user flows (Auth -> Place Review -> Safety Report).
- **Mobile Verification**: Capacitor live-reload testing on Android/iOS emulators.

## 6. Documentation
- **Project Plan**: This document will be moved to the root of the project as `PROJECT_PLAN.md` for team reference.
- **API Specs**: Documentation for the custom AI model endpoint and Supabase edge functions.
