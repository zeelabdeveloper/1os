import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Statistic,
  Tag,
  Space,
  Button,
  DatePicker,
  Divider,
  Spin,
  Alert,
} from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { FaUserTie, FaRegClock, FaCut } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import dayjs from "dayjs";
import axiosInstance from "../../axiosConfig";

const { RangePicker } = DatePicker;

// Mock API functions - replace with actual API calls
const fetchTeamMetrics = async (usert) => {
  const data = await axiosInstance.get(
    `/api/v1/team/myteam/analytics/${usert}`
  );
console.log( data.data)
  return data.data;
};

function TeamsReport({ user }) {
  const { data, isLoading, isError, } = useQuery({
    queryKey: ["teamMetrics"],
    queryFn: () => fetchTeamMetrics(user?._id),
    keepPreviousData: true,
  });

  if (isError) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <TeamOutlined className="mr-2" /> Team Metrics Dashboard
        </h1>
        <p className="text-gray-600">
          Aggregated statistics and analytics for your team
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading team metrics..." />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <Statistic
                title="Total Team Members"
                value={data.totalMembers}
                prefix={<TeamOutlined />}
              />
            </Card>
            <Card>
              <Statistic
                title="Active Members"
                value={data.activeMembers}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
            <Card>
              <Statistic
                title="inactive Members"
                value={data.inactiveMembers}
                prefix={<FaCut />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
           
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card title="Department Distribution" extra={<PieChartOutlined />}>
              <div className="space-y-2">
                { data?.departmentDistribution &&   Object.entries(data?.departmentDistribution).map(
                  ([dept, count]) => (
                    <div
                      key={dept}
                      className="flex justify-between items-center"
                    >
                      <span className="capitalize">{dept}</span>
                      <Tag color="blue">{count} members</Tag>
                    </div>
                  )
                )}
              </div>
            </Card>

            <Card title="Performance Distribution" extra={<BarChartOutlined />}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Excellent</span>
                  <Tag color="green">
                    {data?.performanceDistribution?.excellent}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>Good</span>
                  <Tag color="blue">{data?.performanceDistribution?.good}</Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average</span>
                  <Tag color="orange">
                    {data?.performanceDistribution?.average}
                  </Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>Poor</span>
                  <Tag color="red">{data?.performanceDistribution?.poor}</Tag>
                </div>
              </div>
            </Card>
          </div> */}

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Separation Types" extra={<LineChartOutlined />}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Resignations</span>
                  <Tag color="volcano">{data?.separationTypes?.resignation}</Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>Terminations</span>
                  <Tag color="red">{data?.separationTypes?.termination}</Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>Retirements</span>
                  <Tag color="gold">{data?.separationTypes?.retirement}</Tag>
                </div>
                <div className="flex justify-between items-center">
                  <span>Other</span>
                  <Tag color="gray">{data?.separationTypes?.other}</Tag>
                </div>
              </div>
            </Card>

            <Card title="Overall Attendance">
              <Statistic
                title="Attendance Rate"
                value={data?.attendanceRate}
                suffix="%"
                precision={1}
              />
              <Divider />
              <div className="text-sm text-gray-500">
                Last updated:{" "}
                {dayjs(data?.lastUpdated).format("DD MMM YYYY, hh:mm A")}
              </div>
            </Card>
          </div> */}
        </>
      )}
    </div>
  );
}

export default TeamsReport;
