const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    try {
        const orderList = await Order.find().populate('user','name')
        .populate({path:'orderItems',populate:{path: 'product', populate:'order'}})
        if (!orderList) {
            return res.status(500).json({ success: false, message: "No orders found" });
        }
        res.send(orderList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.user)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        const orderItemsIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            });

            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        }));

        let order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,  // ✅ Corrected field
            status: req.body.status,
            totalPrice: req.body.totalPrice,
            user: req.body.user
        });

        order = await order.save();

        if (!order) {
            return res.status(400).send('The order cannot be created!');
        }

        res.send(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
           status:req.body.status
        },
        { new: true}
    )

    if(!order)
    return res.status(400).send('the order cannot be created!')

    res.send(order);
})

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found!" });
        }

        res.status(200).json({ success: true, message: "Order deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting order", error: error.message });
    }
});


module.exports = router;
