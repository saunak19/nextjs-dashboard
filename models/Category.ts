import mongoose, { Schema, model, models } from "mongoose";

export interface ICategory extends mongoose.Document {
    name: string;
    user: mongoose.Schema.Types.ObjectId;
    parent?: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: [true, 'Please provide a category name.'],
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
}, {
    timestamps: true,
});

CategorySchema.index({ name: 1, user: 1, parent: 1 }, { unique: true });

export default models.Category || model<ICategory>('Category', CategorySchema);