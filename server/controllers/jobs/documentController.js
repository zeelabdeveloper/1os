const Document = require("../../models/Document");

 
// Create or Update Document
exports.createOrUpdateDocument = async (req, res) => {
  try {
    const { documentType,  documentNumber, documentUrl } = req.body;
    
    // Check if document already exists for this user and type
    let document = await Document.findOne({ 
      user: req.user._id, 
      documentType 
    });

    if (document) {
      // Update existing document
      document.documentNumber = documentNumber;
      document.documentUrl = documentUrl;
      document.verified = false; // Reset verification status when updated
      await document.save();
    } else {
      // Create new document
      document = new Document({
        user: req.user._id,
        documentType,
        documentNumber,
        documentUrl
      });
      await document.save();
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get All Documents for User
exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Admin: Get All Documents (for verification)
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().populate('user', 'name email');
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Admin: Update Verification Status
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { verified } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    ).populate('user', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found"
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};