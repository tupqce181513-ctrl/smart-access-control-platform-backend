require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const mqttService = require('./services/mqtt.service');

const PORT = process.env.PORT || 3000;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();

    // Connect to MQTT broker
    console.log('Connecting to MQTT broker...');
    await mqttService.connect();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`
    +Smart Access Control Platform Server                   
    +Version: 1.0.0                                        
    +Environment: ${process.env.NODE_ENV || 'development'}
    +Server running on: http://localhost:${PORT}       
      `);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`✗ Port ${PORT} is already in use`);
      } else {
        console.error('✗ Server error:', error.message);
      }
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n✓ Received SIGINT, shutting down gracefully...');
      server.close(() => {
        console.log('✓ Server closed');
        mqttService.disconnect();
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n✓ Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        console.log('✓ Server closed');
        mqttService.disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
