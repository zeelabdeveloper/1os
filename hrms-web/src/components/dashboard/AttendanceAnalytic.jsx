import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Select,
  Table,
  Tag,
  Tabs,
  Space,
} from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  StarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Line, Pie, DualAxes } from "@ant-design/charts";
import dayjs from "dayjs";
import { fetchAttendanceAnalytics } from "../../api/analytics";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

const compactCardStyle = {
  borderRadius: 8,
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
};

const compactChartStyle = {
  height: 250,
};

const AttendanceAnalytics = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [department, setDepartment] = useState(null);
  const [branch, setBranch] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["attendanceAnalytics", dateRange, department, branch],
    queryFn: () =>
      fetchAttendanceAnalytics({
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        department,
        branch,
      }),
  });

  // Compact Summary Cards
  const summaryCards = [
    {
      title: "Total",
      value: data?.totalRecords,
      icon: <TeamOutlined style={{ fontSize: 16 }} />,
      color: "#1890ff",
    },
    {
      title: "Present",
      value: data?.presentCount,
      icon: <CheckCircleOutlined style={{ fontSize: 16 }} />,
      color: "#52c41a",
    },
    {
      title: "Absent",
      value: data?.absentCount,
      icon: <CloseCircleOutlined style={{ fontSize: 16 }} />,
      color: "#f5222d",
    },
    {
      title: "Leaves",
      value: data?.leaveCount,
      icon: <CalendarOutlined style={{ fontSize: 16 }} />,
      color: "#fa8c16",
    },
    {
      title: "Half Days",
      value: data?.halfDayCount,
      icon: <ClockCircleOutlined style={{ fontSize: 16 }} />,
      color: "#722ed1",
    },
    {
      title: "Avg Hours",
      value: data?.averageHours?.toFixed(1),
      icon: <ClockCircleOutlined style={{ fontSize: 16 }} />,
      color: "#13c2c2",
      suffix: "h",
    },
  ];

  // Compact Chart Configs
  const trendConfig = {
    data: [
      ...(data?.attendanceTrend?.map((item) => ({
        month: item.month,
        value: item.present,
        category: "Present",
      })) || []),
      ...(data?.attendanceTrend?.map((item) => ({
        month: item.month,
        value: item.absent,
        category: "Absent",
      })) || []),
      ...(data?.attendanceTrend?.map((item) => ({
        month: item.month,
        value: item.leave,
        category: "Leave",
      })) || []),
    ],
    xField: "month",
    yField: "value",
    seriesField: "category",
    color: ["#52c41a", "#f5222d", "#fa8c16"],
    legend: {
      position: "bottom",
      itemHeight: 12,
    },
    padding: "auto",
    height: 250,
    autoFit: true,
  };

  const leaveTypeConfig = {
    data: data?.leaveTypeStats || [],
    angleField: "count",
    colorField: "_id",
    label: { type: "inner", offset: "-30%", content: "{percentage}" },
    legend: { position: "bottom", itemHeight: 12 },
    height: 250,
    innerRadius: 0.6,
  };

  const departmentConfig = {
    data: data?.departmentStats || [],
    xField: "_id",
    yField: ["present", "absent"],
    geometryOptions: [
      { geometry: "column", color: "#52c41a", columnWidthRatio: 0.4 },
      { geometry: "column", color: "#f5222d", columnWidthRatio: 0.4 },
    ],
    legend: { position: "bottom", itemHeight: 12 },
    height: 250,
  };

  const topEmployeesColumns = [
    {
      title: "Employee",
      dataIndex: "name",
      render: (text) => <Text style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: "Days",
      dataIndex: "presentDays",
      render: (text, record) => (
        <Text style={{ fontSize: 12 }}>{text || record.absentDays}</Text>
      ),
    },
    {
      title: " ",
      render: (_, record) => (
        <Tag
          color={record.presentDays ? "green" : "red"}
          style={{ margin: 0, fontSize: 11 }}
        >
          {record.presentDays ? "P" : "A"}
        </Tag>
      ),
    },
  ];

  // Location Stats Columns
  const locationColumns = [
    {
      title: "Location",
      dataIndex: "_id",
      render: (text) => (
        <Text style={{ fontSize: 12 }}>
          {text || <Text type="secondary">Unknown</Text>}
        </Text>
      ),
    },
    {
      title: "Check-ins",
      dataIndex: "count",
      render: (text) => <Text style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: " ",
      render: (_, record) => (
        <Text style={{ fontSize: 12 }}>
          {((record.count / (data?.totalRecords || 1)) * 100).toFixed(2)}%
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: 12 }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        Attendance Analytics
      </Title>

      {/* Compact Filters */}
      <Card
        bodyStyle={{ padding: 12 }}
        style={{ ...compactCardStyle, marginBottom: 12 }}
      >
        <Row gutter={8}>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              size="small"
              style={{ width: "100%" }}
              value={dateRange}
              onChange={setDateRange}
              allowClear={false}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              size="small"
              style={{ width: "100%" }}
              placeholder="Department"
              allowClear
              onChange={setDepartment}
            >
              <Option value="IT">IT</Option>
              <Option value="HR">HR</Option>
              <Option value="Finance">Finance</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              size="small"
              style={{ width: "100%" }}
              placeholder="Branch"
              allowClear
              onChange={setBranch}
            >
              <Option value="HQ">HQ</Option>
              <Option value="KNL">Karnal</Option>
              <Option value="Store">Store</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Compact Summary Cards */}
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        {summaryCards.map((card, index) => (
          <Col xs={12} sm={8} md={4} key={index}>
            <Card
              bodyStyle={{ padding: 12 }}
              style={compactCardStyle}
              loading={isLoading}
            >
              <Statistic
                title={
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>
                    {card.title}
                  </Text>
                }
                value={card.value}
                prefix={card.icon}
                valueStyle={{
                  color: card.color,
                  fontSize: 14,
                  fontWeight: 600,
                }}
                suffix={card.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Compact Tabs */}
      <Tabs size="small" tabBarStyle={{ marginBottom: 8 }} defaultActiveKey="1">
        <TabPane tab="Overview" key="1">
          <Row gutter={[8, 8]}>
            <Col xs={14} md={12}>
              <Card
                bodyStyle={{ padding: 12 }}
                style={compactCardStyle}
                loading={isLoading}
                title={
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>
                    Attendance Trend
                  </Text>
                }
              >
                <div style={compactChartStyle}>
                  <Line {...trendConfig} />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                bodyStyle={{ padding: 12 }}
                style={compactCardStyle}
                loading={isLoading}
                title={
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>
                    Leave Types
                  </Text>
                }
              >
                <div style={compactChartStyle}>
                  <Pie {...leaveTypeConfig} />
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                bodyStyle={{ padding: 12 }}
                style={compactCardStyle}
                loading={isLoading}
                title={
                  <Text style={{ fontSize: 12, fontWeight: 500 }}>
                    Department Stats
                  </Text>
                }
              >
                <div style={compactChartStyle}>
                  <DualAxes {...departmentConfig} />
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Employees" key="2">
          <Row gutter={[8, 8]}>
            <Col xs={24} md={12}>
              <Card
                bodyStyle={{ padding: 12 }}
                style={compactCardStyle}
                loading={isLoading}
                title={
                  <Space size={4}>
                    <StarOutlined style={{ color: "#52c41a", fontSize: 14 }} />
                    <Text style={{ fontSize: 12, fontWeight: 500 }}>
                      Top Present
                    </Text>
                  </Space>
                }
              >
                <Table
                  size="small"
                  columns={topEmployeesColumns}
                  dataSource={data?.topPresentEmployees || []}
                  rowKey="userId"
                  pagination={false}
                  loading={isLoading}
                  showHeader={false}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                bodyStyle={{ padding: 12 }}
                style={compactCardStyle}
                loading={isLoading}
                title={
                  <Space size={4}>
                    <WarningOutlined
                      style={{ color: "#f5222d", fontSize: 14 }}
                    />
                    <Text style={{ fontSize: 12, fontWeight: 500 }}>
                      Top Absent
                    </Text>
                  </Space>
                }
              >
                <Table
                  size="small"
                  columns={topEmployeesColumns}
                  dataSource={data?.topAbsentEmployees || []}
                  rowKey="userId"
                  pagination={false}
                  loading={isLoading}
                  showHeader={false}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <Space size={4}>
              <EnvironmentOutlined style={{ fontSize: 14 }} />
              <span>Locations</span>
            </Space>
          }
          key="3"
        >
          <Card
            bodyStyle={{ padding: 12 }}
            style={compactCardStyle}
            loading={isLoading}
            title={
              <Text style={{ fontSize: 12, fontWeight: 500 }}>
                Check-in Locations
              </Text>
            }
          >
            <Table
              size="small"
              columns={locationColumns}
              dataSource={data?.locationStats || []}
              rowKey="_id"
              pagination={false}
              loading={isLoading}
              showHeader={false}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AttendanceAnalytics;
