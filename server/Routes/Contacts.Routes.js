import express from "express";
import { AddContact, DeleteContact, SendEmergencyInfo } from "../Controllers/Contacts.Controller.js";
import { upload } from "../Middlewares/Multer.js";
import { Authenticated } from "../Middlewares/auth.Middleware.js";

const router = express.Router();

// Route: Add a new contact
// Expects: photo (optional file), name, MobileNo in body
// Uses multer to handle file upload
router.post("/addcontact", Authenticated, upload.single("photo"), async (req, res, next) => {
  try {
    await AddContact(req, res);
  } catch (error) {
    // Pass error to the Express error handler
    next(error); 
  }
});

// Route: Delete a contact
// Expects: Contact ID in query or body (as per your DeleteContact logic)
router.delete("/delete-contact", Authenticated, async (req, res, next) => {
  try {
    await DeleteContact(req, res);
  } catch (error) {
    next(error);
  }
});

// Route: Send emergency info to contacts
// This would trigger sending SMS, email, or alert (implementation in controller)
router.post("/emergency", Authenticated, async (req, res, next) => {
  try {
    await SendEmergencyInfo(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
