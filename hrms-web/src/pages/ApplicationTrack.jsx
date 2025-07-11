import React, { useState, useEffect } from "react";
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
  Input,
  Button,
  Form,
  Steps,
  message,
  ConfigProvider,
  theme,
} from "antd";
import {
  CheckCircleOutlined,
  PhoneOutlined,
  UserOutlined,
  DollarOutlined,
  RocketOutlined,
  MehOutlined,
  CloseOutlined,
  PauseOutlined,
  SearchOutlined,
  FileTextOutlined,
  SolutionOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import DocumentVerification from "./Staff/ProfileCreating/DocumentInfo";
import WorkExperience from "./Staff/ProfileCreating/WorkExperience";
import ProfileInfo from "./Staff/ProfileCreating/ProfileInfo";

const { Title, Text } = Typography;
const { Step } = Steps;

// Glass morphism styles
const glassStyle = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  borderRadius: "12px",
};

const cardHeaderStyle = {
  background: "rgba(255, 255, 255, 0.15)",
  padding: "16px",
  margin: "-16px -16px 16px -16px",
  borderRadius: "12px 12px 0 0",
};

const statusConfig = {
  applied: { title: "Applied", icon: <FileTextOutlined />, color: "#3b82f6" },
  phone_screen: {
    title: "Phone Screen",
    icon: <PhoneOutlined />,
    color: "#f97316",
  },
  interview_round: {
    title: "Interview Round",
    icon: <UserOutlined />,
    color: "#8b5cf6",
  },
  selected: {
    title: "Selected",
    icon: <CheckCircleOutlined />,
    color: "#10b981",
  },
  offer_sent: {
    title: "Offer Sent",
    icon: <DollarOutlined />,
    color: "#059669",
  },
  onboarding: {
    title: "Onboarding",
    icon: <RocketOutlined />,
    color: "#7c3aed",
  },
  not_interested: {
    title: "Not Interested",
    icon: <MehOutlined />,
    color: "#64748b",
  },
  rejected: {
    title: "Rejected",
    icon: <CloseOutlined />,
    color: "#ef4444",
  },
  on_hold: {
    title: "On Hold",
    icon: <PauseOutlined />,
    color: "#f59e0b",
  },
};

function ApplicationTrack() {
  const [appId, setAppId] = useState("");
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [urlId, setUrlId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  // Get candidate ID from URL on component mount
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const id = query.get("id");
    if (id) {
      setUrlId(id);
      setAppId(id);
    }
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["application"],
    queryFn: () =>
      axios
        .get(`/api/v1/career/application-track/${appId || urlId}`)
        .then((res) => res.data),
    enabled: !!urlId || !!appId,
    retry: false,
  });

  const handleSearch = () => {
    if (appId.trim()) {
      refetch();
    }
  };

  const showOnboardingForm =
    data && (data.status === "selected" || data.status === "onboarding");

  const steps = [
    {
      title: "Profile Info",
      icon: <IdcardOutlined />,
      content: <ProfileInfo form={form} />,
    },
    {
      title: "Work Experience",
      icon: <SolutionOutlined />,
      content: <WorkExperience form={form} />,
    },
    {
      title: "Documents",
      icon: <FileTextOutlined />,
      content: <DocumentVerification form={form} />,
    },
    {
      title: "Family Details",
      icon: <TeamOutlined />,
      content: <ProfileInfo form={form} />,
    },
  ];

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        applicationId: appId || urlId,
        ...values,
      };
      // Submit to your API endpoint
      // await axios.post('/api/v1/career/onboarding', payload);
      message.success("Onboarding details submitted successfully!");
    } catch (error) {
      message.error(
        error.response?.data?.message || 
        "Failed to submit details. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#7c3aed",
          borderRadius: 12,
          colorBgContainer: darkMode ? "rgba(0, 0, 0, 0.3)" : "#ffffff",
        },
      }}
    >
      <div 
        style={{ 
          minHeight: "100vh",
          padding: "24px",
          background: darkMode 
            ? "radial-gradient(circle at 10% 20%, rgba(37, 37, 37, 1) 0%, rgba(17, 17, 17, 1) 90%)"
            : "radial-gradient(circle at 10% 20%, rgb(239, 246, 249) 0%, rgb(206, 239, 253) 90%)",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ 
            textAlign: "center", 
            marginBottom: "32px",
            padding: "24px",
            ...glassStyle,
          }}>
            <Title level={3} style={{ 
              color: darkMode ? "#ffffff" : "#4f46e5",
              margin: 0,
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}>
              Zeelab Application Tracker
            </Title>
            <Button 
              type="text" 
              onClick={() => setDarkMode(!darkMode)}
              style={{ 
                position: "absolute", 
                top: "24px", 
                right: "24px",
                color: darkMode ? "#ffffff" : "#4f46e5",
              }}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </Button>
          </div>

          {/* Input Card */}
          <Card 
            style={{ 
              marginBottom: "24px",
              ...glassStyle,
              border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <div style={cardHeaderStyle}>
              <Title level={5} style={{ 
                marginBottom: 0,
                color: darkMode ? "#ffffff" : "#4f46e5",
              }}>
                Track Your Application
              </Title>
            </div>

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
                style={{
                  background: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.8)",
                }}
              />
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={isLoading}
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                  border: "none",
                }}
              >
                {isLoading ? "Tracking..." : "Track"}
              </Button>
            </Space.Compact>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card style={glassStyle}>
              <div style={{ textAlign: "center", padding: "24px" }}>
                <Spin size="large" />
                <Text style={{ 
                  display: "block", 
                  marginTop: "16px",
                  color: darkMode ? "#ffffff" : "#4f46e5",
                }}>
                  Fetching application details...
                </Text>
              </div>
            </Card>
          )}

          {/* Application Data */}
          {data && (
            <>
              <Card 
                style={{ 
                  marginBottom: "24px",
                  ...glassStyle,
                  border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <div style={cardHeaderStyle}>
                  <Title level={5} style={{ 
                    marginBottom: 0,
                    color: darkMode ? "#ffffff" : "#4f46e5",
                  }}>
                    Application Status
                  </Title>
                </div>
                
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Application ID">
                    <Text strong>{data?.id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Candidate Name">
                    <Text strong>{data?.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Position Applied">
                    <Text strong>{data?.jobTitle || "N/A"}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Applied At">
                    <Text strong>{data?.applied || "N/A"}</Text>
                  </Descriptions.Item>
                </Descriptions>

                <Divider style={{ borderColor: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }} />

                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  <div>
                    <Text strong style={{ color: darkMode ? "#ffffff" : "#4f46e5" }}>Current Status:</Text>
                    <Tag
                      icon={statusConfig[data.status]?.icon}
                      color={statusConfig[data.status]?.color}
                      style={{
                        marginLeft: "8px",
                        fontSize: "14px",
                        padding: "4px 8px",
                        fontWeight: 600,
                      }}
                    >
                      {statusConfig[data.status]?.title}
                    </Tag>
                  </div>
                </Space>
              </Card>

              {/* Onboarding Form */}
              {showOnboardingForm && (
                <Card 
                  style={{ 
                    marginBottom: "24px",
                    ...glassStyle,
                    border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.1)",
                  }}
                  bodyStyle={{ padding: "24px" }}
                >
                  <div style={cardHeaderStyle}>
                    <Title level={5} style={{ 
                      marginBottom: 0,
                      color: darkMode ? "#ffffff" : "#4f46e5",
                    }}>
                      Complete Your Onboarding
                    </Title>
                    <Tag color="green" style={{ marginLeft: "12px" }}>Action Required</Tag>
                  </div>

                  <Text
                    type="secondary"
                    style={{ 
                      display: "block", 
                      marginBottom: "24px",
                      color: darkMode ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)",
                    }}
                  >
                    Please complete all sections to proceed with your onboarding process.
                  </Text>

                  <Steps 
                    current={currentStep} 
                    style={{ marginBottom: "32px" }}
                    items={steps.map(step => ({
                      ...step,
                      title: <span style={{ color: darkMode ? "#ffffff" : "#4f46e5" }}>{step.title}</span>
                    }))}
                  />

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    initialValues={{
                      experiences: [{}],
                      documents: [{}],
                    }}
                  >
                    <div className="steps-content">
                      {steps[currentStep].content}
                    </div>

                    <div className="steps-action" style={{ marginTop: "24px" }}>
                      {currentStep > 0 && (
                        <Button
                          style={{ marginRight: "8px" }}
                          onClick={() => setCurrentStep(currentStep - 1)}
                        >
                          Previous
                        </Button>
                      )}
                      {currentStep < steps.length - 1 && (
                        <Button
                          type="primary"
                          onClick={() => {
                            form.validateFields()
                              .then(() => setCurrentStep(currentStep + 1))
                              .catch(() => message.warning("Please fill all required fields"));
                          }}
                          style={{
                            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                            border: "none",
                          }}
                        >
                          Next
                        </Button>
                      )}
                      {currentStep === steps.length - 1 && (
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={submitting}
                          style={{
                            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                            border: "none",
                          }}
                        >
                          Submit All Details
                        </Button>
                      )}
                    </div>
                  </Form>
                </Card>
              )}
            </>
          )}

          {/* Footer */}
          <div style={{ 
            textAlign: "center", 
            marginTop: "32px", 
            color: darkMode ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)",
            padding: "16px",
            ...glassStyle,
          }}>
            <Text>© {new Date().getFullYear()} Zeelab. All rights reserved.</Text>
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary">
                Need help? Contact us at support@zeelab.com
              </Text>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default ApplicationTrack;