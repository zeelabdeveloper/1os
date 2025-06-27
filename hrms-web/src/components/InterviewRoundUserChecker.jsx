// import React, { useEffect, useState } from "react";
// import { Table, Card, Skeleton, Empty, Tag } from "antd";
// import useAuthStore from "../stores/authStore";
// import { toast } from "react-hot-toast";
// import axios from "../axiosConfig";

// const InterviewRoundsPanel = () => {
//   const { user } = useAuthStore();
//   const [loading, setLoading] = useState(true);
//   const [interviewRounds, setInterviewRounds] = useState([]);
//   const [hasRounds, setHasRounds] = useState(false);

//   useEffect(() => {
//     const fetchInterviewRounds = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `/api/v1/interview/interviewSessions/interview-rounds/by-interviewer/${user._id}`
//         );

//         if (response.data.success) {
//           setInterviewRounds(response.data.data);
//           const hasAssignedRounds = response.data.data.length > 0;
//           setHasRounds(hasAssignedRounds);

//           if (hasAssignedRounds) {
//             toast.success(
//               `You have ${response.data.data.length} interview rounds`
//             );
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching interview rounds:", error);
//         toast.error(
//           error.response?.data?.message || "Failed to fetch interview rounds"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?._id) {
//       fetchInterviewRounds();
//     }
//   }, [user]);

//   const columns = [
//     {
//       title: "Round Name",
//       dataIndex: "name",
//       key: "name",
//       render: (text) => <strong>{text}</strong>,
//     },
//     {
//       title: "Round Number",
//       dataIndex: "roundNumber",
//       key: "roundNumber",
//       align: "center",
//       render: (num) => <Tag color="blue">Round {num}</Tag>,
//     },
//     {
//       title: "Description",
//       dataIndex: "description",
//       key: "description",
//       ellipsis: true,
//     },
//     {
//       title: "Created At",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       render: (date) => new Date(date).toLocaleDateString(),
//     },
//   ];

//   if (loading) {
//     return (
//       <Card title="Your Interview Rounds" style={{ margin: "20px" }}>
//         <Skeleton active paragraph={{ rows: 4 }} />
//       </Card>
//     );
//   }

//   // Don't render anything if no rounds are assigned
//   if (!hasRounds) {
//     return null;
//   }

//   return (
//     <div style={{ padding: "24px" }}>
//       <Card title="Your Assigned Interview Rounds" bordered={false}>
//         <Table
//           columns={columns}
//           dataSource={Array.isArray(interviewRounds) && interviewRounds}
//           rowKey="_id"
//           pagination={{ pageSize: 5 }}
//           scroll={{ x: true }}
//         />
//       </Card>
//     </div>
//   );
// };

// export default InterviewRoundsPanel;


import React, { useEffect, useState } from "react";
import { Card, Skeleton, Tag, Empty } from "antd";
import useAuthStore from "../stores/authStore";
import { toast } from "react-hot-toast";
import axios from "../axiosConfig";

const InterviewRoundsPanel = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [interviewRounds, setInterviewRounds] = useState([]);

  useEffect(() => {
    const fetchInterviewRounds = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/v1/interview/interviewSessions/interview-rounds/by-interviewer/${user._id}`
        );

        if (response.data.success) {
          setInterviewRounds(response.data.data || []);
          if (response.data.data.length > 0) {
            toast.success(
              `You have ${response.data.data.length} interview rounds assigned`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching interview rounds:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch interview rounds"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchInterviewRounds();
    }
  }, [user]);

  return (
    <div className="flex flex-col lg:flex-row p-4 gap-4">
      {/* Left Side: Assigned Interview Rounds */}
      <div className="w-full lg:w-2/3">
        <Card
          title="Assigned Interview Rounds"
          bordered={false}
          className="shadow-md rounded-2xl"
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : interviewRounds.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {interviewRounds.map((round) => (
                <Card
                  key={round._id}
                  className="border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold text-blue-600">
                    {round.name}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-sm">
                    <Tag color="blue">Round {round.roundNumber}</Tag>
                    <span className="text-gray-500">
                      {new Date(round.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {round.description || "No description provided."}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="No Interview Rounds Assigned" />
          )}
        </Card>
      </div>

      {/* Right Side: Notification Slider */}
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
                <p className="text-gray-600 text-sm">
                  Scheduled on:{" "}
                  <strong>
                    {new Date(round.createdAt).toLocaleDateString()}
                  </strong>
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
