import { Admin, Organisation, User, Volunteer } from "../models/user.model.js";

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

export const getAllVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().select('-password');

        res.status(200).json({
            count: volunteers.length,
            volunteers
        });

    } catch (err) {
        console.log('Error in getAllVolunteers controller: ', err.message);
        res.status(500).json({ message: err.message }); 
    }
}

export const getAllOrganisations = async (req, res) => {
    try {
        const organisations = await Organisation.find().select('-password');

        res.status(200).json({
            count: organisations.length,
            organisations
        });

    } catch (err) {
        console.log('Error in getAllOrganisations controller: ', err.message);
        res.status(500).json({ message: err.message }); 
    }
}

export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');

        res.status(200).json({
            count: admins.length,
            admins
        });

    } catch (err) {
        console.log('Error in getAllAdmins controller: ', err.message);
        res.status(500).json({ message: err.message }); 
    }
}