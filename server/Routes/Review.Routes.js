import express from "express"
import { AddReview, GetAllReviews } from "../Controllers/Review.Controller.js"
import { Authenticated } from "../Middlewares/auth.Middleware.js"

const router = express.Router()

router.post("/addreview", Authenticated, AddReview)
router.get("/allreviews", GetAllReviews)

export default router