const Role = require("../models/Role");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Department = require("../models/Department");
const createToken = (userId) => {
  return jwt.sign(userId, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.loginUser = async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    if (!password || password.length < 4) {
      return res.status(400).json({
        message: "Password must be at least 4 characters long",
      });
    }

    if (!employeeId) {
      return res.status(400).json({
        message: "Please provide either employee ID",
      });
    }

    const user = await User.findOne({ employeeId }).populate("roles");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 3. Check if account is accountSuspended
    if (user.accountSuspended) {
      const lockTime = new Date(user.updatedAt);
      const unlockTime = new Date(lockTime.getTime() + 30 * 60 * 1000);

      if (new Date() < unlockTime) {
        return res.status(403).json({
          message: `Account locked. Try again after ${unlockTime}`,
        });
      } else {
        user.accountSuspended = false;
        user.loginAttempts = 0;
        await user.save();
      }
    }

    // 4. Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated. Contact administrator",
      });
    }

    // 5. Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.accountSuspended = true;
        await user.save();
        return res.status(403).json({
          message: "Too many failed attempts. Account locked for 30 minutes",
        });
      }

      await user.save();
      return res.status(401).json({
        message: `Invalid credentials. ${
          5 - user.loginAttempts
        } attempts remaining`,
      });
    }

    user.loginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // 7. Generate JWT token
    const token = createToken({
      userId: user._id,
      employeeId: user.employeeId,
      roles: user.roles,
    });

    // 8. Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        employeeId: user.employeeId,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        designation: user.designation,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Server error during authentication",
    });
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
      .populate("roles");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // 5. Return verified user data
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        isActive: user.isActive,
      },
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
