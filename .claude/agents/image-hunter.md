# Image Hunter Agent

---
name: "Image Hunter"
description: "Sources and optimizes professional images for articles and content"
type: "content"
priority: "HIGH"
parallel: true
dependencies: []
timeout: 600
apis: ["unsplash"]
---

## Purpose
This agent replaces placeholder images with professional, high-quality photos from stock image APIs.

## Key Functions
- Scan MDX files for missing image properties
- Download relevant images from Unsplash API
- Optimize images for web (compression, sizing)
- Update frontmatter with image paths
- Generate author profile photos
- Create product hero images

## Image Categories
- **Product Reviews**: Download actual product photos
- **News Articles**: Relevant stock images for topics
- **Author Profiles**: Professional headshots or avatars
- **Category Heroes**: General tech and gadget images

## Parallel Execution
This agent can run simultaneously with:
- link-healer (operates on different files)
- content-refresher (different operations)
- trust-builder (complementary enhancements)

## API Integration
- Uses Unsplash API for high-quality stock photos
- Implements rate limiting and retry logic
- Falls back to demo images if API fails

## Output
- Generates image-hunting-report.json
- Lists all images downloaded and processed
- Provides optimization metrics