import crypto from 'crypto'
import redis from "../db/redis.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import responseHandler from '../utils/responseHandler.js';
const createotpandmail=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    const otp=crypto.randomInt(100000,99999);
    await redis.set(`otp:${email}`,otp,'NX','EX',400);
    //nodemailer
    return res.status(200).json(responseHandler(true,"OTP sent to email",null))
})

export {createotpandmail}