import { User } from "../models/user.model.js";

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userToDelete = await User.findById(id);

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found.'});
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            message: 'User deleted successfully.' 
        });

    } catch (err) {
        console.log('Error in deleteUser controller: ', err.message);
        res.status(500).json({ message: err.message }); 
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            count: users.length,
            users, 
        });

    } catch (err) {
        console.log('Error in getAllUsers controller: ', err.message);                                                        
        res.status(500).json({ message: err.message });
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });

    } catch (err) {
        console.log('Error in getUserById controller: ', err.message);                                                        
        res.status(500).json({ message: err.message });
    }
}

export const approveUserAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.approvalStatus === 'approved') {
            return res.status(400).json({
                message: 'User account is already approved.'
            });
        }

        user.approvalStatus = 'approved';
        await user.save();

        res.status(200).json({
            message: 'User account approved successfully.',
            user,
        });

    } catch(err) {
        console.log("Error in approveUserAccount controller: ", err.message);                                                        
        res.status(500).json({ message: err.message });
    }
}