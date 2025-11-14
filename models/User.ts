import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
    name: string; // You added this earlier
    email: string;
    password: string;
    role: 'user' | 'admin' | 'superadmin';
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true }, // From previous step
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // <-- ADD THIS FIELD
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = models?.User || model<IUser>("User", userSchema);

export default User;