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
  TimePicker,
  Input,
  message,
  Alert,
} from "antd";
import { FileTextOutlined, CloseOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../../axiosConfig";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const { Title } = Typography;

const RegularizationList = ({ user }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user's regularization requests
  const { data: regularizations, isLoading } = useQuery({
    queryKey: ["regularizations", user._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/v1/regularization/user/${user._id}`
      );
      return response.data;
    },
  });

  // Create regularization request
  const createRegularization = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post("/api/v1/regularization", {
        ...values,
        userId: user._id,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["regularizations", user._id]);
      setIsModalVisible(false);
      form.resetFields();
      toast.success("Regularization request submitted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit request");
    },
  });

  // Cancel regularization request
  const cancelRegularization = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(
        `/api/v1/regularization/${id}?userId=${user._id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["regularizations", user._id]);
      toast.success("Request cancelled successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    },
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Check In",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (time) => (time ? dayjs(time).format("hh:mm A") : "--"),
    },
    {
      title: "Check Out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (time) => (time ? dayjs(time).format("hh:mm A") : "--"),
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
              icon={<CloseOutlined />}
              onClick={() => cancelRegularization.mutate(record._id)}
              loading={
                cancelRegularization.isLoading &&
                cancelRegularization.variables === record._id
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
      createRegularization.mutate({
        ...values,
        date: values.date.format("YYYY-MM-DD"),
        checkInTime: values.checkInTime?.format(),
        checkOutTime: values.checkOutTime?.format(),
      });
    });
  };

  return (
    <div>
      <Title level={3}>Attendance Regularization</Title>
      <Alert
        message="Use this form to request attendance regularization if you forgot to mark your attendance"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Request Regularization
        </Button>
      </Card>

      <Table
        columns={columns}
        dataSource={(Array.isArray(regularizations) && regularizations) || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} requests`,
        }}
      />

      <Modal
        title="Request Attendance Regularization"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={createRegularization.isLoading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            name="checkInTime"
            label="Check In Time"
            rules={[{ required: true, message: "Please enter check-in time" }]}
          >
            <TimePicker
              style={{ width: "100%" }}
              format="hh:mm A"
              use12Hours
              placeholder="Select check-in time"
            />
          </Form.Item>

          <Form.Item
            name="checkOutTime"
            label="Check Out Time"
            rules={[{ required: true, message: "Please enter check-out time" }]}
          >
            <TimePicker
              style={{ width: "100%" }}
              format="hh:mm A"
              use12Hours
              placeholder="Select check-out time"
            />
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Reason"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Explain why you need regularization..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegularizationList;
