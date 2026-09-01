import app from './app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Environment: ' + process.env.NODE_ENV);
  console.log('Health check: http://localhost:' + PORT + '/api/health');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
