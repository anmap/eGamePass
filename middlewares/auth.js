const { User } = require('./../db/models/user');

const auth = async (req, res, next) => {
    let token = req.header('x-auth');

    try {
        let user = await User.findByToken(token);
        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send();
    }
};

module.exports = { auth };