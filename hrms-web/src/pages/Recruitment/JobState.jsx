import React from "react";
import { Card, Progress, Row, Col, Statistic, Skeleton } from "antd";
import { Column } from "@ant-design/plots";
import { useQuery } from "@tanstack/react-query";
import { fetchJobStats } from "../../api/jobs";
import { FaBriefcase, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const JobStatsDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["jobStats"],
    queryFn: fetchJobStats,
  });

  const columnData = [
    { category: "Active", count: stats?.activeJobs || 0 },
    { category: "Inactive", count: stats?.inactiveJobs || 0 },
  ];

  const columnConfig = {
    data: columnData,
    xField: "category",
    yField: "count",
    columnWidthRatio: 0.6,
    color: ({ category }) => {
      return category === "Active" ? "#00b96b" : "#ff4d4f";
    },
    label: {
      position: "middle",
      style: { fill: "#fff", fontSize: 16 },
    },
    xAxis: { label: { style: { fontSize: 14 } } },
    yAxis: { label: { style: { fontSize: 14 } } },
    height: 97,
  };

  return (
    <div className="p-4">
      <Row gutter={[6, 6]}>
        <Col xs={24} md={8}>
          <Card className="shadow-lg  border rounded-xl">
            {isLoading ? (
              <Skeleton active />
            ) : (
              <Statistic
                title={
                  <span>
                    <FaBriefcase className="text-blue-500 mr-2" /> Total Jobs
                  </span>
                }
                value={stats?.totalJobs || 0}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="shadow-lg border rounded-xl">
            {isLoading ? (
              <Skeleton active />
            ) : (
              <Statistic
                title={
                  <span>
                    <FaCheckCircle className="text-green-500 mr-2" /> Active
                    Jobs
                  </span>
                }
                value={stats?.activeJobs || 0}
                valueStyle={{ color: "#00b96b" }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="shadow-lg border rounded-xl">
            {isLoading ? (
              <Skeleton active />
            ) : (
              <Statistic
                title={
                  <span>
                    <FaTimesCircle className="text-red-500 mr-2" /> Inactive
                    Jobs
                  </span>
                }
                value={stats?.inactiveJobs || 0}
                valueStyle={{ color: "#ff4d4f" }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Active Job Percentage"
            className="shadow-md border rounded-xl flex justify-center items-center"
          >
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <div className="flex justify-center items-center w-full py-4">
                <Progress
                  type="circle"
                  percent={Math.round(
                    ((stats?.activeJobs || 0) / (stats?.totalJobs || 1)) * 100
                  )}
                  strokeColor="#52c41a"
                  strokeWidth={10}
                  format={(percent) => `${percent}% Active`}
                  style={{ fontSize: 20 }}
                />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Job Status (Bar Chart)"
            className="shadow-md border rounded-xl"
          >
            <Column {...columnConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JobStatsDashboard;
