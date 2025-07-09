import TrackUserHistory from "../components/dashboard/TrackUserHistory";
import InterviewSessionNotifications from "../components/InterviewSessionChecker";
// import TeamsReport from "../components/TeamsReport/TeamsReport";
import useAuthStore from "../stores/authStore";

// import SystemDashboard from "./DashBoardForSystem/SystemDashboard";

function Dashboard() {
    console.log("dash")
  const { user } = useAuthStore();
  return (
    <div className="h-[92vh] overflow-y-auto ">
      <TrackUserHistory user={user} />
      <InterviewSessionNotifications />
      {/* <TeamsReport /> */}
      {/* <SystemDashboard /> */}
    </div>
  );
}
export default Dashboard;
