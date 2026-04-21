import { asyncHandler } from "../utils/asyncHandler";

import { instance } from "../utils/razorpay.js";
import crypto from "crypto";

import responseHandler from "../utils/responseHandler.js";

import Payment from "../models/payment.model.js";
import { User } from "../models/user.model.js";

const createorder = asyncHandler(async (req, res) => {
  const type = req.body.type;
  const amount = type === "lifetime" ? 1000 : 99;

  const order = await instance.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_order_${new Date().getTime()}`,
    notes: {
      type: type,
    },
  });
  return res
    .status(200)
    .json(new responseHandler(200, "Order created successfully", order));
});

const verifypayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
  if (generated_signature !== razorpay_signature) {
    return res
      .status(400)
      .json(new responseHandler(400, "Payment verification failed"));
  }

  const order = await instance.orders.fetch(razorpay_order_id);
  const subscriptionType = order.notes.type;

  const amount = subscriptionType === "lifetime" ? 1000 : 99;

  const existingPayment = await Payment.findOne({ paymentId: razorpay_payment_id });
  if (existingPayment) {
    return res
      .status(400)
      .json(new responseHandler(400, "Payment already processed"));
  }
  const paymentDetails = await Payment.create({
    user: req.user._id,
    amount,
    paymentId: razorpay_payment_id,
    subscriptionType,
    status: "success",
    subscriptionstartdate: new Date(),
    subscriptionenddate:
      subscriptionType === "lifetime"
        ? null
        : new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });
  const user = await User.findByIdAndUpdate(req.user._id,{
    usertype : subscriptionType,
    waspremium : true,
    subscriptionExpiryDate :
    subscriptionType === "lifetime"
      ? null
      : new Date(new Date().setMonth(new Date().getMonth() + 1))},
    { new: true });
  return res
    .status(200)
    .json(new responseHandler(200, "Payment verified successfully"));
});
