const jwt = require("jsonwebtoken");

module.exports = (...roles) => {
    return (req, res, next) => {
        const authHeader =req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (roles.includes(decoded.role)) {
                    req.userData = decoded;
                    next();
                } else {
                    return res.status(403).json({
                        message: "Нет доступа"
                    });
                }
            } catch (e) {
                return res.status(401).json({
                    message: "Вы не авторизованы"
                });
            }
        } else {
            return res.status(401).json({
                message: "Вы не авторизованы"
            });
        }
    };
};