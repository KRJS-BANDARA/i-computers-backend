import express from 'express'
import mongoose from 'mongoose'
//import Student from './models/student.js'
import studentRouter from './routers/studentRouter.js'
import userRouter from './routers/userRouter.js'
import jwt from "jsonwebtoken"
import e from 'express'
import authenticate from './controllers/middleWares/authenticate.js'
import productRouter from './routers/product router.js'


const app = express()

const mongoDBURI = "mongodb+srv://admin:Jayantha19740915@cluster0.o1ywdc4.mongodb.net/?appName=Cluster0"

mongoose.connect(mongoDBURI).then(
    ()=>{
        console.log('Connected to MongoDB successfully!')
        }
    )

app.use(express.json())

app.use(authenticate)

app.use("/students", studentRouter)

app.use("/users", userRouter)

app.use("/products", productRouter)

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
