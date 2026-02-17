# Cataboxd

A visual Letterboxd diary viewer that displays your watched films as a stack of 3D DVD cases.

## Features

- **3D DVD Stack** - Films are displayed as realistic DVD cases stacked on top of each other, with dynamic tilting based on scroll position
- **Smooth Animations** - Click on any DVD to pull it out from the stack with a fluid animation, rotating to reveal the movie poster
- **Poster Colors** - Background colors are extracted from movie posters (with intelligent fallback based on film title)
- **Movie Details** - View your ratings, reviews, rewatch status, and link back to Letterboxd
- **Responsive Scroll** - DVDs tilt dynamically as you scroll, creating a tactile browsing experience

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations and gestures
- **Styled Components** - CSS-in-JS styling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cataboxd.git
cd cataboxd

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. Enter your Letterboxd username when prompted
2. Scroll through your DVD stack
3. Click any DVD case to view details
4. Click the back button or press Escape to return to the stack

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## How It Works

### Data Fetching
The app fetches your Letterboxd diary via their public RSS feed, parsing film entries including titles, ratings, reviews, and poster images.

### Color Extraction
Colors are extracted from movie posters using canvas-based dominant color detection. When CORS prevents image access, a deterministic color is generated from the film title hash to ensure consistency.

### 3D Rendering
DVD cases are rendered using CSS 3D transforms with six faces (front, back, top, bottom, left, right). The perspective and rotation create the illusion of physical DVD cases that can be pulled from the stack.

## License

MIT
