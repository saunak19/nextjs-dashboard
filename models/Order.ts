import mongoose, { Document, Schema, model, models } from "mongoose";

// Interface for a single item in the order
export interface IOrderItem {
    name: string;
    qty: number;
    image: string;
    price: number;
    product: mongoose.Schema.Types.ObjectId;
}

// Interface for the main Order
export interface IOrder extends Document {
    user: mongoose.Schema.Types.ObjectId;
    orderItems: IOrderItem[];
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: string;
    paymentResult?: {
        id: string;
        status: string;
        update_time: string;
        email_address: string;
    };
    totalPrice: number;
    isPaid: boolean;
    paidAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
});

const OrderSchema = new Schema<IOrder>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        orderItems: [OrderItemSchema],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order = models.Order || model<IOrder>('Order', OrderSchema);
export default Order;