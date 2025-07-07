import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

import UserManagementCoco from "./pages/Coco/UserList";
import CreateUser from "./pages/Coco/CreateUser";
import Attendance from "./pages/Coco/Attendance";
import AdminRegularizationList from "./pages/Coco/RequestList";
import Store from "./pages/Coco/Store";

import Departments from "./pages/Permission/Departments";
import Roles from "./pages/Permission/Roles";
import Branch from "./pages/Permission/Branch";
import PermissionList from "./pages/Permission/PermissionList";

import SetSalary from "./pages/PAYROLL/SetSalary";
import PaySlip from "./pages/PAYROLL/PaySlip";
import Letter from "./pages/content/Letter";
import StoreGroup from "./pages/store/StoreGroup";
import Staff from "./pages/store/Staff";

import Indicators from "./pages/performance/Indicators";

import Appraisals from "./pages/performance/Appraisals";

import ManageMyAppraisals from "./pages/performance/ManageMyAppraisals";
import Feedback from "./pages/performance/Feedback";
import Reviews from "./pages/performance/Reviews";
import StaffListPage from "./pages/staff/Employee";
 
import ViewStaff from "./pages/staff/ViewStaff";
import DailyAttendance from "./pages/attendance/Daily";
import MonthlyAttendance from "./pages/attendance/Monthly";
import AttendanceReport from "./pages/attendance/Report";
import Setup from "./pages/1os/Setup";
import Jobs from "./pages/recruitment/Jobs";
import CreateJob from "./pages/recruitment/Create";
import Applications from "./pages/recruitment/Applications";
import Application from "./pages/recruitment/Application";
import Candidates from "./pages/recruitment/Candidates";
import Onboarding from "./pages/recruitment/Onboarding";
import StartOnboarding from "./pages/recruitment/Startonboarding";
import Interview from "./pages/recruitment/Interview";
import Settings from "./pages/Settings";
import DeveloperSetting from "./pages/DeveloperSetting";
import EditProfile from "./pages/EditProfile";
import NewsPage from "./pages/Content/News";
import Faq from "./pages/Faq";
import GoalList from "./pages/Performance/Goals";
import ManageTeamAppraisals from "./pages/Performance/ManageTeamAppraisals";
import MyTaskManagement from "./pages/Performance/MyTaskManagement";
import TeamTaskManagement from "./pages/Performance/TeamTaskManagement";
import ViewProfile from "./pages/Profile";
import BankAccountListPage from "./pages/Account/AccountList";
import TeamMembers from "./pages/Team/Members";
import CreateEmployeeMain from "./pages/staff/Createemployee";

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
              <Route path="profiles" element={<ViewProfile />} />

              {/* Coco Routes */}
              <Route path="coco/userlist" element={<UserManagementCoco />} />
              <Route path="coco/createuser" element={<CreateUser />} />
              <Route path="coco/attendance" element={<Attendance />} />
              <Route
                path="coco/request-list"
                element={<AdminRegularizationList />}
              />
              <Route path="coco/store" element={<Store />} />

              {/* Account Routes */}
              <Route path="Account/list" element={<BankAccountListPage />} />

              {/* Team Routes */}
              <Route path="team/logs" element={<TeamMembers />} />

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
              <Route
                path="performance/my-task"
                element={<MyTaskManagement />}
              />
              <Route
                path="performance/team-task"
                element={<TeamTaskManagement />}
              />

              {/* Staff Routes */}
              <Route path="staff/employees" element={<StaffListPage />} />
              <Route path="staff/create" element={<CreateEmployeeMain />} />
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
