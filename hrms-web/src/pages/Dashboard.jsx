import TrackUserHistory from "../components/dashboard/TrackUserHistory";
import InterviewSessionNotifications from "../components/InterviewSessionChecker";
 import TeamsReport from "../components/TeamsReport/TeamsReport";
import useAuthStore from "../stores/authStore";

function Dashboard() {
  console.log("dash");
  const { user } = useAuthStore();
  return (
    <div className="h-[92vh] overflow-y-auto ">
      <TrackUserHistory user={user} />
      <InterviewSessionNotifications />
  <TeamsReport  user={user} />
    </div>
  );
}
export default Dashboard;
