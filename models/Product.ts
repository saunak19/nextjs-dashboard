import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name.'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please provide a description.'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price.'],
        default: 0,
    },
    sku: {
        type: String,
        required: [true, 'Please provide a SKU.'],
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Please provide a stock quantity.'],
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }],
}, {
    timestamps: true,
});

// Debug middleware
ProductSchema.pre('save', function (next) {
    console.log('🔄 Product pre-save - categories:', this.categories);
    next();
});

ProductSchema.index({ sku: 1, user: 1 }, { unique: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);