import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Loading from "./components/Loading";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Import all components directly
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./components/NotFound";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import UserList from "./pages/Coco/UserList";
import CreateUser from "./pages/Coco/CreateUser";
import Attendance from "./pages/Coco/Attendance";
import RequestList from "./pages/Coco/RequestList";
import Store from "./pages/Coco/Store";
import AccountList from "./pages/Account/AccountList";
import Members from "./pages/Team/Members";
import Departments from "./pages/Permission/Departments";
import Roles from "./pages/Permission/Roles";
import Branch from "./pages/Permission/Branch";
import PermissionList from "./pages/Permission/PermissionList";

import SetSalary from "./pages/PAYROLL/SetSalary";
import PaySlip from "./pages/PAYROLL/PaySlip";
import Letter from "./pages/content/letter";
import StoreGroup from "./pages/store/StoreGroup";
import Staff from "./pages/store/Staff";

import Indicators from "./pages/performance/indicators";

import Appraisals from "./pages/performance/appraisals";

import ManageMyAppraisals from "./pages/performance/ManageMyAppraisals";
import Feedback from "./pages/performance/Feedback";
import Reviews from "./pages/performance/reviews";
import Employee from "./pages/staff/employee";
import CreateEmployee from "./pages/staff/createemployee";
import ViewStaff from "./pages/staff/ViewStaff";
import DailyAttendance from "./pages/attendance/daily";
import MonthlyAttendance from "./pages/attendance/monthly";
import AttendanceReport from "./pages/attendance/report";
import Setup from "./pages/1os/setup";
import Jobs from "./pages/recruitment/jobs";
import CreateJob from "./pages/recruitment/create";
import Applications from "./pages/recruitment/applications";
import Application from "./pages/recruitment/application";
import Candidates from "./pages/recruitment/candidates";
import Onboarding from "./pages/recruitment/onboarding";
import StartOnboarding from "./pages/recruitment/startonboarding";
import Interview from "./pages/recruitment/interview";
import Settings from "./pages/settings";
import DeveloperSetting from "./pages/DeveloperSetting";
import EditProfile from "./pages/EditProfile";
import NewsPage from "./pages/Content/News";
import Faq from "./pages/Faq";
import GoalList from "./pages/Performance/Goals";
import ManageTeamAppraisals from "./pages/Performance/ManageTeamAppraisals";
import MyTaskManagement from "./pages/Performance/MyTaskManagement";
import TeamTaskManagement from "./pages/Performance/TeamTaskManagement";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" reverseOrder={false} />
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="categories" element={<Categories />} />
              <Route path="profiles" element={<Profile />} />

              {/* Coco Routes */}
              <Route path="coco/userlist" element={<UserList />} />
              <Route path="coco/createuser" element={<CreateUser />} />
              <Route path="coco/attendance" element={<Attendance />} />
              <Route path="coco/request-list" element={<RequestList />} />
              <Route path="coco/store" element={<Store />} />

              {/* Account Routes */}
              <Route path="Account/list" element={<AccountList />} />

              {/* Team Routes */}
              <Route path="team/logs" element={<Members />} />

              {/* Permission Routes */}
              <Route path="permission/departments" element={<Departments />} />
              <Route path="permission/roles" element={<Roles />} />
              <Route path="permission/branches" element={<Branch />} />
              <Route
                path="permission/permissions-list"
                element={<PermissionList />}
              />

              {/* Payroll Routes */}
              <Route path="payroll/set-salary" element={<SetSalary />} />
              <Route path="payroll/pay-slip" element={<PaySlip />} />

              {/* Content Routes */}
              <Route path="content/letter" element={<Letter />} />
              <Route path="content/news" element={<NewsPage />} />

              {/* Store Routes */}
              <Route path="store/storegroup" element={<StoreGroup />} />
              <Route path="store/staff" element={<Staff />} />

              {/* Performance Routes */}
              <Route path="performance/indicators" element={<Indicators />} />
              <Route path="performance/goals" element={<GoalList />} />
              <Route path="performance/appraisals" element={<Appraisals />} />
              <Route
                path="performance/appraisals/team"
                element={<ManageTeamAppraisals />}
              />
              <Route
                path="performance/appraisal"
                element={<ManageMyAppraisals />}
              />
              <Route path="performance/feedback" element={<Feedback />} />
              <Route path="performance/reviews" element={<Reviews />} />
              <Route path="performance/my-task" element={<MyTaskManagement />} />
              <Route path="performance/team-task" element={<TeamTaskManagement />} />

              {/* Staff Routes */}
              <Route path="staff/employees" element={<Employee />} />
              <Route path="staff/create" element={<CreateEmployee />} />
              <Route path="staff/employee" element={<ViewStaff />} />

              {/* Attendance Routes */}
              <Route path="attendance/daily" element={<DailyAttendance />} />
              <Route
                path="attendance/monthly"
                element={<MonthlyAttendance />}
              />
              <Route path="attendance/reports" element={<AttendanceReport />} />

              {/* System Setup */}
              <Route path="1os/setup" element={<Setup />} />

              {/* Recruitment Routes */}
              <Route path="recruitment/jobs" element={<Jobs />} />
              <Route path="recruitment/create" element={<CreateJob />} />
              <Route
                path="recruitment/applications"
                element={<Applications />}
              />
              <Route path="recruitment/application" element={<Application />} />
              <Route path="recruitment/candidates" element={<Candidates />} />
              <Route path="recruitment/onboarding" element={<Onboarding />} />
              <Route
                path="recruitment/startonboarding"
                element={<StartOnboarding />}
              />
              <Route path="recruitment/interviews" element={<Interview />} />

              {/* Settings Routes */}
              <Route path="controllers" element={<Settings />} />
              <Route path="faq" element={<Faq />} />
              <Route path="developer-settings" element={<DeveloperSetting />} />
              <Route path="edit-profile" element={<EditProfile />} />
            </Route>

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forget-pass" element={<ForgotPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
