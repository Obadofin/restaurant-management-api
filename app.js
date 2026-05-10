const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Or ['1.1.1.1']


const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log('connected to mongodb'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

// Health check route
app.get('/health', (req, res)=>{
    res.json({success: true, message: 'API is healthy'});
});



// Routes
app.use('/api/orders', orderRoutes);



// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



module.exports = app;