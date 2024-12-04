import { PrismaClient } from "@prisma/client";
import { uploadOnCloudinary } from "../helper/cloudinary";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { ProductType } from "../types/product";
import { prouduct } from "./prouduct-item";

const prisma = new PrismaClient();

class ProductController {
      // Get Products
  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await prisma.product.findMany();
    return res
      .status(200)
      .json(new ApiResponse(200, "Products fetched successfully", products));
  });

  // Upload Product
  uploadProduct = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, price, stock, rating }: ProductType = req.body;

    if ([name, description, price, stock, rating].some((item) => !item)) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const productImage = files?.["image"]?.[0];

    if (!productImage) {
      return res.status(400).json(new ApiError(400, "Please provide an image"));
    }

    const uploadPath = await uploadOnCloudinary(productImage.path);

    if (!uploadPath) {
      return res.status(500).json(new ApiError(500, "Failed to upload image"));
    }

    const product = await prisma.product.create({
      data: {
        title: name,
        description,
        image: uploadPath.url,
        price,
        stock,
        rating,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Product uploaded successfully", product));
  });


  // Update Product
  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Product ID from route
    const { name, description, price, stock, rating }: ProductType = req.body;

    if (!id) {
      return res.status(403).json(new ApiError(403, "Product ID is required"));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const productImage = files?.["image"]?.[0];

    let imageUrl;
    if (productImage) {
      const uploadPath = await uploadOnCloudinary(productImage.path);
      if (!uploadPath) {
        return res
          .status(500)
          .json(new ApiError(500, "Failed to upload image"));
      }
      imageUrl = uploadPath.url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: name,
        description,
        image: imageUrl,
        price,
        stock,
        rating,
      },
    });

    if (!updatedProduct) {
      return res.status(500).json(new ApiError(500, "Failed to update product"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Product updated successfully", updatedProduct)
      );
  });

  // Delete Product
  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Product ID from route

    if (!id) {
      return res.status(403).json(new ApiError(403, "Product ID is required"));
    }

    const deletedProduct = await prisma.product.delete({
      where: { id },
    });

    if (!deletedProduct) {
      return res
        .status(500)
        .json(new ApiError(500, "Failed to delete product"));
    }

    return res
      .status(204)
      .json(new ApiResponse(204, "Product deleted successfully"));
  });
}

export const  productController = new ProductController();

