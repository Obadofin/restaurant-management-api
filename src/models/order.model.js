const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
    }, 
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unitPrice: {
        type: Number,
        required: true,

    },
    subTotal: {
        type: Number,
        required: true,
    },
}, {_id: false});


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items)=> items.length > 0,
            message: "Order must have at least one item",
        },

    },
    totalPrice: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["pending", "preparing", "completed", "cancelled"],
        default: "pending",
    },
}, {timestamps: true});

orderSchema.pre("save", function(){
    this.totalPrice = this.items.reduce((total, item) => {
        item.subTotal = item.quantity * item.unitPrice;
        return total + item.subTotal;
    }, 0);

    this.totalPrice = parseFloat(this.totalPrice.toFixed(2));
    
    
});

const VALID_TRANSITION = {
    pending: ["preparing", "cancelled"],
    preparing: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};

orderSchema.methods.canTransitionTo = function(newStatus){
    return VALID_TRANSITION[this.status].includes(newStatus);
};

orderSchema.methods.transitionTo = function(newStatus){
    if(!this.canTransitionTo(newStatus)){
        throw new Error(`Invalid status transition from ${this.status} to ${newStatus}. Allowed: ${VALID_TRANSITION[this.status].join(", ") || "none"}`);
        
    };
    
    this.status = newStatus;
    return this;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;