// src/components/LeaveRequest.jsx
import React, { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
  message,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../../axiosConfig";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const { Title } = Typography;
const { Option } = Select;

const LeaveRequest = ({ user }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ["leaveRequests", user._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/v1/attendance/leave?userId=${user._id}`
      );
      return response.data;
    },
  });

  const requestLeaveMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post("/api/v1/attendance/leave", {
        ...values,
        userId: user._id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leaveRequests", user?._id]);
      setIsModalVisible(false);
      form.resetFields();
      toast.success("Leave request submitted successfully");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to submit leave request"
      );
    },
  });

  const cancelLeaveMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(
        `/api/v1/attendance/leave/${id}?userId=${user._id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["leaveRequests", user._id]);
      message.success("Leave request cancelled successfully");
    },
    onError: (error) => {
      message.error(
        error.response?.data?.message || "Failed to cancel leave request"
      );
    },
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("MMM D, YYYY"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        switch (status) {
          case "approved":
            color = "green";
            break;
          case "pending":
            color = "orange";
            break;
          case "rejected":
            color = "red";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Approved", value: "approved" },
        { text: "Pending", value: "pending" },
        { text: "Rejected", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Type",
      dataIndex: "leaveType",
      key: "leaveType",
      render: (type) => type || "--",
    },
    {
      title: "Reason",
      dataIndex: "remarks",
      key: "remarks",
      render: (remarks) => remarks || "--",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          {record.status === "pending" && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => cancelLeaveMutation.mutate(record._id)}
              loading={
                cancelLeaveMutation.isLoading &&
                cancelLeaveMutation.variables === record._id
              }
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      requestLeaveMutation.mutate(values);
    });
  };

  return (
    <div>
      <Title level={3}>Leave Requests</Title>

      <Card style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Request Leave
        </Button>
      </Card>

      <Table
        columns={columns}
        dataSource={Array.isArray(leaveRequests) && leaveRequests}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} records`,
        }}
      />

      <Modal
        title="Request Leave"
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={requestLeaveMutation.isLoading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label="Leave Date"
            rules={[{ required: true, message: "Please select leave date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="leaveType"
            label="Leave Type"
            rules={[{ required: true, message: "Please select leave type" }]}
          >
            <Select placeholder="Select leave type">
              <Option value="Casual Leave">Casual Leave</Option>
              <Option value="Sick Leave">Sick Leave</Option>
              <Option value="Personal Leave">Personal Leave</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Reason"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <Input.TextArea rows={3} placeholder="Enter reason for leave..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveRequest;
