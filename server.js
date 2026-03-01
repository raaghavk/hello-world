require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { userDb, monitorDb, incidentDb, notificationDb } = require('./database');
const { sendWelcomeEmail } = require('./email');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for simplicity, enable in production
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-key-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static('public'));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// Get current user helper
function getCurrentUser(req) {
  if (req.session.userId) {
    return userDb.findById(req.session.userId);
  }
  return null;
}

// ========================================
// AUTHENTICATION ROUTES
// ========================================

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const existingUser = userDb.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 10);
    const result = userDb.create(email, passwordHash);

    // Send welcome email
    await sendWelcomeEmail(email);

    // Log in the user
    req.session.userId = result.lastInsertRowid;

    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = userDb.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    userDb.updateLastLogin(user.id);

    // Create session
    req.session.userId = user.id;

    res.json({ success: true, user: { id: user.id, email: user.email, plan: user.plan } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
  const user = getCurrentUser(req);
  res.json({
    id: user.id,
    email: user.email,
    plan: user.plan,
    subscription_status: user.subscription_status
  });
});

// ========================================
// MONITOR ROUTES
// ========================================

// Get all monitors for current user
app.get('/api/monitors', requireAuth, (req, res) => {
  try {
    const monitors = monitorDb.findByUserId(req.session.userId);
    res.json(monitors);
  } catch (error) {
    console.error('Error fetching monitors:', error);
    res.status(500).json({ error: 'Failed to fetch monitors' });
  }
});

// Create monitor
app.post('/api/monitors', requireAuth, (req, res) => {
  try {
    const { name, url, checkInterval } = req.body;
    const user = getCurrentUser(req);

    // Validation
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    if (!validator.isURL(url, { require_protocol: true })) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check plan limits
    const existingMonitors = monitorDb.findByUserId(req.session.userId);
    const limits = {
      free: 3,
      basic: 10,
      pro: 50
    };

    if (existingMonitors.length >= limits[user.plan]) {
      return res.status(403).json({
        error: `Your ${user.plan} plan allows only ${limits[user.plan]} monitors. Upgrade to add more.`
      });
    }

    const result = monitorDb.create(
      req.session.userId,
      name,
      url,
      checkInterval || 300
    );

    res.json({
      success: true,
      monitor: {
        id: result.lastInsertRowid,
        name,
        url,
        checkInterval: checkInterval || 300
      }
    });
  } catch (error) {
    console.error('Error creating monitor:', error);
    res.status(500).json({ error: 'Failed to create monitor' });
  }
});

// Get monitor details with stats
app.get('/api/monitors/:id', requireAuth, (req, res) => {
  try {
    const monitor = monitorDb.findById(req.params.id);

    if (!monitor || monitor.user_id !== req.session.userId) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const stats = monitorDb.getStats(monitor.id, 100);
    const incidents = incidentDb.getByMonitor(monitor.id, 20);

    res.json({ monitor, stats, incidents });
  } catch (error) {
    console.error('Error fetching monitor:', error);
    res.status(500).json({ error: 'Failed to fetch monitor' });
  }
});

// Update monitor
app.put('/api/monitors/:id', requireAuth, (req, res) => {
  try {
    const { name, url, checkInterval } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    if (!validator.isURL(url, { require_protocol: true })) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    monitorDb.update(
      req.params.id,
      req.session.userId,
      name,
      url,
      checkInterval || 300
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating monitor:', error);
    res.status(500).json({ error: 'Failed to update monitor' });
  }
});

// Delete monitor
app.delete('/api/monitors/:id', requireAuth, (req, res) => {
  try {
    monitorDb.delete(req.params.id, req.session.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting monitor:', error);
    res.status(500).json({ error: 'Failed to delete monitor' });
  }
});

// Get notifications for current user
app.get('/api/notifications', requireAuth, (req, res) => {
  try {
    const notifications = notificationDb.getByUser(req.session.userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ========================================
// STRIPE PAYMENT ROUTES
// ========================================

// Create checkout session
app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { plan } = req.body; // 'basic' or 'pro'
    const user = getCurrentUser(req);

    const prices = {
      basic: process.env.BASIC_PLAN_PRICE || 1000, // $10
      pro: process.env.PRO_PLAN_PRICE || 2000      // $20
    };

    if (!prices[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Uptime Monitor - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: plan === 'basic' ? 'Up to 10 monitors' : 'Up to 50 monitors'
            },
            unit_amount: prices[plan],
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/dashboard?canceled=true`,
      metadata: {
        userId: user.id.toString(),
        plan: plan
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = parseInt(session.metadata.userId);
        const plan = session.metadata.plan;

        userDb.updateSubscription(
          userId,
          plan,
          session.customer,
          session.subscription,
          'active'
        );
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        const user = userDb.findByEmail(subscription.customer_email);
        if (user) {
          userDb.updateSubscription(user.id, 'free', null, null, 'inactive');
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// ========================================
// ADMIN ROUTES
// ========================================

app.get('/api/admin/users', requireAuth, (req, res) => {
  const user = getCurrentUser(req);

  // Simple admin check (you can enhance this)
  if (user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const users = userDb.getAll();
  res.json(users);
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`\n🚀 Uptime Monitor Server running on port ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
