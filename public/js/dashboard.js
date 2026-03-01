let currentUser = null;
let monitors = [];

// Check authentication on page load
async function checkAuth() {
  try {
    const response = await fetch('/api/user');
    if (!response.ok) {
      window.location.href = '/login.html';
      return;
    }
    currentUser = await response.json();
    updateUserInfo();
    loadMonitors();
  } catch (error) {
    window.location.href = '/login.html';
  }
}

// Update user info in navbar
function updateUserInfo() {
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('userPlan').textContent = currentUser.plan.toUpperCase();

  const planColors = {
    free: '#6b7280',
    basic: '#4f46e5',
    pro: '#10b981'
  };
  document.getElementById('userPlan').style.background = planColors[currentUser.plan];

  // Show upgrade notice if on free plan
  if (currentUser.plan === 'free') {
    document.getElementById('currentPlan').textContent = 'FREE';
    document.getElementById('upgradeNotice').style.display = 'block';
  }
}

// Load monitors
async function loadMonitors() {
  try {
    const response = await fetch('/api/monitors');
    monitors = await response.json();
    renderMonitors();
  } catch (error) {
    console.error('Error loading monitors:', error);
  }
}

// Render monitors
function renderMonitors() {
  const monitorsList = document.getElementById('monitorsList');

  if (monitors.length === 0) {
    monitorsList.innerHTML = `
      <div class="loading">
        <h3>No monitors yet</h3>
        <p>Click "Add Monitor" to start monitoring your first website</p>
      </div>
    `;
    return;
  }

  monitorsList.innerHTML = monitors.map(monitor => `
    <div class="monitor-card status-${monitor.status}">
      <div class="monitor-header">
        <div>
          <div class="monitor-name">${escapeHtml(monitor.name)}</div>
          <div class="monitor-url">${escapeHtml(monitor.url)}</div>
        </div>
        <span class="status-badge ${monitor.status}">${monitor.status.toUpperCase()}</span>
      </div>

      <div class="monitor-stats">
        <div class="stat">
          <span class="stat-label">Last Checked:</span>
          <span class="stat-value">${monitor.last_checked ? formatDate(monitor.last_checked) : 'Never'}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Check Interval:</span>
          <span class="stat-value">${monitor.check_interval / 60} minutes</span>
        </div>
      </div>

      <div class="monitor-actions">
        <button class="btn btn-primary" onclick="viewMonitorDetails(${monitor.id})">Details</button>
        <button class="btn" onclick="editMonitor(${monitor.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteMonitor(${monitor.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// Add monitor button
document.getElementById('addMonitorBtn').addEventListener('click', () => {
  // Check plan limits
  const limits = { free: 3, basic: 10, pro: 50 };
  if (monitors.length >= limits[currentUser.plan]) {
    alert(`You've reached the limit for your ${currentUser.plan} plan. Please upgrade to add more monitors.`);
    document.getElementById('upgradeModal').classList.add('show');
    return;
  }

  document.getElementById('modalTitle').textContent = 'Add Monitor';
  document.getElementById('monitorId').value = '';
  document.getElementById('monitorForm').reset();
  document.getElementById('monitorModal').classList.add('show');
});

// Monitor form submit
document.getElementById('monitorForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('monitorId').value;
  const name = document.getElementById('monitorName').value;
  const url = document.getElementById('monitorUrl').value;
  const checkInterval = parseInt(document.getElementById('checkInterval').value);

  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? `/api/monitors/${id}` : '/api/monitors';

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, checkInterval })
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById('monitorModal').classList.remove('show');
      loadMonitors();
    } else {
      document.getElementById('modalError').textContent = data.error;
      document.getElementById('modalError').classList.add('show');
    }
  } catch (error) {
    document.getElementById('modalError').textContent = 'An error occurred';
    document.getElementById('modalError').classList.add('show');
  }
});

// Edit monitor
function editMonitor(id) {
  const monitor = monitors.find(m => m.id === id);
  if (!monitor) return;

  document.getElementById('modalTitle').textContent = 'Edit Monitor';
  document.getElementById('monitorId').value = monitor.id;
  document.getElementById('monitorName').value = monitor.name;
  document.getElementById('monitorUrl').value = monitor.url;
  document.getElementById('checkInterval').value = monitor.check_interval;
  document.getElementById('monitorModal').classList.add('show');
}

// Delete monitor
async function deleteMonitor(id) {
  if (!confirm('Are you sure you want to delete this monitor?')) return;

  try {
    const response = await fetch(`/api/monitors/${id}`, { method: 'DELETE' });
    if (response.ok) {
      loadMonitors();
    }
  } catch (error) {
    alert('Error deleting monitor');
  }
}

// View monitor details
async function viewMonitorDetails(id) {
  try {
    const response = await fetch(`/api/monitors/${id}`);
    const data = await response.json();

    const { monitor, stats, incidents } = data;

    let detailsHtml = `
      <div>
        <h3>${escapeHtml(monitor.name)}</h3>
        <p>${escapeHtml(monitor.url)}</p>

        <div style="margin: 2rem 0;">
          <h4>Recent Checks (Last ${stats.length})</h4>
          <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 0.5rem; text-align: left;">Status</th>
                <th style="padding: 0.5rem; text-align: left;">Response Time</th>
                <th style="padding: 0.5rem; text-align: left;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${stats.map(stat => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 0.5rem;">
                    <span class="status-badge ${stat.status}">${stat.status.toUpperCase()}</span>
                  </td>
                  <td style="padding: 0.5rem;">${stat.response_time}ms</td>
                  <td style="padding: 0.5rem;">${formatDate(stat.checked_at)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 2rem;">
          <h4>Recent Incidents (Last ${incidents.length})</h4>
          ${incidents.length === 0 ? '<p>No incidents recorded</p>' : `
            <ul style="list-style: none; padding: 0;">
              ${incidents.map(inc => `
                <li style="padding: 0.5rem; border-bottom: 1px solid #e5e7eb;">
                  Started: ${formatDate(inc.started_at)} -
                  ${inc.resolved_at ? `Resolved: ${formatDate(inc.resolved_at)}` : 'Ongoing'}
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>
    `;

    document.getElementById('detailsContent').innerHTML = detailsHtml;
    document.getElementById('detailsModal').classList.add('show');
  } catch (error) {
    alert('Error loading monitor details');
  }
}

// Upgrade plan
document.querySelectorAll('.upgrade-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const plan = btn.dataset.plan;

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      alert('Error creating checkout session');
    }
  });
});

// Upgrade link click
document.getElementById('upgradeLink').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('upgradeModal').classList.add('show');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/';
});

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', () => {
    closeBtn.closest('.modal').classList.remove('show');
  });
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  document.getElementById('monitorModal').classList.remove('show');
});

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Initialize
checkAuth();
