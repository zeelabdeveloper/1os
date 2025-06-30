const Role = require("../models/Role");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Department = require("../models/Department");
const nodemailer = require("nodemailer");
const sendEmail = require("../services/forgetpassmail");
const Permission = require("../models/developer/Permission");

const createToken = (userId) => {
  return jwt.sign(userId, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.loginUser = async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    if (!password || password.length < 4)
      return res
        .status(400)
        .json({ message: "Password must be at least 4 characters long" });
    if (!employeeId)
      return res.status(400).json({ message: "Please provide an employee ID" });

    const userAgg = await User.aggregate([
      {
        $lookup: {
          from: "employeeids",
          localField: "EmployeeId",
          foreignField: "_id",
          as: "employeeIdDetails",
        },
      },
      { $unwind: "$employeeIdDetails" },
      { $match: { "employeeIdDetails.employeeId": employeeId.toUpperCase() } },
      { $limit: 1 },
    ]);

    const user = userAgg[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isActive)
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact administrator" });

    const fullUser = await User.findById(user._id);
    const isMatch = await fullUser.comparePassword(password);

    // if (!isMatch)
    //   return res.status(401).json({ message: "Invalid credentials" });

    fullUser.lastLogin = new Date();
    await fullUser.save();

    const token = createToken({
      userId: fullUser._id,
    });

    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error during authentication" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email })
      .select("+password")
      .populate("EmployeeId");
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.save();

    const mailOptions = {
      from: `"Zeelab Pharmacy" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: "Zeelab - Your Temporary Password",
      html: `
        <h3>Hello ${user.fullName},</h3>
        <p>Your temporary password is:</p>
        <h2 style="color: #22c55e;">${tempPassword}</h2>
        <p>Your Employee Id is:</p>
        <h2 style="color: #22c55e;">${user?.EmployeeId?.employeeId}</h2>
        <p>Please log in and change your password immediately.</p>
        <br/>
        <p>Thanks,<br/>Zeelab Team</p>
      `,
    };

    const emailResult = await sendEmail(mailOptions);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message:
          emailResult.error?.message ||
          "Failed to send email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Temporary password sent to your email.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

exports.createRole = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const superAdmin = await User.create({ ...req.body, isSuperAdmin: true });
    const token = createToken(superAdmin._id);

    res.status(201).json({
      message: "Super admin created",
      user: _.pick(superAdmin, ["_id", "firstName", "lastName", "email"]),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    // if (true) {
    //   const d = await User.findOne({ _id: "683fe0906f71f6586ae021b1" })
    //     .populate("roles")
    //     .exec();
    //   return res.status(400).json({ message: d });
    // }
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const superAdmin = await User.create({ ...req.body, isSuperAdmin: true });
    const token = createToken(superAdmin._id);

    res.status(201).json({
      message: "Super admin created",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, head, location, budget } = req.body;
    // Validate required fields
    if (!name || !code || !location) {
      return res.status(400).json({
        success: false,
        message: "Name, code and location are required",
      });
    }
    const department = new Department({
      name,
      code,
      head,
      location,
      budget: budget || 0,
    });

    await department.save();

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({
      success: false,
      message:
        error.code === 11000
          ? "Department name/code already exists"
          : "Server error",
      error: error.message,
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    // 1. Extract token from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // 2. Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the user and populate Organization if it's a referenced field
   const user = await User.findById(decoded.userId)
  .select("-password -__v")
  .populate([
    {
      path: "Organization",
      strictPopulate: false,
      populate: [
        {
          path: "branch",
          model: "CompanyBranch",
          strictPopulate: false,
        },
        {
          path: "department",
          model: "Department",
          strictPopulate: false,
        },
        {
          path: "role",
          model: "Role",
          strictPopulate: false,
        },
      ],
    },
    { path: "EmployeeId", strictPopulate: false },
    { path: "Profile", strictPopulate: false },
    { path: "Bank", strictPopulate: false },
    { path: "Salary", strictPopulate: false },
    { path: "Experience", strictPopulate: false },
    { path: "Asset", strictPopulate: false },
    { path: "Document", strictPopulate: false },
    { path: "Store", strictPopulate: false },
  ]);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact the admin.",
      });
    }

    // 4. Check if user's organization and role exist
    const roleId = user?.Organization?.role;
    if (!roleId) {
      return res.status(403).json({
        success: false,
        message: "User's role information is missing. Contact admin.",
      });
    }

    // 5. Fetch permissions for that role
    const allPermission = await Permission.findOne({ role: roleId }).populate({
      path: "permissions.route",
      model: "ChildRoute",
      strictPopulate: false,
    });

    if (
      !allPermission ||
      !Array.isArray(allPermission.permissions) ||
      allPermission.permissions.length === 0
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned any permissions. Contact your manager.",
      });
    }

    const allowedRoutes = allPermission.permissions
      .filter((p) => p.access && p.route)
      .map((p) => ({
        url: p?.route?.url,
        label: p?.route?.label,
      }));

    return res.status(200).json({
      success: true, 
      permissions: allowedRoutes,
      user,
      employeeId: user?.EmployeeId,
    });
  } catch (error) {
    console.error("Token verification error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during token verification.",
    });
  }
};

exports.fetchUser = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user in database
    const user = await User.findById(decoded.userId)
      .select("-password -__v")
      .populate("roles")
      .populate("reportingManager");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};
