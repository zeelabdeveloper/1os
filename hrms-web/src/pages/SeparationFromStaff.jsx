import React, { useState, useEffect } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../axiosConfig";
import { toast } from "react-hot-toast";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Modal,
  Tag,
  Space,
  Divider,
  Card,
  Descriptions,
  Upload,
  message,
} from "antd";
import { FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useAuthStore from "../stores/authStore";

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const SeparationFromStaff = () => {
  console.log("ssdds");
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [actionType, setActionType] = useState("view");

  // Fetch user's separation requests
  // const { data: userRequests, isLoading } = useQuery({
  //   queryKey: ["userSeparationRequests", user._id],
  //   queryFn: async () => {
  //     const response = await axios.get(
  //       `/api/v1/separations/my-requests/${user?._id}`
  //     );
  //     return response.data;
  //   },
  //   enabled: !!user._id,
  // });

  // // Create separation request mutation
  // const createSeparation = useMutation({
  //   mutationFn: async (values) => {
  //     const response = await axios.post("/api/v1/separations", values);
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     toast.success("Separation request submitted successfully");
  //     form.resetFields();
  //     setIsModalVisible(false);
  //   },
  //   onError: (error) => {
  //     toast.error(error.response?.data?.error || "Failed to submit request");
  //   },
  // });










const { data: userRequests, isLoading, refetch } = useQuery({
    queryKey: ["userSeparationRequests", user._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/v1/separations/my-requests/${user?._id}`
      );
      return response.data;
    },
    enabled: !!user._id,
});

// Create separation request mutation
const createSeparation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post("/api/v1/separations", values);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Separation request submitted successfully");
      form.resetFields();
      setIsModalVisible(false);
      refetch(); // यहाँ सीधे refetch को call करें
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to submit request");
    },
});

















  // Handle form submission
  const handleSubmit = (values) => {
    values.expectedSeparationDate =
      values.expectedSeparationDate.format("YYYY-MM-DD");
    createSeparation.mutate({
      ...values,
      user: user?._id,
      createBy: user?._id,
    });
  };

  // Show separation form modal
  const showModal = () => {
    form.resetFields();
    setIsModalVisible(true);
    setActionType("create");
  };

  // View details of a separation request
  const viewDetails = (request) => {
    setSelectedRequest(request);
    setActionType("view");
    setIsModalVisible(true);
  };

  // Status tag colors
  const statusTagColors = {
    pending: "orange",
    approved: "green",
    rejected: "red",
    under_review: "blue",
  };

  // Columns for the requests table
  const columns = [
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
      title: "Expected Separation Date",
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
            onClick={() => viewDetails(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Separation Requests</h1>
        <Button type="primary" onClick={showModal}>
          Apply for Separation
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={Array.isArray(userRequests) && userRequests}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Separation Request Modal */}
      <Modal
        title={
          actionType === "create"
            ? "Apply for Separation"
            : "Separation Request Details"
        }
        width={800}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={
          actionType === "create"
            ? [
                <Button key="back" onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  loading={createSeparation.isLoading}
                  onClick={() => form.submit()}
                >
                  Submit
                </Button>,
              ]
            : null
        }
      >
        {actionType === "create" ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              noticePeriod: 30,
              expectedSeparationDate: dayjs().add(30, "day"),
            }}
          >
            <Form.Item
              name="separationType"
              label="Separation Type"
              rules={[
                { required: true, message: "Please select separation type" },
              ]}
            >
              <Select placeholder="Select separation type">
                <Option value="resignation">Resignation</Option>

                <Option value="retirement">Retirement</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reason"
              label="Reason for Separation"
              rules={[{ required: true, message: "Please enter the reason" }]}
            >
              <TextArea
                rows={4}
                placeholder="Explain the reason for separation"
              />
            </Form.Item>

            {/* <Form.Item
              name="noticePeriod"
              label="Notice Period (days)"
              rules={[
                { required: true, message: "Please enter notice period" },
              ]}
            >
              <Input type="number" min="1" />
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
            </Form.Item> */}

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
        ) : (
          selectedRequest && (
            <div>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Request Date">
                  {dayjs(selectedRequest.createdAt).format("DD MMM YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={statusTagColors[selectedRequest.status]}>
                    {selectedRequest.status
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </Tag>
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
                <Descriptions.Item label="Notice Period" span={2}>
                  {selectedRequest.noticePeriod} days
                </Descriptions.Item>
                <Descriptions.Item label="Reason" span={2}>
                  {selectedRequest.reason}
                </Descriptions.Item>
                {selectedRequest.adminComments && (
                  <Descriptions.Item label="Admin Comments" span={2}>
                    {selectedRequest.adminComments}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {selectedRequest.documents &&
                selectedRequest.documents.length > 0 && (
                  <>
                    <Divider orientation="left">Documents</Divider>
                    <div className="space-y-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span>
                            <FileTextOutlined className="mr-2" />
                            {doc.name}
                          </span>
                          <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            href={doc.url}
                            target="_blank"
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default SeparationFromStaff;
