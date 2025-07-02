import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  Tag,
  Space,
  Typography,
  Badge,
  Button,
  Select,
  Modal,
  Form,
  Input,
  Avatar,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useAuthStore from "../stores/authStore";
import axios from "../axiosConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const statusMap = {
  scheduled: { color: "blue", icon: <ClockCircleOutlined /> },
  in_progress: { color: "orange", icon: <ClockCircleOutlined /> },
  completed: { color: "green", icon: <CheckCircleOutlined /> },
  cancelled: { color: "red", icon: <CloseCircleOutlined /> },
  rescheduled: { color: "purple", icon: <ExclamationCircleOutlined /> },
};

const outcomeMap = {
  selected: { color: "success", text: "Selected" },
  rejected: { color: "error", text: "Rejected" },
  hold: { color: "warning", text: "On Hold" },
  pending: { color: "default", text: "Pending" },
};

const fetchSessions = async (id) => {
  const { data } = await axios.get(
    `/api/v1/interview/interviewSessions/by-interviewer/${id}`
  );
  if (!data.success)
    throw new Error(data.message || "Failed to fetch sessions");
  return data.data || [];
};

const updateSession = async ({ id, data }) => {
  const res = await axios.patch(
    `/api/v1/interview/interviewSessions/${id}`,
    data
  );
  return res.data;
};

const InterviewSessionNotifications = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [editVisible, setEditVisible] = useState(false);
  const [current, setCurrent] = useState(null);
  const navigate = useNavigate();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["interviewSessions", user?._id],
    queryFn: () => fetchSessions(user._id),
    enabled: !!user?._id,
  });
   
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return null;
  }

  const mutation = useMutation({
    mutationFn: updateSession,
    onSuccess: () => {
      toast.success("Session updated");
      queryClient.invalidateQueries(["interviewSessions", user?._id]);
      setEditVisible(false);
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Update failed"),
  });

  const grouped = useMemo(
    () => ({
      upcoming: sessions.filter((s) =>
        ["scheduled", "in_progress"].includes(s.status)
      ),
      completed: sessions.filter((s) => s.status === "completed"),
      others: sessions.filter(
        (s) => !["scheduled", "in_progress", "completed"].includes(s.status)
      ),
    }),
    [sessions]
  );

  const handleChange = useCallback(
    (id, value, type) => {
      mutation.mutate({
        id,
        data:
          type === "status"
            ? { status: value }
            : { status: value, isOutCome: true },
      });
    },
    [mutation]
  );

  const openEdit = useCallback(
    (session) => {
      setCurrent(session);
      form.setFieldsValue({ notes: session.notes, feedback: session.feedback });
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
      <div className="flex justify-between items-start">
        <div>
          <Space size="small" className="m-2">
            <Badge status={statusMap[session.status]?.color} />
            <Text strong>{session.interviewRoundId?.name}</Text>
          </Space>
          <Space size="middle">
            <Avatar
              src={session.applicationId?.photo}
              icon={<UserOutlined />}
              size="small"
            />
            <Text
              className="cursor-pointer !text-blue-700"
              onClick={() =>
                navigate(
                  `/recruitment/application?id=${session.applicationId._id}`
                )
              }
            >
              {session.applicationId?.name}
            </Text>
          </Space>
          <Text type="secondary" className="block mt-2 text-sm">
            <ClockCircleOutlined className="mr-1" />
            {dayjs(session.startTime).format("MMM D, h:mm A")}
            {session.endTime
              ? ` - ${dayjs(session.endTime).format("h:mm A")}`
              : ""}
          </Text>
        </div>
        <div className="text-right">
          {showSelect && (
            <Select
              value={session.status}
              bordered={false}
              onChange={(v) => handleChange(session._id, v, "status")}
              style={{ width: 150 }}
              className="mb-2"
            >
              {Object.entries(statusMap).map(([key, val]) => (
                <Option key={key} value={key}>
                  <Tag icon={val.icon} color={val.color}>
                    {key.replace("_", " ")}
                  </Tag>
                </Option>
              ))}
            </Select>
          )}
          {session.meetingLink && (
            <Button
              type="link"
              href={session.meetingLink}
              target="_blank"
              className="p-0"
            >
              Join Meeting
            </Button>
          )}
        </div>
      </div>
    ),
    [navigate, handleChange]
  );

  const OutcomeSelect = useCallback(
    ({ session }) => (
      <Select
        value={session.outcome || "pending"}
        bordered={false}
        style={{ width: 150 }}
        onChange={(v) => handleChange(session._id, v, "outcome")}
      >
        {Object.entries(outcomeMap).map(([key, val]) => (
          <Option key={key} value={key}>
            <Badge status={val.color} text={val.text} />
          </Option>
        ))}
      </Select>
    ),
    [handleChange]
  );

  const SessionCard = useCallback(
    ({ session, showStatusSelect, outcomeSelect }) => (
      <Card
        key={session._id}
        className={`border ${
          session.status === "cancelled"
            ? "border-red-100 bg-red-50"
            : "border-gray-100"
        }`}
        actions={
          outcomeSelect
            ? [
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => openEdit(session)}
                >
                  Add Feedback
                </Button>,
              ]
            : []
        }
      >
        <CardHeader session={session} showSelect={showStatusSelect} />
        {outcomeSelect && (
          <div className="mt-2">
            <OutcomeSelect session={session} />
          </div>
        )}
        {session.notes && (
          <div className="mt-3">
            <Text type="secondary" className="block text-sm">
              Notes:
            </Text>
            <Text>{session.notes}</Text>
          </div>
        )}
      </Card>
    ),
    [CardHeader, OutcomeSelect, openEdit]
  );

  if (isLoading) return <div className="p-4">Loading interviews...</div>;

  return (
    <div className="p-4">
      <Card title="Interview Notifications" bordered={false}>
        <Space direction="vertical" className="w-full">
          {["upcoming", "completed", "others"].map(
            (type) =>
              grouped[type]?.length > 0 && (
                <div key={type}>
                  <Text strong className="text-lg capitalize">
                    {type} Interviews
                  </Text>
                  <Divider />
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
              )
          )}
        </Space>
      </Card>

      <Modal
        title={`Feedback for ${current?.applicationId?.name || "Candidate"}`}
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Add your notes..." />
          </Form.Item>
          <Form.Item name="feedback" label="Feedback">
            <TextArea rows={4} placeholder="Add detailed feedback..." />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isLoading}
            >
              Save Feedback
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InterviewSessionNotifications;
