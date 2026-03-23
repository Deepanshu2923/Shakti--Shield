import express from "express";
import { 
  Authentication, 
  GetUserInfo, 
  GoogleAuthController, 
  Login, 
  Logout, 
  Signup 
} from "../Controllers/User.Controller.js";
import { Authenticated } from "../Middlewares/auth.Middleware.js";

const router = express.Router();

// @route   POST /api/user/signup
// @desc    Register a new user
router.post("/signup", Signup);

// @route   POST /api/user/login
// @desc    Login with email and password
router.post("/login", Login);

// @route   POST /api/user/googleLogin
// @desc    Login or register using Google OAuth
router.post("/googleLogin", GoogleAuthController);

// @route   POST /api/user/logout
// @desc    Logout the user
router.post("/logout", Logout);

// @route   GET /api/user/auth-check
// @desc    Check if user is authenticated
router.get("/auth-check", Authentication);

// @route   GET /api/user/get-data
// @desc    Get logged-in user's profile info
router.get("/get-data", Authenticated, GetUserInfo);

export default router;
