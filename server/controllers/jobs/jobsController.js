const { EmailConfig } = require("../../helper/emailConfig");
const Application = require("../../models/jobs/applicationSchema");
const Job = require("../../models/jobs/jobsSchema");
const Onboarding = require("../../models/jobs/Onboarding");
const EmailNotification = require("../../models/setting/emailNotification");
const sendEmail = require("../../services/sendInterviewScheduledEmail");

// Create a new job
const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user?.id || "683fed6e4171723fde1cba1a",
    };

    const newJob = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: newJob,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(", ")}`,
      });
    }
    console.error("Error creating job:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

// Get all jobs with filtering and pagination
const getAllJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      experience,
      sort,
      page = 1,
      limit = 10,
    } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (experience) {
      query.experience = experience;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "a-z") sortOption = { title: 1 };
    else if (sort === "z-a") sortOption = { title: -1 };

    const jobs = await Job.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("postedBy", "name email")
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    const count = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

// Get single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email")
      .populate("branch", "name")
      .populate("department", "name")
      .populate("role", "name");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }
    console.error("Error fetching job:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

// Update a job
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(", ")}`,
      });
    }
    console.error("Error updating job:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

// Delete a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
      data: job,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }
    console.error("Error deleting job:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

const getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const inactiveJobs = totalJobs - activeJobs;
    console.log(totalJobs, activeJobs, inactiveJobs);
    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        inactiveJobs,
      },
    });
  } catch (error) {
    console.error("Error fetching job stats:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job statistics",
      error: error.message,
    });
  }
};

const getApplicationsForJob = async (req, res) => {
  try {
    const { dateFilter, jobId } = req.query;

    // Base query - always filter by job ID

    let query = {};

    if (jobId) {
      query.jobId = jobId;
    }

    // Handle date filter if provided
    if (dateFilter && dateFilter !== ",") {
      const dates = dateFilter.split(",");
      if (dates.length === 2) {
        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[1]);

        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          query.appliedAt = {
            $gte: new Date(startDate.setHours(0, 0, 0)),
            $lte: new Date(endDate.setHours(23, 59, 59)),
          };
        }
      }
    }

    const applications = await Application.find(query)
      .sort({ appliedAt: -1 })
      .populate("jobId");

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};
// const getHiredApplicationsForJob = async (req, res) => {
//   try {

//     const applications = await Application.find({
//       status: { $in: ["hired", "onboarding"] },
//     }).then{
//       await Onboarding.findOneAndUpdate({ application: app._id }, {})

//     )}

//     res.status(200).json(applications);
//   } catch (error) {
//     console.error("Error fetching applications:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch applications",
//       error: error.message,
//     });
//   }
// };

const getHiredApplicationsForJob = async (req, res) => {
  try {
    const applications = await Application.aggregate([
      {
        $match: {
          status: { $in: ["hired", "onboarding"] },
        },
      },
      {
        $lookup: {
          from: "onboardings",
          localField: "_id",
          foreignField: "applicationId",
          as: "onboarding",
        },
      },
      {
        $addFields: {
          onboarding: { $arrayElemAt: ["$onboarding", 0] },
        },
      },
    ]);
    console.log(applications);
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

const fetchApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const applications = await Application.findById(id).populate("jobId");

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  console.log("Test");
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        $push: {
          history: {
            status: req.body.status,
            date: new Date(),
            notes: req.body.notes || "",
          },
        },
      },
      { new: true }
    );

    if (!application) {
      res.status(404).json({ message: "Applications Not Found!" });
    }
    console.log("dffgfgfgfdfd");
    if (req.body.status !== "hired" || req.body.status !== "onboarding") {
      console.log("dfdfd");
      await Onboarding.findOneAndDelete({ application: application._id });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update application",
      error: error.message,
    });
  }
};
const deleteApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      res.status(404).json({ message: "Applications Not Found!" });
    }
    res.status(200).json({ message: "Deleted Application SuccessFully." });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update application",
      error: error.message,
    });
  }
};

const createApplication = async (req, res) => {
  try {
    let resumePath = "";
    if (req.file) {
      resumePath = `/uploads/company/${req.file.filename}`;
    }
    console.log(req.body);
    const application = await Application.create({
      ...req.body,

      resume: resumePath,
      status: "applied",
    });

    const allNotification = await EmailNotification.findOne();
    if (allNotification.newApplicationStatus) {
      // Generate tracking URL
      const trackingUrl = `http://139.59.72.240/career/application`;

      const mailOptions = {
        from: `${EmailConfig.mailFromName} <${EmailConfig.mailFromAddress}>`,
        to: req.body.email, // Using email from application body
        subject: "Your Zeelab Application Has Been Received",
        html: `
<!DOCTYPE html>
<html>
<head>
    <style type="text/css">
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #4f46e5;
            color: white;
            padding: 25px;
            text-align: center;
        }
        .content {
            padding: 30px;
        }
        .info-box {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .label {
            font-weight: 600;
            color: #4f46e5;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Received!</h1>
        </div>
        <div class="content">
            <p>Hello ${req.body.name},</p>
            <p>Thank you for applying with Zeelab. We've received your application.</p>
            
            <div class="info-box">
                <div class="info-item">
                    <span class="label">Application ID:</span> ${
                      application._id
                    }
                </div>
                <div class="info-item">
                    <span class="label">Current Status:</span> Applied
                </div>
            </div>
            
            <p>You can track your application status using the link below:</p>
            
            <a href="${trackingUrl}" class="button">Track Your Application</a>
            
            <p>We'll review your application and get back to you soon.</p>
        </div>
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© ${new Date().getFullYear()} Zeelab. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`,
      };

      const emailResult = await sendEmail(mailOptions);

      if (!emailResult.success) {
        console.error("Email sending failed:", emailResult.error);
        // Don't return error here - application was created successfully
      }
    }

    res.status(201).json(application);
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create application",
      error: error.message,
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
  deleteApplicationStatus,
  getApplicationsForJob,
  updateApplicationStatus,
  createApplication,
  getHiredApplicationsForJob,
  fetchApplicationById,
};
