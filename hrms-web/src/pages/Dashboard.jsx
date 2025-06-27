import InterviewRoundsPanel from "../components/InterviewRoundUserChecker";
import useAuthStore from "../stores/authStore";
import SystemDashboard from "./DashBoardForSystem/SystemDashboard";

function Dashboard() {
  const { user } = useAuthStore();
  return (
    <div className="h-[92vh] overflow-y-auto ">
      <InterviewRoundsPanel />
      <SystemDashboard />
    </div>
  );
}
export default Dashboard;
