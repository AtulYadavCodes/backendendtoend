import redis from "../db/redis.js";
import errorhandler from "../utils/errorhandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const verifyotp = asyncHandler(async (req, res, next) => {
  if (req.body.otp == (await redis.get(`otp${req.body.email}`))) {
    await redis.del(`otp${req.body.email}`);
    next();
  } else {
    console.log(req.body.otp + " " + (await redis.get(`otp${req.body.email}`)));
    throw new errorhandler(500, "OTP verification failed or OTP expired");
  }
});

export { verifyotp };
