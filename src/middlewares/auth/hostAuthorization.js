import createError from "http-errors";

export const hostAuthorization = (req, res, next) => {
  if (req.user.role === "host") {
    next();
  } else {
    next(createError(403, "Hosts Only Endpoint!"));
  }
};
