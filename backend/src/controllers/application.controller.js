import Application from "../models/application.model.js";

export const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('volunteerId', '-password')
            .populate('opportunityId');

        res.status(200).json({
            count: applications.length,
            applications,
        });

    } catch (err) {
        console.log('Error in getAllApplications controller: ', err.message);
        res.status(500).json({ message: err.message }); 
    }
}

export const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id)
            .populate('volunteerId', '-password')
            .populate('opportunityId');

        if (!application) {
            return res.status(404).json({ 
                message: 'Application not found.' 
            });
        }

        return res.status(200).json({
            application
        });

    } catch (err) {
        console.log('Error in getApplicationById controller: ', err.message);
        res.status(500).json({ message: err.message }); 
    }
}

export const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({ 
                message: 'Application not found.' 
            });
        }

        await Application.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Application deleted successfully.' 
        });

    } catch (err) {
        console.log('Error in deleteApplication controller: ', err.message);
        res.status(500).json({ message: err.message }); 
    }
}