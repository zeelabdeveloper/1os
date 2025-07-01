// import React, { Suspense, lazy } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import Loading from "./components/Loading";
// import ErrorBoundary from "./components/ErrorBoundary";
// import ProtectedRoute from "./components/ProtectedRoute";
// const Home = lazy(() => import("./pages/Home"));
// const Login = lazy(() => import("./pages/Login"));
// const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
// const NotFound = lazy(() => import("./components/NotFound"));
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "react-hot-toast";

// const queryClient = new QueryClient();

// const App = () => {
//   return (
//     <Router>
//       <QueryClientProvider client={queryClient}>
//         <Toaster position="top-right" reverseOrder={false} />
//         <ErrorBoundary>
//           <Suspense fallback={<Loading />}>
//             <Routes>
//               <Route
//                 path="/"
//                 element={
//                   <ProtectedRoute>
//                     <Home />
//                   </ProtectedRoute>
//                 }
//               >
//                 <Route index element={<Navigate to="/" />} />
//                 <Route path="dashboard" element={lazyLoad("Dashboard")} />
//                 <Route path="/" element={lazyLoad("Dashboard")} />
//                 <Route path="categories" element={lazyLoad("Categories")} />
//                 <Route path="profiles" element={lazyLoad("Profile")} />

//                 <Route
//                   path="/coco/userlist"
//                   element={lazyLoad("Coco/UserList")}
//                 />
//                 <Route
//                   path="/coco/createuser"
//                   element={lazyLoad("Coco/CreateUser")}
//                 />
//                 <Route
//                   path="/coco/attendance"
//                   element={lazyLoad("Coco/Attendance")}
//                 />
//                 <Route
//                   path="/coco/request-list"
//                   element={lazyLoad("Coco/RequestList")}
//                 />
//                 <Route path="/coco/store" element={lazyLoad("Coco/Store")} />
//                 {/* Accounts  */}
//                 <Route
//                   path="/Account/list"
//                   element={lazyLoad("Account/AccountList")}
//                 />

//                 {/* Teams */}

//                 <Route path="/team/logs" element={lazyLoad("Team/Members")} />

//                 {/* permissions */}

//                 <Route
//                   path="/permission/departments"
//                   element={lazyLoad("Permission/departments")}
//                 />
//                 <Route
//                   path="/permission/roles"
//                   element={lazyLoad("Permission/Roles")}
//                 />
//                 <Route
//                   path="/permission/branches"
//                   element={lazyLoad("Permission/branch")}
//                 />
//                 <Route
//                   path="/permission/permissions-list"
//                   element={lazyLoad("Permission/permissionlist")}
//                 />
//                 <Route
//                   path="/permission/assign-permissions"
//                   element={lazyLoad("Permission/AssignPermissions")}
//                 />

//                 {/* payroll */}
//                 <Route
//                   path="/payroll/set-salary"
//                   element={lazyLoad("PAYROLL/SetSalary")}
//                 />
//                 <Route
//                   path="/payroll/pay-slip"
//                   element={lazyLoad("payroll/PaySlip")}
//                 />
//                 {/* Content */}
//                 <Route
//                   path="/content/letter"
//                   element={lazyLoad("content/letter")}
//                 />
//                 <Route
//                   path="/payroll/pay-slip"
//                   element={lazyLoad("payroll/PaySlip")}
//                 />

//                 {/* store */}
//                 <Route
//                   path="/store/storegroup"
//                   element={lazyLoad("store/StoreGroup")}
//                 />

//                 <Route path="/store/staff" element={lazyLoad("store/Staff")} />
//                 <Route path="/store/roles" element={lazyLoad("store/Roles")} />

//                 {/* Performance Routes */}
//                 <Route
//                   path="/performance/indicators"
//                   element={lazyLoad("performance/indicators")}
//                 />
//                 <Route
//                   path="/performance/goals"
//                   element={lazyLoad("performance/goals")}
//                 />
//                 <Route
//                   path="/performance/appraisals"
//                   element={lazyLoad("performance/appraisals")}
//                 />
//                 <Route
//                   path="/performance/appraisals/team"
//                   element={lazyLoad("performance/ManageTeamAppraisals")}
//                 />
//                 <Route
//                   path="/performance/appraisal"
//                   element={lazyLoad("performance/ManageMyAppraisals")}
//                 />
//                 <Route
//                   path="/performance/feedback"
//                   element={lazyLoad("performance/feedback")}
//                 />
//                 <Route
//                   path="/performance/reviews"
//                   element={lazyLoad("performance/reviews")}
//                 />

//                 {/* staff */}

//                 <Route
//                   path="/staff/employees"
//                   element={lazyLoad("staff/employee")}
//                 />
//                 <Route
//                   path="/staff/create"
//                   element={lazyLoad("staff/createemployee")}
//                 />
//                 <Route
//                   path="/staff/employee"
//                   element={lazyLoad("staff/ViewStaff")}
//                 />

//                 {/* Attendance */}

//                 <Route
//                   path="/attendance/daily"
//                   element={lazyLoad("attendance/daily")}
//                 />

//                 <Route
//                   path="/attendance/monthly"
//                   element={lazyLoad("attendance/monthly")}
//                 />
//                 <Route
//                   path="/attendance/reports"
//                   element={lazyLoad("attendance/report")}
//                 />

//                 {/* Hrms Systetm Setup */}

//                 <Route path="/1os/setup" element={lazyLoad("1os/setup")} />

//                 {/* Recruitment */}

//                 <Route
//                   path="/recruitment/jobs"
//                   element={lazyLoad("recruitment/jobs")}
//                 />
//                 <Route
//                   path="/recruitment/create"
//                   element={lazyLoad("recruitment/create")}
//                 />
//                 <Route
//                   path="/recruitment/applications"
//                   element={lazyLoad("recruitment/applications")}
//                 />
//                 <Route
//                   path="/recruitment/application"
//                   element={lazyLoad("recruitment/application")}
//                 />
//                 <Route
//                   path="/recruitment/candidates"
//                   element={lazyLoad("recruitment/candidates")}
//                 />
//                 <Route
//                   path="/recruitment/onboarding"
//                   element={lazyLoad("recruitment/onboarding")}
//                 />
//                 <Route
//                   path="/recruitment/startonboarding"
//                   element={lazyLoad("recruitment/startonboarding")}
//                 />
//                 <Route
//                   path="/recruitment/interviews"
//                   element={lazyLoad("recruitment/interview")}
//                 />

//                 {/* system Setting/ */}

//                 <Route path="/controllers" element={lazyLoad("settings")} />
//                 <Route
//                   path="/developer-settings"
//                   element={lazyLoad("DeveloperSetting")}
//                 />
//               </Route>

//               <Route path="/login" element={<Login />} />
//               <Route path="/forget-pass" element={<ForgotPassword />} />

//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </Suspense>
//         </ErrorBoundary>
//       </QueryClientProvider>
//     </Router>
//   );
// };

// export default App;

// function lazyLoad(pageName) {
//   const Component = lazy(() => import(`./pages/${pageName}`));
//   return <Component />;
// }

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
import Goals from "./pages/performance/goals";
import Appraisals from "./pages/performance/appraisals";
import ManageTeamAppraisals from "./pages/performance/ManageTeamAppraisals";
import ManageMyAppraisals from "./pages/performance/ManageMyAppraisals";
import Feedback from "./pages/performance/feedback";
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
              <Route index element={<Navigate to="/" />} />
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

              {/* Store Routes */}
              <Route path="store/storegroup" element={<StoreGroup />} />
              <Route path="store/staff" element={<Staff />} />

              {/* Performance Routes */}
              <Route path="performance/indicators" element={<Indicators />} />
              <Route path="performance/goals" element={<Goals />} />
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
              <Route path="developer-settings" element={<DeveloperSetting />} />
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
