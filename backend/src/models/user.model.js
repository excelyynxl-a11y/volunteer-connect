import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,

        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['volunteer', 'organisation', 'admin'],
            required: true,
        },
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        ageGroup: {
            type: String,
            enum: ['21-30', '31-40', '41-50', '51-60', '60+']
        },
        resume: {
            type: String,
        },
        biodata: {
            type: String,
        },
        avatar: {
            type: String,
            default: '',
        }
    },
    {
        timestamps: true 
    }
);

const User = mongoose.model('User', userSchema);

export default User;