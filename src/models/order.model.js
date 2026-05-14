// Import mongoose for creating schemas and models
const mongoose = require("mongoose");

// Standard HTTP status codes (400, 404, etc.)
const { StatusCodes } = require('http-status-codes');

// Import MenuItem and User models to reference in our order schema
const MenuItem = require('../models/menu.model');
const User = require('../models/user.model');

// Sub-document: one line item in an order (e.g., 2x Burger)
const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",       // Links to the actual menu item in the database
        required: true,
    }, 
    name: {
        type: String,
        required: true,        // Stores the item name at time of order (in case it changes later)
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,                // Must order at least one
    },
    unitPrice: {
        type: Number,
        required: true,        // Price per single item at time of order

    },
    subTotal: {
        type: Number,
        required: true,        // quantity × unitPrice (auto-calculated before saving)
    },
}, {_id: false});              // No separate ID needed for each line item


// Main document: the full customer order
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",           // Links to the customer who placed the order
        required: true,
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items)=> items.length > 0,
            message: "Order must have at least one item",  // Can't checkout with an empty cart
        },

    },
    totalPrice: {
        type: Number,          // Sum of all subTotals (auto-calculated before saving)
    },
    status: {
        type: String,
        enum: ["pending", "preparing", "completed", "cancelled"],
        default: "pending",     // New orders start as "pending" until staff acts on them
    },
}, {timestamps: true});

// Runs automatically before saving: calculates subTotals for each item and the order total
orderSchema.pre("save", function(){
    this.totalPrice = this.items.reduce((total, item) => {
        item.subTotal = item.quantity * item.unitPrice;
        return total + item.subTotal;
    }, 0);

    this.totalPrice = parseFloat(this.totalPrice.toFixed(2));  // Rounds to 2 decimal places (e.g., $19.99)
    
    
});

// Allowed status changes: controls the order lifecycle to prevent invalid jumps
const VALID_TRANSITION = {
    pending: ["preparing", "cancelled"],    // Pending can move to cooking or be cancelled
    preparing: ["completed", "cancelled"],   // Cooking can finish or be cancelled
    completed: [],                           // Finished orders stay finished — no going back
    cancelled: [],                           // Cancelled orders stay cancelled
};

// Checks if a status change is allowed (returns true or false)
orderSchema.methods.canTransitionTo = function(newStatus){
    return VALID_TRANSITION[this.status].includes(newStatus);
};

// Performs the status change, or throws a clear error if it's not allowed
orderSchema.methods.transitionTo = function(newStatus) {
    if (!this.canTransitionTo(newStatus)) {
        const error = new Error(`Invalid status transition from ${this.status} to ${newStatus}. Allowed: ${VALID_TRANSITION[this.status].join(", ") || "none"}`);
        error.statusCode = StatusCodes.BAD_REQUEST;
        throw error;
    }

    this.status = newStatus;
    return this;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;