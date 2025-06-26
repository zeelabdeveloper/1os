 
const Asset = require("../../models/Assets");
const Application = require("../../models/jobs/applicationSchema");
const Onboarding = require("../../models/jobs/Onboarding");

// Create or Update Asset
exports.createOrUpdateAsset = async (req, res) => {
  try {
    const { name, id, applicationId, price, quantity, purchaseDate } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "No application found with that ID",
      });
    }

    if (id) {
      await Asset.findByIdAndUpdate(id, req.body);
      return res.status(200).json({ message: "Asset Updated!" });
    }

    let asset = await Asset.findOne({
      name,
      applicationId,
    });

    if (asset) {
      // Update existing asset
      asset.price = price;
      asset.quantity = quantity;
      asset.purchaseDate = purchaseDate;
      await asset.save();
    } else {
      // Create new asset
      asset = new Asset({
        applicationId,
        name,
        price,
        quantity,
        purchaseDate,
      });
      await asset.save();

      const onboarding = await Onboarding.findOne({ applicationId });

      if (onboarding) {
        onboarding.Asset.push(asset._id);
        await onboarding.save();
      } else {
        const newOnboarding = new Onboarding({
          applicationId,
          Asset: [asset._id],
        });
        await newOnboarding.save();
      }
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Assets for User
exports.getUserAssets = async (req, res) => {
  const { applicationId } = req.params;
  try {
    const assets = await Asset.find({ applicationId });

    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete Asset
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({
      _id: req.params.id,
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "Asset not found",
      });
    }

    // Remove the asset reference from Onboarding
    await Onboarding.findOneAndUpdate(
      { applicationId: asset.applicationId },
      { $pull: { Asset: asset._id } }
    );

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully and removed from onboarding",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin: Get All Assets
exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find().populate("user", "name email");
    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};