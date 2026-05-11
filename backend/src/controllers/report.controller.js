import Report from "../models/report.model.js";

export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('submittedBy', '-password')
            .populate('reportedUserId', '-password')
            .populate('reportedOpportunity');

        res.status(200).json({
            count: reports.length,
            reports,
        })

    } catch (err) {
        console.log('Error in getAllReports controller: ',err.message);
        res.status(500).json({ message: err.message });
    }
}

export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id)
            .populate('submittedBy', '-password')
            .populate('reportedUserId', '-password')
            .populate('reportedOpportunity');

        if (!report) {
            return res.status(404).json({
                message: 'Report not found.' 
            });
        }

        res.status(200).json({
            report 
        });

    } catch (err) {
        console.log('Error in getReportById controller: ',err.message);
        res.status(500).json({ message: err.message });
    }
}

export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params; 

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({
                message: 'Report not found.' 
            });
        }

        await Report.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Report deleted succesfully.'
        });

    } catch (err) {
        console.log('Error in deleteReport controller: ',err.message);
        res.status(500).json({ message: err.message });
    }
}

export const updateReportStatus = async (req, res) => {
    try {
        // TODO
    } catch (err) {
        console.log('Error in updateReportStatus controller: ',err.message);
        res.status(500).json({ message: err.message });
    }
}

export const createReport = (req, res) => {
    try {
        // TODO
    } catch (err) {
        console.log('Error in createReport controller: ',err.message);
        res.status(500).json({ message: err.message });
    }
}