import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { userRequest } from "../types/auth";
import { ApiResponse } from "../utils/api-response";
import { Request, Response } from "express";

const prisma = new PrismaClient();
class OrderController {
  // Fetch all orders for a user
  getOrders = asyncHandler(async (req: userRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json(new ApiResponse(400, "User ID is required", 'User ID is required'));
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            Product: true, // Assuming a relation exists in Prisma schema
          },
        },
        Payment: true,
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No orders found for the user"));
    }

    res.status(200).json(new ApiResponse(200, "Orders fetched successfully", orders));
  });

  // Create a new order
  createOrder = asyncHandler(async (req: userRequest, res: Response) => {
    const { items, paymentMethod, addressId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json(new ApiResponse(400, "User ID is required"));
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json(new ApiResponse(400, "Items are required and must not be empty"));
    }

    if (!paymentMethod || !addressId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Payment method and address ID are required"));
    }

    // Calculate total price (ensure productPrice is a number)
    const totalPrice = items.reduce((acc: number, item: any) => {
      if (!item.productId || !item.quantity || !item.productPrice) {
        throw new Error("Invalid item format");
      }
      // Ensure productPrice is converted to a number
      const price = parseFloat(item.productPrice);
      if (isNaN(price)) {
        throw new Error("Invalid price value");
      }
      return acc + price * item.quantity;
    }, 0);

    // Wrap in a transaction to ensure consistency
    const [payment, order] = await prisma.$transaction([ 
      prisma.payment.create({
        data: {
          method: paymentMethod,
          status: "PENDING",
          title: `Payment for Order`,
          authorId: userId,
          price: totalPrice, // pass the calculated float value
        },
      }),
      prisma.order.create({
        data: {
          userId,
          paymentId: undefined, // Placeholder until payment is created
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: parseFloat(item.productPrice), // convert to number
            })),
          },
          status: "PENDING",
        },
      }),
    ]);

    res.status(201).json(
      new ApiResponse(201, "Order created successfully", {
        order,
        payment,
        totalPrice,
      })
    );
});


  // Update Order Status
  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Order ID and status are required"));
    }

    // Ensure the status is valid
    const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "CANCELED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(new ApiResponse(400, "Invalid status value"));
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.status(200).json(
      new ApiResponse(200, "Order status updated successfully", updatedOrder)
    );
  });
}

export const orderController = new OrderController();
