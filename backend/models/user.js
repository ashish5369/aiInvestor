//hwo a user looks like what will be the user scheme in the database
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    portfolio: [{
        entity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'investmentEntities', // Reference to the investment entity
            required: true
        },
        quantity: {
            type: Number, // Quantity of the investment entity purchased
            required: true
        },
        investmentDate: {
            type: Date, // Date when the investment was made
            default: Date.now
        }
    }], 
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// here we are encrypiting the user password before saving it to the database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// we'll basically use it to get back the real password at the time of login 

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);