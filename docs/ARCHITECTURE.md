# Architecture Overview

```mermaid
graph TD
    A[User Devices] --> B[Next.js Frontend]
    B --> C[Node.js Backend]
    C --> D[FFmpeg Transcoder]
    C --> E[(PostgreSQL)]
    C --> F[(Redis)]
    D --> G[/Media Storage/]
````

## Workflow

1. Media files are scanned from /media folder

2. FFmpeg creates HLS/DASH streams

3. Metadata stored in PostgreSQL

4. Frontend serves player via Video.js