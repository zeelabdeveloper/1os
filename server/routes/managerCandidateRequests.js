const express = require("express");
const router = express.Router();
const EmployeeRequest = require("../models/ManagerCandidateRequest");
const EmailNotification = require("../models/setting/emailNotification");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Department = require("../models/Department");
const sendEmail = require("../services/sendInterviewScheduledEmail");
const { EmailConfig } = require("../helper/emailConfig");

// Create a new employee request (Manager)
router.post("/employeeRequests", async (req, res) => {
  try {
    // Create the new employee request
    const request = new EmployeeRequest({
      ...req.body,
    });

    // Save the request first to get the ID
    const savedRequest = await request.save();

    const org = await Organization.findOne({
      isActive: true,
      user: savedRequest.managerId,
    }).populate("user");

    const department = await Department.findById(org?.department).populate(
      "head"
    );

    savedRequest.updatedBy = department.head._id;
    await request.save();

    // Check if email notifications are enabled for new hiring requests
    const notificationConfig = await EmailNotification.findOne({
      managerRequestRegardingNewHiring: true,
    });
    console.log(notificationConfig);
    if (notificationConfig) {
      // Get the manager's organization and department head

      if (department && department.head) {
        const emailHTML = `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
            <div style="background: #1890ff; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 10px 0 0; font-size: 24px;">New Hiring Request Notification</h1>
            </div>
            
            <div style="padding: 25px;">
              <h2 style="color: #2c3e50; margin-top: 0;">New Employee Request from ${
                org?.user?.firstName
              }</h2>
              
              <div style="margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Department:</p>
                <p style="margin: 5px 0 15px;">${request.department}</p>
                
                <p style="margin: 0; font-weight: bold;">Position:</p>
                <p style="margin: 5px 0 15px;">${request.position}</p>
                
                <p style="margin: 0; font-weight: bold;">Urgency:</p>
                <p style="margin: 5px 0 15px; text-transform: capitalize;">${
                  request.urgency
                }</p>
              </div>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Job Description:</p>
                <p style="margin: 10px 0 0;">${request.jobDescription}</p>
              </div>
              
             
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #95a5a6;">
              <p style="margin: 0;">© ${new Date().getFullYear()} ${"Zee Lab"}. All rights reserved.</p>
              <p style="margin: 5px 0 0;">This is an automated notification email.</p>
            </div>
          </div>
          `;

        // Send email to department head
        await sendEmail({
          from: `${EmailConfig.mailUsername} <${EmailConfig.mailFromAddress}>`,
          to: department?.head?.email,
          subject: `🚀 New Hiring Request: ${request.position} in ${request.department}`,
          html: emailHTML,
        });
      }
    }

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error creating employee request:", error);
    res.status(400).json({
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

router.delete("/employeeRequests/:id", async (req, res) => {
  try {
    const request = await EmployeeRequest.findByIdAndDelete(req.params.id);

    res.status(201).json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all requests (Admin)
router.get("/admin", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can view all requests" });
    }

    const requests = await EmployeeRequest.find().populate(
      "managerId",
      "name email"
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get requests from creator
router.get("/employeeRequests/manager/:id", async (req, res) => {
  try {
    const requests = await EmployeeRequest.find({
      managerId: req.params.id,
    }).sort({ createdAt: -1 }).populate("managerId")
    
    res.json(requests);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});

// get list from manager 
router.get("/employeeRequests/FromManager/:id", async (req, res) => {
  try {
    const requests = await EmployeeRequest.find({
      updatedBy: req.params.id,
    }).sort({ createdAt: -1 }).populate("managerId")
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update request status (Admin)
router.patch("/employeeRequests/:id", async (req, res) => {
  try {
     

     
    const request = await EmployeeRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add candidate details (Admin)
router.patch("/:id/candidate", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can add candidate details" });
    }

    const request = await EmployeeRequest.findByIdAndUpdate(
      req.params.id,
      {
        candidateDetails: req.body,
        status: "fulfilled",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
