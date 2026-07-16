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

app.use('/api', routes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', authMiddleware, adminMiddleware, adminRoutes);

app.use(errorMiddleware);

module.exports = app;
