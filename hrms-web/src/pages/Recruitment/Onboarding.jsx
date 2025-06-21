import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  Divider,
  Card,
  Statistic,
  Descriptions,
  Popconfirm,
  message,
  Typography,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserSwitchOutlined,
  PlusOutlined,
  BarChartOutlined,
  FilePdfOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOnboardings,
  deleteOnboarding,
  convertToEmployee,
} from "../../api/jobs";
import toast, { Toaster } from "react-hot-toast";
import OnboardingChart from "../../components/OnboardingChart";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Onboarding = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [onboardingToDelete, setOnboardingToDelete] = useState(null);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const queryClient = useQueryClient();

 
  const {
    data: onboardings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["onboardings"],
    queryFn: fetchOnboardings,
    onError: () => {
      toast.error("Failed to fetch onboardings. Please try again later.", {
        duration: 5000,
        position: "top-right",
      });
    },
  });

  // Delete onboarding mutation
  const { mutate: deleteOnboardingMutation, isLoading: isDeleting } =
    useMutation({
      mutationFn: deleteOnboarding,
      onSuccess: () => {
        toast.success("Onboarding deleted successfully!", {
          duration: 4000,
          position: "top-right",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });
        queryClient.invalidateQueries(["onboardings"]);
        setIsDeleteModalVisible(false);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message ||
            "Failed to delete onboarding. Please try again.",
          {
            duration: 5000,
            position: "top-right",
            icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          }
        );
      },
    });

  // Convert to employee mutation
  const { mutate: convertToEmployeeMutation, isLoading: isConverting } =
    useMutation({
      mutationFn: convertToEmployee,
      onSuccess: () => {
        toast.success("Candidate converted to employee successfully!", {
          duration: 4000,
          position: "top-right",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        });
        queryClient.invalidateQueries(["onboardings"]);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message ||
            "Failed to convert candidate. Please try again.",
          {
            duration: 5000,
            position: "top-right",
            icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
          }
        );
      },
    });

  // Filter and search logic
  const filteredData = onboardings?.filter((item) => {
    const matchesSearch =
      item.candidateName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const navigate = useNavigate();
  // Status counts for statistics
  const statusCounts = onboardings?.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  // Columns for the table
  const columns = [
    {
      title: "Candidate",
      dataIndex: "candidateName",
      key: "candidateName",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar
            src={
              record.avatar ||
              `https://ui-avatars.com/api/?name=${text}&background=7265e6&color=fff`
            }
            className="mr-3"
          />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Joining Date",
      dataIndex: "joiningDate",
      key: "joiningDate",
      render: (date) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {new Date(date).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">
            {Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))}{" "}
            days remaining
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        let icon = null;

        switch (status) {
          case "pending":
            color = "orange";
            icon = <ClockCircleOutlined />;
            break;
          case "confirmed":
            color = "green";
            icon = <CheckCircleOutlined />;
            break;
          case "cancelled":
            color = "red";
            icon = <CloseCircleOutlined />;
            break;
          default:
            color = "blue";
        }

        return (
          <Tag color={color} icon={icon} className="flex items-center gap-1">
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      render: (salary) => (
        <div className="flex flex-col">
          <span className="font-medium">${salary.toLocaleString()}</span>
          {salary > 100000 && (
            <span className="text-xs text-green-500">+ Bonus Eligible</span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#1890ff" }} />}
            onClick={() => {
              setSelectedOnboarding(record);
              setIsModalVisible(true);
            }}
            tooltip="View Details"
          />
          <Button
            type="text"
            icon={<UserSwitchOutlined style={{ color: "#722ed1" }} />}
            onClick={() => convertToEmployeeMutation(record._id)}
            loading={isConverting}
            tooltip="Convert to Employee"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setOnboardingToDelete(record);
              setIsDeleteModalVisible(true);
            }}
            tooltip="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 onboarding-container">
      <Toaster
        toastOptions={{
          style: {
            borderRadius: "8px",
            padding: "16px",
          },
        }}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Title level={2} className="m-0 text-gray-800">
            Onboarding Management
          </Title>
          <Text type="secondary" className="text-sm">
            Manage all your candidate onboarding processes
          </Text>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button
            icon={<BarChartOutlined />}
            onClick={() => setIsChartVisible(!isChartVisible)}
            className="flex items-center"
          >
            {isChartVisible ? "Hide Analytics" : "Show Analytics"}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="stat-card" hoverable>
          <Statistic
            title="Total Onboardings"
            value={onboardings?.length || 0}
            prefix={<FilePdfOutlined />}
            valueStyle={{ color: "#7265e6" }}
          />
        </Card>
        <Card className="stat-card" hoverable>
          <Statistic
            title="Pending"
            value={statusCounts?.pending || 0}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
        <Card className="stat-card" hoverable>
          <Statistic
            title="Confirmed"
            value={statusCounts?.confirmed || 0}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
        <Card className="stat-card" hoverable>
          <Statistic
            title="Cancelled"
            value={statusCounts?.cancelled || 0}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: "#f5222d" }}
          />
        </Card>
      </div>

      {/* Charts Section */}
      {isChartVisible && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <Title level={4} className="mb-4">
            Onboarding Analytics
          </Title>
          <OnboardingChart data={onboardings} />
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow">
        <Search
          placeholder="Search by name or job title"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full md:w-1/2"
        />
        <div className="flex space-x-4">
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            size="large"
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="all">All Statuses</Option>
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </div>
      </div>

      {/* Onboardings Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} onboardings`,
          }}
          scroll={{ x: true }}
        />
      </div>

      {/* View Details Modal */}
      <Modal
        title={
          <span className="text-xl font-semibold">Onboarding Details</span>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        centered
        className="details-modal"
      >
        {selectedOnboarding && (
          <div className="space-y-4">
            {console.log(selectedOnboarding)}
            <div className="flex items-center mb-6">
              <Avatar
                size={64}
                src={
                  selectedOnboarding.avatar ||
                  `https://ui-avatars.com/api/?name=${selectedOnboarding.candidateName}&size=64`
                }
                className="mr-4"
              />
              <div>
                <Title level={4} className="m-0">
                  {selectedOnboarding.candidateName}
                </Title>
                <Text type="secondary">{selectedOnboarding.jobTitle}</Text>
              </div>
            </div>

            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Joining Date" span={2}>
                <div className="flex items-center">
                  {new Date(
                    selectedOnboarding.joiningDate
                  ).toLocaleDateString()}
                  <Tag color="blue" className="ml-2">
                    {Math.ceil(
                      (new Date(selectedOnboarding.joiningDate) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days remaining
                  </Tag>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedOnboarding.status === "confirmed"
                      ? "green"
                      : selectedOnboarding.status === "pending"
                      ? "orange"
                      : "red"
                  }
                  icon={
                    selectedOnboarding.status === "confirmed" ? (
                      <CheckCircleOutlined />
                    ) : selectedOnboarding.status === "pending" ? (
                      <ClockCircleOutlined />
                    ) : (
                      <CloseCircleOutlined />
                    )
                  }
                >
                  {selectedOnboarding.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Salary Package">
                <div className="flex flex-col">
                  <span className="font-medium">
                    ${selectedOnboarding.salary.toLocaleString()}
                  </span>
                  {selectedOnboarding.bonus && (
                    <span className="text-sm">
                      + ${selectedOnboarding.bonus.toLocaleString()} bonus
                    </span>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                <div className="flex items-center">
                  <MailOutlined className="mr-2" />
                  {selectedOnboarding.email || "N/A"}
                </div>
                <div className="flex items-center mt-1">
                  <PhoneOutlined className="mr-2" />
                  {selectedOnboarding.phone || "N/A"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Work Location">
                {selectedOnboarding.workLocation}
              </Descriptions.Item>
              <Descriptions.Item label="Equipment Needed">
                {selectedOnboarding.equipmentNeeded ? (
                  <Tag color="green">Yes</Tag>
                ) : (
                  <Tag color="default">No</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Title level={5} className="mb-2">
                Onboarding Checklist
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedOnboarding.checklist?.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleOutlined
                      style={{ color: item.completed ? "#52c41a" : "#d9d9d9" }}
                      className="mr-2"
                    />
                    <Text delete={!item.completed}>{item.task}</Text>
                  </div>
                )) || <Text type="secondary">No checklist items</Text>}
              </div>
            </div>

            <Divider />

            <div>
              <Title level={5} className="mb-2">
                Additional Notes
              </Title>
              <Text className="text-gray-700">
                {selectedOnboarding.notes || "No additional notes provided"}
              </Text>
            </div>

            <div className="flex justify-end mt-6">
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>Close</Button>
                <Button
                  onClick={() =>
                    navigate(
                      `/recruitment/application?id=${selectedOnboarding.candidateId}`
                    )
                  }
                >
                  View Candidate
                </Button>
                <Button
                  type="primary"
                  icon={<UserSwitchOutlined />}
                  onClick={() => {
                    convertToEmployeeMutation(selectedOnboarding._id);
                    setIsModalVisible(false);
                  }}
                  loading={isConverting}
                >
                  Convert to Employee
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={<span className="text-xl font-semibold">Confirm Deletion</span>}
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={null}
        centered
        className="delete-modal"
      >
        {onboardingToDelete && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <CloseCircleOutlined
                style={{ fontSize: "48px", color: "#ff4d4f" }}
                className="mb-4"
              />
              <Title level={4} className="m-0">
                Are you sure you want to delete this onboarding?
              </Title>
              <Text type="secondary" className="mt-2">
                This will permanently delete the onboarding record for{" "}
                {onboardingToDelete.candidateName}.
              </Text>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex items-center">
                <Avatar
                  src={
                    onboardingToDelete.avatar ||
                    `https://ui-avatars.com/api/?name=${onboardingToDelete.candidateName}`
                  }
                  className="mr-3"
                />
                <div>
                  <Text strong>{onboardingToDelete.candidateName}</Text>
                  <div className="text-sm text-gray-500">
                    {onboardingToDelete.jobTitle}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <Button onClick={() => setIsDeleteModalVisible(false)}>
                Cancel
              </Button>
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => deleteOnboardingMutation(onboardingToDelete._id)}
                loading={isDeleting}
              >
                Delete Onboarding
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Onboarding;
