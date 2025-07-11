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
} from "antd";
import dayjs from "dayjs";
import {
  UserAddOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { toast } from "react-hot-toast";
import useAuthStore from "../../stores/authStore";

const { Option } = Select;
const { TextArea } = Input;

const NeedEmployee = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

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
        `/api/v1/support/employeeRequests/manager/${user._id}`
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  // Create new request mutation
  const { mutate, isPending: isSubmitting } = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post(
        "/api/v1/support/employeeRequests",
        values
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Employee request submitted successfully!");
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit request");
    },
  });
  const { mutate: DeleteMutate } = useMutation({
    mutationFn: async (values) => {
      console.log(values);
      const response = await axios.delete(
        `/api/v1/support/employeeRequests/${values._id}`,
        values
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Employee request Deleted successfully!");
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to Deleted request");
    },
  });

  const onFinish = (values) => {
    mutate({ ...values, managerId: user._id });
  };
  const handleDelete = (values) => {
    DeleteMutate({ ...values });
  };

  const showDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
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

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
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
    <div className="space-y-6    h-[92vh] overflow-y-auto ">
      <Card
        title={
          <>
            <UserAddOutlined /> My Requests
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
          <p>No requests submitted yet</p>
        )}
      </Card>

      <Card
        title={
          <>
            <UserAddOutlined /> Man Power Requirement
          </>
        }
        bordered={false}
        className="shadow-md"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ urgency: "medium" }}
        >
          <Form.Item
            label="department"
            name="department"
            rules={[{ required: true, message: "Please enter department" }]}
          >
            <Input placeholder="e.g. Coco" />
          </Form.Item>
          <Form.Item
            label="Position"
            name="position"
            rules={[{ required: true, message: "Please enter position" }]}
          >
            <Input placeholder="e.g., Senior Developer, HR Manager" />
          </Form.Item>

          <Form.Item
            label="Required Count"
            name="countRequired"
            rules={[
              { required: true, message: "Please add at least one Count" },
            ]}
          >
            <Select mode="tags" placeholder="Add skills">
              {["Store incharge=1", "Pharmasist=1"].map((skill) => (
                <Option key={skill} value={skill}>
                  {skill}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Store / Headquarters"
            name="store"
            rules={[{ required: true, message: "Please specify Store" }]}
          >
            <TextArea rows={1} placeholder="specify Store..." />
          </Form.Item>

          <Form.Item
            label="Job Description"
            name="jobDescription"
            rules={[
              { required: true, message: "Please provide job description" },
            ]}
          >
            <TextArea rows={4} placeholder="Detailed job description..." />
          </Form.Item>

          <Form.Item label="Urgency" name="urgency">
            <Select>
              <Option value="low">
                <ClockCircleOutlined /> Low
              </Option>
              <Option value="medium">
                <ClockCircleOutlined /> Medium
              </Option>
              <Option value="high">
                <ClockCircleOutlined /> High
              </Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={isSubmitting ? <LoadingOutlined /> : <CheckOutlined />}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              icon={<CloseOutlined />}
              onClick={() => form.resetFields()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
          </Form.Item>
        </Form>
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
            {console.log(selectedRequest)}
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
    </div>
  );
};

export default NeedEmployee;
