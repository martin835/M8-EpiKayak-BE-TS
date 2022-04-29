import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("No JWT Secret provided");
}

export const generateAccessToken = (payload: { _id: any; role: any }) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: "1 week" },
      (err: any, token: unknown) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyAccessToken = (token: string) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET!, (err: any, payload: unknown) => {
      if (err) reject(err);
      else resolve(payload);
    })
  );

// usage with Promises generateAccessToken({}).then(token => console.log(token)).catch(err => console.log(err))

/* usage with Async/Await
  try {
    const token = await generateAccessToken({})
  } catch(err){
    console.log(err)
  }
  
  */
