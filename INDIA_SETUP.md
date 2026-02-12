# 🇮🇳 Quick Setup Guide for Indian Market

## Step 1: Install Node.js (5 minutes)

### Windows
1. Download from: https://nodejs.org/
2. Install LTS version
3. Restart your computer

### Mac/Linux
```bash
# Mac
brew install node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Step 2: Configure for India (10 minutes)

```bash
# Install dependencies
npm install

# Copy configuration
cp .env.example .env

# Edit .env file
nano .env  # or use any text editor
```

### Required Configuration

```env
# Change these:
SESSION_SECRET=your-random-32-character-string
ADMIN_EMAIL=your-email@gmail.com
ADMIN_PASSWORD=ChangeMe123!

# For India market:
PAYMENT_PROVIDER=razorpay

# WhatsApp (get from WATI.io)
WHATSAPP_ENABLED=true
WHATSAPP_API_URL=your-wati-url
WHATSAPP_API_KEY=your-wati-key

# Razorpay (get from razorpay.com)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Pricing in INR
BASIC_PLAN_PRICE=299
PRO_PLAN_PRICE=599
```

## Step 3: Setup WhatsApp (15 minutes)

### Option 1: WATI.io (Recommended, Easiest)

**Cost**: ₹999/month for unlimited messages

1. Go to https://wati.io/
2. Sign up with Indian phone number
3. Complete WhatsApp Business verification
4. Go to Settings → API
5. Copy API URL and API Key
6. Add to .env file

**Test:**
```bash
node -e "require('./whatsapp').testWhatsApp()"
```

### Option 2: Interakt

**Cost**: Free for first 1000 messages

1. Go to https://interakt.shop/
2. Sign up
3. Connect WhatsApp Business
4. Get API credentials
5. Add to .env

### Option 3: Twilio (International)

**Cost**: $0.005 per message (₹0.40)

1. Go to https://www.twilio.com/
2. Sign up
3. Setup WhatsApp sandbox
4. Get credentials
5. More complex setup

## Step 4: Setup Razorpay (15 minutes)

### Create Account

1. Go to https://razorpay.com/
2. Click "Sign Up"
3. Use Indian mobile number
4. Complete KYC (need Aadhaar/PAN)

### Get API Keys

1. Login to Dashboard
2. Go to Settings → API Keys
3. Click "Generate Test Key"
4. Copy Key ID and Key Secret
5. Add to .env

### Test Mode vs Live Mode

**Start with TEST keys** (they start with `rzp_test_`)
- Practice accepting payments
- No real money involved
- Switch to LIVE when ready

**LIVE keys** (start with `rzp_live_`)
- Real payments
- Need complete KYC
- Razorpay takes 2% fee

## Step 5: Start the Application (2 minutes)

```bash
# Initialize database
node setup.js

# Start the app
./start.sh
```

Open browser: http://localhost:3000

## Step 6: Deploy to Indian Server (30 minutes)

### Option 1: DigitalOcean Mumbai (Recommended)

**Cost**: ₹500/month

1. Sign up: https://digitalocean.com/
2. Create Droplet:
   - Region: **Bangalore** or **Mumbai** (IMPORTANT!)
   - Plan: Basic - ₹500/month
   - OS: Ubuntu 22.04

3. SSH into server:
   ```bash
   ssh root@your-server-ip
   ```

4. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs git
   npm install -g pm2
   ```

5. Upload your code:
   ```bash
   git clone your-repo
   cd uptime-monitor
   npm install
   cp .env.example .env
   nano .env  # Configure settings
   node setup.js
   ```

6. Start with PM2:
   ```bash
   pm2 start server.js
   pm2 start monitor.js
   pm2 save
   pm2 startup
   ```

### Option 2: AWS Mumbai

**Cost**: ₹700/month

Same process, but:
- Use Mumbai region (ap-south-1)
- t2.micro instance
- Amazon Linux 2

### Option 3: Hostinger India

**Cost**: ₹299/month

1. Buy VPS hosting from Hostinger India
2. Use their panel to setup Node.js
3. Upload code via FTP
4. Configure and start

## Step 7: Get a Domain (Optional but Recommended)

### Buy .in Domain

**Cost**: ₹299-999/year

**Registrars:**
1. **GoDaddy India** - godaddy.com/en-in
2. **BigRock** - bigrock.in
3. **NameCheap** - namecheap.com

**Good domain names:**
- websitemonitor.in
- uptimealert.in
- sitecheck.in
- businessmonitor.in

### Point Domain to Server

1. Login to domain registrar
2. Go to DNS Settings
3. Add A Record:
   - Host: @
   - Points to: your-server-ip
   - TTL: 3600

Wait 1-24 hours for DNS propagation.

### Setup SSL (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.in
```

## Step 8: Marketing Setup

### 1. Create WhatsApp Business Number

**Free!**

1. Download WhatsApp Business app
2. Use different number than personal
3. Setup business profile:
   - Name: "Uptime Monitor"
   - Category: "Business Service"
   - Description: "Website monitoring service"
   - Website: your-domain.in

### 2. Create Social Media

**LinkedIn** (Most important for B2B)
1. Create business page
2. Post about website monitoring importance
3. Join Indian business groups

**Facebook**
1. Create business page
2. Join groups:
   - "India Startup Club"
   - "Digital Marketing India"
   - Your city business groups

**Instagram**
1. Business account
2. Share tips about websites
3. Use hashtags: #SmallBusiness #DigitalIndia

### 3. List on Business Directories

**Free listings:**
- Google My Business
- Just Dial
- Sulekha
- TradeIndia

**Paid (when ready):**
- IndiaMART - ₹5,000/year

## Step 9: Get First 3 Customers (1 week)

### Free Customer Strategy

**Day 1-2: Friends & Family**
- Offer FREE lifetime to first 10 users
- Get testimonials
- Ask for referrals

**Day 3-4: Local Businesses**
- Visit 20 shops/offices in your area
- Show quick demo on phone
- Give first month FREE
- Goal: 3 paying customers

**Day 5-7: Online**
- Post in Facebook groups
- Share on LinkedIn
- Tweet about it

### First Customer Script

"Hello! I built a service that checks if your website is working.

If your site goes down, you get WhatsApp message in 1 minute.

First month is FREE. Want to try?

[Show demo on your phone]"

## Common Issues & Solutions

### WhatsApp not sending

```bash
# Test WhatsApp
node -e "require('./whatsapp').testWhatsApp()"

# Check .env
cat .env | grep WHATSAPP
```

### Razorpay not working

- Make sure you're using TEST keys first
- Check KYC is complete
- Verify webhook URL

### Port 3000 already in use

```bash
# Kill the process
pkill -f "node server.js"

# Or use different port
PORT=3001 node server.js
```

### Out of memory

- Use at least 1GB RAM server
- If using 512MB, upgrade to 1GB

## Monthly Costs (Estimate)

| Item | Cost |
|------|------|
| Server (DigitalOcean) | ₹500 |
| Domain (.in) | ₹25 (₹299/year) |
| WhatsApp (WATI) | ₹999 |
| Email (Gmail - free) | ₹0 |
| **Total** | **₹1,524/month** |

**Break-even:** 6 customers at ₹299/month

## Success Checklist

- [ ] Application running locally
- [ ] WhatsApp notifications working
- [ ] Razorpay test payment working
- [ ] Deployed on Indian server
- [ ] Domain pointing to server
- [ ] SSL certificate installed
- [ ] WhatsApp Business profile created
- [ ] Social media pages created
- [ ] Got first 3 test users

## Need Help?

**Common Questions:**

1. **"I don't know coding"**
   - You don't need to! Just follow the steps
   - Copy-paste the commands
   - Watch YouTube videos if stuck

2. **"What if something breaks?"**
   - Restart server: `pm2 restart all`
   - Check logs: `pm2 logs`
   - Google the error message

3. **"How do I get customers?"**
   - Start with people you know
   - Post in Facebook groups
   - Visit local businesses
   - See INDIA_MARKET.md for detailed strategy

4. **"Should I quit my job?"**
   - NO! Start part-time
   - Get to ₹25,000/month first
   - Then decide

## Next Steps

1. ✅ Get it running locally (today)
2. ✅ Deploy to server (this week)
3. ✅ Get 3 test customers (week 2)
4. ✅ Get 10 paying customers (month 1)
5. ✅ Reach ₹10,000/month (month 2)
6. ✅ Scale to ₹50,000/month (month 3-6)

---

**You can do this! 🇮🇳 💪**

Remember: Every big business started small. Focus on getting your first customer, then the second, then the third. Take it one step at a time!
