import express from "express";
import { createProduct, getAllProducts, deleteProduct, updateProduct, getProductById, searchProducts } from "../controllers/productController.js";

const productRouter = express.Router()

productRouter.post("/", createProduct)

productRouter.get("/", getAllProducts)

productRouter.get("/search", (req, res) => {
    res.status(200).json({ message: "Search endpoint" })
})

productRouter.get("/search/:query", searchProducts)

productRouter.get("/:productId", getProductById)

productRouter.delete("/:productId", deleteProduct)

productRouter.put("/:productId", updateProduct)

export default productRouter
