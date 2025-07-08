import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../axiosConfig";
import {
  Card,
  Typography,
  Spin,
  Alert,
  Divider,
  Tag,
  Space,
  Descriptions,
  Progress,
  Input,
  Button,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  TeamOutlined,
  FileDoneOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const statusConfig = {
  applied: {
    color: "blue",
    icon: <FileDoneOutlined />,
    progress: 20,
    label: "Applied",
  },
  phone_screen: {
    color: "geekblue",
    icon: <PhoneOutlined />,
    progress: 40,
    label: "Phone Screen",
  },
  interview: {
    color: "orange",
    icon: <TeamOutlined />,
    progress: 60,
    label: "Interview",
  },
  onboarding: {
    color: "purple",
    icon: <ClockCircleOutlined />,
    progress: 80,
    label: "Onboarding",
  },
  hired: {
    color: "green",
    icon: <CheckCircleOutlined />,
    progress: 100,
    label: "Hired",
  },
  rejected: {
    color: "red",
    icon: <CloseCircleOutlined />,
    progress: 100,
    label: "Rejected",
  },
};

function ApplicationTrack() {
  const [appId, setAppId] = useState("");
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["application", appId],
    queryFn: () =>
      axios
        .get(`/api/v1/career/application-track/${appId}`)
        .then((res) => res.data),
    enabled: false, // Disable automatic fetching
    retry: false,
  });
  console.log(error);
  const handleSearch = () => {
    if (appId.trim()) {
      refetch();
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Title level={3} style={{ color: "#4f46e5" }}>
          Zeelab Application Tracker
        </Title>
      </div>

      {/* Input Card - Always visible */}
      <Card style={{ marginBottom: "24px" }}>
        <Title level={5} style={{ marginBottom: "16px" }}>
          Track Your Application
        </Title>

        {/* Show error above input if exists */}
        {isError && (
          <Alert
            message="Error"
            description={
              error.response?.data?.message ||
              "Application not found. Please check your ID."
            }
            type="error"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}

        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="Enter your application ID"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            size="large"
            disabled={isLoading}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={isLoading}
          >
            Track
          </Button>
        </Space.Compact>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div style={{ textAlign: "center", padding: "24px" }}>
            <Spin size="large" />
            <Text style={{ display: "block", marginTop: "16px" }}>
              Fetching application details...
            </Text>
          </div>
        </Card>
      )}

      {/* Application Data - Only shown when successfully loaded */}
      {data && (
        <Card title="Application Status">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Application ID">
              {data?.id}
            </Descriptions.Item>
            <Descriptions.Item label="Candidate Name">
              {data?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Position Applied">
              
              {data?.jobTitle || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Applied At">
              
              {data?.applied || "N/A"}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Text strong>Current Status:</Text>
              <Tag
                icon={statusConfig[data.status]?.icon}
                color={statusConfig[data.status]?.color}
                style={{
                  marginLeft: "8px",
                  fontSize: "14px",
                  padding: "4px 8px",
                }}
              >
                {statusConfig[data.status]?.label}
              </Tag>
            </div>
          </Space>
        </Card>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "32px", color: "#64748b" }}>
        <Text>© {new Date().getFullYear()} Zeelab. All rights reserved.</Text>
        <div style={{ marginTop: "8px" }}>
          <Text type="secondary">
            Need help? Contact us at support@zeelab.com
          </Text>
        </div>
      </div>
    </div>
  );
}

export default ApplicationTrack;
