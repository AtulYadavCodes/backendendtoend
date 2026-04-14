import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()
router.route('/createorder').post(verifyJWT,);
router.route('/verifypayment').post(verifyJWT,);
export default router