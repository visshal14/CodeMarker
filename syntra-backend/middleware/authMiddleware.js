const jwt = require('jsonwebtoken');


const protect = (roles) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) {
            return res.sendStatus(401);
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            if (roles && !roles.includes(user.role)) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    }
};

module.exports = { protect };