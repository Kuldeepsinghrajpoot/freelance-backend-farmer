import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";


const prisma = new PrismaClient();

class CartController {
  // Get all cart items for a user
  getCartByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        Product: true, // Fetch associated product details
      },
    });

    res.status(200).json(new ApiResponse(200, "Cart items fetched successfully", cartItems));
  });

  // Add an item to the cart
  addToCart = asyncHandler(async (req: Request, res: Response) => {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0) {
      throw new ApiError(400, "Missing required fields or invalid quantity");
    }

    const existingCartItem = await prisma.cart.findFirst({
      where: { userId, productId },
    });

    let cartItem;

    if (existingCartItem) {
      cartItem = await prisma.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cart.create({
        data: { userId, productId, quantity },
      });
    }

    res.status(201).json(new ApiResponse(201, "Item added to cart successfully", cartItem));
  });
}

export const cartController = new CartController();
