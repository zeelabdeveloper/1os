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
  Empty,
  Alert,
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

const statusMap = {
  scheduled: { color: "blue", icon: <ClockCircleOutlined />, text: "Scheduled" },
  in_progress: { color: "orange", icon: <ClockCircleOutlined />, text: "In Progress" },
  completed: { color: "green", icon: <CheckCircleOutlined />, text: "Completed" },
  cancelled: { color: "red", icon: <CloseCircleOutlined />, text: "Cancelled" },
  rescheduled: { color: "purple", icon: <ExclamationCircleOutlined />, text: "Rescheduled" },
};

const outcomeMap = {
  selected: { color: "success", text: "Selected", icon: <CheckCircleOutlined /> },
  rejected: { color: "error", text: "Rejected", icon: <CloseCircleOutlined /> },
  hold: { color: "warning", text: "On Hold", icon: <ExclamationCircleOutlined /> },
  pending: { color: "default", text: "Pending", icon: <ClockCircleOutlined /> },
};

const fetchSessions = async (id) => {
  const { data } = await axios.get(`/api/v1/interview/interviewSessions/by-interviewer/${id}`);
  if (!data.success) throw new Error(data.message || "Failed to fetch sessions");
  return data.data || [];
};

const updateSession = async ({ id, data }) => {
  const res = await axios.patch(`/api/v1/interview/interviewSessions/${id}`, data);
  return res.data;
};

const InterviewSessionNotifications = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [editVisible, setEditVisible] = useState(false);
  const [current, setCurrent] = useState(null);
  const navigate = useNavigate();

  const { 
    data: sessions = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["interviewSessions", user?._id],
    queryFn: () => fetchSessions(user._id),
    enabled: !!user?._id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateSession,
    onSuccess: () => {
      toast.success("Session updated successfully");
      queryClient.invalidateQueries(["interviewSessions", user?._id]);
      setEditVisible(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update session");
    },
  });

  const grouped = useMemo(() => {
    if (!Array.isArray(sessions)) return { upcoming: [], completed: [], others: [] };
    
    return {
      upcoming: sessions.filter((s) => 
        ["scheduled", "in_progress"].includes(s.status) && 
        dayjs(s.startTime).isAfter(dayjs().subtract(1, 'hour'))
      ),
      completed: sessions.filter((s) => s.status === "completed"),
      others: sessions.filter(
        (s) => !["scheduled", "in_progress", "completed"].includes(s.status) ||
        (["scheduled", "in_progress"].includes(s.status) && dayjs(s.startTime).isBefore(dayjs()))
      ),
    };
  }, [sessions]);

  const handleChange = useCallback(
    (id, value, type) => {
      mutation.mutate({
        id,
        data: type === "status" ? { status: value } : { outcome: value },
      });
    },
    [mutation]
  );

  const openEdit = useCallback(
    (session) => {
      setCurrent(session);
      form.setFieldsValue({ 
        notes: session.notes, 
        feedback: session.feedback,
        strengths: session.strengths,
        areasForImprovement: session.areasForImprovement,
      });
      setEditVisible(true);
    },
    [form]
  );

  const handleSave = useCallback(
    (values) => {
      mutation.mutate({ id: current._id, data: values });
    },
    [mutation, current]
  );

  const CardHeader = useCallback(
    ({ session, showSelect }) => (
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <Space size="small" className="mb-2">
            <Tag 
              icon={statusMap[session.status]?.icon} 
              color={statusMap[session.status]?.color}
              className="capitalize"
            >
              {statusMap[session.status]?.text}
            </Tag>
            <Text strong className="text-lg">
              {session.interviewRoundId?.name}
            </Text>
          </Space>
          
          <Space size="middle" className="mb-2">
            <Avatar
              src={session.applicationId?.photo}
              icon={<UserOutlined />}
              size="small"
            />
            <Text
              className="cursor-pointer !text-blue-600 hover:!text-blue-800"
              onClick={() => navigate(`/recruitment/application?id=${session.applicationId._id}`)}
            >
              {session.applicationId?.name}
            </Text>
          </Space>
          
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center text-gray-600">
              <CalendarOutlined className="mr-1" />
              {dayjs(session.startTime).format("MMM D, YYYY")}
            </div>
            <div className="flex items-center text-gray-600">
              <ClockCircleOutlined className="mr-1" />
              {dayjs(session.startTime).format("h:mm A")}
              {session.endTime ? ` - ${dayjs(session.endTime).format("h:mm A")}` : ""}
            </div>
            {session.meetingLink && (
              <Button
                type="link"
                href={session.meetingLink}
                target="_blank"
                icon={<VideoCameraOutlined />}
                className="p-0 text-blue-600"
              >
                Join Meeting
              </Button>
            )}
          </div>
        </div>
        
        {showSelect && (
          <Select
            value={session.status}
            bordered={false}
            onChange={(v) => handleChange(session._id, v, "status")}
            style={{ minWidth: 150 }}
            dropdownMatchSelectWidth={false}
          >
            {Object.entries(statusMap).map(([key, val]) => (
              <Option key={key} value={key}>
                <Tag icon={val.icon} color={val.color} className="capitalize">
                  {val.text}
                </Tag>
              </Option>
            ))}
          </Select>
        )}
      </div>
    ),
    [navigate, handleChange]
  );

  const OutcomeSelect = useCallback(
    ({ session }) => (
      <Select
        value={session.outcome || "pending"}
        bordered={false}
        style={{ minWidth: 150 }}
        onChange={(v) => handleChange(session._id, v, "outcome")}
        dropdownMatchSelectWidth={false}
      >
        {Object.entries(outcomeMap).map(([key, val]) => (
          <Option key={key} value={key}>
            <Space>
              {React.cloneElement(val.icon, { style: { color: val.color } })}
              {val.text}
            </Space>
          </Option>
        ))}
      </Select>
    ),
    [handleChange]
  );

  const SessionCard = useCallback(
    ({ session, showStatusSelect, outcomeSelect }) => {
      const isPastSession = dayjs(session.startTime).isBefore(dayjs());
      
      return (
        <Card
          key={session._id}
          className={`session-card ${session.status === "cancelled" ? "cancelled-session" : ""} ${
            isPastSession ? "past-session" : ""
          }`}
          actions={
            outcomeSelect
              ? [
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(session)}
                    className="text-blue-600"
                  >
                    Add Feedback
                  </Button>,
                ]
              : []
          }
        >
          <CardHeader session={session} showSelect={showStatusSelect} />
          
          {outcomeSelect && (
            <div className="mt-4">
              <Text strong className="block mb-1">
                Outcome:
              </Text>
              <OutcomeSelect session={session} />
            </div>
          )}
          
          {session.notes && (
            <div className="mt-4">
              <Text strong className="block mb-1">
                Notes:
              </Text>
              <Text className="whitespace-pre-line">{session.notes}</Text>
            </div>
          )}
        </Card>
      );
    },
    [CardHeader, OutcomeSelect, openEdit]
  );

  if (!user?._id) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading interview sessions..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Error loading interview sessions"
        description={error.message}
        type="error"
        showIcon
        className="m-4"
      />
    );
  }

  if (!Array.isArray(sessions) || sessions.length === 0) {
    return (
      <Empty
        description="No interview sessions assigned"
        className="m-8"
      />
    );
  }

  return (
    <div className="interview-sessions-container">
      <Card 
        title={<Title level={4}>My Interview Sessions</Title>} 
        bordered={false}
        className="shadow-sm"
      >
        <Space direction="vertical" className="w-full" size="large">
          {["upcoming", "completed", "others"].map((type) => {
            if (grouped[type]?.length === 0) return null;
            
            return (
              <div key={type} className="session-group">
                <Text strong className="text-lg capitalize block mb-2">
                  {type.replace("_", " ")} Interviews
                </Text>
                <Divider className="my-2" />
                <Space direction="vertical" className="w-full" size="middle">
                  {grouped[type].map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      showStatusSelect={type === "upcoming"}
                      outcomeSelect={type === "completed"}
                    />
                  ))}
                </Space>
              </div>
            );
          })}
        </Space>
      </Card>

      <Modal
        title={
          <Space>
            <Avatar src={current?.applicationId?.photo} size="small" />
            <span>
              Feedback for {current?.applicationId?.name || "Candidate"}
            </span>
          </Space>
        }
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="notes" label="Quick Notes">
              <TextArea rows={3} placeholder="Brief notes about the interview..." />
            </Form.Item>
            <Form.Item name="feedback" label="Detailed Feedback">
              <TextArea rows={3} placeholder="Comprehensive feedback for the candidate..." />
            </Form.Item>
            <Form.Item name="strengths" label="Strengths">
              <TextArea rows={2} placeholder="Candidate's strengths..." />
            </Form.Item>
            <Form.Item name="areasForImprovement" label="Areas for Improvement">
              <TextArea rows={2} placeholder="Areas where candidate can improve..." />
            </Form.Item>
          </div>
          
          <Form.Item className="mt-4">
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={mutation.isLoading}
                className="min-w-24"
              >
                Save
              </Button>
              <Button 
                onClick={() => setEditVisible(false)}
                disabled={mutation.isLoading}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InterviewSessionNotifications;