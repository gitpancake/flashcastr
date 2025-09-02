# Flashcastr 👾

A Farcaster Frame application for broadcasting and viewing Space Invaders flash photos, featuring IPFS-based image storage and real-time global feed.

![Flashcastr](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=next.js) 
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![IPFS](https://img.shields.io/badge/IPFS-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white)

## ✨ Features

- **Global Flash Feed**: Browse Space Invaders flash photos from players worldwide
- **Personal Feed**: View your own flash history with Farcaster integration
- **IPFS Storage**: Decentralized image storage with S3 fallback for reliability
- **City Filtering**: Filter flashes by location with trending cities
- **Real-time Updates**: Live feed updates with infinite scroll
- **Farcaster Integration**: Seamless authentication and social features
- **Responsive Design**: Mobile-first design with retro terminal aesthetics

## 🏗️ Architecture

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling with retro theme
- **React Query** - Data fetching and caching
- **NextAuth** - Authentication with Farcaster

### Image Storage
- **Primary**: IPFS via Pinata gateway (`fuchsia-rich-lungfish-648.mypinata.cloud`)
- **Fallback**: Amazon S3 (`invader-flashes.s3.amazonaws.com`)
- **Smart Routing**: Automatically selects IPFS when available, falls back to S3

### APIs
- **Flashcastr API**: Personal flashes and user data
- **Invaders.fun API**: Global flash feed and statistics
- **Neynar API**: Farcaster protocol integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Neynar API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gitpancake/flashcastr.git
cd flashcastr
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file:
```bash
# Farcaster/Neynar Configuration
NEYNAR_API_KEY=your_neynar_api_key
NEYNAR_CLIENT_ID=your_neynar_client_id

# Image Storage Configuration
NEXT_PUBLIC_IPFS_GATEWAY=https://fuchsia-rich-lungfish-648.mypinata.cloud/ipfs/
NEXT_PUBLIC_S3_BASE=https://invader-flashes.s3.amazonaws.com

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Frame Configuration
NEXT_PUBLIC_FRAME_NAME="Flashcastr"
NEXT_PUBLIC_FRAME_DESCRIPTION="Broadcast your Space Invader flashes."
NEXT_PUBLIC_FRAME_BUTTON_TEXT="Enter"
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── flash/[id]/        # Individual flash page
│   ├── profile/           # User profile pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── atom/              # Atomic components
│   ├── molecule/          # Molecular components
│   ├── organism/          # Organism components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── api.flashcastr.app/   # Flashcastr API client
│   ├── api.invaders.fun/     # Invaders.fun API client
│   ├── help/              # Helper utilities
│   └── constants.ts       # App constants
└── auth.ts               # NextAuth configuration
```

## 🖼️ Image Storage System

Flashcastr uses a hybrid image storage approach:

### IPFS Primary Storage
- Images are stored on IPFS for decentralization
- Retrieved via Pinata gateway for reliability
- URLs: `https://fuchsia-rich-lungfish-648.mypinata.cloud/ipfs/{cid}`

### S3 Fallback Storage  
- Legacy images remain on S3
- Provides fallback for IPFS unavailability
- URLs: `https://invader-flashes.s3.amazonaws.com/{path}`

### Smart URL Resolution
The `getImageUrl()` utility automatically selects the best storage:

```typescript
// Prefers IPFS if ipfs_cid is available
const imageUrl = getImageUrl(flash);
// Returns: IPFS URL or S3 URL as fallback
```

## 🔌 API Integration

### GraphQL Queries

**Flash Data Structure:**
```typescript
interface FlashData {
  flash_id: number;
  player: string;
  city: string;
  timestamp: number;
  img: string;
  ipfs_cid?: string;  // New IPFS content identifier
}
```

**Global Flash Structure:**
```typescript
interface GlobalFlash {
  flash_id: number;
  player: string;
  city: string;
  text: string;
  timestamp: number;
  img: string;
  ipfs_cid?: string;  // New IPFS content identifier
}
```

## 🎨 Styling & Design

- **Theme**: Retro terminal/hacker aesthetic
- **Colors**: Green terminal text, dark backgrounds
- **Typography**: Monospace fonts (Visitor)
- **Layout**: Mobile-first responsive grid
- **Components**: Custom styled with TailwindCSS

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run deploy:vercel` - Deploy to Vercel

### Environment Setup

The app uses multiple environment files:
- `.env` - Base configuration
- `.env.local` - Local overrides (gitignored)
- `.env.example` - Template for required variables

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Custom rules for Next.js and React
- **Prettier**: Code formatting (via ESLint integration)

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run deploy:vercel
```

This will:
1. Build the application
2. Configure environment variables
3. Deploy to Vercel

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables on your hosting platform

3. Start the production server:
```bash
npm start
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEYNAR_API_KEY` | Neynar API key for Farcaster integration | ✅ |
| `NEYNAR_CLIENT_ID` | Neynar client ID | ✅ |
| `NEXTAUTH_URL` | NextAuth URL (production URL) | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |
| `NEXT_PUBLIC_IPFS_GATEWAY` | IPFS gateway URL with /ipfs/ path | ✅ |
| `NEXT_PUBLIC_S3_BASE` | S3 base URL for fallback images | ✅ |
| `USE_TUNNEL` | Enable tunneling for development | ❌ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Add proper TypeScript types for all data structures

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Neynar** - Farcaster protocol integration
- **Space Invaders Community** - Game and flash photo inspiration
- **IPFS/Pinata** - Decentralized storage infrastructure
- **Vercel** - Hosting and deployment platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/gitpancake/flashcastr/issues)
- **Discord**: Join the Space Invaders community
- **Twitter**: Follow [@flashcastr](https://twitter.com/flashcastr) for updates

---

Built with ❤️ for the Space Invaders community