const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Event = require("../models/Event");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Multer configuration for file uploads

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "events");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/mpeg",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only images/videos allowed."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});


// Helper function to auto-archive past events

async function autoArchivePastEvents() {
  try {
    const now = new Date();
    const result = await Event.updateMany(
      {
        date: { $lt: now },
        isArchived: false,
      },
      {
        $set: {
          isArchived: true,
          archivedAt: now,
          archiveReason: 'auto_archived_after_event',
        },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(` Auto-archived ${result.modifiedCount} past events`);
    }
  } catch (err) {
    console.error(' Error auto-archiving events:', err);
  }
}

// Run auto-archive on server start
autoArchivePastEvents();

// Run auto-archive every hour
setInterval(autoArchivePastEvents, 60 * 60 * 1000);


// GET all events (only active, non-archived) with optional location filtering

router.get("/", async (req, res, next) => {
  try {
    // Auto-archive past events before fetching
    await autoArchivePastEvents();

    const { lat, lng, radius = 50 } = req.query;

    // Get all ACTIVE (non-archived) events with creator info
    let events = await Event.find({ isArchived: false })
      .populate("creator", "firstName lastName email phone")
      .sort({ date: 1 });

    // If location parameters provided, filter by distance
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      events = events.filter((event) => {
        if (event.coordinates && event.coordinates.lat && event.coordinates.lng) {
          const distance = getDistanceInKm(
            userLat,
            userLng,
            event.coordinates.lat,
            event.coordinates.lng
          );
          return distance <= maxRadius;
        }
        return false;
      });

      // Sort by distance
      events = events.map((event) => {
        const distance = getDistanceInKm(
          userLat,
          userLng,
          event.coordinates.lat,
          event.coordinates.lng
        );
        return { ...event.toObject(), distance };
      }).sort((a, b) => a.distance - b.distance);
    }

    res.json(events);
  } catch (err) {
    next(err);
  }
});


// GET single event by ID (includes archived events for saved list)

router.get("/:id", async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'creator',
        select: 'firstName lastName email phone role'
      });

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Convert to object to include virtuals
    const eventObj = event.toObject();
    
    // Ensure creator name is available
    if (eventObj.creator) {
      eventObj.creator.name = `${eventObj.creator.firstName} ${eventObj.creator.lastName}`;
    }

    res.json(eventObj);
  } catch (err) {
    next(err);
  }
});

// POST create new event (Only for organizers)

router.post("/", authenticateToken, upload.array("media", 10), async (req, res, next) => {
  try {
    // Check if user is an organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can create events',
      });
    }

    const { title, description, date } = req.body;
    let { location } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, and date",
      });
    }

    // Validate that event date is in the future
    if (new Date(date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date must be in the future",
      });
    }

    // Extract coordinates from location if available
    let coordinates = null;
    if (location && location.includes(",")) {
      const parts = location.split(",").map((coord) => coord.trim());
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates = { lat, lng };
        }
      }
    }

    // Process uploaded files
    const media = req.files
      ? req.files.map((file) => ({
          url: `/uploads/events/${file.filename}`,
          type: file.mimetype,
          filename: file.filename,
        }))
      : [];

    const event = new Event({
      title,
      description,
      date,
      location: location || "Not specified",
      coordinates,
      media,
      creator: req.user._id,
    });

    await event.save();

    // Populate creator info before sending response
    await event.populate('creator', 'firstName lastName email phone role');

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    console.error(" Error creating event:", err);
    next(err);
  }
});


// PUT update existing event (Only creator can update)

router.put("/:id", authenticateToken, upload.array("media", 10), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Check if event is archived
    if (event.isArchived) {
      return res.status(403).json({
        success: false,
        message: "Cannot update archived event",
      });
    }

    // Check if user is the creator and is an organizer
    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can update events',
      });
    }

    // Update fields
    const { title, description, date, location } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) {
      // Validate that event date is in the future
      if (new Date(date) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Event date must be in the future",
        });
      }
      event.date = date;
    }

    if (location) {
      event.location = location;
      // Update coordinates if location contains them
      if (location.includes(",")) {
        const parts = location.split(",").map((coord) => coord.trim());
        if (parts.length >= 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            event.coordinates = { lat, lng };
          }
        }
      }
    }

    // Handle new media uploads (append to existing)
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map((file) => ({
        url: `/uploads/events/${file.filename}`,
        type: file.mimetype,
        filename: file.filename,
      }));
      event.media = [...event.media, ...newMedia];
    }

    await event.save();
    await event.populate('creator', 'firstName lastName email phone role');

    res.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (err) {
    console.error(" Error updating event:", err);
    next(err);
  }
});


// DELETE event (Only creator can delete, only before event starts)

router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    // Check if event has already started or passed
    const now = new Date();
    if (new Date(event.date) < now) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete event that has already started or passed",
      });
    }

    // Archive the event instead of deleting (so saved lists retain it)
    event.isArchived = true;
    event.archivedAt = new Date();
    event.archiveReason = 'deleted_by_organizer';
    await event.save();

    res.json({ 
      success: true, 
      message: "Event deleted successfully. It will remain visible in users' saved events." 
    });
  } catch (err) {
    console.error(" Error deleting event:", err);
    next(err);
  }
});

// GET archived events (for organizers to see their deleted events)

router.get("/archived/my-events", authenticateToken, async (req, res, next) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can view archived events',
      });
    }

    const archivedEvents = await Event.find({
      creator: req.user._id,
      isArchived: true,
    })
      .populate('creator', 'firstName lastName email phone')
      .sort({ archivedAt: -1 });

    res.json({
      success: true,
      archivedEvents,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;