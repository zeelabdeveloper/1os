import React from "react";
import { Card, Statistic, Row, Col, Progress, Tag } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { FaUserTie, FaRegCalendarAlt } from "react-icons/fa";

function TrackUserHistory({ user = {} }) {
  const {
    firstName = "",
    lastName = "",
    email = "",
    contactNumber = "",
    isCocoEmployee = false,
    dateOfJoining,
    isActive = false,
    lastLogin,
    Asset = [],
    Organization = {},
  } = user;

  const departmentName = Organization?.department?.name || "N/A";
  const roleName = Organization?.role?.name || "N/A";
  const employmentType = Organization?.employmentType || "N/A";

  return (
    <div className="p-2 md:p-4">
      <Row gutter={[16, 16]}>
        {/* User Profile */}
        <Col xs={24} md={8}>
          <Card
            title="My Profile"
            bordered={false}
            className="shadow-lg rounded-xl"
            bodyStyle={{ padding: 16 }}
          >
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <UserOutlined className="text-blue-600 text-lg" />
              </div>
              <div className="leading-tight">
                <h3 className="text-md font-semibold">
                  {`${firstName} ${lastName}` || "N/A"}
                </h3>
                <p className="text-xs text-gray-500">{email || "No email"}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <PhoneOutlined className="mr-2 text-gray-400" />
                <span>{contactNumber || "Not Provided"}</span>
              </div>
              <div className="flex items-center">
                <FaUserTie className="mr-2 text-gray-400" />
                <span>
                  {isCocoEmployee ? "COCO Employee" : "External User"}
                </span>
              </div>
              <div className="flex items-center">
                <FaRegCalendarAlt className="mr-2 text-gray-400" />
                <span>
                  Joined:{" "}
                  {dateOfJoining
                    ? new Date(dateOfJoining).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center">
                <Tag color={isActive ? "green" : "red"}>
                  {isActive ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>

        {/* Organization Info */}
        <Col xs={24} md={8}>
          <Card
            title="My Organization"
            bordered={false}
            className="shadow-lg rounded-xl"
            bodyStyle={{ padding: 16 }}
          >
            <div className="space-y-3">
              <Statistic
                title={<span className="text-xs">Department</span>}
                value={departmentName}
                prefix={<TeamOutlined />}
              />
              <Statistic
                title={<span className="text-xs">Role</span>}
                value={roleName}
                prefix={<IdcardOutlined />}
              />
              <Tag color="blue" className="mt-2">
                {employmentType}
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Activity Info */}
        <Col xs={24} md={8}>
          <Card
            title="My Activity"
            bordered={false}
            className="shadow-lg rounded-xl"
            bodyStyle={{ padding: 16 }}
          >
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 font-medium">Last Login</p>
                <div className="flex items-center text-gray-600">
                  <ClockCircleOutlined className="mr-2" />
                  <span>
                    {lastLogin ? new Date(lastLogin).toLocaleString() : "Never"}
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-1 font-medium">Account Status</p>
                <Progress
                  percent={isActive ? 100 : 0}
                  status={isActive ? "success" : "exception"}
                  format={() => (isActive ? "Active" : "Inactive")}
                  strokeColor={isActive ? "#52c41a" : "#ff4d4f"}
                />
              </div>

              <div>
                <p className="mb-1 font-medium">Assets Assigned</p>
                <Tag color="purple" className="text-xs">
                  {Asset?.length || 0} Items
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default TrackUserHistory;
