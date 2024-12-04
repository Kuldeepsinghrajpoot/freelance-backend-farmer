import Razorpay from "razorpay";
import { ApiError } from "../utils/api-error";

interface PaymentRequest {
    amount: number; // Amount in INR (convert to paise for Razorpay)
    currency: string; // Default: INR
    receipt: string; // Unique receipt ID
    userId: string; // For tracking user
}

export class PaymentService {
    private razorpay: Razorpay;

    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID as string,
            key_secret: process.env.RAZORPAY_KEY_SECRET as string,
        });
    }

    // Create Razorpay order
    async createPaymentOrder(paymentRequest: PaymentRequest) {
        const { amount, currency = "INR", receipt, userId } = paymentRequest;

        if (!amount || !receipt || !userId) {
            throw new ApiError(400, "Missing required fields: amount, receipt, or userId");
        }

        try {
            const options = {
                amount: amount * 100, // Convert INR to paise
                currency,
                receipt,
                payment_capture: 1, // Auto-capture payment
            };

            const order = await this.razorpay.orders.create(options);

            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                status: order.status,
            };
        } catch (error) {
            throw new ApiError(500, "Failed to create Razorpay order");
        }
    }
}
