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
import { FilterOutlined, SyncOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import dayjs from "dayjs";
import useAuthStore from "../../stores/authStore";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminRegularizationList = ({ branchId }) => {
  const [form] = Form.useForm();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({
    status: null,
    dateRange: [],
    userId: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const queryClient = useQueryClient();

  // Fetch all regularization requests
  const { data: regularizations, isLoading } = useQuery({
    queryKey: ["adminRegularizations", { ...filters, ...pagination }],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      const response = await axios.get("/api/v1/regularization/admin", {
        params: {
          branchId,
          page: params.current,
          limit: params.pageSize,
          status: params.status,
          startDate: params.dateRange[0]?.format("YYYY-MM-DD"),
          endDate: params.dateRange[1]?.format("YYYY-MM-DD"),
          userId: params.userId,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
  });
const {user:admin}=useAuthStore()
  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, rejectionReason }) => {
      const response = await axios.put(`/api/v1/regularization/${id}/status`, {
        status,
        approvedBy:admin?._id,
        rejectionReason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminRegularizations"]);
      setSelectedRequest(null);
      message.success("Status updated successfully");
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const columns = [
    {
      title: "Employee",
      dataIndex: ["userId", "EmployeeId", "employeeId"],
      key: "employee",
      render: (_, record) => (
        <div>
          <Text strong>{record.userId?.EmployeeId?.employeeId}</Text>
          <br />
          <Text type="secondary">{record.userId?.firstName}</Text>
        </div>
      ),
    },
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
      render: (status, record) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "rejected"
              ? "red"
              : "orange"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Rejected", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Reason",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => setSelectedRequest(record)}
          >
            Review
          </Button>
        </Space>
      ),
    },
  ];

  const handleStatusUpdate = (values) => {
    updateStatus.mutate({
      id: selectedRequest._id,
      ...values,
    });
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <div>
      <Title level={3}>Regularization Requests</Title>

      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>Filters</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => handleFilterChange("status", value)}
            value={filters.status}
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>

          <RangePicker
            onChange={(dates) => handleFilterChange("dateRange", dates)}
            value={filters.dateRange}
          />

          <Button
            icon={<SyncOutlined />}
            onClick={() => {
              setFilters({
                status: null,
                dateRange: [],
                userId: null,
              });
              setPagination({
                current: 1,
                pageSize: 10,
              });
            }}
          >
            Reset
          </Button>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={regularizations?.data || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: regularizations?.pagination?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `Total ${total} requests`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
        }}
        scroll={{ x: true }}
      />

      {/* Status Update Modal */}
      <Modal
        title={`Review Regularization Request - ${selectedRequest?.userId?.firstName}`}
        open={!!selectedRequest}
        onCancel={() => setSelectedRequest(null)}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Date: </Text>
              <Text>{dayjs(selectedRequest.date).format("DD MMM YYYY")}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Check In: </Text>
              <Text>
                {selectedRequest.checkInTime
                  ? dayjs(selectedRequest.checkInTime).format("hh:mm A")
                  : "--"}
              </Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Check Out: </Text>
              <Text>
                {selectedRequest.checkOutTime
                  ? dayjs(selectedRequest.checkOutTime).format("hh:mm A")
                  : "--"}
              </Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Reason: </Text>
              <Text>{selectedRequest.remarks}</Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleStatusUpdate}
              initialValues={{ status: "approved" }}
            >
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="approved">Approve</Option>
                  <Option value="rejected">Reject</Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.status !== currentValues.status
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("status") === "rejected" ? (
                    <Form.Item
                      name="rejectionReason"
                      label="Rejection Reason"
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateStatus.isPending}
                  >
                    Update Status
                  </Button> 
                  <Button onClick={() => setSelectedRequest(null)}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminRegularizationList;
