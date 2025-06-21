import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  TimePicker,
  Alert,
  Statistic,
  Row,
  Col,
  Calendar,
  Badge,
  notification,
  Spin,
  Tooltip,
} from "antd";
import {
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { MdOutlinePendingActions } from "react-icons/md";
import { FcApproval } from "react-icons/fc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import {
  fetchTodayAttendance,
  monthlyUserAttendance,
  userCheckIn,
  userCheckOut,
} from "../../../api/attendance";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

const DailyAttendance = ({ user }) => {
  const [form] = Form.useForm();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  // Fetch current time from API
  const { data: serverTime, isLoading: timeLoading } = useQuery({
    queryKey: ["serverTime"],
    queryFn: async () => {
       const now = dayjs(); // or new Date() if you prefer plain JS
    console.log("Local Time:", now.format());
    return now;
    },
    staleTime: 60000,
    onError: () => dayjs(),
  });

  // Fetch today's attendance
  const { data: todayAttendance } = useQuery({
    queryKey: ["todayAttendance", user._id],
    queryFn: () => fetchTodayAttendance(user),
  });

  // Fetch monthly attendance for calendar
  const { data: monthlyAttendance } = useQuery({
    queryKey: ["monthlyAttendance", user._id, selectedDate.format("YYYY-MM")],
    queryFn: () =>
      monthlyUserAttendance({ userId: user._id, selectedDate: selectedDate }),
  });

  const checkInMutation = useMutation({
    mutationFn: userCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries(["todayAttendance", user._id]);
      queryClient.invalidateQueries(["monthlyAttendance"]);
      setIsModalVisible(false);
      api.success({
        message: "Checked In Successfully",
        description: "Your attendance has been recorded.",
      });
    },
    onError: (error) => {
      api.error({
        message: "Check In Failed",
        description: error.response?.data?.message || "Unable to check in",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: userCheckOut,
    onSuccess: () => {
      queryClient.invalidateQueries(["todayAttendance", user._id]);
      queryClient.invalidateQueries(["monthlyAttendance"]);
      setIsModalVisible(false);
      api.success({
        message: "Checked Out Successfully",
        description: "Your attendance has been recorded.",
      });
    },
    onError: (error) => {
      api.error({
        message: "Check Out Failed",
        description: error.response?.data?.message || "Unable to check out",
      });
    },
  });

  // Get current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser. Contact your system administrator."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        });
        api.info({
          message: "Location Updated",
          description: `You are currently at ${position.coords.latitude.toFixed(
            6
          )}, ${position.coords.longitude.toFixed(6)}`,

          duration: 6,
        });
        setError(null);
      },
      (err) => {
        setError("Location access denied. Please enable location services.");
        api.warning({
          message: "Location Disabled",
          description:
            "Attendance requires location access. Please enable it in your browser settings. Or Contact +917027944324",
          duration: 6,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleCheckIn = () => {
    if (!location) {
      api.warning({
        message: "Location Required",
        description: "Please enable location services to check in.",
      });
      getLocation();
      return;
    }

    form.setFieldsValue({
      checkInTime: serverTime || dayjs(),
      location: `${location.lat}, ${location.lng}`,
      remarks: "",
    });
    setIsModalVisible(true);
  };

  const handleCheckOut = () => {
    if (!location) {
      api.warning({
        message: "Location Required",
        description: "Please enable location services to check out.",
      });
      getLocation();
      return;
    }

    form.setFieldsValue({
      checkOutTime: serverTime || dayjs(),
      location: `${location.lat}, ${location.lng}`,
      remarks: "",
    });
    setIsModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) {
        checkOutMutation.mutate({ ...values, _id: user._id });
      } else {
        checkInMutation.mutate({ ...values, _id: user._id });
      }
    });
  };

  const getStatus = () => {
    if (!todayAttendance) return "Not Checked In";
    if (todayAttendance.checkInTime && !todayAttendance.checkOutTime)
      return "Checked In";
    if (todayAttendance.checkOutTime) return "Checked Out";
    return "Absent";
  };

  const dateCellRender = (value) => {
    if (!monthlyAttendance) return null;

    const dateStr = value.format("YYYY-MM-DD");
    const record = monthlyAttendance?.find(
      (item) => dayjs(item.date).format("YYYY-MM-DD") === dateStr
    );

    if (!record) return null;

    const content = (
      <div className="text-xs space-y-1">
        <p>
          <strong>Status:</strong> {record.status || "N/A"}
        </p>
        {record.leaveType && (
          <p>
            <strong>Leave Type:</strong> {record.leaveType}
          </p>
        )}
        {record.checkInTime && (
          <p>
            <strong>Check-In:</strong>{" "}
            {dayjs(record.checkInTime).format("hh:mm A")}
          </p>
        )}
        {record.checkOutTime && (
          <p>
            <strong>Check-Out:</strong>{" "}
            {dayjs(record.checkOutTime).format("hh:mm A")}
          </p>
        )}
        {typeof record.hoursWorked === "number" && (
          <p>
            <strong>Hours Worked:</strong> {record.hoursWorked.toFixed(2)}
          </p>
        )}
        {record.location && (
          <p>
            <strong>Location:</strong> {record.location}
          </p>
        )}
        {record.remarks && (
          <p>
            <strong>Remarks:</strong> {record.remarks}
          </p>
        )}
        {record.isApproved !== undefined && (
          <p>
            <strong>Approval:</strong>{" "}
            {record.isApproved
              ? "Approved"
              : record.rejectionReason
              ? `Rejected (${record.rejectionReason})`
              : "Pending"}
          </p>
        )}
      </div>
    );

    return (
      <Tooltip title={content}   placement="topLeft">
        <div className={`calendar-day-status space-y-1 p-1 rounded text-white text-center ${
      record.status === "present"
        ? "bg-green-500"
        : record.status === "absent"
        ? "bg-red-500"
        : record.status === "leave" || record.status === "Casual Leave"
        ? "bg-yellow-500"
        : "bg-gray-400"
    }`}>
          {record.checkInTime && (
            <Badge
              status="processing"
              text={
                <p className="text-[10px]">
                  {dayjs(record.checkInTime).format("hh:mm A")}
                </p>
              }
            />
          )}
          {record.checkOutTime && (
            <Badge
              status="warning"
              text={
                <p className="text-[10px]">
                  {dayjs(record.checkOutTime).format("hh:mm A")}
                </p>
              }
            />
          )}
        </div>
      </Tooltip>
    );
  };

  return (
    <div>
      {contextHolder}
      <Title level={3}>Daily Attendance</Title>
      <Text type="secondary">
        {serverTime
          ? serverTime.format("dddd, MMMM D, YYYY [•] h:mm A")
          : dayjs().format("dddd, MMMM D, YYYY")}
      </Text>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Statistic
                title="Current Status"
                value={getStatus()}
                prefix={<ClockCircleOutlined />}
              />

              <Row gutter={16}>
                <Col span={12}>
                  {!todayAttendance?.checkInTime && (
                    <Button
                      type="primary"
                      icon={<LoginOutlined />}
                      size="large"
                      onClick={handleCheckIn}
                      loading={checkInMutation.isLoading || timeLoading}
                      block
                    >
                      Check In
                    </Button>
                  )}

                  {todayAttendance?.checkInTime &&
                    !todayAttendance?.checkOutTime && (
                      <Button
                        type="primary"
                        icon={<LogoutOutlined />}
                        size="large"
                        onClick={handleCheckOut}
                        loading={checkOutMutation.isLoading || timeLoading}
                        danger
                        block
                      >
                        Check Out
                      </Button>
                    )}

                  {todayAttendance?.checkInTime &&
                    todayAttendance?.checkOutTime && (
                      <Alert
                        message="You have completed your attendance for today"
                        type="success"
                        showIcon
                      />
                    )}
                </Col>
                <Col span={12}>
                  <Button
                    icon={<EnvironmentOutlined />}
                    size="large"
                    onClick={getLocation}
                    block
                  >
                    {location ? "Update Location" : "Enable Location"}
                  </Button>
                </Col>
              </Row>

              {location && (
                <Alert
                  message={`Current Location: ${location.lat}, ${location.lng}`}
                  type="info"
                  showIcon
                />
              )}
              {error && (
                <Alert
                  message={error}
                  type="warning"
                  showIcon
                  action={
                    <Button size="small" type="text" onClick={getLocation}>
                      Retry
                    </Button>
                  }
                />
              )}
            </Space>
          </Card>

          <Card title="Today's Summary" style={{ marginTop: 16 }}>
            {todayAttendance ? (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Text strong>Check In:</Text>{" "}
                  <Text>
                    {dayjs(todayAttendance.checkInTime).format("h:mm A")}
                  </Text>
                </div>
                {todayAttendance.checkOutTime && (
                  <div>
                    <Text strong>Check Out:</Text>{" "}
                    <Text>
                      {dayjs(todayAttendance.checkOutTime).format("h:mm A")}
                    </Text>
                  </div>
                )}
                {todayAttendance.hoursWorked && (
                  <div>
                    <Text strong>Hours Worked:</Text>{" "}
                    <Text>{todayAttendance.hoursWorked.toFixed(2)} hours</Text>
                  </div>
                )}
                <div>
                  <Text strong>Location:</Text>{" "}
                  <Text>{todayAttendance.location || "Not recorded"}</Text>
                </div>
                {todayAttendance.remarks && (
                  <div>
                    <Text strong>Remarks:</Text>{" "}
                    <Text>{todayAttendance.remarks}</Text>
                  </div>
                )}
              </Space>
            ) : (
              <Text>No attendance record for today</Text>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Attendance Calendar</span>
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  queryClient.invalidateQueries(["monthlyAttendance"]);
                }}
              />
            }
          >
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              dateCellRender={dateCellRender}
              headerRender={({ value, onChange }) => (
                <div style={{ padding: 8, textAlign: "center" }}>
                  <Button.Group>
                    <Button
                      onClick={() => onChange(value.subtract(1, "month"))}
                    >
                      Previous
                    </Button>
                    <Button onClick={() => onChange(dayjs())}>Today</Button>
                    <Button onClick={() => onChange(value.add(1, "month"))}>
                      Next
                    </Button>
                  </Button.Group>
                  <div style={{ marginTop: 8, fontSize: 18 }}>
                    {value.format("MMMM YYYY")}
                  </div>
                </div>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          todayAttendance?.checkInTime
            ? "Check Out Confirmation"
            : "Check In Confirmation"
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={checkInMutation.isLoading || checkOutMutation.isLoading}
        okText={todayAttendance?.checkInTime ? "Check Out" : "Check In"}
      >
        <Spin spinning={timeLoading}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="location"
              label="Location Coordinates"
              rules={[{ required: true, message: "Location is required" }]}
            >
              <Input prefix={<EnvironmentOutlined />} disabled />
            </Form.Item>
            {todayAttendance?.checkInTime ? (
              <Form.Item
                name="checkOutTime"
                label="Check Out Time"
                rules={[
                  { required: true, message: "Check out time is required" },
                ]}
              >
                <TimePicker
                  format="h:mm A"
                  style={{ width: "100%" }}
                  showNow={false}
                  disabled={timeLoading}
                />
              </Form.Item>
            ) : (
              <Form.Item
                name="checkInTime"
                label="Check In Time"
                rules={[
                  { required: true, message: "Check in time is required" },
                ]}
              >
                <TimePicker
                  format="h:mm A"
                  style={{ width: "100%" }}
                  showNow={false}
                  disabled={timeLoading}
                />
              </Form.Item>
            )}
            <Form.Item name="remarks" label="Remarks (Optional)">
              <Input.TextArea
                rows={3}
                placeholder="Enter any remarks about your attendance..."
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default DailyAttendance;
