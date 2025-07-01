import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Button,
  Form,
  Input,
  Divider,
  Typography,
  Space,
  Alert,
  Flex,
  Modal,
  Descriptions,
  Tag,
  Steps,
  Avatar,
  Result,
  Row,
  Col,
} from "antd";
import {
  LockOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import axios from "../../axiosConfig";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Step } = Steps;

const ConvertToEMP = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isInvok, setIsEnvoke] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [isAlreadyConverted, setIsAlreadyConverted] = useState(false);
  const [existingEmployee, setExistingEmployee] = useState(null);

  const getCandidateIdFromUrl = () => {
    const query = new URLSearchParams(window.location.search);
    return query.get("id");
  };

  const queryClient = useQueryClient();
  const [isConverting, setIsConverting] = useState(false);

  // Check if applicant is already converted
  const { isLoading: isCheckingConversion, data } = useQuery({
    queryKey: [
      "checkEmployeeConversion",
      isInvok,
      getCandidateIdFromUrl(),
    ],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/v1/employees/check-conversion?applicationId=${getCandidateIdFromUrl()}`
        );
        return response.data;
      } catch (error) {
        console.error("API error:", error);
        throw error;
      }
    },
    staleTime: 0,
    retry: false,
  });

  // ✅ Move state updates into useEffect
  useEffect(() => {
    if (data?.isConverted) {
      setIsAlreadyConverted(true);
      setExistingEmployee(data.employee);
    }
  }, [data]);

  const convertToEmployee = async (values) => {
    const response = await axios.post("/api/v1/employees/convert", {
      ...values,
      applicationId: getCandidateIdFromUrl(),
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: convertToEmployee,
    onSuccess: (data) => {
      setCreatedEmployee(data.user);
      setIsSuccessModalVisible(true);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const onFinish = async (values) => {
    setIsConverting(true);
    try {
      await mutation.mutateAsync(values);
      toast.success("Employee account created successfully!");
      form.resetFields();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create employee account"
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleViewProfile = () => {
    navigate(
      `/staff/employee?emp=${createdEmployee?._id || existingEmployee?._id}`
    );
    setIsSuccessModalVisible(false);
  };

  const handleCloseModal = () => {
    setIsEnvoke(!isInvok)
    setIsSuccessModalVisible(false);
  };

  if (isCheckingConversion) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Card loading={true} />
      </div>
    );
  }

  if (isAlreadyConverted) {
    return (
      <div className="border-t" style={{ margin: "0 auto" }}>
        <Result
          icon={<CheckOutlined style={{ color: "#52c41a" }} />}
          title="This applicant is already Onboared to an employee!"
          subTitle={`User ID: ${existingEmployee.EmployeeId}`}
          extra={[
            <Button
              type="primary"
              key="view"
              onClick={() =>
                navigate(`/staff/employee?emp=${existingEmployee._id}`)
              }
              icon={<UserOutlined />}
            >
              View Employee Profile
            </Button>,
            <Button
              key="back"
              onClick={() => navigate(`/recruitment/onboarding`)}
            >
              Back to Onboarding
            </Button>,
          ]}
        />

        <Card title="Employee Details" style={{ marginTop: 24 }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Name">
              {existingEmployee.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Tag icon={<MailOutlined />}>{existingEmployee.email}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Contact">
              <Tag icon={<PhoneOutlined />}>
                {existingEmployee.contactNumber}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={existingEmployee.isActive ? "green" : "orange"}>
                {existingEmployee.isActive ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date of Joining">
              {new Date(existingEmployee.dateOfJoining).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card
            bordered={false}
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: 8,
              padding: 24,
            }}
          >
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Alert
                  message={`Convert Into Employee`}
                  type="success"
                  showIcon
                  style={{ marginBottom: 8 }}
                />

                <Alert
                  message={`Application ID: ${getCandidateIdFromUrl()} `}
                  type="info"
                  showIcon
                  style={{ marginBottom: 2 }}
                />
              </Col>

              <Col span={24}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="password"
                        label="Set Password"
                        rules={[
                          { required: true, message: "Please input password!" },
                          {
                            min: 8,
                            message: "Password must be at least 8 characters",
                          },
                        ]}
                        hasFeedback
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Enter secure password"
                          size="large"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        dependencies={["password"]}
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "Please confirm password!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("password") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Passwords do not match!")
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined />}
                          placeholder="Confirm password"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginTop: 32 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      icon={<CheckCircleOutlined />}
                      loading={isConverting}
                      style={{ height: 48 }}
                    >
                      {isConverting
                        ? "Creating Account..."
                        : "Create Employee Account"}
                    </Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </motion.div>
      </motion.div>

      {/* Success Modal */}
      <Modal
      
        title={
          <Flex align="center" gap={8}>
            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 24 }} />
            <span>Employee Created Successfully!</span>
          </Flex>
        }
        open={isSuccessModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
          <Button
            key="view"
            type="primary"
            onClick={handleViewProfile}
            icon={<UserOutlined />}
          >
            Assign Roles And More!
          </Button>,
        ]}
        width={800}
      >
        {createdEmployee && (
          <div>
            <Flex align="center" gap={24} style={{ marginBottom: 24 }}>
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {createdEmployee.fullName}
                </Title>
                <Text type="secondary">
                  User ID: {createdEmployee.EmployeeId}
                </Text>
              </div>
            </Flex>

            <Steps current={2} style={{ marginBottom: 24 }}>
              <Step title="Application" />
              <Step title="Onboarding" />
              <Step title="Employee Created" />
            </Steps>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Email" span={2}>
                <Tag icon={<MailOutlined />}>{createdEmployee.email}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                <Tag icon={<PhoneOutlined />}>
                  {createdEmployee.contactNumber}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Join Date">
                <Tag icon={<CalendarOutlined />}>
                  {new Date(createdEmployee.dateOfJoining).toLocaleDateString()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={createdEmployee.isActive ? "green" : "orange"}>
                  {createdEmployee.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assets" span={2}>
                <Space size={[0, 8]} wrap>
                  {createdEmployee.Asset?.length > 0 ? (
                    createdEmployee.Asset.map((asset) => (
                      <Tag key={asset} color="blue">
                        {asset}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">No assets assigned</Text>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Documents">
                <Space size={[0, 8]} wrap>
                  {createdEmployee.Document?.length > 0 ? (
                    createdEmployee.Document.map((doc) => (
                      <Tag key={doc} color="purple">
                        {doc}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">No documents</Text>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trainings">
                <Space size={[0, 8]} wrap>
                  {createdEmployee.Trainings?.length > 0 ? (
                    createdEmployee.Trainings.map((training) => (
                      <Tag key={training} color="cyan">
                        {training}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">No trainings</Text>
                  )}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConvertToEMP;
