import jwt from "jsonwebtoken"

export default function authenticate(req, res, next) {
        const header =req.header("authorization")
        if (!header) {
        next()
        }else {
            const token = header.replace("Bearer ", "")
            jwt.verify(token, "secretKey1974", 
                (err, decoded)=>{
                    if (!decoded) {
                        res.status(401).json({ message: "Invalid token. Please login again." })
                    } else {
                        req.user = decoded
                        next()
                    }
                })
        }
    }