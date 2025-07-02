import TrackUserHistory from "../components/dashboard/TrackUserHistory";
import InterviewSessionNotifications from "../components/InterviewSessionChecker";
import useAuthStore from "../stores/authStore";

import SystemDashboard from "./DashBoardForSystem/SystemDashboard";

function Dashboard() {
  const { user } = useAuthStore();
  return (
    <div className="h-[92vh] overflow-y-auto ">
      <TrackUserHistory user={user} />
      <InterviewSessionNotifications />
      {/* <SystemDashboard /> */}
    </div>
  );
}
export default Dashboard;
