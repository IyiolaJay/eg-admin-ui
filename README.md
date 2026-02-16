# ErrandGo Admin UI

A modern, accessible admin login interface for ErrandGo built with React, TypeScript, and Tailwind CSS.

## Phase 1: Admin Login

This implementation delivers a professional, secure, and fully accessible login experience with mocked authentication flows.

## Features

- **Modern UI Design**: Clean, responsive login interface with brand panel
- **Full Accessibility**: WCAG AA compliant with proper ARIA labels, keyboard navigation, and focus management
- **Form Validation**: Client-side validation with helpful error messages
- **Loading States**: Visual feedback during authentication
- **Password Toggle**: Secure password input with visibility toggle
- **Responsive**: Works seamlessly on desktop and mobile devices
- **Mocked Authentication**: Simulates various login scenarios without backend
- **Unit Tests**: Comprehensive test coverage for validation and auth flows

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **React Router** - Client-side routing
- **Vitest** - Unit testing
- **Testing Library** - Component testing utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Test Credentials

The application includes mocked authentication with the following test accounts:

| Role | Email | Password | Result |
|------|-------|----------|--------|
| Admin | admin@errandgo.test | password123 | Success |
| Super Admin | super@errandgo.test | superpass | Success |
| Locked Account | locked@errandgo.test | (any) | Account locked error |
| (any other) | - | - | Invalid credentials error |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Toast.tsx
├── pages/           # Page components
│   ├── Login.tsx
│   └── Dashboard.tsx
├── services/        # API and business logic
│   └── auth.ts      # Mock authentication service
├── types/           # TypeScript type definitions
│   └── auth.ts
├── utils/           # Utility functions
│   └── validation.ts
└── __tests__/       # Unit tests
    ├── Login.test.tsx
    ├── auth.test.ts
    └── validation.test.ts
```

## Design System

### Colors

- **Primary**: #FFFFFF (white)
- **Secondary**: #7D32DF (blue violet)
- **Tertiary**: #FAFAC6 (cream)
- **Text Primary**: #111827
- **Text Muted**: #6B7280
- **Error**: #DC2626

### Typography

- Font Stack: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Heading sizes: 24–32px
- Body text: 14–16px

## Accessibility Features

- **Keyboard Navigation**: Full support for tab navigation and keyboard interactions
- **Screen Readers**: Proper ARIA labels and live regions
- **Focus Management**: Visible focus indicators using brand colors
- **Contrast**: WCAG AA compliant color contrast ratios
- **Semantic HTML**: Proper use of form elements and ARIA attributes

## Testing

The application includes comprehensive unit tests covering:

- Form validation logic
- Mock authentication flows (success, invalid credentials, locked account)
- User interactions (typing, clicking, form submission)
- Loading states and error handling
- Accessibility features

Run tests with:

```bash
npm test
```

## Acceptance Criteria - Phase 1

✅ Responsive login page implemented matching design spec  
✅ Fields validate and disable/enable submit correctly  
✅ Mocked success, invalid credential, and account-locked flows demonstrated  
✅ Accessibility checks: tab navigation, screen reader announcements, color contrast  
✅ Unit tests cover form validation and mocked auth flows

## Future Phases

- Real API integration
- Multi-factor authentication (MFA)
- Password reset flow
- Full admin dashboard with analytics
- User management features

## License

Copyright © 2026 ErrandGo. All rights reserved.
