import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';

dbConnect();

export default async (req, res) => {

    const { query: { user } } = req;

    try {
        const account = await User.findOne({ user: user })

        if (account === null) {
            res.status(200).json({ success: true, data: account, message: 'User Does Not Exist' });
        } else {
            res.status(200).json({ success: true, data: account, message: 'Found User' });
        }

    } catch (error) {
        res.status(400).json({ success: false, error: error, message: 'Error Finding User' });
    }
}