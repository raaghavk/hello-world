require('dotenv').config();
const axios = require('axios');
const { CronJob } = require('cron');
const { monitorDb, incidentDb, userDb, notificationDb } = require('./database');
const { sendEmail } = require('./email');

// Check interval in seconds (default: 5 minutes)
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL_SECONDS) || 300;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT_MS) || 10000;

// Check a single monitor
async function checkMonitor(monitor) {
  const startTime = Date.now();
  let status = 'down';
  let statusCode = null;
  let errorMessage = null;
  let responseTime = null;

  try {
    const response = await axios.get(monitor.url, {
      timeout: REQUEST_TIMEOUT,
      validateStatus: (status) => status < 500, // Accept all non-server error codes as "up"
      maxRedirects: 5
    });

    responseTime = Date.now() - startTime;
    statusCode = response.status;

    if (statusCode >= 200 && statusCode < 500) {
      status = 'up';
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    errorMessage = error.message;

    if (error.response) {
      statusCode = error.response.status;
    }
  }

  // Update monitor status in database
  monitorDb.updateStatus(monitor.id, status, responseTime, statusCode, errorMessage);

  // Handle incident creation/resolution
  await handleIncident(monitor, status);

  return { status, responseTime, statusCode, errorMessage };
}

// Handle incidents (when site goes down or comes back up)
async function handleIncident(monitor, currentStatus) {
  const ongoingIncident = incidentDb.findOngoing(monitor.id);

  if (currentStatus === 'down') {
    // Site is down
    if (!ongoingIncident) {
      // Create new incident
      const result = incidentDb.create(monitor.id);
      const incidentId = result.lastInsertRowid;

      // Send notification
      await sendDownNotification(monitor, incidentId);
    }
  } else if (currentStatus === 'up') {
    // Site is up
    if (ongoingIncident) {
      // Resolve the incident
      incidentDb.resolve(ongoingIncident.id);

      // Send recovery notification
      await sendUpNotification(monitor, ongoingIncident.id);
    }
  }
}

// Send notification when site goes down
async function sendDownNotification(monitor, incidentId) {
  try {
    const monitorOwner = userDb.findById(monitor.user_id);
    if (!monitorOwner) return;

    const subject = `🔴 ALERT: ${monitor.name} is DOWN`;
    const message = `
      Your monitored website is currently down:

      Monitor: ${monitor.name}
      URL: ${monitor.url}
      Time: ${new Date().toLocaleString()}

      We will continue monitoring and notify you when it comes back online.

      View details: ${process.env.APP_URL || 'http://localhost:3000'}/dashboard
    `;

    await sendEmail(monitorOwner.email, subject, message);

    // Record notification in database
    notificationDb.create(
      monitorOwner.id,
      incidentId,
      'down',
      `${monitor.name} went down`
    );

    incidentDb.markNotificationSent(incidentId);
    console.log(`📧 Down notification sent for monitor: ${monitor.name}`);
  } catch (error) {
    console.error('Error sending down notification:', error);
  }
}

// Send notification when site comes back up
async function sendUpNotification(monitor, incidentId) {
  try {
    const monitorOwner = userDb.findById(monitor.user_id);
    if (!monitorOwner) return;

    const subject = `✅ RESOLVED: ${monitor.name} is back UP`;
    const message = `
      Great news! Your monitored website is back online:

      Monitor: ${monitor.name}
      URL: ${monitor.url}
      Time: ${new Date().toLocaleString()}

      View details: ${process.env.APP_URL || 'http://localhost:3000'}/dashboard
    `;

    await sendEmail(monitorOwner.email, subject, message);

    // Record notification
    notificationDb.create(
      monitorOwner.id,
      incidentId,
      'up',
      `${monitor.name} recovered`
    );

    console.log(`📧 Recovery notification sent for monitor: ${monitor.name}`);
  } catch (error) {
    console.error('Error sending up notification:', error);
  }
}

// Main monitoring loop
async function runMonitoringCycle() {
  console.log(`🔄 Starting monitoring cycle at ${new Date().toLocaleString()}`);

  const monitors = monitorDb.getAllActive();
  console.log(`   Checking ${monitors.length} monitors...`);

  const checkPromises = monitors.map(async (monitor) => {
    try {
      const result = await checkMonitor(monitor);
      console.log(`   ✓ ${monitor.name}: ${result.status} (${result.responseTime}ms)`);
    } catch (error) {
      console.error(`   ✗ Error checking ${monitor.name}:`, error.message);
    }
  });

  await Promise.all(checkPromises);
  console.log(`✅ Monitoring cycle completed at ${new Date().toLocaleString()}\n`);
}

// Start the monitoring service
function startMonitoring() {
  console.log('🚀 Starting Uptime Monitor Service');
  console.log(`   Check interval: ${CHECK_INTERVAL} seconds`);
  console.log(`   Request timeout: ${REQUEST_TIMEOUT}ms\n`);

  // Run initial check immediately
  runMonitoringCycle();

  // Schedule periodic checks
  const cronPattern = `*/${CHECK_INTERVAL} * * * * *`; // Every CHECK_INTERVAL seconds

  new CronJob(cronPattern, runMonitoringCycle, null, true, 'UTC');

  console.log('✅ Monitoring service is running\n');
}

// Run if executed directly
if (require.main === module) {
  startMonitoring();
}

module.exports = { checkMonitor, startMonitoring };
