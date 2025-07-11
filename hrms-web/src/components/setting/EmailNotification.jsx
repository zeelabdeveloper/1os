import React, { useEffect } from "react";
import { Card, Switch, Divider, Form, Button, Row, Col, Spin } from "antd";
import {
  UserAddOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
  SwapOutlined,
  LogoutOutlined,
  CarOutlined,
  RiseOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FormOutlined,
  BellOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEmailNotification,
  updateEmailNotification,
} from "../../api/setting";
import toast from "react-hot-toast";
import { IoTicketOutline } from "react-icons/io5";

const EmailNotificationSettings = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: emailSettings, isLoading } = useQuery({
    queryKey: ["emailNotification"],
    queryFn: fetchEmailNotification,
  });

  const updateMutation = useMutation({
    mutationFn: updateEmailNotification,
    onSuccess: () => {
      toast.success("Email settings updated successfully");
      queryClient.invalidateQueries(["emailNotification"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  useEffect(() => {
    if (emailSettings) {
      form.setFieldsValue(emailSettings);
    }
  }, [emailSettings, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateMutation.mutateAsync(values);
    } catch (err) {
      console.error("Error saving email settings:", err);
    }
  };

  const notificationGroups = [
    {
      title: "Employee Notifications",
      items: [
        {
          name: "newUser",
          label: "New User Registration",
          icon: <UserAddOutlined />,
          color: "#1890ff",
        },
        {
          name: "newEmployee",
          label: "New Employee Added",
          icon: <TeamOutlined />,
          color: "#13c2c2",
        },
        {
          name: "newPayroll",
          label: "New Payroll",
          icon: <DollarOutlined />,
          color: "#722ed1",
        },
        {
          name: "newTicket",
          label: "New Ticket",
          icon: <IoTicketOutline />,
          color: "#fa8c16",
        },
        {
          name: "newAward",
          label: "New Award",
          icon: <TrophyOutlined />,
          color: "#fadb14",
        },
        {
          name: "employeeTransfer",
          label: "Employee Transfer",
          icon: <SwapOutlined />,
          color: "#52c41a",
        },
        {
          name: "employeeResignation",
          label: "Employee Resignation",
          icon: <LogoutOutlined />,
          color: "#ff4d4f",
        },
        {
          name: "employeeTrip",
          label: "Employee Trip",
          icon: <CarOutlined />,
          color: "#fa541c",
        },
        {
          name: "employeePromotion",
          label: "Employee Promotion",
          icon: <RiseOutlined />,
          color: "#eb2f96",
        },
        {
          name: "employeeComplaints",
          label: "Employee Complaints",
          icon: <WarningOutlined />,
          color: "#a0d911",
        },
        {
          name: "employeeWarning",
          label: "Employee Warning",
          icon: <WarningOutlined />,
          color: "#d4380d",
        },
        {
          name: "employeeTermination",
          label: "Employee Termination",
          icon: <CloseCircleOutlined />,
          color: "#d9363e",
        },
      ],
    },
    {
      title: "Leave Management",
      items: [
        {
          name: "leaveStatus",
          label: "Leave Status Change",
          icon: <FileDoneOutlined />,
          color: "#08979c",
        },
        {
          name: "contract",
          label: "Contract",
          icon: <FileTextOutlined />,
          color: "#7cb305",
        },
        {
          name: "newLeaveRequest",
          label: "New Leave Request",
          icon: <FormOutlined />,
          color: "#d48806",
        },
      ],
    },
    {
      title: "Other Notifications",
      items: [
        {
          name: "newComplaint",
          label: "New Complaint",
          icon: <BellOutlined />,
          color: "#391085",
        },
        {
          name: "newWarning",
          label: "New Warning",
          icon: <WarningOutlined />,
          color: "#9e1068",
        },
        {
          name: "newNews",
          label: "New News",
          icon: <VideoCameraOutlined />,
          color: "green",
        },
      ],
    },

    {
      title: "Recruitment Management",
      items: [
        {
          name: "newApplicationStatus",
          label: "New Application Status",
          icon: <FileDoneOutlined />,
          color: "#08979c",
        },
        {
          name: "interviewInitiateApplicant",
          label: "Applicant - Interview Initiate",
          icon: <FileDoneOutlined />,
          color: "#02979c",
        },
        {
          name: "interviewInitiateInterviewer",
          label: "Interviewer - Interview Initiate",
          icon: <FileDoneOutlined />,
          color: "#08919c",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          name: "managerRequestRegardingNewHiring",
          label: "Hiring Request From Manager To Head And HR",
          icon: <FileDoneOutlined />,
          color: "#08979c",
        },
        
       
      ],
    },
  ];

  if (isLoading)
    return <Spin size="large" className="flex justify-center my-8" />;

  return (
    <div className="">
      <Card
        title="Email Notification Settings"
        bordered={false}
        className="shadow-lg rounded-lg"
      >
        <Form form={form} layout="vertical">
          {notificationGroups.map((group, index) => (
            <div key={index}>
              <Divider orientation="left" className="text-lg font-semibold">
                {group.title}
              </Divider>
              <Row gutter={[16, 16]}>
                {group.items.map((item, itemIndex) => (
                  <Col key={itemIndex} xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Card
                      hoverable
                      className="shadow-md rounded-lg h-full"
                      bodyStyle={{ padding: "16px" }}
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className="p-2 w-[30px] flex h-[30px] rounded-full mr-3"
                          style={{
                            backgroundColor: `${item.color}20`,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </div>
                        <span className="font-medium text-[9px]">
                          {item.label}
                        </span>
                      </div>
                      <Form.Item
                        name={item.name}
                        valuePropName="checked"
                        className="mb-0"
                      >
                        <Switch
                          checkedChildren="ON"
                          unCheckedChildren="OFF"
                          style={{ backgroundColor: item.color }}
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}

          <div className="mt-6 text-left">
            <Button
              type="primary"
              onClick={handleSubmit}
              size="large"
              className="px-8 h-10 rounded-lg shadow-md"
            >
              Save Settings
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EmailNotificationSettings;
