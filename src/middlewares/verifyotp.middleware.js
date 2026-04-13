import redis from "../db/redis";
import errorhandler from "../utils/errorhandler.js";
import { asyncHandler } from "../utils/asyncHandler";
const verifyotp=asyncHandler(async(req,res,next)=>{
    if ((req.body.otp) && (req.otp === await redis.get(`otp${req.body.email}`))) {
        await redis.del(`otp${req.body.email}`);
        next();
    } else {
        await redis.incr(`otp:${req.body.email}`,'EX',60);
        throw new errorhandler(400, "OTP verification failed or OTP expired");
    }
   
})

export {verifyotp}