# Flashcastr 👾

A decentralized Farcaster Frame application for broadcasting and viewing Space Invaders flash photos, featuring IPFS storage via Pinata and real-time global feed.

![Flashcastr](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=next.js) 
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![IPFS](https://img.shields.io/badge/IPFS-65C2CB?style=for-the-badge&logo=ipfs&logoColor=white)

## ✨ Features

- **Global Flash Feed**: Browse Space Invaders flash photos from players worldwide
- **Personal Feed**: View your own flash history with Farcaster integration
- **IPFS Storage**: Decentralized image storage via Pinata for reliability
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
- **IPFS**: Decentralized storage via Pinata gateway (`fuchsia-rich-lungfish-648.mypinata.cloud`)
- **Fully Decentralized**: All images stored on IPFS for censorship resistance and permanence

### APIs
- **Flashcastr API**: All flash data, user management, and global feed
- **Neynar API**: Farcaster protocol integration and authentication

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
cp .env.example .env
```

4. Configure your `.env` file with your actual values:
   - Get a **Neynar API key** from [neynar.com](https://neynar.com)
   - Generate a **NextAuth secret**: `openssl rand -base64 32`
   - Set your **Flashcastr API key** (contact the team)
   - Configure your deployment URL for production

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
│   ├── api.flashcastr.app/   # Flashcastr API client (unified API)
│   ├── neynar/            # Neynar/Farcaster API client
│   ├── help/              # Helper utilities
│   └── constants.ts       # App constants
└── auth.ts               # NextAuth configuration
```

## 🖼️ Image Storage System

Flashcastr uses decentralized IPFS storage for all images:

### IPFS Decentralized Storage
- All images are stored on IPFS for permanence and censorship resistance
- Retrieved via Pinata gateway for optimal performance and reliability
- URLs: `https://fuchsia-rich-lungfish-648.mypinata.cloud/ipfs/{cid}`

### Image URL Resolution
The `getImageUrl()` utility handles IPFS URL construction:

```typescript
// Returns IPFS URL from ipfs_cid
const imageUrl = getImageUrl(flash);
// Returns: https://gateway.../ipfs/{cid}
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
  img: string;           // Legacy field for backwards compatibility
  ipfs_cid?: string;     // IPFS content identifier (primary)
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
- `.env` - Your local configuration (gitignored for security)
- `.env.example` - Template showing all required variables
- Environment variables are automatically loaded by Next.js

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

All required environment variables are documented in `.env.example`. Copy it to `.env` and configure with your values.

### Core Configuration (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEYNAR_API_KEY` | Neynar API key for Farcaster integration | Get from [neynar.com](https://neynar.com) |
| `NEYNAR_CLIENT_ID` | Neynar client ID from dashboard | `ca507e6f-5287-...` |
| `NEXTAUTH_URL` | Your app's public URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | JWT signing secret | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_URL` | Public URL for the app | Same as NEXTAUTH_URL |
| `FLASHCASTR_API_KEY` | API key for Flashcastr backend | Contact team for access |
| `NEXT_PUBLIC_FLASHCASTR_API_URL` | Flashcastr API endpoint | `http://localhost:4000` (dev) |

### Image Storage (Required)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_IPFS_GATEWAY` | IPFS gateway for decentralized storage via Pinata | `https://...mypinata.cloud/ipfs/` |

### Frame Configuration (Required)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_FRAME_NAME` | App name displayed in frame | `Flashcastr` |
| `NEXT_PUBLIC_FRAME_DESCRIPTION` | Frame description | `Broadcast your Space Invader flashes.` |
| `NEXT_PUBLIC_FRAME_BUTTON_TEXT` | Frame button text | `Enter` |

### Optional Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `REDIS_URL` | Redis connection for caching | Production only |
| `KV_REST_API_URL` | Vercel KV store URL | Optional |
| `KV_REST_API_TOKEN` | Vercel KV store token | Optional |
| `NEXT_PUBLIC_ADMIN_FID` | Admin Farcaster ID for special features | Optional |
| `USE_TUNNEL` | Enable localtunnel for development | Optional |

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