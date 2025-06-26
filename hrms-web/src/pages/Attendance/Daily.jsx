// src/components/AttendanceSystem.jsx
import React, { useState } from "react";
import { Layout, Tabs, theme, Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DailyAttendance from "./createAttendance/DailyAttendance";
import AttendanceHistory from "./createAttendance/AttendanceHistory";
import LeaveRequest from "./createAttendance/LeaveRequest";
import Reports from "./createAttendance/Reports";

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const AttendanceSystem = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/user/staff/685d24dd2fd550d8d845da7e");
      return response.data;
    },
  });
console.log(error)
  const [activeTab, setActiveTab] = useState("daily");

  if (isLoading) return <Spin size="large" fullscreen />;
  if (error) return <Alert message="Error loading user data" type="error" />;

  const renderContent = () => {
    switch (activeTab) {
      case "daily":
        return <DailyAttendance user={userData?.data} />;
      case "history":
        return <AttendanceHistory user={userData?.data} />;
      case "leave":
        return <LeaveRequest user={userData?.data} />;
      case "reports":
        return <Reports user={userData?.data} />;
      default:
        return <DailyAttendance user={userData?.data} />;
    }
  };

  return (
    <Layout style={{ height: "92vh", overflowY: "auto" }}>
      <Header style={{ padding: 0, background: colorBgContainer }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: "0 24px" }}
        >
          <TabPane tab="Daily Attendance" key="daily" />
          <TabPane tab="Attendance History" key="history" />
          <TabPane tab="Leave Requests" key="leave" />
          <TabPane tab="Reports" key="reports" />
        </Tabs>
      </Header>
      <Content style={{ margin: "16px" }}>
        <div
          style={{ padding: 24, minHeight: 360, background: colorBgContainer }}
        >
          {renderContent()}
        </div>
      </Content>
    </Layout>
  );
};

export default AttendanceSystem;
