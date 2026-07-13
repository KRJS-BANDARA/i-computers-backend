import express from 'express'
import mongoose from 'mongoose'
//import Student from './models/student.js'
import studentRouter from './routers/studentRouter.js'
import userRouter from './routers/userRouter.js'
import jwt from "jsonwebtoken"
import e from 'express'
import authenticate from './controllers/middleWares/authenticate.js'
import productRouter from './routers/productRouter.js'
import dotenv from 'dotenv'
import cors from 'cors'
import orderRouter from './routers/orderRouter.js'

const app = express()

dotenv.config()

const mongoDBURI = process.env.MONGO_URI

mongoose.connect(mongoDBURI).then(
    ()=>{
        console.log('Connected to MongoDB successfully!')
        }
    ).catch(
        (error)=>{
            console.log('Error connecting to MongoDB: ', error)
        }
    )
app.use(cors());     

app.use(express.json())

app.use(authenticate)

app.use("/students", studentRouter)

app.use("/api/users", userRouter)

app.use("/api/products", productRouter)

app.use("/api/orders", orderRouter)

let port = 3000

// app.get(
//     "/", 
//     (req, res)=>{
//         console.log(req)
//         console.log('Get request received!') 
//         Student.find().then(
//             (student)=>{
//                 res.json(student)
//             }
//         )
//     })

// app.post(
//     "/", 
//     (req, res)=>{
    
//         const message = "Hi "+req.body.Designation + " "+req.body.Name
//         res.send(message)
//         const newStudent = new Student(req.body)

//         newStudent.save().then(
//             ()=>{
//                 res.json({
//                     message: "Student saved successfully!"
//                 })  
//             }
//         )  
//     })
   
// app.put(
//     "/", 
//     ()=>{
//         console.log('Put request received!') 
//     })

// app.delete(
//     "/", 
//     ()=>{
//         console.log('Delete request received!') 
//     })    

app.listen(
    port, 
    ()=>{
     console.log('Server stated successfully!')
     console.log('Listening on port 3000')
    }
)
