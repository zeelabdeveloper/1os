import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
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
import { toast } from "react-hot-toast";
import InterviewSessionForm from "./InterviewSessionForm";

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const fetchInterviewSessions = async () => {
  const { data } = await axios.get(
    "/api/interviewSessions?populate=interviewRound,application"
  );
  return data;
};

const deleteInterviewSession = async (id) => {
  await axios.delete(`/api/interviewSessions/${id}`);
};

const InterviewSessionList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [form] = Form.useForm();

  const {
    data: sessions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["interviewSessions"],
    queryFn: fetchInterviewSessions,
  });

const deleteMutation = useMutation({
  mutationFn: deleteInterviewSession,
  onSuccess: () => {
    message.success("Interview session deleted successfully");
    refetch(); // still works the same way
  },
  onError: () => {
    message.error("Failed to delete interview session");
  },
});

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
    form.resetFields();
  };

  const getStatusTag = (status) => {
    const statusMap = {
      scheduled: { color: "blue", icon: <ClockCircleOutlined /> },
      in_progress: { color: "orange", icon: <ClockCircleOutlined /> },
      completed: { color: "green", icon: <CheckCircleOutlined /> },
      cancelled: { color: "red", icon: <CloseCircleOutlined /> },
      rescheduled: { color: "purple", icon: <ExclamationCircleOutlined /> },
    };
    return (
      <Tag icon={statusMap[status]?.icon} color={statusMap[status]?.color}>
        {status.replace("_", " ")}
      </Tag>
    );
  };

  const getOutcomeTag = (outcome) => {
    const outcomeMap = {
      selected: { color: "success", text: "Selected" },
      rejected: { color: "error", text: "Rejected" },
      hold: { color: "warning", text: "On Hold" },
      pending: { color: "default", text: "Pending" },
    };
    return (
      <Badge
        status={outcomeMap[outcome]?.color}
        text={outcomeMap[outcome]?.text}
      />
    );
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: ["application", "name"],
      key: "candidate",
      render: (text, record) => (
        <Space>
          <Avatar src={record.application?.photo} icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Interview Round",
      dataIndex: ["interviewRound", "name"],
      key: "round",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">
            Round {record.interviewRound?.roundNumber}
          </Text>
        </div>
      ),
    },
    {
      title: "Interviewer",
      dataIndex: ["interviewRound", "interviewer", "name"],
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
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
    {
      title: "Outcome",
      dataIndex: "outcome",
      key: "outcome",
      render: getOutcomeTag,
    },
    {
      title: "Actions",
      key: "actions",
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
    <div className="p-6">
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
          dataSource={sessions}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={
          selectedSession
            ? "Edit Interview Session"
            : "Schedule New Interview Session"
        }
        visible={isModalVisible}
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
