import express from "express"
import { AddProfilePhoto, UpdateEmail, UpdatePassword, UpdateUsername } from "../Controllers/Profile.Controller.js"
import { upload } from "../Middlewares/Multer.js"
import { Authenticated } from "../Middlewares/auth.Middleware.js"

const router = express.Router()

router.post("/add-photo", Authenticated, upload.single("photo"), async (req, res, next) => {
    try {
        await AddProfilePhoto(req, res)
    } catch (error) {
        next(error)
    }
})
router.post("/update-name", Authenticated, UpdateUsername)
router.post("/update-email", Authenticated, UpdateEmail)
router.post("/update-password", Authenticated, UpdatePassword)


export default router