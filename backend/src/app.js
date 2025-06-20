require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const roleRoutes = require('./routes/role');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/courseRoutes');
const crnRoutes = require('./routes/crnRoutes');
const projectProposalRoutes = require('./routes/projectProposalRoutes');
const projectGroupRoutes = require('./routes/projectGroupRoutes');
const literatureReviewRoutes = require('./routes/literatureReviewRoutes');
const methodologyRoutes = require('./routes/methodologyRoutes');
const systemAnalysisRoutes = require('./routes/systemAnalysisRoutes');
const systemDesignRoutes = require('./routes/systemDesignRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/crns', crnRoutes);
app.use('/api/proposals', projectProposalRoutes);
app.use('/api/project-groups', projectGroupRoutes);
app.use('/api/literature-review', literatureReviewRoutes);
app.use('/api/methodology', methodologyRoutes);
app.use('/api/system-analysis', systemAnalysisRoutes);
app.use('/api/system-design', systemDesignRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 