const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required:true
        }],
        shippingAddress1: { 
            type:String,
            required:true,
        },
        shippingAddress2 :{
            type:String,
        },
        city:{
            type:String,
            required:true,
        },
        zip:{
            type:String,
            required:true,
        },
    country:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,
        default:'pending',
    },
    totalPrice:{
        type:Number,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    dateOrdered:{
        type:Date,
        default:Date.now,
    },
})

orderSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

orderSchema.set('toJSON',{
    virtuals:true,
});

exports.Order = mongoose.model('Order', orderSchema);


/**
 * order example:
 * {
 * "orderItems":[
 * {
 * "quantity":3,
 * "product":"678d4e048a8f42d45d913cef"
 * },
 * {
 * "quantity":2,
 * "product":"678d5217149dc7bdbc8dd971"
 * }
 * ],
 * "shippingAddress1":"flowers street, 45",
 * "shippingAddress2":"1-B",
 * "city":"NewYork",
 * "zip":"000000"
 * "country":"Manhattan"
 * "phone":"+9189896303030"
 * "user":"req.body.user"
 * 
 * }
 */