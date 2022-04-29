var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import createError from "http-errors";
import { hostAuthorization } from "../../middlewares/auth/hostAuthorization.js";
import { JWTAuthMiddleware } from "../../middlewares/auth/JWTMiddleware.js";
import AccommodationModel from "./model.js";
const accommodationRouter = express.Router();
accommodationRouter.post("/", JWTAuthMiddleware, hostAuthorization, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("📨 PING - POST REQUEST");
    try {
        const newAccommodation = new AccommodationModel(req.body);
        const { _id } = yield newAccommodation.save();
        res.status(201).send({ _id });
    }
    catch (error) {
        next(error);
    }
}));
accommodationRouter.get("/", JWTAuthMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("📨 PING - GET REQUEST");
    try {
        const accommodations = yield AccommodationModel.find({}).populate({
            path: "host",
        });
        res.send(accommodations);
    }
    catch (error) {
        next(error);
    }
}));
accommodationRouter.get("/:accommodationId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("📨 PING - GET REQUEST");
    try {
        const accommodation = yield AccommodationModel.findById(req.params.accommodationId);
        if (accommodation) {
            res.send(accommodation);
        }
        else {
            next(createError(404, `Accommodation with id ${req.params.accommodationId} not found!`));
        }
    }
    catch (error) {
        next(error);
    }
}));
accommodationRouter.put("/:accommodationId", JWTAuthMiddleware, hostAuthorization, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("📨 PING - PUT REQUEST");
    try {
        const updatedAccommodation = yield AccommodationModel.findByIdAndUpdate(req.params.accommodationId, req.body, { new: true, runValidators: true });
        if (updatedAccommodation) {
            res.send(updatedAccommodation);
        }
        else {
            next(createError(404, `Accommodation with id ${req.params.accommodationId} not found!`));
        }
    }
    catch (error) {
        next(error);
    }
}));
accommodationRouter.delete("/:accommodationId", JWTAuthMiddleware, hostAuthorization, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("📨 PING - DELETE REQUEST");
    try {
        const deletedAccommodation = yield AccommodationModel.findOneAndDelete({
            _id: req.params.accommodationId,
            host: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
        });
        if (deletedAccommodation) {
            res.status(204).send();
        }
        else {
            next(createError(404, `Accommodation with id ${req.params.accommodationId} not found!`));
        }
    }
    catch (error) {
        next(error);
    }
}));
export default accommodationRouter;
