const News = require("../models/News");
const Role = require("../models/Role");
const mongoose = require("mongoose");
const EmailNotification = require("../models/setting/emailNotification");
const sendEmail = require("../services/sendInterviewScheduledEmail");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { EmailConfig } = require("../helper/emailConfig");
// @desc    Get all news
// @route   GET /api/v1/news
// @access  Public/Admin or Role-based
exports.getNews = async (req, res) => {
  try {
    let query;

    if (req.user && req.user.role.name !== "admin") {
      query = News.find({ targetRoles: req.user.role._id });
    } else {
      query = News.find();
    }

    const news = await query
      .populate("targetRoles", "name")
      .populate("createdBy", "name")
      .sort("-createdAt");

    return res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get single news by ID
// @route   GET /api/v1/news/:id
// @access  Public or Role-based
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate("targetRoles", "name")
      .populate("createdBy", "name");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: `News not found with id of ${req.params.id}`,
      });
    }

    if (
      req.user &&
      req.user.role.name !== "admin" &&
      !news.targetRoles.some((role) => role._id.equals(req.user.role._id))
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this news",
      });
    }

    return res.status(200).json({
      success: true,
      data: news,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Create news
// @route   POST /api/v1/news
// @access  Private (admin, editor)

exports.createNews = async (req, res) => {
  try {
    const news = await News.create(req.body);
    const notify = await EmailNotification.findOne({ newNews: true });

    if (notify) {
      const orgs = await Organization.find({
        role: { $in: req.body.targetRoles || [] },
      }).select("_id");

      // Then get users belonging to those orgs
      const users = await User.find({
        isActive: true,
        Organization: { $in: orgs.map((o) => o._id) },
      })
        .select("email firstName -_id")
        .lean();

      if (users.length) {
        const emailHTML = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
          <div style="background: #4CAF50; padding: 20px; text-align: center;">
            <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zee Pharmacy" style="height: 50px;">
            <h1 style="color: white; margin: 10px 0 0; font-size: 24px;">Zee Pharmacy News Update</h1>
          </div>
          
          <div style="padding: 25px;">
            <h2 style="color: #2c3e50; margin-top: 0;">${news.title}</h2>
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.5;">${
              news.summary
            }</p>
            
            ${
              news.image
                ? `<img src="${news.image}" alt="News Image" style="max-width: 100%; border-radius: 4px; margin: 15px 0;">`
                : ""
            }
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #34495e;"><strong>Details:</strong></p>
              <p style="margin: 10px 0 0; color: #7f8c8d;">${news.content.substring(
                0,
                200
              )}...</p>
            </div>
            
            <a href="${process.env.DOMAIN}/news/${news._id}" 
               style="display: inline-block; background: #4CAF50; color: white; 
                      padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                      font-weight: bold; margin-top: 10px;">
              Read Full Story
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #95a5a6;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Zee Pharmacy. All rights reserved.</p>
            <p style="margin: 5px 0 0;">This email was sent to you as part of your Zee Pharmacy notifications.</p>
          </div>
        </div>
        `;

        await sendEmail({
          from: `"Zee Pharmacy" <${EmailConfig.mailFromAddress}>`,
          to: users.map((u) => u.email),
          subject: `📰 Zee News: ${news.title}`,
          html: emailHTML,
        });
      }
    }

    return res.status(201).json({ success: true, data: news });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update news
// @route   PUT /api/v1/news/:id
// @access  Private (admin, editor)
exports.updateNews = async (req, res) => {
  try {
    console.log(req.body, req.params);
    let news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: `News not found with id of ${req.params.id}`,
      });
    }

    // Optional: Validate targetRoles if provided
    if (req.body.targetRoles) {
      const roles = await Role.find({ _id: { $in: req.body.targetRoles } });
      if (roles.length !== req.body.targetRoles.length) {
        return res.status(404).json({
          success: false,
          message: "One or more roles not found",
        });
      }
    }

    news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: news,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Delete news
// @route   DELETE /api/v1/news/:id
// @access  Private (admin, editor)
exports.deleteNews = async (req, res) => {
  console.log(req.params.id);
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: `News not found with id of ${req.params.id}`,
      });
    }

    await news.deleteOne();

    return res.status(200).json({
      success: true,
      message: "News deleted successfully",
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/**
 * @desc    Get news articles by role ID
 * @route   GET /api/news/role/:id
 * @access  Private
 */
exports.getNewsByRole = async (req, res) => {
  const { role } = req.query;
  console.log(role);
  // Validate role ID
  if (!mongoose.Types.ObjectId.isValid(role)) {
    return res.status(400).json({
      success: false,
      message: "Id Not Found",
    });
  }

  try {
    // Find news that target the specified role
    const news = await News.find({
      targetRoles: { $in: [role] },
    })

      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Convert to plain JS objects

    if (!news || news.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No news found for this role",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (err) {
    console.error(`Error getting news for role ${id}:`, err);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching news",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
