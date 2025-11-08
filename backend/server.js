const { app, connectDB } = require('./app');

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };