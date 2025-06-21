import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Avatar,
  Progress,
  Divider,
  Tag,
  message,
  Modal,
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
} from "@ant-design/icons";

const AttendanceApprovalPopup = () => {
  // Sample data
  const [attendanceRequests, setAttendanceRequests] = useState([
    {
      id: 1,
      userId: "EMP001",
      userName: "John Doe",
      userPhoto: "https://randomuser.me/api/portraits/men/1.jpg",
      date: "2023-06-15",
      timeIn: "09:15 AM",
      timeOut: "06:30 PM",
      status: "pending",
      reason: "Traffic delay",
      location: "Office Main Gate",
      photoProof: "https://via.placeholder.com/400x300?text=Entry+Photo",
      totalHours: "8.5",
      lateMinutes: 15,
    },
    {
      id: 2,
      userId: "EMP002",
      userName: "Jane Smith",
      userPhoto: "https://randomuser.me/api/portraits/women/1.jpg",
      date: "2023-06-15",
      timeIn: "08:45 AM",
      timeOut: "05:30 PM",
      status: "pending",
      reason: "Early leave - Doctor appointment",
      location: "Office Reception",
      photoProof: "https://via.placeholder.com/400x300?text=Exit+Photo",
      totalHours: "8.75",
      lateMinutes: 0,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentRequest = attendanceRequests[currentIndex];

  // Keyboard event handler
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
  }, [isModalOpen, currentIndex, attendanceRequests]);

  const showModal = () => {
    setIsModalOpen(true);
    setCurrentIndex(0); // Reset to first request when opening
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleApprove = () => {
    if (loading) return;

    setLoading(true);
    setTimeout(() => {
      const updatedRequests = [...attendanceRequests];
      updatedRequests[currentIndex].status = "approved";
      setAttendanceRequests(updatedRequests);
      message.success("Attendance approved successfully!");
      setLoading(false);
      moveToNext();
    }, 500);
  };

  const handleReject = () => {
    if (loading) return;

    setLoading(true);
    setTimeout(() => {
      const updatedRequests = [...attendanceRequests];
      updatedRequests[currentIndex].status = "rejected";
      setAttendanceRequests(updatedRequests);
      message.warning("Attendance rejected!");
      setLoading(false);
      moveToNext();
    }, 500);
  };

  const moveToNext = () => {
    if (currentIndex < attendanceRequests.length - 1) {
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

  return (
    <div>
      {/* Button to open the modal */}
      <Button
        type="primary"
        icon={<EyeOutlined />}
        onClick={showModal}
        className="bg-blue-500   hover:bg-blue-600"
      >
        Review Attendance Requests ({attendanceRequests.length})
      </Button>

      {/* Modal/Popup */}
      <Modal
        title={`Attendance Approval (${currentIndex + 1}/${
          attendanceRequests.length
        })`}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={900}
        centered
        className="max-w-[95vw]"
      >
        {attendanceRequests.length > 0 ? (
          <Card
            className="border-0"
            actions={[
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprove}
                loading={loading}
                className="bg-green-500 hover:bg-green-600"
              >
                Approve (Enter)
              </Button>,
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleReject}
                loading={loading}
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
                    src={currentRequest.userPhoto}
                    icon={<UserOutlined />}
                    className="mb-3 border-2 border-blue-200"
                  />
                  <h2 className="text-xl font-semibold">
                    {currentRequest.userName}
                  </h2>
                  <p className="text-gray-500">{currentRequest.userId}</p>
                </div>

                <Divider />

                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{currentRequest.date}</span>
                  </div>

                  <div className="flex items-center">
                    <ClockCircleOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium">Time In:</span>
                    <Tag
                      color={
                        currentRequest.lateMinutes > 0 ? "orange" : "green"
                      }
                      className="ml-2"
                    >
                      {currentRequest.timeIn}
                      {currentRequest.lateMinutes > 0 &&
                        ` (Late by ${currentRequest.lateMinutes} mins)`}
                    </Tag>
                  </div>

                  <div className="flex items-center">
                    <ClockCircleOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium">Time Out:</span>
                    <Tag color="blue" className="ml-2">
                      {currentRequest.timeOut}
                    </Tag>
                  </div>

                  <div className="flex items-center">
                    <InfoCircleOutlined className="text-blue-500 mr-2" />
                    <span className="font-medium">Total Hours:</span>
                    <span className="ml-2">
                      {currentRequest.totalHours} hours
                    </span>
                  </div>

                  {currentRequest.reason && (
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="font-medium text-yellow-800">Reason:</p>
                      <p className="text-yellow-700">{currentRequest.reason}</p>
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
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={currentRequest.photoProof}
                      alt="Attendance proof"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <p className="text-gray-500 mt-2">
                    Location: {currentRequest.location}
                  </p>
                </div>

                {/* Navigation buttons - visible even in modal */}
                <div className="flex justify-between mt-6">
                  <Button
                    icon={<LeftOutlined />}
                    onClick={moveToPrevious}
                    disabled={currentIndex === 0}
                  >
                    Previous (←)
                  </Button>
                  <Button
                    icon={<RightOutlined />}
                    onClick={moveToNext}
                    disabled={currentIndex === attendanceRequests.length - 1}
                  >
                    Next (→)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No pending attendance requests
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendanceApprovalPopup;
