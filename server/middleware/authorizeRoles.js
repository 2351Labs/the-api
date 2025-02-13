const authorizeRoles = (allowedRoles) => (req, res, next) => {
    if (!req.user || !req.user.roles || !Array.isArray(req.user.roles)) {
        return res.status(403).json({ message: "Access Forbidden. No roles assigned." });
    }

    // Check if user has at least one of the required roles
    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
        return res.status(403).json({ message: "Access Forbidden. Insufficient privileges." });
    }
    next();
};


// const roleAuthetication = (req, res, next) => {
//   // user object attached to request during JWT authetication
//   console.log("USER ROLE", req.user)
//   if (!req.user || !allowedRoles.includes(req.user.role)) {
//     return res
//       .status(403)
//       .json({ message: "Access Forbidden. Insufficient privileges." });
//   }
//   next();
// };

module.exports = authorizeRoles;
