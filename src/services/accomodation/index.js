import express from "express";
import createError from "http-errors";
import { hostAuthorization } from "../../middlewares/auth/hostAuthorization.js";
import { JWTAuthMiddleware } from "../../middlewares/auth/JWTMiddleware.js";
import AccommodationModel from "./model.js";

const accommodationRouter = express.Router();

accommodationRouter.post(
  "/",
  JWTAuthMiddleware,
  hostAuthorization,
  async (req, res, next) => {
    console.log("📨 PING - POST REQUEST");
    try {
      const newAccommodation = new AccommodationModel(req.body);
      const { _id } = await newAccommodation.save();
      res.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

accommodationRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  console.log("📨 PING - GET REQUEST");
  try {
    const accommodations = await AccommodationModel.find({}).populate({
      path: "host",
    });
    res.send(accommodations);
  } catch (error) {
    next(error);
  }
});

accommodationRouter.get("/:accommodationId", async (req, res, next) => {
  console.log("📨 PING - GET REQUEST");
  try {
    const accommodation = await AccommodationModel.findById(
      req.params.accommodationId
    );
    if (accommodation) {
      res.send(accommodation);
    } else {
      next(
        createError(
          404,
          `Accommodation with id ${req.params.accommodationId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

accommodationRouter.put(
  "/:accommodationId",
  JWTAuthMiddleware,
  hostAuthorization,
  async (req, res, next) => {
    console.log("📨 PING - PUT REQUEST");
    try {
      const updatedAccommodation = await AccommodationModel.findByIdAndUpdate(
        req.params.accommodationId,
        req.body,
        { new: true, runValidators: true }
      );
      if (updatedAccommodation) {
        res.send(updatedAccommodation);
      } else {
        next(
          createError(
            404,
            `Accommodation with id ${req.params.accommodationId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

accommodationRouter.delete(
  "/:accommodationId",
  JWTAuthMiddleware,
  hostAuthorization,
  async (req, res, next) => {
    console.log("📨 PING - DELETE REQUEST");
    try {
      const deletedAccommodation = await AccommodationModel.findOneAndDelete({
        _id: req.params.accommodationId,
        host: req.user._id,
      });
      if (deletedAccommodation) {
        res.status(204).send();
      } else {
        next(
          createError(
            404,
            `Accommodation with id ${req.params.accommodationId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default accommodationRouter;
