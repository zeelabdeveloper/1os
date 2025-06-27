// 📁 File: routes/headerRoutes.js
const express = require("express");
const router = express.Router();
const Header = require("../models/developer/CreateRoute");
const ChildRoute = require("../models/developer/ChildRoute");

// Create header with children
router.post("/", async (req, res) => {
  try {
    const { header, child } = req.body;
    console.log(header,child)
    // First create all child items
    const createdChildren = await ChildRoute.insertMany(child);
    const childIds = createdChildren.map(c => c._id);
    
    // Then create the header with references to the children
    const newHeader = new Header({
      header,
      child: childIds
    });
    
    await newHeader.save();
    res.status(201).json({ success: true, data: newHeader });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all headers with populated children
router.get("/", async (req, res) => {
  try {
    const headers = await Header.find().populate('child');
    res.status(200).json({ success: true, data: headers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete header and its children
router.delete("/:id", async (req, res) => {
  try {
    const header = await Header.findById(req.params.id);
    if (!header) {
      return res.status(404).json({ success: false, error: "Header not found" });
    }
    
    // Delete all child items
    await ChildRoute.deleteMany({ _id: { $in: header.child } });
    
    // Then delete the header
    await Header.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update header and children
router.put("/:id", async (req, res) => {
  try {
    const { header, child } = req.body;
    const headerId = req.params.id;

    // Get the current header with child references
    const currentHeader = await Header.findById(headerId);
    if (!currentHeader) {
      return res.status(404).json({ success: false, error: "Header not found" });
    }

    // Separate existing and new child items
    const existingChildIds = currentHeader.child.map(id => id.toString());
    const incomingChildIds = child.filter(c => c._id).map(c => c._id);
    
    // Find child IDs that were removed
    const removedChildIds = existingChildIds.filter(
      id => !incomingChildIds.includes(id)
    );

    // Delete removed child items
    if (removedChildIds.length > 0) {
      await ChildRoute.deleteMany({ _id: { $in: removedChildIds } });
    }

    // Process child updates and creations
    const childUpdates = child.map(async (c) => {
      if (c._id) {
        return await ChildRoute.findByIdAndUpdate(c._id, c, { new: true });
      } else {
        return await ChildRoute.create(c);
      }
    });

    const updatedChildren = await Promise.all(childUpdates);
    const childIds = updatedChildren.map(c => c._id);

    // Update the header
    const updated = await Header.findByIdAndUpdate(
      headerId,
      { header, child: childIds },
      { new: true }
    ).populate('child');

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;