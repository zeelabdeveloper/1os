import React, { useState } from "react";
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
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  SearchOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const AdminSeparationManagement = () => {
  const [form] = Form.useForm();
  const [separationForm] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSeparationModalVisible, setIsSeparationModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [assetsConfirmed, setAssetsConfirmed] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all employees
  const { data: employees } = useQuery({
    queryKey: ["allEmployees"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/users");
      return response.data.filter(user => user.isActive); // Only active employees
    },
  });

  // Fetch all separation requests
  const { data: separationRequests, isLoading } = useQuery({
    queryKey: ["allSeparationRequests", searchParams],
    queryFn: async () => {
      const response = await axios.get("/api/v1/separations", {
        params: searchParams,
      });
      return response.data;
    },
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
      queryClient.invalidateQueries(["allSeparationRequests"]);
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
      queryClient.invalidateQueries(["allSeparationRequests"]);
      setIsSeparationModalVisible(false);
      setCurrentStep(0);
      setSelectedEmployee(null);
      separationForm.resetFields();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to initiate separation");
    },
  });

  // Handle form submission for review modal
  const handleSubmit = (values) => {
    updateSeparation.mutate(values);
  };

  // Handle admin-initiated separation submission
  const handleSeparationSubmit = (values) => {
    createSeparation.mutate(values);
  };

  // View and edit request
  const handleViewRequest = (request, action = "view") => {
    setSelectedRequest(request);
    form.setFieldsValue({
      status: request.status,
      adminComments: request.adminComments,
      noticePeriod: request.noticePeriod,
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
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={(value) => {
              const emp = employees.find(e => e._id === value);
              setSelectedEmployee(emp);
            }}
          >
            {employees?.map(employee => (
              <Option key={employee._id} value={employee._id}>
                <div className="flex items-center">
                  <Avatar 
                    size="small" 
                    src={employee.profilePicture} 
                    icon={<UserOutlined />} 
                    className="mr-2"
                  />
                  {employee.firstName} {employee.lastName} ({employee.EmployeeId || 'N/A'})
                </div>
              </Option>
            ))}
          </Select>
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
              <Option value="layoff">Layoff</Option>
              <Option value="absconding">Absconding</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          {selectedEmployee && (
            <Form.Item
              name="noticePeriod"
              label="Notice Period (days)"
              initialValue={30}
              rules={[{ required: true, message: "Please enter notice period" }]}
            >
              <Input type="number" min="1" />
            </Form.Item>
          )}

          <Form.Item
            name="expectedSeparationDate"
            label="Separation Date"
            rules={[{ required: true, message: "Please select date" }]}
            initialValue={dayjs().add(30, 'day')}
          >
            <DatePicker 
              style={{ width: "100%" }} 
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: "Please enter reason" }]}
          >
            <TextArea rows={4} placeholder="Enter reason for separation" />
          </Form.Item>

          {(separationForm.getFieldValue('separationType') === 'termination' || 
            separationForm.getFieldValue('separationType') === 'absconding') && (
            <Form.Item>
              <div className="p-4 border rounded bg-gray-50">
                <Form.Item
                  name="assetsConfirmed"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject('Please confirm assets collection'),
                    },
                  ]}
                >
                  <Checkbox
                    onChange={(e) => setAssetsConfirmed(e.target.checked)}
                  >
                    I confirm that all company assets have been collected from this employee
                  </Checkbox>
                </Form.Item>
              </div>
            </Form.Item>
          )}

          <Form.Item
            name="adminComments"
            label="Admin Comments"
          >
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
                    <h4 className="m-0">{selectedEmployee.firstName} {selectedEmployee.lastName}</h4>
                    <p className="m-0 text-gray-500">{selectedEmployee.EmployeeId || 'N/A'}</p>
                  </div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Separation Type">
                {separationForm.getFieldValue('separationType')?.charAt(0).toUpperCase() + 
                 separationForm.getFieldValue('separationType')?.slice(1)}
              </Descriptions.Item>
              <Descriptions.Item label="Notice Period">
                {separationForm.getFieldValue('noticePeriod')} days
              </Descriptions.Item>
              <Descriptions.Item label="Separation Date">
                {dayjs(separationForm.getFieldValue('expectedSeparationDate')).format('DD MMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                {separationForm.getFieldValue('reason')}
              </Descriptions.Item>
            </Descriptions>
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
      render: (user) => `${user.firstName} ${user.lastName}`,
    },
    {
      title: "Employee ID",
      dataIndex: "user",
      key: "employeeId",
      render: (user) => user.EmployeeId || "N/A",
    },
    {
      title: "Request Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Type",
      dataIndex: "separationType",
      key: "separationType",
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1),
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
            Review
          </Button>
          {record.status === "pending" && (
            <>
              <Popconfirm
                title="Approve this request?"
                description="Are you sure you want to approve this separation request?"
                onConfirm={() => handleQuickAction(record._id, "approved")}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  style={{ color: "green" }}
                />
              </Popconfirm>
              <Popconfirm
                title="Reject this request?"
                description="Are you sure you want to reject this separation request?"
                onConfirm={() => handleQuickAction(record._id, "rejected")}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger icon={<CloseOutlined />} />
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
      await axios.put(`/api/v1/separations/${requestId}`, { status: action });
      toast.success(`Request ${action} successfully`);
      queryClient.invalidateQueries(["allSeparationRequests"]);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update request");
    }
  };

  // Search by status
  const handleStatusFilter = (status) => {
    setSearchParams({ ...searchParams, status });
  };

  // Handle step change in separation modal
  const handleStepChange = (step) => {
    if (step === 1 && !selectedEmployee) {
      message.error("Please select an employee first");
      return;
    }
    
    if (step === 2) {
      // Validate form before proceeding to confirmation
      separationForm.validateFields()
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Separation Requests Management</h1>
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
            onChange={handleStatusFilter}
            style={{ width: 200 }}
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="under_review">Under Review</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />}>
            Search
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(separationRequests) && separationRequests}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      {/* Review Modal */}
      <Modal
        title={`Review Separation Request - ${selectedRequest?.user?.firstName} ${selectedRequest?.user?.lastName}`}
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
              <Descriptions.Item label="Employee ID">
                {selectedRequest.user.EmployeeId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedRequest.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Request Date">
                {dayjs(selectedRequest.createdAt).format("DD MMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Separation Type">
                {selectedRequest.separationType.charAt(0).toUpperCase() +
                  selectedRequest.separationType.slice(1)}
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
                {selectedRequest.reason}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="status"
                label="Status"
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
                label="Adjust Notice Period (days)"
              >
                <Input type="number" min="1" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Initiate Separation Modal */}
      <Modal
        title="Initiate Separation Process"
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
            <Button key="back" onClick={() => handleStepChange(currentStep - 1)}>
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
              onClick={() => separationForm.submit()}
            >
              Confirm & Initiate Separation
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