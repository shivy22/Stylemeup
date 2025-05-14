const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // ✅ Import axios
require('dotenv/config');

app.use(cors());
app.options('*', cors());

// ✅ Use Express's built-in JSON parser
app.use(express.json());
app.use(morgan('tiny'));

// Serve static files
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

// Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/cart`, cartRoutes);

// ✅ Virtual Try-On Route (Fetches Products from Cart)
const UNITY_SERVER_URL = "http://localhost:5001"; // Unity server URL

app.post('/try-on', async (req, res) => {
    const { userId } = req.body;

    // ✅ Validate input
    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    try {
        // ✅ Fetch cart items from API
        const cartResponse = await axios.get(`http://localhost:3000/api/v1/cart/${userId}`);
        const cartItems = cartResponse.data.items;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // ✅ Extract valid outfit IDs (ignore null productId)
        const outfitIds = cartItems
            .filter(item => item.productId) // Remove items with null productId
            .map(item => item.productId);

        if (outfitIds.length === 0) {
            return res.status(400).json({ error: "No valid outfits found in the cart" });
        }

        console.log("➡️ Sending request to Unity:", { userId, outfitIds });

        // ✅ Send request to Unity
        const response = await axios.post(`${UNITY_SERVER_URL}/process-tryon`, { userId, outfitIds });

        console.log("✅ Unity Response:", response.data);

        res.json(response.data);
    } catch (error) {
        console.error("❌ Error communicating with Unity:", error?.response?.data || error.message);
        res.status(500).json({ error: "Unity server not responding or request failed" });
    }
});

// ✅ Database Connection
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(() => {
    console.log('✅ Database Connection is ready...');
})
.catch((err) => {
    console.log('❌ Database Connection Error:', err);
});

// ✅ Start the Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// ✅ Handle "Address in Use" error
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is in use. Trying another port...`);
        const newPort = PORT + 1;
        app.listen(newPort, () => {
            console.log(`✅ Server is now running on http://localhost:${newPort}`);
        });
    } else {
        console.error("❌ Server error:", err);
    }
});
