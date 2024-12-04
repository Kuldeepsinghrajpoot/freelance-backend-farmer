import { Request, Response } from "express";
import { PaymentService } from "../helper/payment";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";


class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Create Razorpay order
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const { amount, currency, userId } = req.body;

    if (!amount || !userId) {
      throw new ApiError(400, "Amount and User ID are required");
    }

    const receipt = `receipt_${new Date().getTime()}`;
    const paymentOrder = await this.paymentService.createPaymentOrder({
      amount,
      currency: currency || "INR",
      receipt,
      userId,
    });

    res.status(201).json(new ApiResponse(201, "Payment order created successfully", paymentOrder));
  });
}

export const paymentController = new PaymentController();
