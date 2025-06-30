
import { Card, Skeleton, Tag, Empty } from "antd";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAuthStore from "../stores/authStore";
import axios from "../axiosConfig";
import InterviewSessionNotifications from "./InterviewSessionChecker";

const fetchInterviewRounds = async (userId) => {
  const response = await axios.get(
    `/api/v1/interview/interviewSessions/interview-rounds/by-interviewer/${userId}`
  );
  if (!response.data.success) {
    throw new Error(
      response.data.message || "Failed to fetch interview rounds"
    );
  }
  return response.data.data || [];
};

const InterviewRoundsPanel = () => {
  const { user } = useAuthStore();

  const { data: interviewRounds = [], isLoading } = useQuery({
    queryKey: ["interviewRounds", user?._id],
    queryFn: () => fetchInterviewRounds(user._id),
    enabled: !!user?._id,
    onSuccess: (data) => {
      if (data.length > 0) {
        toast.success(`You have ${data.length} interview rounds assigned`);
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to fetch interview rounds");
    },
  });

  // ✅ If no interview rounds, render nothing
  if (!isLoading && interviewRounds.length === 0) return null;

  return (
    <div className="flex flex-col lg:flex-row p-4 gap-4">
      {/* Left Side: Assigned Interview Rounds */}
      <div className="w-full lg:w-2/3">
        <Card
          title="Assigned Interview Rounds"
          bordered={false}
          className="shadow-md rounded-2xl"
        >
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <InterviewSessionNotifications />
            </div>
          )}
        </Card>
      </div>

      <div className="w-full lg:w-1/3">
        <Card
          title="Notifications"
          className="shadow-md rounded-2xl h-full max-h-[500px] overflow-y-auto"
        >
          {interviewRounds.length > 0 ? (
            interviewRounds.map((round, index) => (
              <div
                key={index}
                className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-sm"
              >
                <p className="text-blue-700 font-medium">
                  ✅ {round.name} (Round {round.roundNumber})
                </p>
              </div>
            ))
          ) : (
            <Empty description="No New Notifications" />
          )}
        </Card>
      </div>
    </div>
  );
};

export default InterviewRoundsPanel;
