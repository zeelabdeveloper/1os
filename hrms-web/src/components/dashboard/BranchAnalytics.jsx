import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBranchAnalytics } from "../../api/analytics";
import {
  Card,
  Table,
  Typography,
  Tag,
  Progress,
  Row,
  Col,
  Skeleton,
  Empty
} from "antd";
import { Pie } from "@ant-design/charts";

const { Title, Text } = Typography;

const BranchAnalytics = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["branchAnalytics"],
    queryFn: fetchBranchAnalytics,
  });

  const columns = [
    {
      title: "Branch",
      dataIndex: "branchName",
      key: "branch",
      render: (text, record) => (
        <span>
          {text} ({record.branchCode})
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
          percent={Math.round((text / record.staffCount) * 100)}
          size="small"
          status="active"
        />
      ),
    },
    {
      title: "Inactive Staff",
      dataIndex: "inactiveStaff",
      key: "inactive",
      render: (text, record) => (
        <Text type={text > 0 ? "danger" : "success"}>
          {text} ({Math.round((text / record.staffCount) * 100)}%)
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag
          color={
            record.activeStaff / record.staffCount > 0.7 ? "green" : "orange"
          }
        >
          {record.activeStaff / record.staffCount > 0.7
            ? "Healthy"
            : "Needs Attention"}
        </Tag>
      ),
    },
  ];

  // Prepare data for charts
  const branchDistributionData =Array.isArray(data) && data?.map(item => ({
    type: `${item.branchName} (${item.branchCode})`,
    value: item.staffCount
  })) || [];

  const statusDistributionData =Array.isArray(data) && data?.flatMap(item => [
    {
      type: `${item.branchName} Active`,
      value: item.activeStaff,
      status: 'active'
    },
    {
      type: `${item.branchName} Inactive`,
      value: item.inactiveStaff,
      status: 'inactive'
    }
  ]) || [];

  const branchPieConfig = {
    data: branchDistributionData,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{percentage}',
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{ type: 'element-active' }],
    height:200,
    legend: {
      position: 'bottom'
    }
  };

  const statusPieConfig = {
    data: statusDistributionData,
    angleField: 'value',
    colorField: 'status',
    height:200,
    color: ['#52c41a', '#f5222d'],
    radius: 1,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{percentage}',
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      position: 'bottom'
    }
  };

  if (isError) return <div>Error loading branch analytics</div>;

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Branch-wise Analytics</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="Staff Distribution by Branch" loading={isLoading}>
            {!isLoading && data?.length > 0 ? (
              <Pie {...branchPieConfig} />
            ) : (
              <Skeleton active paragraph={{ rows: 6 }} />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Active/Inactive Staff Status" loading={isLoading}>
            {!isLoading && data?.length > 0 ? (
              <Pie {...statusPieConfig} />
            ) : (
              <Skeleton active paragraph={{ rows: 6 }} />
            )}
          </Card>
        </Col>
      </Row>

      <Card 
        title="Branch Details" 
        loading={isLoading}
        style={{ overflowX: 'auto' }}
      >
        {data?.length > 0 ? (
          <Table
            columns={columns}
            dataSource={ Array.isArray(data) &&  data}
            rowKey="_id"
            pagination={false}
            bordered
            style={{ width: '100%' }}
          />
        ) : (
          <Empty description="No branch data available" />
        )}
      </Card>
    </div>
  );
};

export default BranchAnalytics;