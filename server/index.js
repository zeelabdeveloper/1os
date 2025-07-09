// server.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const { refreshEmailConfig, EmailConfig } = require("./helper/emailConfig.js");
// const { refreshEmailConfig } = require("./helper/emailConfig.js");
dotenv.config();

const app = express();

// Connect DB
connectDB();

app.use("/uploads", express.static("uploads"));
app.use(morgan("tiny"));

// Middleware

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://capable-melomakarona-858a10.netlify.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );

// app.use(
//   cors({
//     origin: (origin, callback) => {

//       callback(null, origin || "*");
//     },
//     credentials: true,
//   })
// );

// Routes
app.use("/api/v1", require("./routes/route.js"));
app.use("/api/v1/roles", require("./routes/roles-routes.js"));
app.use("/api/v1/finance", require("./routes/finance-routes.js"));
app.use("/api/v1/company", require("./routes/company-routes.js"));
app.use("/api/v1/user", require("./routes/user-route.js"));
app.use("/api/v1/helper", require("./routes/helper-route.js"));
app.use("/api/v1/attendance", require("./routes/attendance-routes.js"));
app.use("/api/v1/separations", require("./routes/separation.js"));
app.use("/api/v1/regularization", require("./routes/regularization.js"));
app.use(
  "/api/v1/store/storeGroups",
  require("./routes/store/storeGroupRoutes.js")
);
app.use("/api/v1/store/roles", require("./routes/store/storeRoles.js"));
app.use("/api/v1/stores", require("./routes/store/store.js"));
app.use("/api/v1/jobs", require("./routes/jobsRoute.js"));
app.use("/api/v1/news", require("./routes/newsRoutes.js"));
app.use("/api/v1/recruitment", require("./routes/recruitment.js"));

app.use(
  "/api/v1/interview/interviewSessions",
  require("./routes/interviewSessions.js")
);

app.use("/api/v1/analytics", require("./routes/analytics.js"));
app.use("/api/v1/documents", require("./routes/documentRoutes.js"));
app.use("/api/v1/assets", require("./routes/AssetRoute.js"));
app.use("/api/v1/trainings", require("./routes/TrainingRoutes.js"));
app.use("/api/v1/letters", require("./routes/RelevantLetterRoutes.js"));
app.use("/api/v1/manage-letter", require("./routes/letterTemplates.js"));
app.use("/api/v1/stores", require("./routes/storeRoutes.js"));
app.use("/api/v1/storeuser", require("./routes/storeuser.js"));
app.use("/api/v1/team", require("./routes/team.js"));
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

// permission
app.use("/api/v1/permission", require("./routes/permissionRoutes.js"));
// career
app.use("/api/v1/career", require("./routes/careerRoutes.js"));

// access For Only Developer

app.use(
  "/api/v2/developer/routes",
  require("./routes/DeveloperRouteAccess.js")
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => { 
  await refreshEmailConfig();
 
  console.log(`Server running on port ${PORT}`);
});
