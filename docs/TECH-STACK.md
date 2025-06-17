# Technology Stack (v0.1)

## Core Components
- **Osmose** - Self-hosted streaming platform

## Frontend
- **Next.js** (v14+)
  - React framework with SSR/ISR
  - App Router architecture
- **Player Stack**
  - Video.js (v8+) with HLS.js
  - MSE-based adaptive streaming
- **UI Toolkit**
  - ShadCN UI (Radix + Tailwind)
  - Tailwind CSS (v3+) with CSS variables

## Backend Services
- **API Layer**
  - Node.js (v20+)
  - Express.js (v5+) 
  - REST API + WebSocket endpoints
- **Transcoding**
  - FFmpeg (v6+)
  - Hardware acceleration (NVENC/VAAPI)
  - HLS/DASH packaging

## Data Layer
- **PostgreSQL** (v16+)
  - Media metadata storage
  - User accounts and preferences
- **Prisma ORM**
  - Type-safe database client
  - Migrations system
- **Redis** (v7+)
  - Session caching
  - Real-time event pub/sub

## Infrastructure
- **Docker** (v24+)
  - Containerized services
  - GPU passthrough support
- **NGINX** (v1.25+)
  - Reverse proxy
  - SSL termination
  - Static file serving

## Key Workflows
1. Media ingestion → FFmpeg transcoding → HLS segmentation
2. Metadata extraction → PostgreSQL storage
3. Client requests → API service → Redis caching
4. Adaptive streaming → Video.js playback

````
User Devices (Browser/Phone/TV)
       │
       ▼
[Your Home Server/NAS/Old PC]
├───────────────────────────────────────┤
│  DOCKER CONTAINERS (single command)  │
│                                       │
│  ┌─────────────┐  ┌─────────────┐     │
│  │  Next.js    │  │  Node.js    │     │
│  │ (Frontend)  │  │ (API+Jobs)  │◄────┘
│  └──────┬──────┘  └──────┬──────┘
│         │                │          ▲
│  ┌──────▼──────┐  ┌─────▼──────┐   │
│  │ PostgreSQL  │  │   Redis    │   │
│  │ (Metadata)  │  │  (Cache)   │   │
│  └──────┬──────┘  └────────────┘   │
│         │                           │
│  ┌──────▼──────┐                    │
│  │   FFmpeg    │◄───────────────────┘
│  │(Transcoding)│
│  └──────┬──────┘
│         │
└─────────▼─────────────────────────┘
          │
[User's Media Folder]
````