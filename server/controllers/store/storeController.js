const Store = require("../../models/Store");
const StoreGroup = require("../../models/stores/StoreGroup");

 
module.exports = {
  

  createStore: async (req, res) => {
    try {
      const storeData = req.body;
      const store = new Store(storeData);
      await store.save();

      const populatedStore = await Store.findById(store._id).populate(
        "storeGroup",
        "name"
      );
      res.status(201).json(populatedStore);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAllStores: async (req, res) => {
    try {
      const stores = await Store.find()
        .populate("storeGroup", "name")
        .sort({ createdAt: -1 });
      res.json(stores);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  updateStore: async (req, res) => {
    try {
      const { id } = req.params;
      const storeData = req.body;

      const store = await Store.findByIdAndUpdate(
        id,
        { ...storeData, updatedAt: Date.now() },
        { new: true }
      ).populate("storeGroup", "name");

      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      res.json(store);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteStore: async (req, res) => {
    try {
      const { id } = req.params;
      const store = await Store.findByIdAndDelete(id);

      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json({ message: "Store deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getStoreGroups: async (req, res) => {
    try {
      const storeGroups = await StoreGroup.find().select("_id name");
      res.json(storeGroups);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
