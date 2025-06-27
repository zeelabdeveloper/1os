import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Loading from "./components/Loading";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./components/NotFound"));
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" reverseOrder={false} />
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                  <Home />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={lazyLoad("Dashboard")} />
                <Route path="categories" element={lazyLoad("Categories")} />
                <Route path="profiles" element={lazyLoad("Profile")} />
                
                <Route
                  path="/coco/userlist"
                  element={lazyLoad("Coco/UserList")}
                />
                <Route
                  path="/coco/createuser"
                  element={lazyLoad("Coco/CreateUser")}
                />
                <Route
                  path="/coco/attendance"
                  element={lazyLoad("Coco/Attendance")}
                />
                <Route
                  path="/coco/request-list"
                  element={lazyLoad("Coco/RequestList")}
                />
                {/* Accounts  */}
                <Route
                  path="/Account/list"
                  element={lazyLoad("Account/AccountList")}
                />

                {/* permissions */}

                <Route
                  path="/permission/departments"
                  element={lazyLoad("Permission/departments")}
                />
                <Route
                  path="/permission/roles"
                  element={lazyLoad("Permission/Roles")}
                />
                <Route
                  path="/permission/branches"
                  element={lazyLoad("Permission/branch")}
                />
                <Route
                  path="/permission/permissions-list"
                  element={lazyLoad("Permission/permissionlist")}
                />
                <Route
                  path="/permission/assign-permissions"
                  element={lazyLoad("Permission/AssignPermissions")}
                />

                {/* payroll */}
                <Route
                  path="/payroll/set-salary"
                  element={lazyLoad("PAYROLL/SetSalary")}
                />
                <Route
                  path="/payroll/pay-slip"
                  element={lazyLoad("payroll/PaySlip")}
                />
                {/* Content */}
                <Route
                  path="/content/letter"
                  element={lazyLoad("content/letter")}
                />
                <Route
                  path="/payroll/pay-slip"
                  element={lazyLoad("payroll/PaySlip")}
                />

                {/* store */}
                <Route
                  path="/store/storegroup"
                  element={lazyLoad("store/StoreGroup")}
                />

                <Route path="/store/staff" element={lazyLoad("store/Staff")} />
                <Route path="/store/roles" element={lazyLoad("store/Roles")} />

                {/* Performance Routes */}
                <Route
                  path="/performance/indicators"
                  element={lazyLoad("performance/indicators")}
                />
                <Route
                  path="/performance/goals"
                  element={lazyLoad("performance/goals")}
                />
                <Route
                  path="/performance/appraisals"
                  element={lazyLoad("performance/appraisals")}
                />
                <Route
                  path="/performance/feedback"
                  element={lazyLoad("performance/feedback")}
                />
                <Route
                  path="/performance/reviews"
                  element={lazyLoad("performance/reviews")}
                />

                {/* staff */}

                <Route
                  path="/staff/employees"
                  element={lazyLoad("staff/employee")}
                />
                <Route
                  path="/staff/create"
                  element={lazyLoad("staff/createemployee")}
                />
                <Route
                  path="/staff/employee"
                  element={lazyLoad("staff/ViewStaff")}
                />

                {/* Attendance */}

                <Route
                  path="/attendance/daily"
                  element={lazyLoad("attendance/daily")}
                />

                <Route
                  path="/attendance/monthly"
                  element={lazyLoad("attendance/monthly")}
                />
                <Route
                  path="/attendance/reports"
                  element={lazyLoad("attendance/report")}
                />

                {/* Hrms Systetm Setup */}

                <Route path="/1os/setup" element={lazyLoad("1os/setup")} />

                {/* Recruitment */}

                <Route
                  path="/recruitment/jobs"
                  element={lazyLoad("recruitment/jobs")}
                />
                <Route
                  path="/recruitment/create"
                  element={lazyLoad("recruitment/create")}
                />
                <Route
                  path="/recruitment/applications"
                  element={lazyLoad("recruitment/applications")}
                />
                <Route
                  path="/recruitment/application"
                  element={lazyLoad("recruitment/application")}
                />
                <Route
                  path="/recruitment/candidates"
                  element={lazyLoad("recruitment/candidates")}
                />
                <Route
                  path="/recruitment/onboarding"
                  element={lazyLoad("recruitment/onboarding")}
                />
                <Route
                  path="/recruitment/startonboarding"
                  element={lazyLoad("recruitment/startonboarding")}
                />
                <Route
                  path="/recruitment/interviews"
                  element={lazyLoad("recruitment/interview")}
                />

                {/* system Setting/ */}

                <Route path="/settings" element={lazyLoad("settings")} />
                <Route path="/developer-settings" element={lazyLoad("DeveloperSetting")} />
              </Route>

              <Route path="/login" element={<Login />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    </Router>
  );
};

export default App;

function lazyLoad(pageName) {
  const Component = lazy(() => import(`./pages/${pageName}`));
  return <Component />;
}