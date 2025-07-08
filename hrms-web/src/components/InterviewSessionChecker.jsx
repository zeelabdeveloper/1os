import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  Tag,
  Space,
  Typography,
  Button,
  Select,
  Modal,
  Form,
  Input,
  Avatar,
  Divider,
  Spin,
  Alert,
  Collapse,
  Descriptions,
  Empty,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import useAuthStore from "../stores/authStore";
import axios from "../axiosConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const statusOptions = [
  {
    value: "scheduled",
    label: "Scheduled",
    color: "blue",
    icon: <ClockCircleOutlined />,
  },
  {
    value: "in_progress",
    label: "In Progress",
    color: "orange",
    icon: <ClockCircleOutlined />,
  },
  {
    value: "completed",
    label: "Completed",
    color: "green",
    icon: <CheckCircleOutlined />,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "red",
    icon: <CloseCircleOutlined />,
  },
  {
    value: "rescheduled",
    label: "Rescheduled",
    color: "purple",
    icon: <ExclamationCircleOutlined />,
  },
];

const outcomeOptions = [
  {
    value: "selected",
    label: "Selected",
    color: "green",
    icon: <CheckCircleOutlined />,
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "red",
    icon: <CloseCircleOutlined />,
  },
  {
    value: "hold",
    label: "On Hold",
    color: "orange",
    icon: <ExclamationCircleOutlined />,
  },
  {
    value: "pending",
    label: "Pending",
    color: "blue",
    icon: <ClockCircleOutlined />,
  },
];

const fetchInterviewerSessions = async (interviewerId) => {
  const { data } = await axios.get(
    `/api/v1/interview/interviewSessions/by-interviewer/${interviewerId}`
  );
  if (!data.success)
    throw new Error(data.message || "Failed to fetch sessions");
  return data.data || [];
};

const updateInterviewSession = async ({ id, updateData }) => {
  const { data } = await axios.patch(
    `/api/v1/interview/interviewSessions/${id}`,
    updateData
  );
  return data;
};

const InterviewSessionManager = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const navigate = useNavigate();

  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["interviewSessions", user?._id],
    queryFn: () => fetchInterviewerSessions(user._id),
    enabled: !!user?._id,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: updateInterviewSession,
    onSuccess: (data) => {
      toast.success(data.message || "Session updated successfully");
      queryClient.invalidateQueries(["interviewSessions", user?._id]);
      setIsModalVisible(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update session");
    },
  });

  const handleStatusChange = (sessionId, newStatus) => {
    mutation.mutate({
      id: sessionId,
      updateData: { status: newStatus },
    });
  };

  const handleOutcomeChange = (sessionId, newOutcome) => {
    mutation.mutate({
      id: sessionId,
      updateData: { isOutCome: true, status: newOutcome },
    });
  };

  const handleOpenEditModal = (session) => {
    setCurrentSession(session);
    form.setFieldsValue({
      feedback: session.feedback || "",
      notes: session.notes || "",
      meetingLink: session.meetingLink || "",
      recordingLink: session.recordingLink || "",
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      mutation.mutate({
        id: currentSession._id,
        updateData: values,
      });
    } catch (err) {
      console.error("Validation error:", err);
    }
  };

  const groupedSessions = useMemo(() => {
    const now = dayjs();
    return {
      upcoming: sessions.filter(
        (s) =>
          ["scheduled", "in_progress"].includes(s.status) &&
          dayjs(s.endTime).isAfter(now)
      ),
      completed: sessions.filter(
        (s) =>
          s.status === "completed" ||
          (["scheduled", "in_progress"].includes(s.status) &&
            dayjs(s.endTime).isBefore(now))
      ),
      others: sessions.filter((s) =>
        ["cancelled", "rescheduled"].includes(s.status)
      ),
    };
  }, [sessions]);

  const renderSessionCard = (session) => {
    const statusConfig = statusOptions.find(
      (opt) => opt.value === session.status
    );
    const outcomeConfig = outcomeOptions.find(
      (opt) => opt.value === (session.outcome || "pending")
    );
    const isCompleted =
      session.status === "completed" ||
      dayjs(session.endTime).isBefore(dayjs());

    return (
      <Card
        key={session._id}
        className="mb-4 shadow-sm"
        actions={[
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(session)}
          >
            Edit Feedback
          </Button>,
        ]}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <Space>
                <Tag icon={statusConfig?.icon} color={statusConfig?.color}>
                  {statusConfig?.label}
                </Tag>
                <Text strong className="text-lg">
                  {session.interviewRoundId?.name}
                </Text>
              </Space>

              <Tag color={outcomeConfig?.color} icon={outcomeConfig?.icon}>
                {outcomeConfig?.label}
              </Tag>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Avatar
                src={session.applicationId?.photo}
                icon={<UserOutlined />}
                size="small"
              />
              <Text
                className="text-blue-600 hover:underline cursor-pointer"
                onClick={() =>
                  navigate(
                    `/recruitment/application?id=${session.applicationId?._id}`
                  )
                }
              >
                {session.applicationId?.name}
              </Text>
            </div>

            <Descriptions size="small" column={1}>
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> Date
                  </>
                }
              >
                {dayjs(session.startTime).format("MMM D, YYYY")}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <ClockCircleOutlined /> Time
                  </>
                }
              >
                {dayjs(session.startTime).format("h:mm A")} -{" "}
                {dayjs(session.endTime).format("h:mm A")}
              </Descriptions.Item>
              {session.meetingLink && (
                <Descriptions.Item
                  label={
                    <>
                      <VideoCameraOutlined /> Meeting Link
                    </>
                  }
                >
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Meeting
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Collapse ghost className="mt-2">
              <Collapse.Panel header="Quick Actions" key="actions">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text strong className="block mb-2">
                      Update Status
                    </Text>
                    <Select
                      value={session.status}
                      onChange={(v) => handleStatusChange(session._id, v)}
                      style={{ width: "100%" }}
                    >
                      {statusOptions.map((opt) => (
                        <Select.Option key={opt.value} value={opt.value}>
                          <Tag color={opt.color} icon={opt.icon}>
                            {opt.label}
                          </Tag>
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Text strong className="block mb-2">
                      Update Outcome
                    </Text>
                    <Select
                      value={session.outcome || "pending"}
                      onChange={(v) => handleOutcomeChange(session._id, v)}
                      style={{ width: "100%" }}
                    >
                      {outcomeOptions.map((opt) => (
                        <Select.Option key={opt.value} value={opt.value}>
                          <Tag color={opt.color} icon={opt.icon}>
                            {opt.label}
                          </Tag>
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Collapse.Panel>
              {(session.notes || session.feedback) && (
                <Collapse.Panel header="Notes & Feedback" key="feedback">
                  {session.feedback && (
                    <div className="mb-3">
                      <Text strong className="block">
                        Feedback:
                      </Text>
                      <Text className="whitespace-pre-line">
                        {session.feedback}
                      </Text>
                    </div>
                  )}
                  {session.notes && (
                    <div>
                      <Text strong className="block">
                        Private Notes:
                      </Text>
                      <Text className="whitespace-pre-line">
                        {session.notes}
                      </Text>
                    </div>
                  )}
                </Collapse.Panel>
              )}
            </Collapse>
          </div>
        </div>
      </Card>
    );
  };

  if (!user?._id) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading your interview sessions..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Error loading sessions"
        description={error.message}
        type="error"
        showIcon
        className="m-4"
      />
    );
  }

  if (sessions.length === 0) {
    return (
     null
    );
  }

  return (
    <div className="p-4">
      <Card
        title={<Title level={4}>My Interview Sessions</Title>}
        bordered={false}
        className="shadow-sm"
      >
        {Object.entries(groupedSessions).map(([group, groupSessions]) => {
          if (groupSessions.length === 0) return null;

          return (
            <div key={group} className="mb-6">
              <Text strong className="text-lg capitalize block mb-2">
                {group} ({groupSessions.length})
              </Text>
              <Divider className="my-2" />
              <div className="space-y-4">
                {groupSessions.map((session) => renderSessionCard(session))}
              </div>
            </div>
          );
        })}
      </Card>

      <Modal
        title={`Session Feedback - ${
          currentSession?.interviewRoundId?.name || "Interview"
        }`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={mutation.isLoading}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 gap-4">
            <Form.Item name="notes" label="Private Notes">
              <TextArea
                readOnly
                rows={1}
                placeholder="Internal notes about the session..."
              />
            </Form.Item>
            <Form.Item name="feedback" label="Candidate Feedback">
              <TextArea
                rows={4}
                placeholder="Detailed feedback about the candidate..."
              />
            </Form.Item>

            <Form.Item name="recordingLink" label="Recording Link">
              <Input
                placeholder="https://recording.example.com/your-recording"
                prefix={<LinkOutlined />}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default InterviewSessionManager;
