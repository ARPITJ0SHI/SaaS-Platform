require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const planRoutes = require('./routes/plan.routes');
const stripeRoutes = require('./routes/stripe.routes');
const organizationRoutes = require('./routes/organization.routes');




const app = express();


app.use(cors());


app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));


app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/organizations', organizationRoutes);


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const startServer = async (port) => {
  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        resolve();
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}`);
          server.close();
          startServer(port + 1);
        } else {
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;
startServer(PORT); 