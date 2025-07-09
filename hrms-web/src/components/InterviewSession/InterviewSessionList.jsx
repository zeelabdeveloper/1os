 

import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Avatar,
  Typography,
  Badge,
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

// Memoized components to prevent unnecessary re-renders
const MemoizedAvatar = React.memo(Avatar);
const MemoizedTag = React.memo(Tag);
const MemoizedButton = React.memo(Button);
const MemoizedText = React.memo(Text);

const getCandidateIdFromUrl = () => {
  const query = new URLSearchParams(window.location.search);
  return query.get("id");
};

const fetchInterviewSessions = async (candidateId) => {
  const { data } = await axios.get(
    `/api/v1/interview/interviewSessions/${candidateId}`
  );
  return data;
};

const deleteInterviewSession = async (id) => {
  await axios.delete(`/api/v1/interview/interviewSessions/${id}`);
};

const updateInterviewStatus = async ({ id, status, isOutCome }) => {
  const { data } = await axios.patch(
    `/api/v1/interview/interviewSessions/${id}`,
    { status, isOutCome }
  );
  return data;
};

const InterviewSessionList = () => {
  const candidateId = useMemo(() => getCandidateIdFromUrl(), []);
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Query for interview sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["interviewSessions", candidateId],
    queryFn: () => fetchInterviewSessions(candidateId),
    staleTime: 500,
  });
console.log(sessions)
  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteInterviewSession,
    onSuccess: () => {
      toast.success("Interview session deleted successfully");
      queryClient.invalidateQueries(["interviewSessions", candidateId]);
    },
    onError: () => {
      toast.error("Failed to delete interview session");
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateInterviewStatus,
    onSuccess: (s) => {
      toast.success(s.message || "Status updated successfully");
      queryClient.invalidateQueries(["interviewSessions", candidateId]);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  // Memoized handlers
  const handleStatusChange = useCallback(
    (id, newStatus, isOutCome) => {
      statusMutation.mutate({ id, status: newStatus, isOutCome });
    },
    [statusMutation]
  );

  const handleEdit = useCallback((session) => {
    setSelectedSession(session);
    setIsModalVisible(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedSession(null);
    setIsModalVisible(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  // Memoized status and outcome tag components
  const getStatusTag = useCallback((status, record) => {
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
        {/* {Object.keys(statusMap).map((key) => (
          <Option key={key} value={key}>
            <MemoizedTag color={statusMap[key].color} icon={statusMap[key].icon}>
              {key.replace("_", " ")}
            </MemoizedTag>
          </Option>
        ))} */}
      </Select>
    );
  }, [handleStatusChange]);

  const getOutcomeTag = useCallback((outcome, record) => {
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
        onChange={(value) => handleStatusChange(record._id, value, true)}
        bordered={false}
        
      >
        {/* {Object.keys(outcomeMap).map((key) => (
          <Option key={key} value={key}>
            <Badge status={outcomeMap[key].color} text={outcomeMap[key].text} />
          </Option>
        ))} */}
      </Select>
    );
  }, [handleStatusChange]);

  // Memoized table columns
  const columns = useMemo(() => [
    {
      title: "Candidate",
      dataIndex: ["application", "name"],
      key: "candidate",
      render: (text, record) => (
        <Space>
          <MemoizedAvatar src={record.applicationId?.photo} icon={<UserOutlined />} />
          <div>
            <MemoizedText strong>{record.applicationId?.name}</MemoizedText>
            <br />
            <MemoizedText type="secondary">{record.applicationId?.email}</MemoizedText>
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
          <MemoizedText strong>{record.interviewRoundId?.name}</MemoizedText>
          <br />
          <MemoizedText type="secondary">
            Round {record.interviewRoundId?.roundNumber}
          </MemoizedText>
        </div>
      ),
    },
    {
      title: "Interviewer",
      dataIndex: ["interviewRoundId", "interviewer", "fullName"],
      key: "interviewer",
      render: (text) => <MemoizedTag icon={<UserOutlined />}>{text}</MemoizedTag>,
    },
    {
      title: "Schedule",
      dataIndex: "startTime",
      key: "schedule",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <MemoizedText>
            <CalendarOutlined /> {dayjs(record.startTime).format("DD MMM YYYY")}
          </MemoizedText>
          <MemoizedText type="secondary">
            {dayjs(record.startTime).format("h:mm A")} -{" "}
            {dayjs(record.endTime).format("h:mm A")}
          </MemoizedText>
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
          <MemoizedButton
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
            <MemoizedButton type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ], [getStatusTag, getOutcomeTag, handleEdit, deleteMutation]);

  return (
    <div className="">
      <Card
        title="Interview Sessions"
        extra={
          <MemoizedButton type="primary" onClick={handleCreate}>
            Schedule New Session
          </MemoizedButton>
        }
      >
        <Table
          columns={columns}
          dataSource={Array.isArray(sessions) ? sessions : []}
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
            queryClient.invalidateQueries(["interviewSessions", candidateId]);
          }}
        />
      </Modal>
    </div>
  );
};

export default React.memo(InterviewSessionList);





 