 
import StaffDetails from "../../components/dashboard/StaffDetails";
import BranchAnalytics from "../../components/dashboard/BranchAnalytics";
import DepartmentAnalytics from "../../components/dashboard/DepartmentAnalytics";
import AttendanceAnalytics from "../../components/dashboard/AttendanceAnalytic";

function SystemDashboard() {
  return (
    <>
      <StaffDetails />
      <AttendanceAnalytics />
      <BranchAnalytics />
      <DepartmentAnalytics />
    
    </>
  );
}

export default SystemDashboard;
