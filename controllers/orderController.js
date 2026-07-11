import Order from "../models/Order.js"
import Product from "../models/product.js"

export async function createOrder(req, res) {
    
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

        const orderData = {
            orderId: "ORD000001",
            firstName: req.body.firstName || req.user.firstName,
            lastName: req.body.lastName || req.user.lastName,
            email: req.body.email,
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            city: req.body.city,
            phone: req.body.phone,
            items: [],
            totalAmount: 0
        }
    
        const lastOrder = await Order.findOne().sort({ date: -1 })
        if (lastOrder) {
            const lastOrderId = lastOrder.orderId
            const lastOrderNumberInString= lastOrderId.replace("ORD", "")
            const lastOrderNumber = parseInt(lastOrderNumberInString)
            const newOrderNumber = lastOrderNumber + 1
            orderData.orderId = "ORD" + newOrderNumber.toString().padStart(6, "0")
        }
        for(let i=0; i<req.body.items.length; i++) {
            const product = await Product.findOne({ productId: req.body.items[i].productId })
            if (!product) {
                res.status(400).json({ message: `Product with ID ${req.body.items[i].productId} not found` })
                return
            }
            if (!product.isAvailable) {
                res.status(400).json({ message: `Product with ID ${req.body.items[i].productId} is not available` })
                return
            }
            if (product.stock < req.body.items[i].quantity) {
                res.status(400).json({ message: `Not enough stock for product with ID ${req.body.items[i].productId}` })
                return
            }

            orderData.items.push({
                product: {
                    productId: product.productId,
                    name: product.name,
                    image: product.images[0],
                    price: product.price,
                    labeledPrice: product.labeledPrice
                },
                quantity: req.body.items[i].quantity
            })
            orderData.totalAmount += product.price * req.body.items[i].quantity
        }

        const newOrder = new Order(orderData)
        await newOrder.save()
        
        for(let i=0; i<req.body.items.length; i++) {
            await Product.updateOne(
                { productId: req.body.items[i].productId },
                { $inc: { stock: -req.body.items[i].quantity }}
            )
        }
        res.status(201).json({ message: "Order created successfully", orderId: newOrder.orderId })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
} 

export async function getAllOrders(req, res) {
     
    if (!req.user) {
            res.status(401).json({ message: "Unauthorized" })
            return
        }

    try {
    if (req.user.isAdmin) {

        const pageSizeInString = req.params.pageSize || "10"
        const pageNumberInString = req.params.pageNumber || "1"
        const pageSize = parseInt(pageSizeInString)
        const pageNumber = parseInt(pageNumberInString)
        const orderCount = await Order.countDocuments()
        const totalPages = Math.ceil(orderCount / pageSize)

        const orders = await Order.find().sort({ date: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize)
        res.json({
            orders: orders,
            totalPages: totalPages,
            currentPage: pageNumber,
            totalOrders: orderCount 
        })
        return
    }else {
        const pageSizeInString = req.params.pageSize || "10"
        const pageNumberInString = req.params.pageNumber || "1"
        const pageSize = parseInt(pageSizeInString)
        const pageNumber = parseInt(pageNumberInString)
        const orderCount = await Order.countDocuments({ email: req.user.email })
        const totalPages = Math.ceil(orderCount / pageSize)

        const orders = await Order.find({ email: req.user.email }).sort({ date: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize)
        res.json({
            orders: orders,
            totalPages: totalPages,
            currentPage: pageNumber,
            totalOrders: orderCount 
        })
        return
    }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export async function updateOrderStatus(req, res) {
    if (!req.user || !req.user.isAdmin) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })
        if (!order) {
            res.status(404).json({ message: "Order not found" })
            return
        }
        
        await Order.updateOne({ orderId: req.params.orderId }, { status: req.body.status })
        res.status(200).json({ message: "Order status updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
