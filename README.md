# Memry Photobook

A mobile-first web application for ordering custom photo books. Users can select book styles, choose page counts, pick cover designs, upload photos, and edit their photobook with a drag-and-drop editor.

## Features

### Customer Features
- **Book Style Selection**: Choose from Portrait, Landscape, or Square photobooks
- **Page Count Options**: Select 50 or 100 pages (configurable by admin)
- **Cover Design Selection**: Pick from preset cover designs
- **Photo Upload**: Upload multiple photos with drag-and-drop support
- **Book Editor**: 
  - Arrange photos automatically or manually
  - Choose from 5 layout options (1-6 photos per page)
  - Add and edit text on pages
  - Customize page background colors
- **Flip Book Preview**: View your photobook with realistic page-turning animation
- **Shareable Links**: Generate links to share your photobook with others

### Admin Features
- **Secure Login**: Password-protected admin dashboard
- **Book Type Management**: Add, edit, delete book types with custom prices and aspect ratios
- **Page Options Management**: Configure available page counts and pricing
- **Cover Design Management**: Upload and manage cover design options
- **Toggle Activation**: Enable/disable products without deleting them

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Convex (serverless backend)
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Animations**: react-pageflip for book flip effect

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd memry
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```

This will:
- Create a new Convex project (if needed)
- Generate a `.env.local` file with your `VITE_CONVEX_URL`
- Start the Convex development server

4. In a new terminal, start the frontend:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

### Initial Setup

1. Navigate to `/admin` to create your admin account
2. On first visit, you'll be prompted to create your admin credentials
3. Once logged in, click "Seed Sample Data" to populate initial book types, page options, and cover designs
4. Or manually add your own products through the dashboard

## Project Structure

```
memry/
├── convex/                 # Convex backend
│   ├── schema.ts          # Database schema
│   ├── admin.ts           # Admin authentication
│   ├── bookTypes.ts       # Book type CRUD
│   ├── pageOptions.ts     # Page options CRUD
│   ├── coverDesigns.ts    # Cover design CRUD
│   ├── photoBooks.ts      # Photo book management
│   ├── files.ts           # File upload handling
│   └── seed.ts            # Sample data seeding
├── src/
│   ├── components/ui/     # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and store
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   ├── PageOptionsPage.tsx
│   │   ├── CoverSelectionPage.tsx
│   │   ├── PhotoUploadPage.tsx
│   │   ├── BookEditorPage.tsx
│   │   ├── ViewBookPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   └── AdminDashboardPage.tsx
│   ├── types/             # TypeScript declarations
│   ├── App.tsx            # Main app with routing
│   └── main.tsx           # Entry point
└── index.html
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Customer order flow (step-by-step) |
| `/view/:shareId` | View shared photobook (read-only) |
| `/admin` | Admin login page |
| `/admin/dashboard` | Admin management dashboard |

## Design System

The app uses a white theme with beige accents and black text:

- **Primary**: Black (#0a0a0a)
- **Background**: White (#ffffff)
- **Accent/Beige**: #f5f0e8, #e8e4dc
- **Muted**: #f5f5f0

## Development

### Run development server:
```bash
npm run dev
```

### Type checking:
```bash
npx tsc --noEmit
```

### Lint:
```bash
npm run lint
```

### Build for production:
```bash
npm run build
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## License

MIT