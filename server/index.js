// server.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect DB
connectDB();
app.use("/uploads", express.static("uploads"));
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/v1", require("./routes/route.js"));
app.use("/api/v1/roles", require("./routes/roles-routes.js"));
app.use("/api/v1/finance", require("./routes/finance-routes.js"));
app.use("/api/v1/company", require("./routes/company-routes.js"));
app.use("/api/v1/user", require("./routes/user-route.js"));
app.use("/api/v1/helper", require("./routes/helper-route.js"));
app.use("/api/v1/attendance", require("./routes/attendance-routes.js"));
app.use(
  "/api/v1/store/storeGroups",
  require("./routes/store/storeGroupRoutes.js")
);
app.use("/api/v1/store/roles", require("./routes/store/storeRoles.js"));
app.use("/api/v1/stores", require("./routes/store/store.js"));
app.use("/api/v1/jobs", require("./routes/jobsRoute.js"));
app.use("/api/v1/recruitment", require("./routes/recruitment.js"));
// app.use("/api/v1/onboarding", require("./routes/onboarding.js"));
app.use("/api/v1/analytics", require("./routes/analytics.js"));
app.use(
  "/api/v1/performance",
  require("./routes/performance/performanceRouter.js")
);

app.use("/api/v1/settings", require("./routes/setting/settingsRouter.js"));
app.use(
  "/api/v1/email-settings",
  require("./routes/setting/emailSettingRoutes.js")
);
app.use(
  "/api/v1/email-notification-setting",
  require("./routes/setting/emailNotificationRouter.js")
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
