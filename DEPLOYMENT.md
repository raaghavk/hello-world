# Uptime Monitor SaaS - Deployment Guide

## Quick Start (Easiest Method)

### Option 1: Using the Start Script (Recommended for Beginners)

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose LTS version (18 or higher)

2. **Configure the Application**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your favorite text editor
   nano .env  # or: vim .env, code .env, etc.
   ```

3. **Set Required Configuration**
   Open `.env` and configure:
   - `SESSION_SECRET`: Generate a random 32+ character string
   - `EMAIL_*`: Your email settings (see Email Setup below)
   - `STRIPE_*`: Your Stripe API keys (see Stripe Setup below)

4. **Run the Application**
   ```bash
   ./start.sh
   ```

5. **Access Your Application**
   - Open browser: http://localhost:3000
   - Login with default admin credentials (from .env)
   - **CHANGE THE ADMIN PASSWORD IMMEDIATELY!**

---

## Email Setup (Required for Notifications)

### Option A: Using Gmail (Easiest)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Create new app password for "Mail"
3. **Configure .env**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=noreply@yourmonitor.com
   ```

### Option B: Using SendGrid (Recommended for Production)

1. **Sign up**: https://sendgrid.com/ (Free tier: 100 emails/day)
2. **Create API Key**: Settings → API Keys → Create API Key
3. **Configure .env**:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourmonitor.com
   ```

### Option C: Using Mailgun

1. **Sign up**: https://mailgun.com/
2. **Get SMTP Credentials**: Sending → Domain Settings → SMTP Credentials
3. **Configure .env**:
   ```env
   EMAIL_HOST=smtp.mailgun.org
   EMAIL_PORT=587
   EMAIL_USER=postmaster@yourdomain.mailgun.org
   EMAIL_PASSWORD=your-mailgun-password
   EMAIL_FROM=noreply@yourmonitor.com
   ```

---

## Stripe Setup (Required for Payments)

1. **Create Stripe Account**
   - Sign up: https://stripe.com/

2. **Get API Keys**
   - Go to: https://dashboard.stripe.com/apikeys
   - Copy your **Publishable key** and **Secret key**

3. **Configure .env**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Set Up Webhook** (for subscription updates)
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhook`
   - Events to listen: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy the webhook signing secret to `.env`:
     ```env
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

5. **Configure Pricing** (optional)
   ```env
   BASIC_PLAN_PRICE=1000  # $10 in cents
   PRO_PLAN_PRICE=2000    # $20 in cents
   ```

---

## Deployment to Production

### Option 1: Deploy to DigitalOcean (Recommended)

**Cost**: $6/month for basic droplet

1. **Create Droplet**
   - Sign up: https://digitalocean.com/
   - Create Droplet → Ubuntu 22.04 → $6/mo plan

2. **SSH into Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs

   # Install Git
   apt install -y git

   # Install PM2 (process manager)
   npm install -g pm2
   ```

4. **Clone and Setup Application**
   ```bash
   # Clone your repository or upload files
   git clone your-repo-url uptime-monitor
   cd uptime-monitor

   # Install dependencies
   npm install

   # Configure environment
   cp .env.example .env
   nano .env  # Configure all settings

   # Run setup
   node setup.js
   ```

5. **Start with PM2**
   ```bash
   # Start server
   pm2 start server.js --name uptime-server

   # Start monitor
   pm2 start monitor.js --name uptime-monitor

   # Save PM2 configuration
   pm2 save

   # Set PM2 to start on boot
   pm2 startup
   ```

6. **Set Up Nginx (Reverse Proxy)**
   ```bash
   # Install Nginx
   apt install -y nginx

   # Create Nginx configuration
   nano /etc/nginx/sites-available/uptime-monitor
   ```

   Add this configuration:
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
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site:
   ```bash
   ln -s /etc/nginx/sites-available/uptime-monitor /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. **Set Up SSL (Free with Let's Encrypt)**
   ```bash
   # Install Certbot
   apt install -y certbot python3-certbot-nginx

   # Get SSL certificate
   certbot --nginx -d your-domain.com
   ```

8. **Configure Firewall**
   ```bash
   ufw allow 22
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

### Option 2: Deploy to Heroku (Easiest, but more expensive)

**Cost**: $7-25/month

1. **Install Heroku CLI**
   - Download: https://devcenter.heroku.com/articles/heroku-cli

2. **Login and Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Add Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set SESSION_SECRET=your-secret
   heroku config:set EMAIL_HOST=smtp.gmail.com
   heroku config:set EMAIL_PORT=587
   # ... set all other variables from .env
   ```

5. **Create Procfile**
   ```bash
   echo "web: node server.js" > Procfile
   echo "worker: node monitor.js" >> Procfile
   ```

6. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

7. **Scale Workers**
   ```bash
   heroku ps:scale web=1 worker=1
   ```

### Option 3: Deploy with Docker

1. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Configure .env**
   ```bash
   cp .env.example .env
   nano .env
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

4. **View Logs**
   ```bash
   docker-compose logs -f
   ```

---

## Marketing & Getting Customers

### 1. Set Up Your Landing Page

- Use the included homepage at `/public/index.html`
- Customize the branding and copy
- Add your own domain

### 2. SEO Basics

- Create Google Search Console account
- Submit your sitemap
- Write blog posts about website monitoring
- Target keywords like "uptime monitoring", "website monitoring"

### 3. Free Marketing Channels

- **Reddit**: Post in r/SideProject, r/Entrepreneur
- **Hacker News**: Launch on Show HN
- **Product Hunt**: Submit your product
- **Twitter**: Tweet about building in public
- **LinkedIn**: Share your journey

### 4. Paid Advertising (When Ready)

- **Google Ads**: Target "uptime monitor" keywords ($1-5/day budget)
- **Facebook Ads**: Target small business owners
- **Reddit Ads**: Very cheap, good for testing

### 5. Competitive Pricing

- Free tier: Attract users, build trust
- Basic ($10/mo): Covers your costs
- Pro ($20/mo): Your profit margin

---

## Maintenance Tasks (10-20 hrs/month)

### Daily (5-10 min)
- Check PM2 status: `pm2 status`
- Review error logs: `pm2 logs`

### Weekly (30-60 min)
- Respond to customer emails
- Check database size: `du -sh data/`
- Review system resources: `htop`

### Monthly (2-4 hours)
- Update dependencies: `npm update`
- Review analytics
- Adjust marketing strategy
- Handle billing issues

### As Needed
- Scale server if traffic grows
- Add new features based on feedback
- Handle customer support

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs

# Check if port is in use
lsof -i :3000

# Restart services
pm2 restart all
```

### Email Not Sending
```bash
# Test email configuration
node -e "require('./email').testEmail()"
```

### Database Issues
```bash
# Backup database
cp data/uptime.db data/uptime.db.backup

# Check database integrity
sqlite3 data/uptime.db "PRAGMA integrity_check;"
```

### Monitor Not Running
```bash
# Check if monitor is running
pm2 list

# Restart monitor
pm2 restart uptime-monitor

# Check monitor logs
pm2 logs uptime-monitor
```

---

## Scaling to $1000/month

### Revenue Calculation

- **50 customers at $20/mo** = $1000/mo (Pro plan)
- **100 customers at $10/mo** = $1000/mo (Basic plan)
- **Mix**: 30 Pro ($600) + 40 Basic ($400) = $1000/mo

### Timeline

- **Month 1-2**: Launch, get first 10 customers (free marketing)
- **Month 3-4**: Reach 25 customers (organic + paid ads)
- **Month 5-6**: Reach 50+ customers (word of mouth + marketing)

### Key Metrics

- Conversion rate: 2-5% (visitors to paying customers)
- Churn rate: Keep under 5% monthly
- Customer acquisition cost: Under $20

---

## Support

If you encounter issues:

1. Check the logs: `pm2 logs`
2. Review this guide
3. Check the code comments
4. Google the error message

**Remember**: This is a real business. Treat your customers well, respond quickly, and continuously improve the service!
