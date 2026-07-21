const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
const adminRoutes = require('./routes/admin/index');
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Privacy Policy page (required by Google Play Store)
app.get('/privacy-policy', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Maktech</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0f172a; color: #e2e8f0;
      line-height: 1.7; padding: 2rem 1rem;
    }
    .container {
      max-width: 800px; margin: 0 auto;
      background: #1e293b; border-radius: 16px;
      padding: 3rem; border: 1px solid #334155;
    }
    h1 {
      font-size: 2rem; color: #f8fafc;
      margin-bottom: 0.5rem;
    }
    .updated { color: #94a3b8; margin-bottom: 2rem; font-size: 0.9rem; }
    h2 {
      font-size: 1.25rem; color: #38bdf8;
      margin-top: 2rem; margin-bottom: 0.75rem;
    }
    p, li { color: #cbd5e1; margin-bottom: 0.75rem; }
    ul { padding-left: 1.5rem; }
    a { color: #38bdf8; }
    .footer { text-align: center; margin-top: 2rem; color: #64748b; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

    <h2>1. Introduction</h2>
    <p>Welcome to Maktech. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application.</p>

    <h2>2. Information We Collect</h2>
    <p>We may collect the following types of information:</p>
    <ul>
      <li><strong>Account Information:</strong> Name, email address, and phone number when you create an account.</li>
      <li><strong>Usage Data:</strong> Information about how you interact with the app, including browsing history within the app and search queries.</li>
      <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers.</li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <p>We use your information to:</p>
    <ul>
      <li>Provide and maintain our services</li>
      <li>Personalize your experience</li>
      <li>Send you notifications about products and updates</li>
      <li>Improve our app and customer service</li>
      <li>Process transactions</li>
    </ul>

    <h2>4. Data Sharing</h2>
    <p>We do not sell, trade, or rent your personal information to third parties. We may share data only with service providers who assist in operating our app, and only as necessary to provide our services.</p>

    <h2>5. Data Security</h2>
    <p>We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

    <h2>6. Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
      <li>Access and receive a copy of your personal data</li>
      <li>Request correction of inaccurate data</li>
      <li>Request deletion of your account and associated data</li>
      <li>Opt out of marketing communications</li>
    </ul>

    <h2>7. Third-Party Services</h2>
    <p>Our app may use third-party services such as Google Sign-In and Firebase for authentication and analytics. These services have their own privacy policies governing their use of your information.</p>

    <h2>8. Children's Privacy</h2>
    <p>Our app is not intended for children under 13. We do not knowingly collect personal data from children under 13.</p>

    <h2>9. Changes to This Policy</h2>
    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

    <h2>10. Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
    <p><strong>Email:</strong> <a href="mailto:support@maktech.app">support@maktech.app</a></p>

    <div class="footer">&copy; ${new Date().getFullYear()} Maktech. All rights reserved.</div>
  </div>
</body>
</html>`);
});

app.use('/api', routes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);

app.use(errorMiddleware);

module.exports = app;
