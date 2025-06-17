# Osmose - Self-Hosted Media Streaming Platform

![Osmose Architecture Diagram](docs/ARCHITECTURE.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/osmosemedia/osmose)](https://hub.docker.com/r/osmosemedia/osmose) 
[![GitHub Stars](https://img.shields.io/github/stars/osmose-media/osmose)](https://github.com/osmose-media/osmose)

Osmose is a modern, self-hosted streaming service with hardware-accelerated transcoding and a responsive web interface.

## ✨ Features

- **4K Transcoding** - FFmpeg with NVENC/Intel QSV support
- **Adaptive Streaming** - HLS/DASH via Video.js
- **Modern UI** - Next.js with ShadCN components
- **Easy Deployment** - Docker-compose ready
- **Metadata Management** - PostgreSQL + Prisma ORM

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/osmose-media/osmose.git
cd osmose

# Start services
docker-compose up -d
```