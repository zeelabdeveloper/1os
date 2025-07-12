import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSingleBranchAnalytics } from "../../api/analytics";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  Skeleton,
  Empty,
  Tag
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const BranchUserStats = ({ branchId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["branchUserStats", branchId],
    queryFn: () => fetchSingleBranchAnalytics(branchId),
    enabled: !!branchId
  });
console.log(data)
  if (isError) return <div>Error loading branch user statistics</div>;

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>
        {isLoading ? (
          <Skeleton.Input active />
        ) : (
          `Branch User Statistics`
        )}
      </Title>

      {/* Key Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={data?.totalUsers || 0}
              prefix={<TeamOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={data?.activeUsers || 0}
              prefix={<CheckCircleOutlined />}
              loading={isLoading}
            />
            {!isLoading && (
              <Text>
                ({Math.round(data?.activePercentage || 0)}%)
              </Text>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Inactive Users"
              value={data?.inactiveUsers || 0}
              prefix={<CloseCircleOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="New This Month"
              value={data?.newThisMonth || 0}
              prefix={<UserAddOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="New This Year"
              value={data?.newThisYear || 0}
              prefix={<UserAddOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Deactivated This Month"
              value={data?.deactivatedThisMonth || 0}
              prefix={<UserDeleteOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {!isLoading && (
        <Card title="Summary">
          <Tag color={data?.activePercentage > 70 ? "green" : "orange"}>
            {data?.activePercentage > 70 ? "Healthy" : "Needs Attention"}
          </Tag>
          <Text style={{ marginLeft: 16 }}>
            {data?.activeUsers} active out of {data?.totalUsers} total users
          </Text>
        </Card>
      )}
    </div>
  );
};

export default BranchUserStats;