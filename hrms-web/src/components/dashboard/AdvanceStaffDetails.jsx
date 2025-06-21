import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Divider,
  Typography,
  Space,
  Avatar,
  Skeleton,
  Result,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  BarChartOutlined,
  CalendarOutlined,
  HistoryOutlined,
  StarOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Column } from "@ant-design/charts";
import { fetchStaffAnalytics } from "../../api/analytics";

const { Title, Text } = Typography;

function AdvanceStaffDetails() {
  const {
    data: analytics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["staffAnalytics"],
    queryFn: fetchStaffAnalytics,
  });

  console.log(isLoading);

  if (isLoading) {
    return (
      <div style={{ padding: "20px" }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          <Skeleton.Input style={{ width: 220 }} active size="small" />
        </Title>

        {/* Top Stat Cards */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {[...Array(4)].map((_, i) => (
            <Col xs={12} sm={8} md={6} key={i}>
              <Card size="small" bodyStyle={{ padding: 12 }}>
                <Skeleton active paragraph={false} title={{ width: 80 }} />
                <Skeleton.Input active size="small" style={{ width: 60 }} />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Join Stats Cards */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {[...Array(4)].map((_, i) => (
            <Col xs={12} sm={8} md={6} key={i}>
              <Card size="small" bodyStyle={{ padding: 12 }}>
                <Skeleton active paragraph={false} title={{ width: 100 }} />
                <Skeleton.Input active size="small" style={{ width: 50 }} />
                <Skeleton.Button
                  active
                  size="small"
                  style={{ width: "100%", marginTop: 8 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Section */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {[...Array(2)].map((_, i) => (
            <Col xs={24} md={12} key={i}>
              <Card size="small" bodyStyle={{ padding: 12 }}>
                <Skeleton.Input
                  active
                  style={{ width: "40%", marginBottom: 16 }}
                />
                <Skeleton active paragraph={{ rows: 5 }} />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Lower Metrics */}
        <Row gutter={[12, 12]}>
          {[...Array(3)].map((_, i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card size="small" bodyStyle={{ padding: 12 }}>
                <Skeleton avatar active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
console.log(isError, isLoading)
  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to Load Staff Analytics"
        subTitle="Please try again later or check your internet connection."
      />
    );
  }

  const tenureData = [
    { type: "New (<1 year)", value: analytics?.newStaff || 0 },
    { type: "Mid (1-5 years)", value: analytics?.midTermStaff || 0 },
    { type: "Long (>5 years)", value: analytics?.longTermStaff || 0 },
  ];

  const statusData = [
    { type: "Active", value: analytics?.activeStaff || 0 },
    { type: "Inactive", value: analytics?.inactiveStaff || 0 },
    { type: "Suspended", value: analytics?.suspendedAccounts || 0 },
  ];

  const joiningTrendConfig = {
    data: analytics?.joiningTrends || [],
    xField: "month",
    yField: "count",
    height: 200,
    color: "#3f8600",
    label: {
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    slider: {
      start: 0,
      end: 1,
    },
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      <Title level={4} style={{ marginBottom: "16px" }}>
        <TeamOutlined /> Staff Analytics
      </Title>

      {/* Summary Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
        {[
          {
            title: "Total Staff",
            value: analytics?.totalStaff,
            icon: <UserOutlined />,
            color: "#3f8600",
          },
          {
            title: "COCO Staff",
            value: analytics?.cocoStaff,
            icon: <SafetyOutlined />,
            color: "#1890ff",
          },
          {
            title: "Active Staff",
            value: analytics?.activeStaff,
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
          },
          {
            title: "Inactive Staff",
            value: analytics?.inactiveStaff,
            icon: <CloseCircleOutlined />,
            color: "#f5222d",
          },
        ].map((item, index) => (
          <Col xs={12} sm={8} md={6} key={index}>
            <Card
              size="small"
              bodyStyle={{ padding: "12px" }}
              style={{
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                backgroundColor: "#fff",
              }}
            >
              <Statistic
                title={<Text style={{ fontSize: 12 }}>{item.title}</Text>}
                value={item.value}
                prefix={React.cloneElement(item.icon, {
                  style: { fontSize: 13 },
                })}
                valueStyle={{ fontSize: 18, color: item.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Joining Stats */}
      <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
        <Col xs={12} sm={8} md={6}>
          <Card size="small" bodyStyle={{ padding: "12px" }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>This Month Joining</Text>}
              value={analytics?.thisMonthJoining}
              prefix={<CalendarOutlined style={{ fontSize: 13 }} />}
              valueStyle={{ color: "#13c2c2", fontSize: 18 }}
            />
            <Progress
              percent={
                (analytics?.thisMonthJoining / analytics?.totalStaff) * 100 || 0
              }
              size="small"
              status="active"
              strokeColor="#13c2c2"
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card size="small" bodyStyle={{ padding: "12px" }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>Last Month Joining</Text>}
              value={analytics?.lastMonthJoining}
              prefix={<HistoryOutlined style={{ fontSize: 13 }} />}
              valueStyle={{ color: "#722ed1", fontSize: 18 }}
            />
            <Text
              type={
                analytics?.thisMonthJoining > analytics?.lastMonthJoining
                  ? "success"
                  : "danger"
              }
            >
              {analytics?.thisMonthJoining > analytics?.lastMonthJoining ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}{" "}
              {Math.abs(
                ((analytics?.thisMonthJoining - analytics?.lastMonthJoining) /
                  (analytics?.lastMonthJoining || 1)) *
                  100
              ).toFixed(2)}
              %
            </Text>
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card size="small" bodyStyle={{ padding: "12px" }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>This Year Joining</Text>}
              value={analytics?.thisYearJoining}
              prefix={<BarChartOutlined style={{ fontSize: 13 }} />}
              valueStyle={{ color: "#fa8c16", fontSize: 18 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8} md={6}>
          <Card size="small" bodyStyle={{ padding: "12px" }}>
            <Statistic
              title={<Text style={{ fontSize: 12 }}>Last Year Joining</Text>}
              value={analytics?.lastYearJoining}
              prefix={<HistoryOutlined style={{ fontSize: 13 }} />}
              valueStyle={{ color: "#a0d911", fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title="Joining Trends"
            bodyStyle={{ padding: "12px" }}
          >
            <Column {...joiningTrendConfig} />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            size="small"
            title="Tenure Distribution"
            bodyStyle={{ padding: "12px" }}
          >
            <Column
              data={tenureData}
              xField="type"
              yField="value"
              colorField="type"
              height={200}
              label={{
                position: "middle",
                style: { fill: "#FFFFFF", opacity: 0.6 },
              }}
              legend={{ position: "top" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={8}>
          <Card
            size="small"
            title="Recently Active (30d)"
            bodyStyle={{ padding: "12px" }}
          >
            <Statistic
              value={analytics?.recentlyActive}
              prefix={<ClockCircleOutlined style={{ fontSize: 13 }} />}
              valueStyle={{ color: "#13c2c2", fontSize: 18 }}
            />
            <Progress
              percent={
                (analytics?.recentlyActive / analytics?.activeStaff) * 100 || 0
              }
              size="small"
              strokeColor="#13c2c2"
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Out of {analytics?.activeStaff} active staff
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            size="small"
            title="Account Status"
            bodyStyle={{ padding: "12px" }}
          >
            <Column
              data={statusData}
              xField="type"
              yField="value"
              colorField="type"
              height={200}
              color={["#52c41a", "#f5222d", "#faad14"]}
              label={{
                position: "middle",
                style: { fill: "#FFFFFF", opacity: 0.6 },
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            size="small"
            title="Long Term Staff"
            bodyStyle={{ padding: "12px" }}
          >
            <Statistic
              value={analytics?.longTermStaff}
              prefix={<StarOutlined style={{ fontSize: 13 }} />}
              valueStyle={{ color: "#faad14", fontSize: 18 }}
            />
            <Text style={{ fontSize: 11 }}>Staff with 5+ years tenure</Text>
            <Progress
              percent={
                (analytics?.longTermStaff / analytics?.totalStaff) * 100 || 0
              }
              size="small"
              strokeColor="#faad14"
            />
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: "20px 0" }} />

      {/* Final Summary */}
      <Card
        title="Staff Status Overview"
        size="small"
        bodyStyle={{ padding: "12px" }}
      >
        <Row gutter={[12, 12]}>
          {[
            {
              title: "Active Staff",
              value: analytics?.activeStaff,
              icon: <CheckCircleOutlined />,
              color: "#52c41a",
            },
            {
              title: "Inactive Staff",
              value: analytics?.inactiveStaff,
              icon: <CloseCircleOutlined />,
              color: "#f5222d",
            },
            {
              title: "Suspended Accounts",
              value: analytics?.suspendedAccounts,
              icon: <WarningOutlined />,
              color: "#faad14",
            },
          ].map((item, i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card
                type="inner"
                size="small"
                bordered={false}
                bodyStyle={{ padding: "12px" }}
              >
                <Space size="middle">
                  <Avatar
                    icon={item.icon}
                    size={40}
                    style={{ backgroundColor: item.color }}
                  />
                  <Statistic value={item.value} valueStyle={{ fontSize: 18 }} />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}

export default AdvanceStaffDetails;


 