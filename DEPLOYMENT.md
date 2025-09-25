# Seva Sahayak - Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Advantages:**
- Optimized for Next.js
- Automatic HTTPS
- Global CDN
- Automatic deployments from Git
- Free tier available

**Steps:**

1. **Prepare your project:**
   ```bash
   # Make sure all dependencies are installed
   npm install

   # Test build locally
   npm run build
   ```

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Deploy:**
   ```bash
   # From your project directory
   cd seva-sahayak
   vercel
   ```

4. **Set Environment Variables in Vercel:**
   - Go to your project dashboard on vercel.com
   - Navigate to Settings → Environment Variables
   - Add these variables:
     ```
     GOOGLE_API_KEY=your_gemini_api_key
     CHROMADB_URL=your_chromadb_url
     TOP_K_RESULTS=8
     CHUNK_SIZE=1500
     CHUNK_OVERLAP=300
     SIMILARITY_THRESHOLD=-0.1
     ```

**ChromaDB Setup for Vercel:**
Since Vercel doesn't support persistent storage, you'll need:
- **Option A**: Use ChromaDB Cloud (paid service)
- **Option B**: Use a separate VPS/server for ChromaDB (see Option 3)

### Option 2: Netlify

**Steps:**

1. **Build the project:**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Deploy via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=out
   ```

3. **Set Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add the same variables as Vercel

### Option 3: VPS/Server (Full Control)

**Recommended for production with ChromaDB persistence**

#### Server Requirements:
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 50GB+ SSD
- **CPU**: 2+ cores
- **OS**: Ubuntu 20.04+ or Windows Server

#### Setup Steps:

1. **Install Dependencies:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs python3 python3-pip

   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Setup ChromaDB:**
   ```bash
   pip3 install chromadb

   # Create ChromaDB service
   sudo nano /etc/systemd/system/chromadb.service
   ```

   **ChromaDB Service File:**
   ```ini
   [Unit]
   Description=ChromaDB Service
   After=network.target

   [Service]
   Type=exec
   User=www-data
   WorkingDirectory=/var/www/seva-sahayak
   ExecStart=/usr/bin/python3 -m chromadb.cli.cli run --host 0.0.0.0 --port 8000 --path ./chroma_data
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable chromadb
   sudo systemctl start chromadb
   ```

3. **Deploy Next.js App:**
   ```bash
   # Clone your repository
   git clone <your-repo-url> /var/www/seva-sahayak
   cd /var/www/seva-sahayak

   # Install dependencies
   npm install

   # Build the app
   npm run build

   # Start with PM2
   pm2 start npm --name "seva-sahayak" -- start
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx (Reverse Proxy):**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/seva-sahayak
   ```

   **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
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

   ```bash
   sudo ln -s /etc/nginx/sites-available/seva-sahayak /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Setup SSL with Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 4: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Build the app
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose (with ChromaDB):**
```yaml
version: '3.8'
services:
  seva-sahayak:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - CHROMADB_URL=http://chromadb:8000
    depends_on:
      - chromadb
    volumes:
      - ./pdfs:/app/pdfs

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma
    environment:
      - IS_PERSISTENT=TRUE

volumes:
  chroma_data:
```

**Deploy with Docker:**
```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
- [ ] GOOGLE_API_KEY (Gemini API key)
- [ ] CHROMADB_URL (if using external ChromaDB)
- [ ] TOP_K_RESULTS=8
- [ ] CHUNK_SIZE=1500
- [ ] CHUNK_OVERLAP=300
- [ ] SIMILARITY_THRESHOLD=-0.1

### 2. Security
- [ ] Remove any hardcoded API keys
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS if needed
- [ ] Set up rate limiting
- [ ] Configure firewall rules

### 3. Performance
- [ ] Optimize images and assets
- [ ] Enable compression
- [ ] Set up CDN for static files
- [ ] Configure caching headers

### 4. Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring
- [ ] Configure alerts

## 🔧 Post-Deployment Tasks

### 1. Initialize Documents
```bash
# Process PDFs (one-time setup)
curl -X POST https://your-domain.com/api/process
```

### 2. Health Checks
```bash
# Test main endpoints
curl https://your-domain.com/api/debug
curl -X POST https://your-domain.com/api/chat -H "Content-Type: application/json" -d '{"message":"test"}'
```

### 3. Performance Testing
- Test with multiple concurrent users
- Monitor response times
- Check memory usage
- Verify ChromaDB performance

## 📊 Recommended Production Setup

**Architecture:**
```
Internet → Load Balancer → Next.js App → ChromaDB
    ↓
   CDN (Static Assets)
```

**Infrastructure:**
- **App Server**: 4GB RAM, 2 CPU cores
- **ChromaDB Server**: 8GB RAM, 4 CPU cores, SSD storage
- **Database Backup**: Regular ChromaDB data snapshots
- **Monitoring**: Uptime, error rates, response times

## 🚨 Important Notes

1. **ChromaDB Data**: Always backup your vector database
2. **API Keys**: Never commit to version control
3. **HTTPS**: Always use SSL in production
4. **Scaling**: Consider load balancers for high traffic
5. **Updates**: Test deployments in staging first

## 💡 Cost Estimates

### Vercel + ChromaDB Cloud
- **Vercel Pro**: $20/month
- **ChromaDB Cloud**: $50+/month
- **Total**: ~$70/month

### VPS (DigitalOcean/Linode)
- **Droplet (8GB)**: $48/month
- **Domain**: $12/year
- **Total**: ~$49/month

### AWS/GCP
- **Variable based on usage**
- **Estimate**: $30-100/month

Choose the option that best fits your budget and technical requirements!