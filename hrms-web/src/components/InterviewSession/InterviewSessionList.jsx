import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
 
  Select,
 
  Card,
  Popconfirm,
  message,
  Badge,
  Avatar,
  Typography,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import InterviewSessionForm from "./InterviewSessionForm";
import toast from "react-hot-toast";

const { Text } = Typography;
const { Option } = Select;

const getCandidateIdFromUrl = () => {
  const query = new URLSearchParams(window.location.search);
  return query.get("id");
};

const candidateId = getCandidateIdFromUrl();

const fetchInterviewSessions = async () => {
  const { data } = await axios.get(
    `/api/v1/interview/interviewSessions/${candidateId}`
  );
  return data;
};

const deleteInterviewSession = async (id) => {
  await axios.delete(`/api/v1/interview/interviewSessions/${id}`);
};

const updateInterviewStatus = async ({ id, status , isOutCome   }) => {
  const { data } = await axios.patch(
    `/api/v1/interview/interviewSessions/${id}`,
    { status , isOutCome   }
  );
  return data;
};

const InterviewSessionList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const {
    data: sessions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["interviewSessions"],
    queryFn: fetchInterviewSessions,
  });
  console.log(sessions);
  const deleteMutation = useMutation({
    mutationFn: deleteInterviewSession,
    onSuccess: () => {
      toast.success("Interview session deleted successfully");
      
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete interview session");
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateInterviewStatus,
    onSuccess: (s) => {
      toast.success( s.message || "Status updated successfully");
      refetch();
    },
    onError: (err) => {
      console.log(err)
      toast.error( err.response.data.message ||  "Failed to update status");
    },
  });

  const handleStatusChange = (id, newStatus  , isOutCome  ) => {
    statusMutation.mutate({ id, status: newStatus  ,  isOutCome });
  };

  const handleEdit = (session) => {
    setSelectedSession(session);
    setIsModalVisible(true);
  };

  const handleCreate = () => {
    setSelectedSession(null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getStatusTag = (status, record) => {
    const statusMap = {
      scheduled: { color: "blue", icon: <ClockCircleOutlined /> },
      in_progress: { color: "orange", icon: <ClockCircleOutlined /> },
      completed: { color: "green", icon: <CheckCircleOutlined /> },
      cancelled: { color: "red", icon: <CloseCircleOutlined /> },
      rescheduled: { color: "purple", icon: <ExclamationCircleOutlined /> },
    };

    return (
      <Select
        defaultValue={status}
        style={{ width: 150 }}
        onChange={(value) => handleStatusChange(record._id, value)}
        bordered={false}
      >
        {Object.keys(statusMap).map((key) => (
          <Option key={key} value={key}>
            <Tag color={statusMap[key].color} icon={statusMap[key].icon}>
              {key.replace("_", " ")}
            </Tag>
          </Option>
        ))}
      </Select>
    );
  };

  const getOutcomeTag = (outcome, record) => {
    const outcomeMap = {
      selected: { color: "success", text: "Selected" },
      rejected: { color: "error", text: "Rejected" },
      hold: { color: "warning", text: "On Hold" },
      pending: { color: "default", text: "Pending" },
    };

    return (
      <Select
        defaultValue={outcome}
        style={{ width: 120 }}
        onChange={(value) => handleStatusChange(record._id, value ,  true  )}
        bordered={false}
      >
        {Object.keys(outcomeMap).map((key) => (
          <Option key={key} value={key}>
            <Badge status={outcomeMap[key].color} text={outcomeMap[key].text} />
          </Option>
        ))}
      </Select>
    );
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: ["application", "name"],
      key: "candidate",
      render: (text, record) => (
        <Space>
          <Avatar src={record.applicationId?.photo} icon={<UserOutlined />} />
          <div>
            <Text strong>{record.applicationId?.name}</Text>
            <br />
            <Text type="secondary">{record.applicationId?.email}</Text>
          </div>
        </Space>
      ),
    },
   
    {
      title: "Interview Round",
      dataIndex: ["interviewRound", "name"],
      key: "round",
      render: (text, record) => (
        <div>
          <Text strong>{record.interviewRoundId?.name}</Text>
          <br />
          <Text type="secondary">
            Round {record.interviewRoundId?.roundNumber}
          </Text>
        </div>
      ),
    },
    {
      title: "Interviewer",
      dataIndex: ["interviewRoundId", "interviewer", "fullName"],
      key: "interviewer",
      render: (text) => <Tag icon={<UserOutlined />}>{text}</Tag>,
    },
    {
      title: "Schedule",
      dataIndex: "startTime",
      key: "schedule",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            <CalendarOutlined /> {dayjs(record.startTime).format("DD MMM YYYY")}
          </Text>
          <Text type="secondary">
            {dayjs(record.startTime).format("h:mm A")} -{" "}
            {dayjs(record.endTime).format("h:mm A")}
          </Text>
          {record.meetingLink && (
            <a
              href={record.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Meeting
            </a>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => getStatusTag(status, record),
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      key: "outcome",
      render: (outcome, record) => getOutcomeTag(outcome, record),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this session?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="">
      <Card
        title="Interview Sessions"
        extra={
          <Button type="primary" onClick={handleCreate}>
            Schedule New Session
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={Array.isArray(sessions) && sessions}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
          bordered
        />
      </Card>

      <Modal
        title={selectedSession ? "Edit Session" : "New Session"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <InterviewSessionForm
          session={selectedSession}
          onSuccess={() => {
            setIsModalVisible(false);
            refetch();
          }}
        />
      </Modal>
    </div>
  );
};

export default InterviewSessionList;
