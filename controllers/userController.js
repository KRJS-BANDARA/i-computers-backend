
import User from "../models/user.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()
export async function createUser(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            res.status(400).json({ message: "User already exists" })
            return
        }

        const passwordHash = await bcrypt.hash(req.body.password, 10)
        console.log(passwordHash)
        //const newUser = new User(req.body)
        const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: passwordHash
        })
        await newUser.save()
        res.status(201).json({ message: "User created successfully" })

    }catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export async function loginUser(req, res) {
    try {
        const email = req.body.email
        const password = req.body.password
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" })
            return
        }
        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(404).json({ message: "User not found" })
            return
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (isPasswordValid) {
            const token = jwt.sign(
                {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    isBlocked: user.isBlocked,
                    isEmailVerified: user.isEmailVerified,
                    image: user.image
                },
                process.env.JWT_SECRET_KEY
            )
            res.status(200).json({ message: "User authenticated successfully", token: token })
            console.log(token)
        }else {
            res.status(401).json({ message: "Invalid password" })
        }
            
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}