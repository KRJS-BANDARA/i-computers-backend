import Product from "../models/product.js"
export async function createProduct(req, res) {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    if (!req.user.isAdmin) {
        res.status(403).json({ message: "Only admins can create products" })
        return
    }
    try {
        const existingProduct = await Product.findOne({ productId: req.body.productId })
        if (existingProduct) {
            res.status(400).json({ message: "Product with this ID already exists" })
            return
        }
        const newProduct = new Product(req.body)
        console.log(newProduct)
        await newProduct.save()
        res.status(201).json({ message: "Product created successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export async function getAllProducts(req, res) {
    console.log("Products are fetching...")
    try {
        if (req.user && req.user.isAdmin) {

            const products = await Product.find()
            res.status(200).json(products)
        } else {
            const products = await Product.find({ isAvailable: true })
            res.status(200).json(products)
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export async function deleteProduct(req, res) {
    if (req.user && req.user.isAdmin) {
        try {
            const procuct = await Product.findOne({ productId: req.params.productId })
            if (!procuct) {
                res.status(404).json({ message: "Product not found" })
                return
            }
            await Product.deleteOne({ productId: req.params.productId })
            res.status(200).json({ message: "Product deleted successfully" })

        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    } else {
        res.status(403).json({ message: "Only admins can delete products" })
        return
    }
}

export async function updateProduct(req, res) {
    if (req.user && req.user.isAdmin) {
        console.log("Incoming Body:", req.body);
        try {
            if (req.body.productId) {
                res.status(404).json({ message: "ProductId cannot be updated" })
                return
            }

            await Product.updateOne({ productId: req.params.productId }, req.body)
            res.status(200).json({ message: "Product updated successfully" })

        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    } else {
        res.status(403).json({ message: "Only admins can update products" })
        return
    }
}

export async function getProductById(req, res) {
    try {
        const product = await Product.findOne({ productId: req.params.productId })
        if (!product) {
            res.status(404).json({ message: "Product not found" })
            return
        }
        if (product.isAvailable) {
            res.status(200).json(product)
        } else {
            if (req.user && req.user.isAdmin) {
                res.status(200).json(product)
            } else {
                res.status(403).json({ message: "Only admins can view unavailable products" })
                return
            }
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export async function searchProducts(req, res) {
        try {
           const query = req.params.query
           const products = await Product.find(
            {   $or: [
                    {name: { $regex: query, $options: "i" }},
                    {description: { $regex: query, $options: "i" }},
                    {altNames: { $elemMatch: { $regex: query, $options: "i" }}}
            ],
                isAvailable: true
        }
            
        )
        res.status(200).json(products)
    

        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
