const { validationResult } = require("express-validator");
const StoreGroup = require("../../models/stores/StoreGroup");

exports.createStoreGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const storeGroup = new StoreGroup({ name });
    await storeGroup.save();
    res.status(201).json(storeGroup);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Store group name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getAllStoreGroups = async (req, res) => {
  try {
    const storeGroups = await StoreGroup.find().sort({ createdAt: -1 });
    res.json(storeGroups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStoreGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const storeGroup = await StoreGroup.findByIdAndUpdate(
      id,
      { name, updatedAt: Date.now() },
      { new: true }
    );

    if (!storeGroup) {
      return res.status(404).json({ message: "Store group not found" });
    }

    res.json(storeGroup);
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Store group name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStoreGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const storeGroup = await StoreGroup.findByIdAndDelete(id);

    if (!storeGroup) {
      return res.status(404).json({ message: "Store group not found" });
    }

    res.json({ message: "Store group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};