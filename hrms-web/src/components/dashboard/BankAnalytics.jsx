// components/analytics/BankAnalytics.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Typography,
  Progress,
  Row,
  Col,
  Statistic,
  Skeleton,
  Result,
} from "antd";
import { Pie } from "@ant-design/charts";
import {
  BankOutlined,
  SafetyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { fetchBankAnalytics } from "../../api/analytics";

const { Title, Text } = Typography;

const BankAnalytics = () => {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bankAnalytics"],
    queryFn: fetchBankAnalytics,
    staleTime: 5 * 60 * 1000,
  });

  // Safe fallback data
  const verifiedData = data?.find((item) => item.status === "Verified") || {};
  const unverifiedData = data?.find((item) => item.status === "Unverified") || {};

  const totalVerified = verifiedData.count || 0;
  const totalUnverified = unverifiedData.count || 0;
  const totalPrimary =
    (verifiedData.primaryAccounts || 0) + (unverifiedData.primaryAccounts || 0);
  const totalSecondary =
    (verifiedData.secondaryAccounts || 0) + (unverifiedData.secondaryAccounts || 0);

  const verificationRate =
    totalVerified + totalUnverified === 0
      ? 0
      : Math.round((totalVerified / (totalVerified + totalUnverified)) * 100);

  const pieConfig = {
    data: data || [],
    angleField: "count",
    colorField: "status",
    color: ["#52c41a", "#f5222d"],
    radius: 0.8,
    label: {
      type: "outer",
      content: "{status} {percentage}", // ✅ Fixed from {name}
    },
    interactions: [{ type: "element-active" }],
  };

  if (isError) {
    return (
      <Result
        status="error"
        icon={<WarningOutlined />}
        title="Failed to load bank analytics"
        subTitle="Please check your connection or try again later."
      />
    );
  }

  return (
    <div style={{ padding: "24px", background: "#fafafa" }}>
      <Title level={3} style={{ marginBottom: "24px" }}>
        Bank Account Verification Analytics
      </Title>

      <Row gutter={[16, 16]}>
        {/* Verification Status Chart */}
        <Col xs={24} md={12}>
          <Card
            size="small"
            title="Verification Status"
            style={{ minHeight: 300 }}
          >
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Pie {...pieConfig} />
            )}
          </Card>
        </Col>

        {/* Account Summary */}
        <Col xs={24} md={12}>
          <Card size="small" title="Account Summary" style={{ minHeight: 300 }}>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title={
                      <Text style={{ fontSize: 12 }}>Primary Accounts</Text>
                    }
                    value={totalPrimary}
                    prefix={<SafetyOutlined />}
                    valueStyle={{ fontSize: 20, color: "#1890ff" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={
                      <Text style={{ fontSize: 12 }}>Secondary Accounts</Text>
                    }
                    value={totalSecondary}
                    prefix={<BankOutlined />}
                    valueStyle={{ fontSize: 20, color: "#722ed1" }}
                  />
                </Col>
                <Col span={24}>
                  <Progress
                    percent={verificationRate}
                    status="active"
                    strokeColor="#52c41a"
                    style={{ marginTop: 10 }}
                  />
                  <Text type="secondary">{verificationRate}% Verification Rate</Text>
                </Col>
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BankAnalytics;
