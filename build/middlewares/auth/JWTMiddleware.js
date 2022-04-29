var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import createError from "http-errors";
import { verifyAccessToken } from "./tools.js";
export const JWTAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Check if Authorization header is in the request, if it is not --> 401
    if (!req.headers.authorization) {
        next(createError(401, "Please provide bearer token in authorization header"));
    }
    else {
        try {
            // 2. Extract the token from Authorization header
            const token = req.headers.authorization.replace("Bearer ", "");
            // 3. Verify the token (check if it is not expired and check signature integrity), if everything is fine we should get back the payload ({_id, role})
            const payload = yield verifyAccessToken(token);
            // 4. If token is valid --> next()
            req.user = {
                _id: payload._id,
                role: payload.role,
            };
            next();
        }
        catch (error) {
            // 5. In case of errors thrown by the jsonwebtoken module --> 401
            next(createError(401, "Token is not valid!"));
        }
    }
});
