import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String },
    surname: { type: String },
    email: { type: String, required: true },
    password: { type: String },
    role: { type: String, enum: ["host", "guest"], default: "guest" },
    googleId: { type: String },
    accommodations: [{ type: Schema.Types.ObjectId, ref: "Accommodation" }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  // BEFORE saving the user in db, hash the password
  // I haven't used ARROW FUNCTION here because of "this"

  const newUser = this; // "this" here represents the current user I'm trying to save in db
  const plainPW = newUser.password;

  if (newUser.isModified("password")) {
    // only if the user is modifying his password I will use some CPU cycles to hash that, otherwise it's just a waste of time
    const hash = await bcrypt.hash(plainPW, 11);
    newUser.password = hash;
  }

  next();
});

UserSchema.methods.toJSON = function () {
  // EVERY TIME Express does a res.send of users documents, this toJSON function is called

  //This prevents passwords from being send in the response

  const userDocument = this;
  const userObject = userDocument.toObject();

  delete userObject.password; //this line deletes the password from the object

  return userObject;
};

UserSchema.statics.checkCredentials = async function (email, plainPassword) {
  // Given email and plain password this method should check if email exists in database, then compare plain password with the hashed one
  // 1. Find the user by email

  const user = await this.findOne({ email }); // "this" here refers to the UserModel

  if (user) {
    // 2. If user is found --> compare plainPW with the hashed one
    const isMatch = await bcrypt.compare(plainPassword, user.password);

    if (isMatch) {
      // 3. If they do match --> return a proper response (user himself)
      return user;
    } else {
      // 4. If they don't --> return null
      return null;
    }
  } else {
    // 5. If email is not found --> return null
    return null;
  }
};

//usage --> await UserModel.checkCredentials("john@rambo.com", "1234")

export default model("User", UserSchema);
