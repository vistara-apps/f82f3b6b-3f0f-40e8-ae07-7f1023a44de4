# Right Guard - Production Deployment Guide

This guide provides step-by-step instructions for deploying Right Guard to production.

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- A Vercel account (recommended) or other hosting platform
- Supabase account and project
- OpenAI API key
- Pinata IPFS account
- OnchainKit API key
- Base RPC access (optional, uses public RPC by default)

## Environment Setup

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. In the SQL Editor, run the database schema from `lib/database.sql`
4. Enable Row Level Security (RLS) policies as defined in the schema
5. Configure authentication providers if needed

### 2. OpenAI Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key from the API Keys section
3. Ensure you have sufficient credits for GPT-4 usage

### 3. Pinata IPFS Setup

1. Create an account at [pinata.cloud](https://pinata.cloud)
2. Generate API keys from the API Keys section
3. Note both the API Key and Secret API Key

### 4. OnchainKit Setup

1. Get your OnchainKit API key from [onchainkit.xyz](https://onchainkit.xyz)
2. This enables Base blockchain integration and MiniKit features

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# OnchainKit API Key for Base integration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI API Key for content generation
OPENAI_API_KEY=your_openai_api_key_here

# Pinata IPFS Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_key_here

# Base RPC URL (optional, defaults to public RPC)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications:

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   vercel
   ```

2. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all environment variables from your `.env.local`

3. **Configure Domains**
   - Add your custom domain in the Domains section
   - Configure DNS records as instructed

4. **Enable Edge Functions** (if needed)
   - Vercel automatically optimizes API routes
   - No additional configuration needed

### Option 2: Netlify

1. **Build Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login and deploy
   netlify login
   netlify deploy --prod
   ```

### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci --only=production
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
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

2. **Build and Deploy**
   ```bash
   # Build image
   docker build -t right-guard .
   
   # Run container
   docker run -p 3000:3000 --env-file .env.local right-guard
   ```

## Database Migration

### Initial Setup

Run the database schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of lib/database.sql
-- This creates all necessary tables, indexes, and RLS policies
```

### Seeding Data

The schema includes basic legal guides for California in English and Spanish. For additional states:

1. Use the OpenAI integration to generate guides automatically
2. Or manually insert guides using the API endpoints
3. Consider pre-generating guides for major states

## Security Configuration

### 1. Supabase Security

- Enable Row Level Security (RLS) on all tables
- Configure authentication policies
- Set up proper CORS origins
- Enable realtime subscriptions if needed

### 2. API Security

- Implement rate limiting (consider using Upstash Redis)
- Add request validation middleware
- Set up proper CORS headers
- Enable HTTPS only

### 3. Environment Security

- Never commit `.env` files to version control
- Use different API keys for development and production
- Rotate API keys regularly
- Monitor API usage and costs

## Performance Optimization

### 1. Next.js Optimizations

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['gateway.pinata.cloud'],
  },
  // Enable compression
  compress: true,
  // Optimize builds
  swcMinify: true,
  // Enable static exports for static pages
  output: 'standalone',
};

export default nextConfig;
```

### 2. Database Optimizations

- Ensure proper indexing (included in schema)
- Use connection pooling
- Implement query optimization
- Consider read replicas for high traffic

### 3. CDN Configuration

- Use Vercel's Edge Network or Cloudflare
- Cache static assets aggressively
- Implement proper cache headers
- Optimize images and media

## Monitoring and Analytics

### 1. Application Monitoring

```javascript
// Add to your app
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Error Tracking

Consider integrating Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

### 3. Performance Monitoring

- Use Vercel Analytics or Google Analytics
- Monitor Core Web Vitals
- Track API response times
- Monitor database performance

## Backup and Recovery

### 1. Database Backups

Supabase provides automatic backups, but consider:
- Regular manual backups for critical data
- Export user data periodically
- Test restore procedures

### 2. Media Backups

IPFS provides decentralized storage, but consider:
- Pinning important content to multiple nodes
- Regular verification of IPFS content
- Backup strategy for critical recordings

## Scaling Considerations

### 1. Horizontal Scaling

- Vercel automatically scales serverless functions
- Consider database connection limits
- Implement proper caching strategies

### 2. Database Scaling

- Monitor Supabase usage and upgrade plans as needed
- Consider read replicas for high read workloads
- Implement proper indexing strategies

### 3. API Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
// Example using Upstash Redis
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function rateLimit(identifier, limit = 10, window = 60) {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return current <= limit;
}
```

## Health Checks

Implement health check endpoints:

```javascript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    // Check external API availability
    // Check IPFS connectivity
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        openai: 'up',
        pinata: 'up'
      }
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    );
  }
}
```

## SSL/TLS Configuration

### Vercel
- Automatic SSL certificates
- HTTP/2 support
- Edge network optimization

### Custom Deployment
- Use Let's Encrypt for free SSL certificates
- Configure proper SSL headers
- Enable HSTS

## Domain Configuration

1. **DNS Setup**
   ```
   A     @     76.76.19.61
   CNAME www   your-app.vercel.app
   ```

2. **Subdomain for API** (optional)
   ```
   CNAME api   your-app.vercel.app
   ```

## Testing in Production

### 1. Smoke Tests

Create basic smoke tests for critical paths:

```javascript
// tests/smoke.test.js
describe('Production Smoke Tests', () => {
  test('App loads successfully', async () => {
    const response = await fetch(process.env.NEXT_PUBLIC_APP_URL);
    expect(response.status).toBe(200);
  });
  
  test('API health check passes', async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`);
    expect(response.status).toBe(200);
  });
});
```

### 2. Load Testing

Use tools like Artillery or k6 for load testing:

```yaml
# artillery-config.yml
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Basic user flow"
    requests:
      - get:
          url: "/"
      - get:
          url: "/api/health"
```

## Maintenance

### 1. Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Update API keys as needed
- Review and update legal content

### 2. Monitoring Checklist

- [ ] Application uptime
- [ ] API response times
- [ ] Database performance
- [ ] Error rates
- [ ] User engagement metrics
- [ ] Cost monitoring

### 3. Backup Verification

- [ ] Test database restore procedures
- [ ] Verify IPFS content accessibility
- [ ] Check backup completeness

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify API key validity
   - Review dependency versions

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check connection limits
   - Review RLS policies

3. **API Timeouts**
   - Check OpenAI API limits
   - Verify Pinata connectivity
   - Review rate limiting

### Debug Mode

Enable debug logging in production:

```javascript
// Only enable in development or with specific flag
if (process.env.NODE_ENV === 'development' || process.env.DEBUG_MODE === 'true') {
  console.log('Debug information');
}
```

## Support and Documentation

- **API Documentation**: `/docs/API.md`
- **User Guide**: Create user-facing documentation
- **Support Email**: Set up support@rightguard.app
- **Status Page**: Consider creating a status page

## Legal Considerations

- **Privacy Policy**: Ensure GDPR/CCPA compliance
- **Terms of Service**: Clear terms for app usage
- **Data Retention**: Implement proper data retention policies
- **Legal Disclaimers**: Ensure proper legal disclaimers are displayed

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] API keys tested and valid
- [ ] Build process successful
- [ ] Tests passing

### Deployment
- [ ] Application deployed successfully
- [ ] Health checks passing
- [ ] SSL certificate active
- [ ] Domain configured correctly
- [ ] CDN configured

### Post-Deployment
- [ ] Smoke tests completed
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Documentation updated
- [ ] Team notified

### Go-Live
- [ ] DNS propagated
- [ ] All services operational
- [ ] Monitoring alerts configured
- [ ] Support processes in place
- [ ] Launch announcement ready

---

**Congratulations! Your Right Guard application is now ready for production use.**

For ongoing support and updates, refer to the project documentation and maintain regular monitoring of all systems.
