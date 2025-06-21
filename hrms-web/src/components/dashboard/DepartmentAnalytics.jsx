import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, Tag, Progress, Skeleton, Result } from "antd";
import {  Radar, Bar } from "@ant-design/charts";
import { fetchDepartmentAnalytics } from "../../api/analytics";
import { WarningOutlined } from "@ant-design/icons";

const DepartmentAnalytics = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["departmentAnalytics"],
    queryFn: fetchDepartmentAnalytics,
  });

  const columns = [
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "department",
      render: (text, record) => (
        <span>
          {text} ({record.departmentCode})
        </span>
      ),
    },
    {
      title: "Total Staff",
      dataIndex: "staffCount",
      key: "total",
      sorter: (a, b) => a.staffCount - b.staffCount,
    },
    {
      title: "Active Staff",
      dataIndex: "activeStaff",
      key: "active",
      render: (text, record) => (
        <Progress
          percent={
            record.staffCount > 0
              ? Math.round((text / record.staffCount) * 100)
              : 0
          }
          size="small"
          status="active"
        />
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag
          color={
            record.staffCount > 0 && record.activeStaff / record.staffCount > 0.7
              ? "green"
              : "orange"
          }
        >
          {record.staffCount > 0 && record.activeStaff / record.staffCount > 0.7
            ? "Healthy"
            : "Needs Attention"}
        </Tag>
      ),
    },
  ];

  const radarConfig = {
  data: Array.isArray(data)
    ? data.map((item) => ({
        department: item.departmentName,
        metric: "Staff Count",
        value: item.staffCount,
      }))
    : [],
  xField: "department",
  yField: "value",
  seriesField: "metric",
  height: 240,
  point: {
    size: 4,
    shape: 'circle',
    style: { fill: 'white', stroke: '#5B8FF9', lineWidth: 2 },
  },
  area: {},
  line: {
    style: {
      lineWidth: 2,
    },
  },
};

  const barConfig = {
    data: Array.isArray(data) ? data : [],
    xField: "departmentName",
    yField: "staffCount",
    seriesField: "departmentName",
    isStack: true,
    label: {
      position: "middle",
      style: { fill: "#FFFFFF" },
    },
    height: 240,
  };

  if (isError) {
    return (
      <Result
        status="error"
        icon={<WarningOutlined />}
        title="Failed to load department analytics"
        subTitle="Please check your network or try again later."
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50  ">
      <h2 className="text-2xl font-semibold mb-6">Department-wise Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-medium mb-2">Staff Distribution by Department</h3>
          {isLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : <Radar {...radarConfig} />}
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="text-lg font-medium mb-2">Staff Count by Department</h3>
          {isLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : <Bar {...barConfig} />}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-lg font-medium mb-4">Department Details</h3>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={Array.isArray(data) ? data : []}
            rowKey={(record) =>
              record.departmentCode || record._id || record.departmentName
            }
            pagination={false}
            size="middle"
          />
        )}
      </div>
    </div>
  );
};

export default DepartmentAnalytics;
