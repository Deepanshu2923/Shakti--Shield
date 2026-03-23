import User from "../Models/User.Model.js";
import { cloudinaryUpload } from "../Utils/Cloudinary.Utils.js";
import fs from "fs";
import getPublicIdFromUrl from "../Utils/getPublicIdFromUrl.Utils.js";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

/**
 * Add a new contact for a user
 * @route POST /api/contact/addcontact
 * @param {string} name - Name of the contact
 * @param {string} MobileNo - Mobile number of the contact
 * @param {string} userId - ID of the user adding the contact
 * @param {file} photo - (Optional) Contact photo
 */
const AddContact = async (req, res) => {
  const userId = req.user?.id;
  const { MobileNo, name } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!MobileNo || !name) {
    return res.status(400).json({ message: "Please enter all required fields (name, MobileNo)" });
  }

  try {
    let photoUrl = "https://via.placeholder.com/150"; // default photo

    // If a file was uploaded, upload it to Cloudinary
    if (req.file) {

      // it upload the file on the cloudinary and return the link 
      const uploaded = await cloudinaryUpload(req.file.path);
      photoUrl = uploaded; 

      // after uploading the file on the cloudinary now i delete the local file so it doesn’t fill my server disk.
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting local file:", err);
      });
    }

    // Push new contact into user's contacts array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          contacts: { user: userId, photo: photoUrl, name, MobileNo }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the newly added contact
    const newContact = updatedUser.contacts.at(-1);
    return res.status(201).json({
      message: "Contact added successfully",
      contact: newContact
    });

  } catch (error) {
    console.error("Error in AddContact:", error);
    return res.status(500).json({ message: "An error occurred while adding the contact" });
  }
};

/**
 * Delete a contact from a user's contacts
 * @route DELETE /api/contact/delete-contact
 * @query {string} userId - ID of the user
 * @query {string} contactId - ID of the contact to delete
 */
const DeleteContact = async (req, res) => {
  const userId = req.user?.id;
  const { contactId } = req.query;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!contactId) {
    return res.status(400).json({ message: "Contact ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const contact = user.contacts.find(c => c._id.toString() === contactId);
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    // Delete the photo from Cloudinary if exists
    if (contact.photo) {
      try {
        const publicId = getPublicIdFromUrl(contact.photo);
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Failed to delete photo from Cloudinary:", err);
        // Continue even if Cloudinary delete fails
      }
    }

    // Remove contact from array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { contacts: { _id: contactId } } },
      { new: true }
    );

    return res.status(200).json({
      message: "Contact deleted successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error in DeleteContact:", error);
    return res.status(500).json({ message: "An error occurred while deleting the contact" });
  }
};

/**
 * Send emergency SMS alerts with location to multiple contacts
 * @route POST /api/contact/emergency
 * @param {array} contactNumbers - Array of contact numbers to alert
 * @param {object} location - { latitude: number, longitude: number }
 */
const SendEmergencyInfo = async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { contactNumbers, location } = req.body;

  if (!contactNumbers || !Array.isArray(contactNumbers) || contactNumbers.length === 0) {
    return res.status(400).json({ message: "Contact numbers array is required" });
  }

  if (!location || !location.latitude || !location.longitude) {
    return res.status(400).json({ message: "Valid location is required" });
  }

  try {
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    const messageText = `EMERGENCY ALERT! Location: ${mapsLink} Please respond immediately.`;

    // Send SMS to all contacts concurrently
    const results = await Promise.all(
      contactNumbers.map(async (number) => {
        try {
          const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
              route: 'q',
              message: messageText,
              numbers: number.replace(/\D/g, ''),
              flash: 0
            },
            {
              headers: {
                authorization: process.env.FAST2SMS_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );

          return {
            number,
            status: 'success',
            messageId: response.data.message[0]
          };
        } catch (err) {
          console.error(`Failed to send to ${number}:`, err.message);
          return {
            number,
            status: 'failed',
            error: err.message
          };
        }
      })
    );

    const successful = results.filter(r => r.status === 'success');
    if (successful.length === 0) {
      return res.status(500).json({
        message: "Failed to send emergency alerts to all contacts",
        results
      });
    }

    return res.status(200).json({
      message: "Emergency alerts sent",
      results
    });

  } catch (error) {
    console.error("Error in SendEmergencyInfo:", error);
    return res.status(500).json({ message: "An error occurred while sending emergency alerts" });
  }
};

export { AddContact, DeleteContact, SendEmergencyInfo };
