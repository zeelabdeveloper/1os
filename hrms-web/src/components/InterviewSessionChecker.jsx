import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  Tag,
  Space,
  Typography,
  Button,
  Select,
  DatePicker,
  Input,
  Avatar,
  Divider,
  Spin,
  List,
  Descriptions,
  Collapse,
} from "antd";
import {
  ClockCircleOutlined,
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  FilterOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SolutionOutlined,
  BookOutlined,
  WarningOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import useAuthStore from "../stores/authStore";
import axios from "../axiosConfig";
import toast from "react-hot-toast";

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const STATUS_FILTER_OPTIONS = [
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "in_progress", label: "In Progress", color: "orange" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
];

const OUTCOME_FILTER_OPTIONS = [
  { value: "selected", label: "Selected", color: "green" },
  { value: "rejected", label: "Rejected", color: "red" },
  { value: "hold", label: "On Hold", color: "orange" },
  { value: "pending", label: "Pending", color: "blue" },
];

const fetchInterviewerSessions = async (interviewerId) => {
  const { data } = await axios.get(
    `/api/v1/interview/interviewSessions/by-interviewer/${interviewerId}`
  );
  return data.data || [];
};

const updateInterviewStatus = async ({ id, isOutCome, status }) => {
  const { data } = await axios.patch(
    `/api/v1/interview/interviewSessions/${id}`,
    {
      isOutCome,
      status,
    }
  );
  return data;
};

const InterviewSessionManager = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [expandedRows, setExpandedRows] = useState([]);

  // State for filters
  const [statusFilter, setStatusFilter] = useState([]);
  const [outcomeFilter, setOutcomeFilter] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [searchText, setSearchText] = useState("");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["interviewSessions", user?._id],
    queryFn: () => fetchInterviewerSessions(user._id),
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: updateInterviewStatus,
    onSuccess: (data) => {
      toast.success(data.message || "Status updated successfully");
      queryClient.invalidateQueries(["interviewSessions", user?._id]);
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "Can't Update!");
    },
  });

  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        if (statusFilter.length > 0 && !statusFilter.includes(session.status)) {
          return false;
        }
        if (
          outcomeFilter.length > 0 &&
          (!session.outcome || !outcomeFilter.includes(session.outcome))
        ) {
          return false;
        }
        if (dateRange.length === 2) {
          const sessionDate = dayjs(session.startTime);
          if (
            sessionDate.isBefore(dateRange[0], "day") ||
            sessionDate.isAfter(dateRange[1], "day")
          ) {
            return false;
          }
        }
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          if (
            !session.applicationId?.name?.toLowerCase().includes(searchLower) &&
            !session.interviewRoundId?.name?.toLowerCase().includes(searchLower)
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => dayjs(b.startTime).diff(dayjs(a.startTime)));
  }, [sessions, statusFilter, outcomeFilter, dateRange, searchText]);

  const handleStatusChange = useCallback(
    (sessionId, isOutCome, newStatus) => {
      mutation.mutate({ id: sessionId, isOutCome, status: newStatus });
    },
    [mutation]
  );

  const resetFilters = useCallback(() => {
    setStatusFilter([]);
    setOutcomeFilter([]);
    setDateRange([]);
    setSearchText("");
  }, []);

  const toggleExpandRow = useCallback((sessionId) => {
    setExpandedRows((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );
  }, []);

  const renderField = (icon, value, label) => {
    if (!value) return null;
    return (
      <Descriptions.Item
        label={
          <span className="flex items-center gap-1">
            {icon}
            <span>{label}</span>
          </span>
        }
      >
        {value}
      </Descriptions.Item>
    );
  };

  if (sessions?.length == 0) {
    return null;
  }

  return (
    <div className="p-4">
      <Card
        title={
          <div className="flex justify-between items-center">
            <Title level={4} className="mb-0">
              My Interview Sessions
            </Title>
            <div className="flex items-center gap-2">
              <Button icon={<FilterOutlined />} onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        }
        bordered={false}
      >
        {/* Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Search by candidate or round"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          <Select
            mode="multiple"
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            optionRender={({ value, label, color }) => (
              <Tag color={color}>{label}</Tag>
            )}
          />

          <Select
            mode="multiple"
            placeholder="Filter by outcome"
            value={outcomeFilter}
            onChange={setOutcomeFilter}
            options={OUTCOME_FILTER_OPTIONS}
            optionRender={({ value, label, color }) => (
              <Tag color={color}>{label}</Tag>
            )}
          />

          <RangePicker
            style={{ width: "100%" }}
            value={dateRange}
            onChange={setDateRange}
          />
        </div>

        <Divider className="my-2" />

        {/* Session List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading sessions..." />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <Text type="secondary">
              No sessions found matching your filters
            </Text>
          </div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={filteredSessions}
            renderItem={(session) => (
              <Card
                key={session._id}
                className="mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleExpandRow(session._id)}
              >
                <div className="flex flex-col md:flex-row justify-between w-full">
                  {/* Basic Info (always shown) */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <Avatar
                        src={session.applicationId?.photo}
                        icon={<UserOutlined />}
                      />
                      <div>
                        <Text strong>{session.applicationId?.name}</Text>
                        <div className="text-sm text-gray-500">
                          {session.interviewRoundId?.name} (Round{" "}
                          {session.interviewRoundId?.roundNumber})
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <CalendarOutlined />
                        <Text>
                          {dayjs(session.startTime).format("MMM D, YYYY")}
                        </Text>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockCircleOutlined />
                        <Text>
                          {dayjs(session.startTime).format("h:mm A")} -{" "}
                          {dayjs(session.endTime).format("h:mm A")}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0">
                    <Select
                      value={session.status}
                      onChange={(value) =>
                        handleStatusChange(session._id, false, value)
                      }
                      style={{ width: 150 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {STATUS_FILTER_OPTIONS.map(({ value, label, color }) => (
                        <Option key={value} value={value}>
                          <Tag color={color}>{label}</Tag>
                        </Option>
                      ))}
                    </Select>

                    {session.status === "completed" && (
                      <Select
                        value={session.outcome || "pending"}
                        onChange={(value) =>
                          handleStatusChange(session._id, true, value)
                        }
                        style={{ width: 150 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {OUTCOME_FILTER_OPTIONS.map(
                          ({ value, label, color }) => (
                            <Option key={value} value={value}>
                              <Tag color={color}>{label}</Tag>
                            </Option>
                          )
                        )}
                      </Select>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRows.includes(session._id) && (
                  <div className="mt-4 pt-4 border-t">
                    <Descriptions column={2} bordered size="small">
                      {renderField(
                        <MailOutlined />,
                        session.applicationId?.email,
                        "Email"
                      )}
                      {renderField(
                        <PhoneOutlined />,
                        session.applicationId?.phone,
                        "Phone"
                      )}
                      {renderField(
                        <EnvironmentOutlined />,
                        session.applicationId?.currentLocation,
                        "Location"
                      )}
                      {renderField(
                        <SolutionOutlined />,
                        session.applicationId?.position,
                        "Position"
                      )}
                      {renderField(
                        <TeamOutlined />,
                        session.applicationId?.currentCompany,
                        "Current Company"
                      )}
                      {renderField(
                        <BookOutlined />,
                        session.applicationId?.education,
                        "Education"
                      )}
                      {renderField(
                        <DollarOutlined />,
                        session.applicationId?.salary,
                        "Expected Salary"
                      )}
                      {renderField(
                        <WarningOutlined />,
                        session.applicationId?.weaknesses,
                        "Weaknesses"
                      )}
                      {session.notes && (
                        <Descriptions.Item label="Notes" span={2}>
                          {session.notes}
                        </Descriptions.Item>
                      )}
                      {session.feedback && (
                        <Descriptions.Item label="Feedback" span={2}>
                          {session.feedback}
                        </Descriptions.Item>
                      )}
                      {console.log(session)}
                      {session?.applicationId?.resume && (
                        <Descriptions.Item label="Resume" span={2}>
                          <a
                            href={`${import.meta.env.VITE_BACKEND_URL}${
                              session?.applicationId?.resume
                            }`}
                            target="_blank"
                          >
                            Download
                          </a>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </div>
                )}
              </Card>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default InterviewSessionManager;
