/* Importing packages */
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const customerRoutes = require('./routes/customerRoutes');
const businessRoutes = require('./routes/businessRoutes');
const importRoutes = require('./routes/importdataRoutes');
const reviewRoutes = require('./routes/formRoutes');
const searchRoutes = require('./routes/searchRoutes');
const churnRoutes = require('./routes/churnRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatRoutes = require('./routes/chatRoutes');

/* Load environment variables from .env file */
dotenv.config();

/* Get MongoDB connection string from .env */
const uri = process.env.MONGO_URI;

const app = express();
app.use(cors());

/* Middleware to serve static files */
app.use(express.static(path.join(__dirname, 'public')));

/* Serve the HTML file on the root URL */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'import.html')); // Adjust the path as needed
});

async function connect() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error occurred while connecting to MongoDB:", error);
    }
};

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/business', businessRoutes);
app.use('/customer', customerRoutes);
app.use('/upload-csv', importRoutes);
app.use('/submit-form', reviewRoutes);
app.use('/search', searchRoutes);
app.use('/churn', churnRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/chat', chatRoutes);

//Connect to MongoDB
connect();

// Start the server 
app.listen(8000, () => {
    console.log("Server started on port 8000");
});
