import express from "express";
import createError from "http-errors";
import UsersModel from "./model.js";
import AccommodationModel from "../accomodation/model.js";
import { generateAccessToken } from "../../middlewares/auth/tools.js";
import { JWTAuthMiddleware } from "../../middlewares/auth/JWTMiddleware.js";

const usersRouter = express.Router();

// 0 - DEV EndPoint Only ⬇️⬇️⬇️

// usersRouter.post("/", async (req, res, next) => {
//   console.log("📨 PING - POST REQUEST");
//   try {
//     const newUser = new UsersModel(req.body);
//     const { _id } = await newUser.save();
//     res.status(201).send({ _id });
//   } catch (error) {
//     next(error);
//   }
// });

// 🚉 1 - Get All users and their accommodations -- endpoint for ADMINS ONLY

usersRouter.get("/", async (req, res, next) => {
  console.log("📨 PING - GET REQUEST");
  try {
    const users = await UsersModel.find({}).populate({
      path: "accommodations",
    });
    res.send(users);
  } catch (error) {
    next(error);
  }
});

// 🚉 2 - "Profile endpoint for authenticated users"

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  console.log("📨 PING - GET REQUEST");
  try {
    const user = await UsersModel.findById(req.user._id).populate({
      path: "accommodations",
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

//🚉 3 - "Registration endpoint for new users"

usersRouter.post("/register", async (req, res, next) => {
  try {
    // 1. Obtain registration data from req.body, save user and retrieve _id
    const newUser = new UsersModel(req.body);
    const { _id, role } = await newUser.save();

    // 2. Generate access token
    // KEYS _id and role are send as a payload to `generateAcccessToken function, that...
    //.. creates a JWT token out of it.
    //VALUES _id and role are retrieved from user in the DB
    const accessToken = await generateAccessToken({
      _id: _id,
      role: role,
    });
    // 3 Send access token and _id in the response
    res.status(201).send({ accessToken, _id, role });
  } catch (error) {
    next(error);
  }
});

//🚉 4 - "Login" endpoint for existing users - checking if email is in DB

usersRouter.post("/login", async (req, res, next) => {
  try {
    // 1. Obtain credentials from req.body
    const { email, password } = req.body;

    // 2. Verify credentials
    const user = await UsersModel.checkCredentials(email, password);

    if (user) {
      // 3. If credentials are ok we are going to generate an Access Token and send it as a response

      const accessToken = await generateAccessToken({
        _id: user._id,
        role: user.role,
      });

      res.send({ accessToken });
    } else {
      // 4. If credentials are not fine --> throw an error (401)
      next(createError(401, `Credentials are not ok!`));
    }
  } catch (error) {
    next(error);
  }
});

// usersRouter.get(
//   "/googleLogin",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// usersRouter.get(
//   "/googleRedirect",
//   passport.authenticate("google"),
//   async (req, res, next) => {
//     try {
//       console.log("Token: ", req.user.token);

//       if (req.user.role === "Admin") {
//         res.redirect(
//           `${process.env.FE_URL}/adminDashboard?accessToken=${req.user.token}`
//         );
//       } else {
//         res.redirect(
//           `${process.env.FE_URL}/profile?accessToken=${req.user.token}`
//         );
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// );

//🚉 5 - "See user" endpoint to see a user - only logged-in users can see other users

usersRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  console.log("📨 PING - GET REQUEST");
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

//🚉 6 - "Edit profile" - endpoint

usersRouter.put("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  console.log("📨 PING - PUT REQUEST");
  try {
    const updatedUser = await UsersModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

//🚉 7 - "Delete profile" - endpoint

usersRouter.delete("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  console.log("📨 PING - DELETE REQUEST");
  try {
    const deletedUser = await UsersModel.findByIdAndUpdate(req.params.userId);
    if (deletedUser) {
      res.status(204).send();
    } else {
      next(createError(404, `User with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

//🚉 8 - "Book accommodation" - endpoint

usersRouter.post(
  "/:userId/accommodations",
  JWTAuthMiddleware,
  async (req, res, next) => {
    console.log(`📨 PING - POST ACCOMMODATION FOR USER: ${req.params.userId} `);

    try {
      //retrieve accommodationId from the req body
      const { accommodationId } = req.body;

      //  0 Does user exist?
      const user = await UsersModel.findById(req.params.userId);
      if (!user) {
        return next(
          createError(404, `User with id ${req.params.userId} not found`)
        );
      }
      //  1 Does accommodation exist ?
      const accommodation = await AccommodationModel.findById(accommodationId);
      if (!accommodation) {
        return next(
          createError(
            404,
            `Accommodation with id ${req.params.accommodationId} not found`
          )
        );
      }

      //2 Is the accommodation already booked ?
      // !!! this is not working -- returning null
      const isAccommodationBooked = await UsersModel.findOne({
        _id: req.params.userId,
        accommodations: accommodation._id.toString(),
      });

      console.log(isAccommodationBooked);

      if (isAccommodationBooked) {
        // 3.1 If it's booked, remove it
        const modifiedAccommodations = await UsersModel.findByIdAndUpdate(
          { _id: req.params.userId },
          { $pull: { accommodations: accommodationId } },
          { new: true }
        );
        res.send(modifiedAccommodations);
      } else {
        //3.2 If it's not booked - add it to accommodations: []
        const modifiedAccommodations = await UsersModel.findByIdAndUpdate(
          { _id: req.params.userId }, // WHAT we want to modify
          { $push: { accommodations: { _id: accommodationId } } }, // HOW we want to modify the record
          {
            new: true, // OPTIONS
            upsert: true, // if the accommodation of this user is not found --> just create it automagically please
          }
        );
        res.send(modifiedAccommodations);
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
