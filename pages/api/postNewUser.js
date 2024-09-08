import dbConnect from '../../utils/dbConnect';
import User from '../../models/User';

dbConnect();

export default async (req, res) => {

    try {
        const user = await User.create(req.body);

        res.status(201).json({ success: true, data: user, message: 'New User Created' });

    } catch (error) {
        res.status(400).json({ success: false, error: error, message: 'Error Creating New User' });
    }
}