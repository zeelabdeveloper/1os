import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  Card,
  Space,
  Typography,
  Grid,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

// Mock API functions
const fetchRoles = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    {
      id: "1",
      name: "Admin",
      permissions: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canPay: true,
        canPost: true,
        canMarkAttendance: true,
      },
    },
  ];
};

const createRole = async (roleData) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...roleData, id: Math.random().toString(36).substring(2, 9) };
};

const updateRole = async (roleData) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return roleData;
};

const deleteRole = async (roleId) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return roleId;
};

const permissionColumns = [
  { key: "canView", title: "Can View" },
  { key: "canEdit", title: "Can Edit" },
  { key: "canDelete", title: "Can Delete" },
  { key: "canPay", title: "Can Pay" },
  { key: "canPost", title: "Can Post" },
  { key: "canMarkAttendance", title: "Can Mark Attendance" },
];

const CreateRole = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const queryClient = useQueryClient();
  const screens = useBreakpoint();

  // Fetch roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });



  



  // Mutations
  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      message.success("Role created successfully");
      queryClient.invalidateQueries(["roles"]);
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      message.error("Failed to create role");
    },
  });




  const updateMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      message.success("Role updated successfully");
      queryClient.invalidateQueries(["roles"]);
      setIsModalVisible(false);
      setEditingRole(null);
      form.resetFields();
    },
    onError: () => {
      message.error("Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      message.success("Role deleted successfully");
      queryClient.invalidateQueries(["roles"]);
    },
    onError: () => {
      message.error("Failed to delete role");
    },
  });



  const handleCreate = () => {
    setEditingRole(null);
    setIsModalVisible(true);
  };


  const handleEdit = (role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      ...role.permissions,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (roleId) => {
    deleteMutation.mutate(roleId);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const roleData = {
        name: values.name,
        permissions: {
          canView: values.canView || false,
          canEdit: values.canEdit || false,
          canDelete: values.canDelete || false,
          canPay: values.canPay || false,
          canPost: values.canPost || false,
          canMarkAttendance: values.canMarkAttendance || false,
        },
      };

      if (editingRole) {
        updateMutation.mutate({ ...roleData, id: editingRole.id });
      } else {
        createMutation.mutate(roleData);
      }
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRole(null);
  };

  // Table columns
  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    ...permissionColumns.map((col) => ({
      title: col.title,
      dataIndex: ["permissions", col.key],
      key: col.key,
      align: "center",
      render: (value) =>
        value ? (
          <CheckOutlined style={{ color: "#52c41a" }} />
        ) : (
          <CloseOutlined style={{ color: "#ff4d4f" }} />
        ),
    })),
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this role?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.xs ? 12 : 24 }}>
      <Card
        title={
          <Title level={4} style={{ margin: 0 }}>
            Role Management
          </Title>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {screens.md ? "Create Role" : "Create"}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
          bordered
        />
      </Card>

      <Modal
        title={editingRole ? "Edit Role" : "Create Role"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            canView: false,
            canEdit: false,
            canDelete: false,
            canPay: false,
            canPost: false,
            canMarkAttendance: false,
          }}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: "Please input the role name!" }]}
          >
            <Input placeholder="Enter role name" />
          </Form.Item>

          <Title level={5} style={{ marginBottom: 16 }}>
            Permissions
          </Title>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {permissionColumns.map((col) => (
              <Form.Item key={col.key} name={col.key} valuePropName="checked">
                <Checkbox>{col.title}</Checkbox>
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateRole;
