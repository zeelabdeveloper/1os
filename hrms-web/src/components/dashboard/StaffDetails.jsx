
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../../api/analytics';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Table,
  Avatar,
  Skeleton,
  Tag,
  Result,
} from 'antd';
import {
  TeamOutlined,
  BankOutlined,
  ShopOutlined,
  ApartmentOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // optional: cache for 5 mins
  });

  const summaryCards = [
    {
      title: 'Total Staff',
      value: data?.totalStaff,
      icon: <TeamOutlined />,
      color: '#1890ff',
    },
    {
      title: 'COCO Staff',
      value: data?.cocoStaff,
      icon: <TeamOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: 'Active Staff',
      value: data?.activeStaff,
      icon: <CheckCircleOutlined />,
      color: '#13c2c2',
    },
    {
      title: 'Verified Bank Accounts',
      value: data?.verifiedBankAccounts,
      icon: <BankOutlined />,
      color: '#722ed1',
    },
    {
      title: 'Branches',
      value: data?.branchCount,
      icon: <ShopOutlined />,
      color: '#fa8c16',
    },
    {
      title: 'Departments',
      value: data?.departmentCount,
      icon: <ApartmentOutlined />,
      color: '#f5222d',
    },
  ];

  const recentJoiningsColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Joining Date',
      dataIndex: 'dateOfJoining',
      key: 'joining',
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: active => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  if (isError) {
    return (
      <Result
        status="error"
        title="Failed to Load Dashboard"
        subTitle="Please check your connection or try again later."
      />
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9f9f9' }}>
      <Title level={3} style={{ marginBottom: '24px' }}>
        Staff Analytics Dashboard
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {summaryCards.map((card, index) => (
          <Col xs={12} sm={8} md={6} lg={4} key={index}>
            <Card size="small">
              {isLoading ? (
                <Skeleton active title={false} paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title={<Text style={{ fontSize: 12 }}>{card.title}</Text>}
                  value={card.value}
                  prefix={card.icon}
                  valueStyle={{ color: card.color, fontSize: 18 }}
                />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Joinings Table */}
      <Card
        title="Recent Joinings"
        style={{ marginBottom: '24px' }}
        loading={isLoading}
        size="small"
      >
        <Table
          columns={recentJoiningsColumns}
          dataSource={data?.recentJoinings || []}
          rowKey="_id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* Salary and Experience Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Salary Overview" size="small" loading={isLoading}>
            {data && (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Average Salary"
                    value={data.avgSalary?.toFixed(2)}
                    prefix={<DollarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Paid"
                    value={data.totalSalaryPaid?.toFixed(2)}
                    prefix={<DollarOutlined />}
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Experience Overview" size="small" loading={isLoading}>
            {data && (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Avg. Experience"
                    value={data.avgExperience?.toFixed(1)}
                    prefix={<StarOutlined />}
                    suffix="years"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Max Experience"
                    value={data.maxExperience}
                    prefix={<ClockCircleOutlined />}
                    suffix="positions"
                  />
                </Col>
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
