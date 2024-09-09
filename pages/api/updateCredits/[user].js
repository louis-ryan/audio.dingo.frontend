import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';

dbConnect();

export default async (req, res) => {

    const { query: { user } } = req;

    try {
        const account = await User.findOne({ user: user })
        const updatedAccount = await User.findByIdAndUpdate(account._id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedAccount) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: updatedAccount });
    } catch (error) {
        res.status(400).json({ success: false });
    }
}