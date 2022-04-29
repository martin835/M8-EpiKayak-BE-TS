import createError from "http-errors";
export const hostAuthorization = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "host") {
        next();
    }
    else {
        next(createError(403, "Hosts Only Endpoint!"));
    }
};
