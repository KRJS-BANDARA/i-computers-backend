import express from 'express';
import { createUser } from '../controllers/userController.js';
import { loginUser } from '../controllers/userController.js';
import { getUserInfo } from '../controllers/userController.js';
import { updateProfile } from '../controllers/userController.js';
import { updatePassword } from '../controllers/userController.js';
import { googleLogin } from '../controllers/userController.js';
import { sendOTP } from '../controllers/userController.js';
import { verifyOTP } from '../controllers/userController.js';
import { getAllUsers } from '../controllers/userController.js';
import { updateUserState } from '../controllers/userController.js';
import { switchRole } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.get("/me", getUserInfo)
userRouter.put("/", updateProfile)
userRouter.post("/password", updatePassword)
userRouter.post("/google-login", googleLogin)
userRouter.post("/otp", sendOTP)
userRouter.post("/verify-otp", verifyOTP)
userRouter.get("/all/:pageNumber/:pageSize", getAllUsers)
userRouter.put("/role/:email", switchRole)
userRouter.put("/state/:email", updateUserState)

export default userRouter;