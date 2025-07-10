import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { toast } from "react-hot-toast";
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Descriptions,
  Divider,
  Popconfirm,
  message,
  Steps,
  Avatar,
  Checkbox,
  Pagination,
  Spin,
  Card,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import useAuthStore from "../../stores/authStore";
import SeparationAnalytics from "../../components/SeparationAnalytics";

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const AdminSeparationManagement = () => {

 const queryClient = useQueryClient();


  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [separationForm] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSeparationModalVisible, setIsSeparationModalVisible] =
    useState(false);
  const [searchParams, setSearchParams] = useState({
    status: "",
    page: 1,
    limit: 10,
  });
  const [employeeSearchParams, setEmployeeSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [assetsConfirmed, setAssetsConfirmed] = useState(false);

  // Fetch separation requests
  const {
    data: separationData,
    refetch,
    
    isLoading,
  } = useQuery({
    queryKey: ["allSeparationRequests", searchParams],
    queryFn: async () => {
      const response = await axios.get("/api/v1/separations", {
        params: searchParams,
      });
      return response.data;
    },
  });

  // Fetch employees with pagination and search
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["allEmployees", employeeSearchParams],
    queryFn: async () => {
      const response = await axios.get("/api/v1/user/staff", {
        params: {
          ...employeeSearchParams,
        },
      });
      return response.data;
    },
    enabled: isSeparationModalVisible,
  });

  // Update separation request mutation
  const updateSeparation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.put(
        `/api/v1/separations/${selectedRequest._id}`,
        values
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Separation request updated successfully");
      refetch();
       queryClient.invalidateQueries({
      queryKey: ['separationAnalytics']
    });
      setIsModalVisible(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to update request");
    },
  });

  // Create admin-initiated separation
  const createSeparation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post("/api/v1/separations", {
        ...values,
        user: selectedEmployee._id,
        status: "approved",
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Separation initiated successfully");
      refetch();
      queryClient.invalidateQueries({
      queryKey: ['separationAnalytics']
    });
      setIsSeparationModalVisible(false);
      setCurrentStep(0);
      setSelectedEmployee(null);
      separationForm.resetFields();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to initiate separation"
      );
    },
  });

  // Handle employee search with debounce
  const handleEmployeeSearch = debounce((value) => {
    setEmployeeSearchParams((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  }, 500);

  // Handle form submission for review modal
  const handleSubmit = (values) => {
    updateSeparation.mutate({ ...values, updatedBy: user?._id });
  };

  // Handle admin-initiated separation submission
  const handleSeparationSubmit = (values) => {
    createSeparation.mutate(values);
  };

  // View and edit request
  const handleViewRequest = (request) => {
    console.log(request);
    setSelectedRequest(request);
    form.setFieldsValue({
      status: request.status,
      adminComments: request.adminComments,
      noticePeriod: request.noticePeriod,
      expectedSeparationDate: request.expectedSeparationDate
        ? dayjs(request.expectedSeparationDate) // Just pass the ISO string directly to dayjs
        : null,
    });
    setIsModalVisible(true);
  };

  // Status tag colors
  const statusTagColors = {
    pending: "orange",
    approved: "green",
    rejected: "red",
    under_review: "blue",
  };

  // Steps for admin-initiated separation
  const steps = [
    {
      title: "Select Employee",
      content: (
        <div className="mt-6">
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Search employee by name or ID"
            optionFilterProp="children"
            filterOption={false}
            onSearch={handleEmployeeSearch}
            onChange={(value) => {
              const emp = employeesData?.data?.find((e) => e._id === value);
              setSelectedEmployee(emp);
            }}
            loading={employeesLoading}
            notFoundContent={employeesLoading ? <Spin size="small" /> : null}
          >
            {Array.isArray(employeesData?.data) &&
              employeesData?.data?.map((employee) => (
                <Option key={employee._id} value={employee._id}>
                  <div className="flex items-center">
                    <Avatar
                      size="small"
                      src={employee.profilePicture}
                      icon={<UserOutlined />}
                      className="mr-2"
                    />
                    {employee.firstName} {employee.lastName} (
                    {employee.EmployeeId || "N/A"})
                  </div>
                </Option>
              ))}
          </Select>

          <div className="mt-4 flex justify-end">
            <Pagination
              size="small"
              current={employeeSearchParams.page}
              pageSize={employeeSearchParams.limit}
              total={employeesData?.totalCount}
              onChange={(page, pageSize) => {
                setEmployeeSearchParams((prev) => ({
                  ...prev,
                  page,
                  limit: pageSize,
                }));
              }}
              showSizeChanger
              showQuickJumper
            />
          </div>
        </div>
      ),
    },
    {
      title: "Separation Details",
      content: (
        <Form
          form={separationForm}
          layout="vertical"
          className="mt-6"
          onFinish={handleSeparationSubmit}
        >
          <Form.Item
            name="separationType"
            label="Separation Type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select placeholder="Select separation type">
              <Option value="resignation">Resignation</Option>
              <Option value="termination">Termination</Option>
              <Option value="retirement">Retirement</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="noticePeriod"
            label="Notice Period (days)"
            rules={[{ required: true, message: "Please enter notice period" }]}
          >
            <Input
              type="number"
              min={0}
              onChange={(e) => {
                const days = parseInt(e.target.value || 0);
                const newDate = days === 0 ? dayjs() : dayjs().add(days, "day");
                separationForm.setFieldsValue({
                  expectedSeparationDate: newDate,
                });
              }}
            />
          </Form.Item>

          <Form.Item
            name="expectedSeparationDate"
            label="Expected Separation Date"
            rules={[
              {
                required: true,
                message: "Please select expected separation date",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current < dayjs().endOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Please enter reason" }]}
          >
            <TextArea rows={4} placeholder="Enter reason for separation" />
          </Form.Item>

          <Form.Item name="assetsConfirmed" valuePropName="checked">
            <Checkbox onChange={(e) => setAssetsConfirmed(e.target.checked)}>
              Confirm all company assets have been collected
            </Checkbox>
          </Form.Item>

          <Form.Item name="adminComments" label="Admin Comments">
            <TextArea rows={3} placeholder="Any additional comments" />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "Confirmation",
      content: (
        <div className="mt-6">
          {selectedEmployee && (
            <Card title="Separation Summary">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Employee">
                  <div className="flex items-center">
                    <Avatar
                      size="large"
                      src={selectedEmployee.profilePicture}
                      icon={<UserOutlined />}
                      className="mr-3"
                    />
                    <div>
                      <h4 className="m-0">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </h4>
                      <p className="m-0 text-gray-500">
                        {selectedEmployee.EmployeeId || "N/A"} |{" "}
                        {selectedEmployee.email}
                      </p>
                    </div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Separation Type">
                  {separationForm
                    .getFieldValue("separationType")
                    ?.charAt(0)
                    .toUpperCase() +
                    separationForm.getFieldValue("separationType")?.slice(1)}
                </Descriptions.Item>
                <Descriptions.Item label="Notice Period">
                  {separationForm.getFieldValue("noticePeriod")} days
                </Descriptions.Item>
                <Descriptions.Item label="Separation Date">
                  {dayjs(
                    separationForm.getFieldValue("expectedSeparationDate")
                  ).format("DD MMM YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Reason">
                  {separationForm.getFieldValue("reason") || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Assets Confirmation">
                  {assetsConfirmed ? (
                    <Tag color="green">Confirmed</Tag>
                  ) : (
                    <Tag color="orange">Pending</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <ExclamationCircleOutlined className="text-yellow-500 mr-2" />
                <span className="text-yellow-700">
                  This action will immediately deactivate the employee's account
                  upon confirmation.
                </span>
              </div>
            </Card>
          )}
        </div>
      ),
    },
  ];

  // Columns for the admin table
  const columns = [
    {
      title: "Employee",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
          {user?.firstName} {user?.lastName}
        </div>
      ),
      sorter: (a, b) => a?.user?.firstName.localeCompare(b?.user?.firstName),
    },

    {
      title: "Request Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Type",
      dataIndex: "separationType",
      key: "separationType",
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1),
      filters: [
        { text: "Resignation", value: "resignation" },
        { text: "Termination", value: "termination" },
        { text: "Retirement", value: "retirement" },
        { text: "Other", value: "other" },
      ],
      onFilter: (value, record) => record.separationType === value,
    },
    {
      title: "Expected Date",
      dataIndex: "expectedSeparationDate",
      key: "expectedSeparationDate",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusTagColors[status]}>
          {status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Tag>
      ),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Rejected", value: "rejected" },
        { text: "Under Review", value: "under_review" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => handleViewRequest(record)}
          >
            Details
          </Button>
          {record.status === "pending" && (
            <>
              <Popconfirm
                title="Approve this request?"
                description="This will deactivate the employee's account."
                onConfirm={() => handleQuickAction(record._id, "approved")}
                okText="Approve"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  className="text-green-600"
                />
              </Popconfirm>
              <Popconfirm
                title="Reject this request?"
                onConfirm={() => handleQuickAction(record._id, "rejected")}
                okText="Reject"
                cancelText="Cancel"
              >
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  className="text-red-500"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Quick approve/reject action
  const handleQuickAction = async (requestId, action) => {
    try {
      await axios.put(`/api/v1/separations/${requestId}`, {
        status: action,
        updatedBy: user?._id,
      });
      toast.success(`Request ${action} successfully`);
      refetch();
       queryClient.invalidateQueries({
      queryKey: ['separationAnalytics']
    });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update request");
    }
  };

  // Handle step change in separation modal
  const handleStepChange = (step) => {
    if (step === 1 && !selectedEmployee) {
      message.error("Please select an employee first");
      return;
    }

    if (step === 2) {
      separationForm
        .validateFields()
        .then(() => {
          setCurrentStep(step);
        })
        .catch(() => {
          message.error("Please fill all required fields");
        });
      return;
    }

    setCurrentStep(step);
  };

  return (
    <div className="p-4 h-[92vh] overflow-y-auto  ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Separations</h1>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsSeparationModalVisible(true)}
          >
            Initiate Separation
          </Button>
          <Select
            placeholder="Filter by status"
            allowClear
            onChange={(value) =>
              setSearchParams((prev) => ({ ...prev, status: value, page: 1 }))
            }
            style={{ width: 200 }}
            value={searchParams.status || undefined}
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="under_review">Under Review</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={separationData?.requests || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: searchParams.page,
          pageSize: searchParams.limit,
          total: separationData?.totalCount,
          onChange: (page, pageSize) => {
            setSearchParams((prev) => ({
              ...prev,
              page,
              limit: pageSize,
            }));
          },
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        bordered
      />
      <SeparationAnalytics />
      {/* Review Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <FileTextOutlined className="mr-2" />
            <span>Separation Request Details</span>
          </div>
        }
        width={800}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updateSeparation.isLoading}
            onClick={() => form.submit()}
          >
            Update Status
          </Button>,
        ]}
      >
        {selectedRequest && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Employee">
                <div className="flex items-center">
                  <Avatar
                    size="large"
                    src={selectedRequest.user.profilePicture}
                    icon={<UserOutlined />}
                    className="mr-3"
                  />
                  <div>
                    <h4 className="m-0">
                      {selectedRequest.user.firstName}{" "}
                      {selectedRequest.user.lastName}
                    </h4>
                    <p className="m-0 text-gray-500">
                      {selectedRequest.user.EmployeeId || "N/A"} |{" "}
                      {selectedRequest.user.email}
                    </p>
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {dayjs(selectedRequest.createdAt).format(
                  "DD MMM YYYY, hh:mm A"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Separation Type">
                <Tag color="blue">
                  {selectedRequest.separationType.charAt(0).toUpperCase() +
                    selectedRequest.separationType.slice(1)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusTagColors[selectedRequest.status]}>
                  {selectedRequest.status
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Expected Separation Date">
                {dayjs(selectedRequest.expectedSeparationDate).format(
                  "DD MMM YYYY"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Notice Period">
                {selectedRequest.noticePeriod} days
              </Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>
                {selectedRequest.reason || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="status"
                label="Update Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  <Option value="approved">Approve</Option>
                  <Option value="rejected">Reject</Option>
                  <Option value="under_review">Under Review</Option>
                </Select>
              </Form.Item>

              <Form.Item name="adminComments" label="Comments">
                <TextArea
                  rows={4}
                  placeholder="Enter any comments or instructions"
                />
              </Form.Item>

              <Form.Item
                name="noticePeriod"
                label="Notice Period (days)"
                rules={[
                  { required: true, message: "Please enter notice period" },
                ]}
              >
                <Input
                  type="number"
                  min="0"
                  onChange={(e) => {
                    const days = parseInt(e.target.value || 0);
                    const newDate =
                      days === 0 ? dayjs() : dayjs().add(days, "day");
                    form.setFieldsValue({ expectedSeparationDate: newDate });
                  }}
                />
              </Form.Item>

              <Form.Item
                name="expectedSeparationDate"
                label="Expected Separation Date"
                rules={[
                  {
                    required: true,
                    message: "Please select expected separation date",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) =>
                    current && current < dayjs().endOf("day")
                  }
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Initiate Separation Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <PlusOutlined className="mr-2" />
            <span>Initiate Employee Separation</span>
          </div>
        }
        width={800}
        open={isSeparationModalVisible}
        onCancel={() => {
          setIsSeparationModalVisible(false);
          setCurrentStep(0);
          setSelectedEmployee(null);
          separationForm.resetFields();
        }}
        footer={[
          currentStep > 0 && (
            <Button
              key="back"
              onClick={() => handleStepChange(currentStep - 1)}
            >
              Back
            </Button>
          ),
          currentStep < steps.length - 1 ? (
            <Button
              key="next"
              type="primary"
              onClick={() => handleStepChange(currentStep + 1)}
              disabled={currentStep === 0 && !selectedEmployee}
            >
              Next
            </Button>
          ) : (
            <Button
              key="submit"
              type="primary"
              loading={createSeparation.isLoading}
              onClick={() =>
                handleSeparationSubmit(separationForm.getFieldValue())
              }
            >
              Confirm Separation
            </Button>
          ),
        ]}
      >
        <Steps current={currentStep} className="mb-6">
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className="steps-content">{steps[currentStep].content}</div>
      </Modal>
    </div>
  );
};

export default AdminSeparationManagement;
