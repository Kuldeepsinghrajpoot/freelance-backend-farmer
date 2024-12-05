import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { userRequest } from "../types/auth";

const prisma = new PrismaClient();
class CartController {
  // Get all cart items for a user
  getCartByUserId = asyncHandler(async (req: userRequest, res: Response) => {
    const userId = req?.user?.id;
    if (!userId) {
      throw new ApiError(400, "User ID is required", "User ID is required");
    }
  
    // Fetch cart items with associated product details
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        Product: true, // Fetch associated product details
      },
    });
  
    // Transform cart items into a single array
    const formattedCart = cartItems.map((item) => ({
      id: item.id,
      productId: item.Product?.id,
      productName: item.Product?.title,
      productDescription: item.Product?.description,
      productPrice: item.Product?.price,
      productImage: item.Product?.image,
      quantity: item.quantity, // Assuming cart has a quantity field
      userId: item.userId,
    }));
  
    res
      .status(200)
      .json(new ApiResponse(200, "Cart items fetched successfully", formattedCart));
  });
  

  // Add an item to the cart
  addToCart = asyncHandler(async (req: userRequest, res: Response) => {
    const userId = req?.user?.id;
    const productId = req.params.id;
    if (!userId) throw new ApiError(400, "User ID is required", "User ID is required");
    const {  quantity } = req.body;


    if (!userId || !productId || quantity <= 0) {
      throw new ApiError(400, "Missing required fields or invalid quantity", "Missing required fields or invalid quantity");
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
