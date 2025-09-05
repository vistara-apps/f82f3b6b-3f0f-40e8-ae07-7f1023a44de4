# Right Guard - Base Mini App

**Know Your Rights. Instantly.**

A mobile-first Base Mini App providing instant, state-specific legal rights information and documentation tools for interactions with law enforcement, designed for Farcaster integration.

## Features

### 🛡️ On-Demand Rights Card
- Mobile-optimized, one-page guide displaying essential rights
- State-specific "what to say" scripts
- Available in English and Spanish
- Instant access when you need it most

### 📹 Instant Record & Alert
- One-tap recording of audio/video encounters
- Discreet alert system to trusted contacts
- Automatic location sharing
- IPFS storage for evidence preservation

### 🌍 Bilingual Support
- Full content available in English and Spanish
- Culturally appropriate scripts and guidance
- Accessible to broader user base

### 📍 Location-Aware Content
- Automatic state detection
- State-specific legal information
- Relevant local guidance and scripts

## Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Blockchain**: Base (via OnchainKit), MiniKit integration
- **Backend**: Supabase for data storage
- **AI**: OpenAI for content generation
- **Storage**: Pinata for IPFS media storage
- **Animation**: Framer Motion
- **Wallet**: Base Wallet integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Base wallet for testing

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd right-guard-miniapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your API keys:
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Your OnchainKit API key
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `OPENAI_API_KEY`: Your OpenAI API key
- `PINATA_API_KEY`: Your Pinata API key
- `PINATA_SECRET_API_KEY`: Your Pinata secret key

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main application page
│   ├── providers.tsx      # MiniKit and other providers
│   ├── globals.css        # Global styles with Tailwind
│   ├── loading.tsx        # Loading UI
│   └── error.tsx          # Error boundary
├── components/            # Reusable UI components
│   ├── CalloutCard.tsx    # Information cards
│   ├── ScriptButton.tsx   # Action buttons
│   ├── RecordButton.tsx   # Recording controls
│   ├── StateSelector.tsx  # State selection dropdown
│   ├── ContactPicker.tsx  # Emergency contact picker
│   ├── RightsCard.tsx     # Rights information display
│   └── RecordingInterface.tsx # Recording functionality
├── lib/                   # Utilities and types
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Utility functions
│   └── constants.ts      # App constants and config
└── public/               # Static assets
```

## Key Components

### RightsCard
Displays state-specific legal rights and "what to say" scripts with bilingual support.

### RecordingInterface  
Handles audio/video recording with emergency alert functionality.

### StateSelector
Allows users to select their state for relevant legal information.

### ContactPicker
Manages emergency contacts for alert system.

## Business Model

**Freemium with Micro-transactions:**
- Free: Basic rights information and recording
- $0.99: State-specific premium scripts
- $1.99: Enhanced recording features and cloud storage  
- $4.99: Unlimited bilingual content access

## Legal Disclaimer

This app provides general information only and does not constitute legal advice. Laws vary by jurisdiction and situation. Users should consult with qualified attorneys for specific legal guidance.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@rightguard.app or create an issue in this repository.

## Roadmap

- [ ] Advanced state-specific legal content
- [ ] Integration with legal aid organizations
- [ ] Multi-language support beyond English/Spanish
- [ ] Enhanced AI-powered legal guidance
- [ ] Community-driven content updates
- [ ] Integration with legal document services

---

**Right Guard** - Empowering citizens with knowledge and tools for safer interactions with law enforcement.
