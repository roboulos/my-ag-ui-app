# Deployment Guide - AG UI Dashboard

This comprehensive guide covers everything needed to deploy the AG UI Dashboard to production environments, including configuration, optimization, monitoring, and maintenance.

## 🚀 Deployment Overview

The AG UI Dashboard is designed for production deployment with enterprise-grade features:
- **Next.js 15** with App Router and Turbopack optimization
- **Edge-compatible** serverless functions
- **WebSocket** support for real-time collaboration
- **AI integration** with OpenAI API
- **Scalable architecture** for high traffic loads

## 📋 Pre-Deployment Checklist

### ✅ Environment Requirements
- [ ] Node.js 18+ installed
- [ ] OpenAI API key obtained and validated
- [ ] Deployment platform account (Vercel, Netlify, AWS, etc.)
- [ ] Domain name configured (optional)
- [ ] SSL certificate ready (handled by most platforms)

### ✅ Code Preparation
- [ ] All TypeScript errors resolved (`npm run typecheck`)
- [ ] ESLint warnings addressed (`npm run lint`)
- [ ] Production build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Dependencies updated and security patches applied

### ✅ Testing Verification
- [ ] AI functionality working with API key
- [ ] Real-time collaboration tested
- [ ] Component generation tested
- [ ] Analytics features verified
- [ ] Multi-user synchronization confirmed

## 🌐 Deployment Platforms

### Vercel (Recommended)
Vercel provides optimal deployment for Next.js applications with built-in optimizations.

#### Quick Deploy to Vercel

1. **Connect Repository**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

2. **Environment Variables**
In Vercel dashboard, add:
```bash
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_WS_URL=wss://your-domain.vercel.app
```

3. **Build Configuration**
`vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### Vercel-Specific Optimizations
- **Edge Functions**: API routes automatically deployed to Edge Runtime
- **Image Optimization**: Built-in image optimization for better performance
- **CDN**: Global CDN for static assets
- **Analytics**: Built-in performance monitoring

---

### Netlify
Netlify offers comprehensive hosting with advanced deployment features.

#### Deploy to Netlify

1. **Build Configuration**
`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

2. **Environment Variables**
In Netlify dashboard:
```bash
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_WS_URL=wss://your-site.netlify.app
```

3. **Deployment Commands**
```bash
# Build for Netlify
npm run build

# Deploy via CLI
netlify deploy --prod --dir=.next
```

---

### AWS (Advanced)
For enterprise deployments requiring full control and scalability.

#### AWS Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │ -> │   Application   │ -> │    RDS/DynamoDB │
│   (CDN + WAF)   │    │  Load Balancer  │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                         ┌─────────────────┐    ┌─────────────────┐
                         │   ECS/Lambda    │ -> │      Redis      │
                         │  (Application)  │    │   (Sessions)    │
                         └─────────────────┘    └─────────────────┘
```

#### AWS Deployment Steps

1. **Container Configuration**
`Dockerfile`:
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

2. **Infrastructure as Code**
`terraform/main.tf`:
```hcl
# Application Load Balancer
resource "aws_lb" "main" {
  name               = "ag-ui-dashboard-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = var.public_subnets
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = "ag-ui-dashboard"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "ag-ui-dashboard"
    container_port   = 3000
  }
}
```

---

### Self-Hosted (Docker)
For complete control over the deployment environment.

#### Docker Deployment

1. **Production Dockerfile**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

FROM base AS build
COPY . .
RUN npm ci && npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

2. **Docker Compose**
`docker-compose.yml`:
```yaml
version: '3.8'
services:
  ag-ui-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_WS_URL=wss://localhost:3000
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - ag-ui-dashboard
    restart: unless-stopped
```

3. **NGINX Configuration**
`nginx.conf`:
```nginx
upstream app {
    server ag-ui-dashboard:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/certs/key.pem;
    
    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ⚙️ Environment Configuration

### Production Environment Variables

#### Required Variables
```bash
# AI Integration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Application Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://your-domain.com
WS_PORT=3001
```

#### Optional Variables
```bash
# Analytics and Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn

# Performance Optimization
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
REDIS_URL=redis://your-redis-instance

# Security
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
```

### Environment-Specific Configurations

#### Development
```bash
# .env.local
OPENAI_API_KEY=sk-dev-key
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

#### Staging
```bash
# .env.staging
OPENAI_API_KEY=sk-staging-key
NEXT_PUBLIC_WS_URL=wss://staging.your-domain.com
```

#### Production
```bash
# .env.production
OPENAI_API_KEY=sk-prod-key
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

## 🔧 Performance Optimization

### Build Optimizations

#### Next.js Configuration
`next.config.ts`:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Compress responses
  compress: true,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Performance Monitoring

#### Core Web Vitals Tracking
```typescript
// lib/analytics.ts
export const trackWebVitals = (metric: any) => {
  // Track Cumulative Layout Shift
  if (metric.name === 'CLS') {
    console.log('CLS:', metric.value);
  }
  
  // Track First Input Delay
  if (metric.name === 'FID') {
    console.log('FID:', metric.value);
  }
  
  // Track Largest Contentful Paint
  if (metric.name === 'LCP') {
    console.log('LCP:', metric.value);
  }
};
```

#### Application Performance Monitoring
```typescript
// lib/monitoring.ts
export const setupMonitoring = () => {
  // Performance observer
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log performance metrics
        console.log(`${entry.name}: ${entry.duration}ms`);
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  }
};
```

### Caching Strategy

#### CDN Configuration
```json
{
  "cache-control": {
    "static": "public, max-age=31536000, immutable",
    "dynamic": "public, max-age=0, must-revalidate",
    "api": "no-cache, no-store, must-revalidate"
  }
}
```

#### Service Worker (PWA)
```javascript
// public/sw.js
const CACHE_NAME = 'ag-ui-dashboard-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

## 🔒 Security Configuration

### Security Headers
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  return response;
}
```

### API Security
```typescript
// lib/auth.ts
export const validateApiKey = (apiKey: string) => {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key');
  }
  return true;
};

export const rateLimiter = {
  attempts: new Map(),
  limit: 100, // requests per hour
  
  check(ip: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(ip) || [];
    
    // Remove old attempts (older than 1 hour)
    const recentAttempts = userAttempts.filter(
      (time: number) => now - time < 3600000
    );
    
    if (recentAttempts.length >= this.limit) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(ip, recentAttempts);
    return true;
  }
};
```

### Environment Security
```bash
# Secure environment variable handling
chmod 600 .env.production
chown app:app .env.production

# Use secret management services
export OPENAI_API_KEY=$(aws secretsmanager get-secret-value --secret-id openai-key --query SecretString --output text)
```

## 📊 Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
  };
  
  return Response.json(health);
}
```

#### Metrics Collection
```typescript
// lib/metrics.ts
export class MetricsCollector {
  private metrics: Map<string, number> = new Map();
  
  increment(key: string, value: number = 1) {
    this.metrics.set(key, (this.metrics.get(key) || 0) + value);
  }
  
  gauge(key: string, value: number) {
    this.metrics.set(key, value);
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

export const metrics = new MetricsCollector();
```

### Logging Strategy

#### Structured Logging
```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

#### Error Tracking
```typescript
// lib/error-tracking.ts
export const captureException = (error: Error, context: any = {}) => {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // Send to external service (Sentry, etc.)
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Quality Gates
```yaml
# Quality checks before deployment
quality-gate:
  runs-on: ubuntu-latest
  steps:
    - name: Type Check
      run: npm run typecheck
      
    - name: Lint Check
      run: npm run lint
      
    - name: Security Audit
      run: npm audit --audit-level moderate
      
    - name: Bundle Size Check
      run: npm run build && npm run bundle-analyzer
```

## 🚦 Post-Deployment Verification

### Deployment Checklist
- [ ] Application loads successfully
- [ ] AI chat functionality works
- [ ] Component generation functional
- [ ] Real-time collaboration active
- [ ] Analytics and reporting working
- [ ] Performance metrics within acceptable ranges
- [ ] Security headers properly configured
- [ ] SSL certificate valid and active

### Smoke Tests
```typescript
// tests/smoke.test.ts
describe('Production Smoke Tests', () => {
  test('application loads', async () => {
    const response = await fetch(process.env.BASE_URL);
    expect(response.status).toBe(200);
  });
  
  test('health check responds', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/health`);
    expect(response.status).toBe(200);
  });
  
  test('AI endpoint accessible', async () => {
    const response = await fetch(`${process.env.BASE_URL}/api/copilotkit`);
    expect(response.status).not.toBe(404);
  });
});
```

### Performance Validation
```bash
# Lighthouse CI for performance testing
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Load Balancing**: Use Application Load Balancer for traffic distribution
- **Auto Scaling**: Configure auto-scaling based on CPU/memory usage
- **CDN**: Implement global CDN for static asset delivery
- **Database Scaling**: Use read replicas for improved performance

### Vertical Scaling
- **Memory Optimization**: Monitor and optimize memory usage
- **CPU Utilization**: Scale compute resources based on demand
- **Storage Performance**: Use SSD storage for better I/O performance

### Monitoring Scaling Metrics
```typescript
// lib/scaling-metrics.ts
export const scalingMetrics = {
  // Track concurrent users
  concurrentUsers: 0,
  
  // Monitor response times
  averageResponseTime: 0,
  
  // Track resource usage
  cpuUsage: process.cpuUsage(),
  memoryUsage: process.memoryUsage(),
  
  // WebSocket connections
  activeConnections: 0,
};
```

## 🔧 Maintenance and Updates

### Regular Maintenance Tasks
- **Dependency Updates**: Monthly security and feature updates
- **Performance Review**: Weekly performance metric analysis
- **Log Analysis**: Daily log review for errors and anomalies
- **Backup Verification**: Weekly backup integrity checks
- **Security Scans**: Monthly vulnerability assessments

### Update Strategy
```bash
# Update dependencies safely
npm audit
npm update
npm run test
npm run build

# Deploy to staging first
npm run deploy:staging

# Run integration tests
npm run test:integration

# Deploy to production
npm run deploy:production
```

### Rollback Procedure
```bash
# Quick rollback using Vercel
vercel rollback

# Or using Git-based rollback
git revert HEAD
git push origin main

# Database rollback (if applicable)
# Restore from latest backup
```

---

This deployment guide provides comprehensive coverage for production deployment of the AG UI Dashboard. Follow the sections relevant to your deployment platform and requirements for optimal results.