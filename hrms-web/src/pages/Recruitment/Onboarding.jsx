// import React from "react";
// import {
//   Table,
//   Tag,
//   Space,
//   Button,
  
//   Skeleton,
//   Alert,
//   Card,
//   Typography,
// } from "antd";
// import {
//   SolutionOutlined,
//   CheckCircleOutlined,
//   RocketOutlined,
  
//   UserOutlined,
//   MailOutlined,
//   ClockCircleOutlined,
// } from "@ant-design/icons";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   fetchHiredApplications,
//   updateApplicationStatus,
// } from "../../api/jobs";
// import toast from "react-hot-toast";

// const { Title, Text } = Typography;

// const ApplicationList = () => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();

//   const {
//     data: applications = [],
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["applications"],
//     queryFn: fetchHiredApplications,
//     select: (data) =>
//       data.filter(
//         (app) => app.status === "hired" || app.status === "onboarding"
//       ),
//   });

//   const { mutateAsync: startOnboarding } = useMutation({
//     mutationFn: updateApplicationStatus,
//     onSuccess: () => {
//       queryClient.invalidateQueries(["applications"]);
//       toast.success("Onboarding Initiated successfully!");
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || "internal server error");
//     },
//   });

//   const handleStartOnboarding = async (id) => {
//     try {
//       await startOnboarding({ id, status: "onboarding" });
//     } catch (err) {
//       toast.error("Failed to start onboarding.");
//     }
//   };

//   const columns = [
//     {
//       title: (
//         <Text strong>
//           <UserOutlined /> Name
//         </Text>
//       ),
//       dataIndex: "name",
//       key: "name",
//       render: (text, record) => (
//         <a
//           onClick={() => navigate(`/recruitment/application?id=${record._id}`)}
//           style={{ color: "#1890ff", fontWeight: 600 }}
//         >
//           {text}
//         </a>
//       ),
//     },
//     {
//       title: (
//         <Text strong>
//           <MailOutlined /> Email
//         </Text>
//       ),
//       dataIndex: "email",
//       key: "email",
//       render: (email) => <Text style={{ color: "#722ed1" }}>{email}</Text>,
//     },
//     {
//       title: (
//         <Text strong>
//           <SolutionOutlined /> Status
//         </Text>
//       ),
//       dataIndex: "status",
//       key: "status",
//       render: (status) => (
//         <Tag
//           color={status === "hired" ? "green" : "blue"}
//           icon={
//             status === "hired" ? <CheckCircleOutlined /> : <SolutionOutlined />
//           }
//           style={{ fontWeight: 600 }}
//         >
//           {status.toUpperCase()}
//         </Tag>
//       ),
//     },
//     {
//       title: (
//         <Text strong>
//           <ClockCircleOutlined /> Applied On
//         </Text>
//       ),
//       dataIndex: "appliedAt",
//       key: "appliedAt",
//       render: (date) => (
//         <Tag color="volcano" style={{ fontWeight: 500 }}>
//           {new Date(date).toLocaleDateString()}
//         </Tag>
//       ),
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <Space size="middle">
//           {record.status === "hired" && (
//             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//               <Button
//                 type="primary"
//                 icon={<RocketOutlined />}
//                 style={{
//                   background: "#13c2c2",
//                   borderColor: "#13c2c2",
//                   fontWeight: "bold",
//                 }}
//                 onClick={() => handleStartOnboarding(record._id)}
//               >
//                 Start Onboarding
//               </Button>
//             </motion.div>
//           )}

//           {record.status === "onboarding" && (
//             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//               <Button
//                 type="default"
//                 icon={<SolutionOutlined />}
//                 style={{
//                   fontWeight: "bold",
//                   color: "#1d39c4",
//                   borderColor: "#1d39c4",
//                 }}
//                 onClick={() =>
//                   navigate(`/recruitment/startonboarding?id=${record._id}`)
//                 }
//               >
//                 Continue Onboarding
//               </Button>
//             </motion.div>
//           )}
//         </Space>
//       ),
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div style={{ padding: "40px" }}>
//         <Skeleton active paragraph={{ rows: 10 }} />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div style={{ padding: "40px" }}>
//         <Alert
//           message="Error"
//           description={error.message}
//           type="error"
//           showIcon
//         />
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "10px" }}      className="h-[92vh] overflow-y-auto">
//       <Card
//         bordered={false}
//         style={{
//           boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
//           borderRadius: "20px",
//         }}
//       >
//         <div style={{ marginBottom: "24px" }}>
//           <Title level={3} style={{ color: "#13c2c2" }}>
//             <SolutionOutlined style={{ marginRight: 10 }} />
//             Onboarding Candidates
//           </Title>
//           <Text type="secondary">
//             Manage candidates who are in the hiring or onboarding phase.
//           </Text>
//         </div>

//         <Table
//           columns={columns}
//           dataSource={applications}
//           rowKey="_id"
//           bordered
//           pagination={{ pageSize: 8 }}
//           locale={{
//             emptyText: "No candidates in hired or onboarding status",
//           }}
//         />
//       </Card>
//     </div>
//   );
// };

// export default ApplicationList;








import React from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Skeleton,
  Alert,
  Card,
  Typography,
  Progress,
} from "antd";
import {
  SolutionOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fetchHiredApplications,
  updateApplicationStatus,
} from "../../api/jobs";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const ApplicationList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: applications = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchHiredApplications,
    select: (data) =>
      data.filter(
        (app) => app.status === "hired" || app.status === "onboarding"
      ),
  });

  const { mutateAsync: startOnboarding } = useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["applications"]);
      toast.success("Onboarding Initiated successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "internal server error");
    },
  });

  const handleStartOnboarding = async (id) => {
    try {
      await startOnboarding({ id, status: "onboarding" });
    } catch (err) {
      toast.error("Failed to start onboarding.");
    }
  };

  const getOnboardingProgress = (onboarding) => {
    if (!onboarding) return 0;
    
    const totalSteps = 5; // InterviewSession, Document, Asset, Trainings, Letters
    let completedSteps = 0;
    
    if (onboarding.InterviewSession?.length > 0) completedSteps++;
    if (onboarding.Document?.length > 0) completedSteps++;
    if (onboarding.Asset?.length > 0) completedSteps++;
    if (onboarding.Trainings?.length > 0) completedSteps++;
    if (onboarding.Letters?.length > 0) completedSteps++;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "in_progress":
        return "blue";
      case "completed":
        return "green";
      case "terminated":
        return "red";
      default:
        return "gray";
    }
  };

  const columns = [
    {
      title: (
        <Text strong>
          <UserOutlined /> Name
        </Text>
      ),
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a
          onClick={() => navigate(`/recruitment/application?id=${record._id}`)}
          style={{ color: "#1890ff", fontWeight: 600 }}
        >
          {text}
        </a>
      ),
    },
    {
      title: (
        <Text strong>
          <MailOutlined /> Email
        </Text>
      ),
      dataIndex: "email",
      key: "email",
      render: (email) => <Text style={{ color: "#722ed1" }}>{email}</Text>,
    },
    {
      title: (
        <Text strong>
          <SolutionOutlined /> Status
        </Text>
      ),
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Space direction="vertical">
          <Tag
            color={status === "hired" ? "green" : "blue"}
            icon={
              status === "hired" ? <CheckCircleOutlined /> : <SolutionOutlined />
            }
            style={{ fontWeight: 600 }}
          >
            {status.toUpperCase()}
          </Tag>
          {status === "onboarding" && record.onboarding && (
            <Tag color={getStatusColor(record.onboarding.overallStatus)}>
              {record.onboarding.overallStatus.replace('_', ' ').toUpperCase()}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: (
        <Text strong>
          <ClockCircleOutlined /> Progress
        </Text>
      ),
      dataIndex: "onboarding",
      key: "progress",
      render: (onboarding, record) => (
        record.status === "onboarding" ? (
          <Progress 
            percent={getOnboardingProgress(onboarding)} 
            status={
              onboarding?.overallStatus === "completed" ? "success" : 
              onboarding?.overallStatus === "terminated" ? "exception" : "active"
            }
          />
        ) : (
          <Tag color="default">Not Started</Tag>
        )
      ),
    },
    {
      title: (
        <Text strong>
          <ClockCircleOutlined /> Applied On
        </Text>
      ),
      dataIndex: "appliedAt",
      key: "appliedAt",
      render: (date) => (
        <Tag color="volcano" style={{ fontWeight: 500 }}>
          {new Date(date).toLocaleDateString()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "hired" && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="primary"
                icon={<RocketOutlined />}
                style={{
                  background: "#13c2c2",
                  borderColor: "#13c2c2",
                  fontWeight: "bold",
                }}
                onClick={() => handleStartOnboarding(record._id)}
              >
                Start Onboarding
              </Button>
            </motion.div>
          )}

          {record.status === "onboarding" && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="default"
                icon={<SolutionOutlined />}
                style={{
                  fontWeight: "bold",
                  color: "#1d39c4",
                  borderColor: "#1d39c4",
                }}
                onClick={() =>
                  navigate(`/recruitment/startonboarding?id=${record._id}`)
                }
              >
                {record.onboarding?.overallStatus === "completed" 
                  ? "View Onboarding" 
                  : "Continue Onboarding"}
              </Button>
            </motion.div>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ padding: "40px" }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: "40px" }}>
        <Alert
          message="Error"
          description={error.message}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "10px" }} className="h-[92vh] overflow-y-auto">
      <Card
        bordered={false}
        style={{
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          borderRadius: "20px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <Title level={3} style={{ color: "#13c2c2" }}>
            <SolutionOutlined style={{ marginRight: 10 }} />
            Onboarding Candidates
          </Title>
          <Text type="secondary">
            Manage candidates who are in the hiring or onboarding phase.
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="_id"
          bordered
          pagination={{ pageSize: 8 }}
          locale={{
            emptyText: "No candidates in hired or onboarding status",
          }}
        />
      </Card>
    </div>
  );
};

export default ApplicationList;







