import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Spin,
  Table,
  Tag,
  Space,
  Modal,
  Radio,
  message,
  Avatar,
  Pagination,
} from "antd";
import dayjs from "dayjs";
import debounce from "lodash/debounce";
import {
  UserAddOutlined,
  EyeOutlined,
  EditFilled,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { toast } from "react-hot-toast";
import useAuthStore from "../../stores/authStore";

const AdminSee = () => {
  const { user } = useAuthStore();

  const [actionForm] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState("feedback");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch employee requests
  const {
    data: requests = [],
    isLoading: isFetchingRequests,
    isError: isFetchError,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ["employeeRequests"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/v1/support/employeeRequests/FromManager/${user._id}`
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const { mutate: updateRequest } = useMutation({
    mutationFn: async (values) => {
      const { _id, ...data } = values;
      const response = await axios.patch(
        `/api/v1/support/employeeRequests/${_id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Request updated successfully!");
      actionForm.resetFields();
      setIsActionModalVisible(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update request");
    },
  });

  const showDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const [employeeSearchParams, setEmployeeSearchParams] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

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
    enabled: isActionModalVisible,
  });

  const handleEmployeeSearch = debounce((value) => {
    setEmployeeSearchParams((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  }, 500);

  const handleAction = (request) => {
    setSelectedRequest(request);
    setIsActionModalVisible(true);
    // Set initial status in form
    actionForm.setFieldsValue({
      status: request.status,
    });
  };

  const handleActionSubmit = () => {
    actionForm.validateFields().then((values) => {
      const updateData = {
        _id: selectedRequest._id,
        updatedAt: new Date().toISOString(),
        status: values.status,
      };

      if (actionType === "feedback") {
        updateData.adminFeedback = values.feedback;
      } else {
        updateData.updatedBy = selectedEmployee._id;
      }

      updateRequest(updateData);
    });
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "approved":
        return <Tag color="green">Approved</Tag>;
      case "rejected":
        return <Tag color="red">Rejected</Tag>;
      case "fulfilled":
        return <Tag color="blue">Fulfilled</Tag>;
      default:
        return <Tag color="orange">Pending</Tag>;
    }
  };

  const columns = [
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD/MM/YYYY hh:mm A"),
    },
    {
      title: "Created By",
      dataIndex: "managerId",
      key: "managerId",
      render: (text) => {
        return text?.fullName || text?.firstName;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      render: (urgency) => (
        <Tag
          color={
            urgency === "high"
              ? "red"
              : urgency === "medium"
              ? "orange"
              : "green"
          }
        >
          {urgency}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button icon={<EyeOutlined />} onClick={() => showDetails(record)}>
            View
          </Button>

          {record.status !== "fulfilled" && (
            <Button
              type="primary"
              icon={<EditFilled />}
              onClick={() => handleAction(record)}
            >
              Action
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isFetchError) {
    return (
      <Card title="Error" bordered={false}>
        <p>Failed to load requests: {fetchError.message}</p>
        <Button onClick={refetch}>Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 h-[92vh] overflow-y-auto">
      <Card
        title={
          <>
            <UserAddOutlined /> Incoming Requests
          </>
        }
        bordered={false}
        className="shadow-md"
        loading={isFetchingRequests}
      >
        {requests.length > 0 ? (
          <Table
            columns={columns}
            dataSource={Array.isArray(requests) && requests}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
        ) : (
          <p>No requests yet</p>
        )}
      </Card>

      {/* Request Details Modal */}
      <Modal
        title="Request Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Department:</p>
                <p>{selectedRequest.department}</p>
              </div>
              <div>
                <p className="font-semibold">Position:</p>
                <p>{selectedRequest.position}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <p>{getStatusTag(selectedRequest.status)}</p>
              </div>
              <div>
                <p className="font-semibold">Urgency:</p>
                <p>{selectedRequest.urgency}</p>
              </div>
            </div>

               <div>
                         <p className="font-semibold">Recuirement:</p>
                         <div className="flex flex-wrap gap-2">
                           {Array.isArray(selectedRequest?.countRequired) &&
                             selectedRequest?.countRequired.map((skill) => (
                               <Tag key={skill}>{skill}</Tag>
                             ))}
                         </div>
                       </div>
           
                       <div>
                         <p className="font-semibold">Store:</p>
                         <p>{selectedRequest?.store}</p>
                       </div>

            <div>
              <p className="font-semibold">Job Description:</p>
              <p className="whitespace-pre-line">
                {selectedRequest.jobDescription}
              </p>
            </div>

            {selectedRequest.adminFeedback && (
              <div>
                <p className="font-semibold">Admin Feedback:</p>
                <p>{selectedRequest.adminFeedback}</p>
              </div>
            )}

            {selectedRequest.candidateDetails && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-lg">Candidate Details:</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="font-semibold">Name:</p>
                    <p>{selectedRequest.candidateDetails.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Contact:</p>
                    <p>{selectedRequest.candidateDetails.contact}</p>
                  </div>
                  {selectedRequest.candidateDetails.resumeUrl && (
                    <div>
                      <p className="font-semibold">Resume:</p>
                      <a
                        href={selectedRequest.candidateDetails.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                  {selectedRequest.candidateDetails.interviewDate && (
                    <div>
                      <p className="font-semibold">Interview Date:</p>
                      <p>
                        {new Date(
                          selectedRequest.candidateDetails.interviewDate
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={`Take Action on Request`}
        open={isActionModalVisible}
        onCancel={() => {
          setIsActionModalVisible(false);
          actionForm.resetFields();
        }}
        footer={[
          <Button key="back" onClick={() => setIsActionModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleActionSubmit}>
            Submit
          </Button>,
        ]}
        width={600}
      >
        <Form form={actionForm} layout="vertical">
          <Form.Item
            name="status"
            label="Change Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
              <Select.Option value="fulfilled">Fulfilled</Select.Option>
            </Select>
          </Form.Item>

          <Radio.Group
            onChange={(e) => setActionType(e.target.value)}
            value={actionType}
            style={{ marginBottom: 20 }}
          >
            <Radio value="feedback">Provide Feedback</Radio>
            <Radio value="assign">Assign to Someone</Radio>
          </Radio.Group>

          {actionType === "feedback" ? (
            <Form.Item
              name="feedback"
              label="Feedback"
              rules={[
                {
                  required: actionType === "feedback",
                  message: "Please provide feedback",
                },
              ]}
            >
              <Input.TextArea rows={4} placeholder="Enter your feedback..." />
            </Form.Item>
          ) : (
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
                notFoundContent={
                  employeesLoading ? <Spin size="small" /> : null
                }
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
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSee;
