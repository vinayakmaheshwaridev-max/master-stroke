🎨 Cricket Tournament Platform — Design System & UI Specification
1. Overview
This document defines the complete design system and UI guidelines for the Cricket Tournament Platform.
It MUST be treated as the single source of truth for all UI generation.
Goals

Maintain strict alignment with PRD (no extra screens)
Ensure consistent UI across User + Admin panels
Follow Apple-inspired minimal design
Be implementation-ready (React + Tailwind)
PRD Reference: Use this as the foundation for all screens and flows:
2. 🎯 Design Principles

Minimal, calm, premium interface
Neutral-first color palette
Content-first layout
Normal spacing, low clutter
Card-based structure
Consistent components across all screens
Functional clarity over decoration
3. 🎨 Color System
Backgrounds

bg-primary: #F7F5F2 (main beige background)
bg-secondary: #FFFFFF (cards, surfaces)
bg-tertiary: #F0EEE9 (subtle sections)
Text Colors

text-primary: #1C1C1E
text-secondary: #6B6B6B
text-muted: #9A9A9A
Accent Colors

accent-primary: #E8DFC8
accent-secondary: #62a43a (secondary interactive elements)
accent-hover: #DDD2B5
Semantic Colors

success: #4CAF50
warning: #F59E0B
error: #EF4444
info: #3B82F6
Borders

border-light: #E5E5E5
divider: #EFEFEF
4. 🔤 Typography
Font Family

Primary: Inter (fallback: system UI / SF Pro)
Type Scale

H1: 32px / 600
H2: 24px / 600
H3: 20px / 500
Body: 16px / 400
Small: 14px / 400
Caption: 12px / 400
Line Height

Headings: 1.2
Body: 1.5
5. 📏 Spacing System (8pt Grid)

xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
6. 🔲 Border Radius

sm: 8px (subtle roundedness)
md: 12px
lg: 16px
xl: 20px
7. 🌫 Shadow System

soft: 0 2px 8px rgba(0,0,0,0.05)
medium: 0 4px 16px rgba(0,0,0,0.08)
strong: 0 8px 24px rgba(0,0,0,0.12)
Default usage: soft
8. 🧩 Core Components
Buttons
Primary

Background: accent-primary
Text: text-primary
Hover: accent-hover
Radius: 12px
Secondary

Background: white
Border: 1px solid accent-secondary
Text: accent-secondary
Hover: accent-secondary with text white
Danger

Background: error
Text: white
Disabled

Opacity: 0.5
No shadow
Inputs

Height: 44px
Padding: 12px
Border: 1px solid border-light
Radius: 12px
States

Focus: soft accent glow
Error: red border + helper text
Disabled: muted background
Cards

Background: white
Radius: 16px
Padding: 16–24px
Shadow: soft
Used in:

Dashboards
Match cards
Admin panels
Tables

Clean minimal layout
Row height: 48px
Sticky header (admin)
Optional zebra rows
Badges (Status)

Pending → yellow background
Approved → green background
Rejected → red background
Rounded pill style
Modal

Centered
Background blur
Radius: 16px
Padding: 24px
Toggle Switch

Rounded
ON: green
OFF: grey
Notification Bell

Icon with badge count
Dropdown panel
Scrollable list
Navigation
User Panel (Top Navbar)

Sticky
Links:

Home
Register
Login
Admin Panel (Sidebar)

Fixed left sidebar
Items:

Dashboard
Teams
Scheduler
Matches
Tournament
Notifications
9. 📐 Layout System
Structure

Navbar (user) OR Sidebar (admin)
Page Header
Content Sections (cards/tables/forms)
Container Width

Max: 1200px
Standard: 1024px
10. 📱 Responsiveness

Mobile-first adjustments required
Cards stack vertically
Tables become scrollable
Sidebar becomes drawer
11. 🎯 UX Patterns
Empty State

Icon + text
Example: "No matches scheduled yet"
Success State

Green banner
Example: "Registration submitted successfully"
Error State

Inline form errors
Loading

Skeleton loaders
12. 🔁 Consistency Rules

Use SAME components everywhere
Do NOT create variations unless defined
Maintain spacing system strictly
Maintain color usage rules
No unnecessary gradients or visual noise
13. 🚫 Hard Constraints

Do NOT create screens outside PRD
Do NOT add extra features
Do NOT change flows
Follow PRD exactly
14. 🎯 Screen Coverage Requirement
You MUST generate ONLY these screens:
User Panel

U1: Landing Page (/)
U2: Registration (/register)
U3: Login (/login)
U4: Dashboard (/dashboard)
U5: Matches (/matches)
U6: Points Table (/standings)
U7: Info Page (/info)
Admin Panel

A0: Admin Login (/admin/login)
A1: Dashboard
A2: Teams
A3: Scheduler
A4: Score Entry
A5: Tournament Overview
A6: Notifications
15. 🎯 Final Instruction

First apply this design system
Then generate ALL screens using it
Maintain strict consistency across all UI
Ensure production-ready layouts