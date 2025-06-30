const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Employee = require("../models/EmployeeId");
const sendEmail = require("../services/sendInterviewScheduledEmail");

// ✅ Create User
router.post("/", async (req, res) => {
  try {
    const { email, EmployeeId: emp } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    console.log(req.body);
    // Step 1: Create the user
    const user = new User({
      isCocoEmployee: true,
      ...req.body,
      EmployeeId: null,
    });
    const savedUser = await user.save();

    if (emp) {
      const newEmployee = new Employee({
        employeeId: emp,
        user: savedUser._id,
      });

      const savedEmployee = await newEmployee.save();

      // Step 3: Update user with employee reference
      savedUser.EmployeeId = savedEmployee._id;
      await savedUser.save();
    }

    const mailOptions = {
      from: `"Zeelab Pharmacy" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Zeelab - New Panel Introduced",
      html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; background-color: #ffffff;">
    <div style="text-align: center;">
      <img src="https://zeelabpharmacy.com/img/logo.png" alt="Zeelab Logo" style="max-width: 150px; margin-bottom: 20px;" />
      <h2 style="color: #22c55e;">Welcome to Zeelab Pharmacy 👋</h2>
    </div>

    <p style="font-size: 16px; color: #111827;">
      Dear <strong>${user.fullName}</strong>,
    </p>

    <p style="font-size: 15px; color: #374151;">
      We are excited to welcome you to the <strong>Zeelab Team</strong>. You now have access to our new internal employee panel, where you can manage your:
    </p>

    <ul style="color: #374151; font-size: 15px; padding-left: 20px;">
      <li>📅 Attendance</li>
      <li>📊 Performance Metrics</li>
      <li>📝 Complaints & Suggestions</li>
      <li>📌 Daily Activity & Task Updates</li>
      <li>📌 Company Notifications</li>
    </ul>

    <div style="background-color: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 10px;">
      <p style="font-size: 15px; color: #374151;">Here are your login credentials:</p>
      <p style="font-size: 15px;"><strong>Employee ID:</strong> <span style="color: #16a34a;">${emp.toUpperCase()}</span></p>
      <p style="font-size: 15px;"><strong>Temporary Password:</strong> <span style="color: #f97316;">${
        req.body.password
      }</span></p>
    </div>

    <p style="font-size: 15px; color: #374151; margin-top: 20px;">
      Kindly log in to your panel and update your password for security. Start exploring your dashboard to stay ahead and informed.
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://zeelabpanel.yourdomain.com/login" style="background-color: #22c55e; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-size: 16px;">Go to Dashboard</a>
    </div>

    <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
      If you have any questions or face issues, feel free to contact the HR or support team.
    </p>

    <p style="font-size: 15px; color: #374151; margin-top: 20px;">
      Best Regards,<br/>
      <strong>Zeelab HR Team</strong>
    </p>
  </div>
`,
    };

    const emailResult = await sendEmail(mailOptions);

    res.status(201).json(savedUser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

// ✅ Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ isCocoEmployee: true }).populate([
      {
        path: "EmployeeId",
        strictPopulate: false,
      },
      {
        path: "Store",
        strictPopulate: false,
      },
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get Single User by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update User
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // return updated document
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Delete User
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
