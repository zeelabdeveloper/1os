import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Avatar,
  Divider,
  Tag,
  message,
  Modal,
  Spin,
  Progress,
  Badge,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import moment from "moment";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";

const AttendanceApprovalPopup = () => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch pending attendance requests
  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ["pendingAttendance"],
    queryFn: async () => {
      const { data } = await axios.get(
        "/api/v1/attendance/getAttendanceRecords?isApproved=false&limit=100"
      );

      return data.data;
    },
  });
  console.log(pendingRequests);
  const currentRequest = pendingRequests[currentIndex] || null;
  const { user } = useAuthStore();
  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) =>
      axios.put(`/api/v1/attendance/${id}`, {
        approvedBy: user?._id,
        status: "approved",
        isApproved: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingAttendance"]);
      toast.success("Attendance approved successfully!");
      moveToNext();
    },
    onError: (ee) => {
      toast.error(
        ee?.response?.data?.message || "Failed to approve attendance"
      );
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (id) =>
      axios.put(`/api/v1/attendance/${id}`, {
        approvedBy: user?._id,
        status: "rejected",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingAttendance"]);
      toast.error("Attendance rejected!");
      moveToNext();
    },
    onError: (ee) => {
      console.log(ee)
      toast.error(ee?.response?.data?.message || "Failed to reject attendance");
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          moveToNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveToPrevious();
          break;
        case "Enter":
          e.preventDefault();
          handleApprove();
          break;
        case "Delete":
          e.preventDefault();
          handleReject();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, currentIndex, pendingRequests]);

  const showModal = () => {
    setIsModalOpen(true);
    setCurrentIndex(0);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleApprove = () => {
    if (!currentRequest) return;
    approveMutation.mutate(currentRequest._id);
  };

  const handleReject = () => {
    if (!currentRequest) return;
    rejectMutation.mutate(currentRequest._id);
  };

  const moveToNext = () => {
    if (currentIndex < pendingRequests.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      message.info("No more pending requests");
      setIsModalOpen(false);
    }
  };

  const moveToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Calculate late minutes
  const calculateLateMinutes = (checkInTime) => {
    if (!checkInTime) return 0;
    const checkIn = moment(checkInTime);
    const expectedTime = moment(checkIn).set({ hour: 9, minute: 30 }); // 9:00 AM
    return Math.max(0, checkIn.diff(expectedTime, "minutes"));
  };

  return (
    <div>
      <Badge count={pendingRequests.length} overflowCount={9}>
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={showModal}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Review Attendance Requests
        </Button>
      </Badge>

      <Modal
        title={`Attendance Approval (${currentIndex + 1}/${
          pendingRequests.length
        })`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={900}
        centered
        className="max-w-[95vw]"
        destroyOnClose
      >
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationCircleOutlined className="text-3xl text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              No pending attendance requests
            </p>
          </div>
        ) : (
          <Card
            className="border-0"
            actions={[
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprove}
                loading={approveMutation.isLoading}
                className="bg-green-500 hover:bg-green-600"
                block
              >
                Approve (Enter)
              </Button>,
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleReject}
                loading={rejectMutation.isLoading}
                block
              >
                Reject (Delete)
              </Button>,
            ]}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* User Info Section */}
              <div className="w-full md:w-1/3">
                <div className="flex flex-col items-center mb-4">
                  <Avatar
                    size={120}
                    src={currentRequest?.userId?.Profile?.photo}
                    icon={<UserOutlined />}
                    className="mb-3  border-2 border-blue-200"
                  />
                  <h2 className="text-xl font-semibold text-center">
                    {currentRequest?.userId?.fullName || "Unknown User"}
                  </h2>
                  <p className="text-gray-500">
                    {currentRequest?.userId?.EmployeeId?.employeeId || "N/A"}
                  </p>
                </div>

                <Divider />

                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">
                      {moment(currentRequest?.date).format("DD MMM YYYY")}
                    </span>
                  </div>
                  {currentRequest?.leaveType && (
                    <div className="flex items-center">
                      <CalendarOutlined className="text-blue-500 mr-2" />
                      <span className="font-medium">Leave type:</span>
                      <span className="ml-2">{currentRequest?.leaveType}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <ClockCircleOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium">Time In:</span>
                    <Tag
                      color={
                        calculateLateMinutes(currentRequest?.checkInTime) > 0
                          ? "orange"
                          : "green"
                      }
                      className="ml-2"
                    >
                      {currentRequest?.checkInTime
                        ? moment(currentRequest?.checkInTime).format("hh:mm A")
                        : "N/A"}
                      {calculateLateMinutes(currentRequest?.checkInTime) > 0 &&
                        ` (Late by ${calculateLateMinutes(
                          currentRequest?.checkInTime
                        )} mins)`}
                    </Tag>
                  </div>

                  <div className="flex items-center">
                    <ClockCircleOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium">Time Out:</span>
                    <Tag color="blue" className="ml-2">
                      {currentRequest?.checkOutTime
                        ? moment(currentRequest?.checkOutTime).format("hh:mm A")
                        : "N/A"}
                    </Tag>
                  </div>

                  <div className="flex items-center">
                    <InfoCircleOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium">Total Hours:</span>
                    <span className="ml-2">
                      {currentRequest?.hoursWorked
                        ? `${Math.floor(
                            currentRequest?.hoursWorked
                          )}h ${Math.round(
                            (currentRequest?.hoursWorked % 1) * 60
                          )}m`
                        : "N/A"}
                    </span>
                  </div>

                  {currentRequest?.remarks && (
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="font-medium text-yellow-800">Remarks:</p>
                      <p className="text-yellow-700">
                        {currentRequest?.remarks}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Proof Section */}
              <div className="w-full md:w-2/3">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">
                    Attendance Proof
                  </h3>
                  <div className="border rounded-lg overflow-hidden bg-gray-100">
                    {currentRequest?.checkInPhoto ? (
                      <img
                        src={currentRequest?.checkInPhoto}
                        alt="Check-in proof"
                        className="w-full h-64 object-contain"
                      />
                    ) : (
                      <div className="flex justify-center items-center h-64 text-gray-400">
                        No photo available
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 mt-2">
                    Location: {currentRequest?.location || "Not specified"}
                  </p>
                </div>

                {/* Progress and navigation */}
                <div className="mt-4">
                  <Progress
                    percent={Math.round(
                      ((currentIndex + 1) / pendingRequests.length) * 100
                    )}
                    status="active"
                    showInfo={false}
                  />
                  <div className="flex justify-between mt-4">
                    <Button
                      icon={<LeftOutlined />}
                      onClick={moveToPrevious}
                      disabled={currentIndex === 0}
                    >
                      Previous (←)
                    </Button>
                    <span className="text-gray-500 self-center">
                      {currentIndex + 1} of {pendingRequests.length}
                    </span>
                    <Button
                      icon={<RightOutlined />}
                      onClick={moveToNext}
                      disabled={currentIndex === pendingRequests.length - 1}
                    >
                      Next (→)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default AttendanceApprovalPopup;
