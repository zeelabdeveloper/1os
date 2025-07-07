import React, { useState, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Card,
  Space,
  Typography,
  Grid,
  message,
  Popconfirm,
  Select,
  Tag,
  Divider,
  Avatar,
  Switch,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";

import dayjs from "dayjs";
import axios from "../../axiosConfig";
import { useStores } from "../../hooks/useStores";
import toast from "react-hot-toast";
import useAuthStore from "../../stores/authStore";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { Option } = Select;

// API Configuration

// API functions with proper error handling
const fetchUsers = async (id) => {
  try {
    const response = await axios.get(`/api/v1/team/allusers/${id}`);

    return response.data;
  } catch (error) {
    // Axios error may contain response with message
    const errorMessage =
      error.response?.data?.message || "Failed to fetch users";
    throw new Error(errorMessage);
  }
};

const updateUser = async (userData) => {
  try {
    const response = await axios.put(
      `/api/v1/storeuser/${userData.id}`,
      userData
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update user";
    throw new Error(errorMessage);
  }
};
const deleteUser = async (userId) => {
  try {
    await axios.delete(`/api/v1/storeuser/${userId}`);
    return userId; // Return deleted user ID if needed
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete user";
    throw new Error(errorMessage);
  }
};

const TeamMembers = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterRole, setFilterRole] = useState(null);
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const csvLinkRef = useRef();

  // Fetch data with error handling
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(user?._id),
    onError: (error) => {
      message.error(error.message);
    },
    enabled: user._id && true,
  });

  const { data: stores, error: storesError } = useStores();

  // Mutations with proper error handling

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      toast.success(data.message || "User updated successfully");
      queryClient.invalidateQueries(["users"]);
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      contactNumber: user.contactNumber,
      EmployeeId: user.EmployeeId,
      Store: user.Store?._id,
      isCocoEmployee: user.isCocoEmployee,
      dateOfJoining: user.dateOfJoining ? dayjs(user.dateOfJoining) : null,
    });
    setIsModalVisible(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setIsViewModalVisible(true);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const userData = {
          ...values,
          dateOfJoining: values.dateOfJoining
            ? values.dateOfJoining.toISOString()
            : null,
        };

        if (editingUser) {
          updateMutation.mutate({ ...userData, id: editingUser._id });
        } else {
        }
      })
      .catch((error) => {
        message.error("Please fill all required fields correctly");
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setViewingUser(null);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
  };

  const handleResetFilters = () => {
    setSearchText("");
    setFilterStatus(null);
    setFilterRole(null);
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Filter and search logic
  const filteredData =Array.isArray(users) &&  users?.filter((item) => {
    const matchesSearch = searchText
      ? `${item.firstName} ${item.lastName}`
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        item.email.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.EmployeeId &&
          item.EmployeeId.toLowerCase().includes(searchText.toLowerCase()))
      : true;

    const matchesStatus =
      filterStatus !== null ? item.isActive === filterStatus : true;

    const matchesRole = filterRole ? item.role === filterRole : true;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // ... (keep all the existing export handlers)

  // Table columns
  const columns = [
    {
      title: "Name",
      key: "name",
      fixed: "left",
      width: 200,
      render: (_, record) => (
        <Space
          onClick={() =>
            (window.location.href = `/staff/employee?emp=${record._id}`)
          }
          className="cursor-pointer"
        >
          <Avatar src={record.avatar}>
            {record.firstName?.charAt(0)}
            {record.lastName?.charAt(0)}
          </Avatar>
          <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
        </Space>
      ),
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Employee ID",
      dataIndex: ["EmployeeId", "employeeId"],
      key: "employeeId",
      width: 150,
      sorter: (a, b) => (a.employeeId || "").localeCompare(b.employeeId || ""),
    },
    {
      title: "Store",
      dataIndex: ["Store", "storeName"],
      key: "storeName",
      width: 150,
      sorter: (a, b) =>
        (a.Store?.storeName || "").localeCompare(b.Store?.storeName || ""),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },

    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            tooltip="View"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            tooltip="Edit"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.xs ? 12 : 24 }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            My Team
          </Title>
        }
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space wrap>
            <Input
              placeholder="Search by name, email or employee ID"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              onChange={handleStatusFilter}
              value={filterStatus}
              allowClear
            >
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>

            <Button onClick={handleResetFilters}>Reset Filters</Button>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            loading={isLoading}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectChange,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
            }}
            scroll={{ x: true }}
            bordered
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Total: {filteredData?.length || 0} users</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={4}>
                    <Text strong>
                      Selected: {selectedRowKeys.length} user
                      {selectedRowKeys.length !== 1 ? "s" : ""}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Space>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingUser ? "Edit User" : "Create User"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={updateMutation.isPending}
        width={700}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
            isCocoEmployee: false,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                { required: true, message: "Please input the first name!" },
              ]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: "Please input the last name!" },
              ]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input the password!" },
                { min: 6, message: "Password must be at least 6 characters!" },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item
            name="contactNumber"
            label="Contact Number"
            rules={[
              {
                pattern: /^\d{10}$/,
                message: "Please enter a valid 10-digit phone number!",
              },
            ]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>

          <Form.Item
            name="EmployeeId"
            label="Employee ID"
            rules={[
              { required: true, message: "Please input the employee ID!" },
            ]}
          >
            <Input placeholder="Enter employee ID" />
          </Form.Item>

          <Form.Item name="Store" label="Store">
            <Select placeholder="Select store" allowClear>
              {stores?.map((store) => (
                <Option key={store._id} value={store._id}>
                  {store.storeName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </div>

          <Form.Item name="dateOfJoining" label="Date of Joining">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="User Details"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              handleViewCancel();
              handleEdit(viewingUser);
            }}
          >
            Edit
          </Button>,
        ]}
        width={700}
      >
        {viewingUser && (
          <div>
            <Space size="large" align="start">
              <Avatar size={128} src={viewingUser.avatar}>
                {viewingUser.firstName?.charAt(0)}
                {viewingUser.lastName?.charAt(0)}
              </Avatar>
              <div>
                <Title
                  level={4}
                >{`${viewingUser.firstName} ${viewingUser.lastName}`}</Title>
                <Text type="secondary">{viewingUser.email}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color={viewingUser.isActive ? "green" : "red"}>
                    {viewingUser.isActive ? "ACTIVE" : "INACTIVE"}
                  </Tag>
                  <Tag color="blue">{viewingUser.role}</Tag>
                  {viewingUser.isCocoEmployee && (
                    <Tag color="purple">COCO EMPLOYEE</Tag>
                  )}
                </div>
              </div>
            </Space>

            <Divider />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
            >
              <div>
                <Text strong>Employee ID:</Text>
                <div>{viewingUser?.EmployeeId?.employeeId || "N/A"}</div>
              </div>
              <div>
                <Text strong>Store:</Text>
                <div>{viewingUser?.Store?.storeName || "N/A"}</div>
              </div>
              <div>
                <Text strong>Contact Number:</Text>
                <div>{viewingUser?.contactNumber || "N/A"}</div>
              </div>
              <div>
                <Text strong>Date of Joining:</Text>
                <div>
                  {viewingUser?.dateOfJoining
                    ? new Date(viewingUser.dateOfJoining).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>
            <div>
              <Text strong>Created At:</Text>
              <div>{new Date(viewingUser.createdAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden CSV Link */}
      <CSVLink
        data={filteredData || []}
        filename="users.csv"
        ref={csvLinkRef}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default TeamMembers;
