# 🚀 Quick Start Guide

Get your Uptime Monitor SaaS running in **15 minutes**!

## Step 1: Install Node.js (5 minutes)

### Already have Node.js?
Check your version:
```bash
node --version
```

If you see `v18.x.x` or higher, skip to Step 2.

### Don't have Node.js?

**Windows:**
1. Go to https://nodejs.org/
2. Download "LTS" version
3. Run installer
4. Restart your terminal

**Mac:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Step 2: Setup the Application (5 minutes)

```bash
# Install dependencies
npm install

# Copy configuration file
cp .env.example .env

# Edit the .env file
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

### Minimum Configuration

Open `.env` and change these values:

```env
# REQUIRED: Change this to a random string (at least 32 characters)
SESSION_SECRET=your-super-secret-random-string-here-make-it-long

# REQUIRED: Your email for admin account
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=ChangeMeAfterFirstLogin123!

# OPTIONAL (for now): Email settings
# You can configure these later - app will run without them
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password

# OPTIONAL (for now): Stripe settings
# You can configure these later - app will run without them
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Generate a random SESSION_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))

# Or just mash your keyboard for 32+ characters!
```

## Step 3: Initialize Database (1 minute)

```bash
node setup.js
```

You should see:
```
Setting up Uptime Monitor SaaS...
1. Initializing database...
2. Creating admin user...
✅ Setup complete!
```

## Step 4: Start the Application (1 minute)

```bash
# Easy way (recommended):
./start.sh

# Or manually:
node server.js &
node monitor.js &
```

You should see:
```
🚀 Uptime Monitor Server running on port 3000
   URL: http://localhost:3000
```

## Step 5: Test It Out! (3 minutes)

1. **Open your browser**: http://localhost:3000

2. **Click "Login"**

3. **Login with admin credentials** (from your .env file)

4. **Add your first monitor**:
   - Click "Add Monitor"
   - Name: "My Website"
   - URL: https://example.com
   - Click "Save Monitor"

5. **Watch it work!**
   - After a few minutes, you'll see the status update
   - Check the monitoring logs in your terminal

## 🎉 Success!

Your uptime monitor is now running locally!

## What's Next?

### Configure Email (Important!)

Without email, users won't get notifications. Here's the easiest way:

**Using Gmail:**

1. Enable 2FA on your Gmail: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Update .env:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=noreply@yourmonitor.com
   ```
4. Restart the app

**Test email:**
```bash
node -e "require('./email').testEmail()"
```

### Configure Stripe (For Payments)

1. Sign up: https://stripe.com/
2. Get your test keys: https://dashboard.stripe.com/apikeys
3. Update .env:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Restart the app

**Note**: Start with TEST keys (sk_test_, pk_test_). Switch to live keys when ready for real customers!

### Deploy to Production

When you're ready to go live, see **DEPLOYMENT.md** for:
- Deploying to DigitalOcean ($6/month)
- Setting up a domain name
- Configuring SSL (free with Let's Encrypt)
- Marketing your service

## Troubleshooting

### "Port 3000 is already in use"
```bash
# Find what's using the port
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port in .env
PORT=3001
```

### "Cannot find module..."
```bash
# Install dependencies again
npm install
```

### "Database locked"
```bash
# Stop all running instances
pkill -f "node server.js"
pkill -f "node monitor.js"

# Start again
./start.sh
```

### Email not sending
- Email is optional for testing
- App will log emails to console if not configured
- Configure later when ready

### Stripe errors
- Stripe is optional for testing
- You can use the app without payment features
- Configure later when ready for paying customers

## Need More Help?

1. Check **README.md** - Full documentation
2. Check **DEPLOYMENT.md** - Deployment guide
3. Google the error message
4. Make sure all .env values are set correctly

## Stopping the Application

```bash
# If you used ./start.sh, press Ctrl+C

# Or kill the processes:
pkill -f "node server.js"
pkill -f "node monitor.js"
```

---

**Remember**: This is a real business application. Take your time, follow the steps, and you'll be up and running in no time! 🚀
