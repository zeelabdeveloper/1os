import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Table,
  Space,
  Skeleton,
  Popconfirm,
  Card,
  Modal,
  message,
  Alert,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";

const ADMIN_USERNAME = import.meta.env.VITE_DEVELOPER_USERNAME;
const ADMIN_PASSWORD = import.meta.env.VITE_DEVELOPER_PASSWORD;

const fetchHeaders = async () => {
  const res = await axios.get("/api/v2/developer/routes");
  return res.data.data;
};

const LoginForm = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFinish = (values) => {
    setLoading(true);
    setError("");

    if (
      values.username === ADMIN_USERNAME &&
      values.password === ADMIN_PASSWORD
    ) {
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess();
      }, 500);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError("Invalid username or password");
      }, 500);
    }
  };

  return (
    <Card
      title="Developer Login"
      style={{ maxWidth: 400, margin: "50px auto" }}
    >
      {error && (
        <Alert message={error} type="error" style={{ marginBottom: 16 }} />
      )}
      <Form
        name="Developer Login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

const HeaderPanel = () => {
  const [form] = Form.useForm();
  const [children, setChildren] = useState([]);
  const [editing, setEditing] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["headers"],
    queryFn: fetchHeaders,
    enabled: isAuthenticated,  
  });

  const createMutation = useMutation({
    mutationFn: (newHeader) =>
      axios.post("/api/v2/developer/routes", newHeader),
    onSuccess: () => {
      toast.success("Header created successfully");
      resetForm();
      queryClient.invalidateQueries(["headers"]);
    },
    onError: () => toast.error("Failed to create header"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) =>
      axios.put(`/api/v2/developer/routes/${id}`, values),
    onSuccess: () => {
      toast.success("Header updated successfully");
      resetForm();
      queryClient.invalidateQueries(["headers"]);
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/v2/developer/routes/${id}`),
    onSuccess: () => {
      toast.success("Deleted successfully");
      queryClient.invalidateQueries(["headers"]);
    },
    onError: () => toast.error("Delete failed"),
  });

  const resetForm = () => {
    form.resetFields();
    setChildren([]);
    setEditing(null);
    setModalVisible(false);
  };

  const onFinish = (values) => {
    if (editing) {
      updateMutation.mutate({
        id: editing._id,
        values: {
          header: values.header,
          child: children.map((c) => ({
            _id: c._id,
            url: c.url,
            label: c.label,
          })),
        },
      });
    } else {
      createMutation.mutate({
        header: values.header,
        child: children.map((c) => ({
          url: c.url,
          label: c.label,
        })),
      });
    }
  };

  const addChild = () => setChildren([...children, { url: "", label: "" }]);

  const removeChild = (index) => {
    const updated = [...children];
    updated.splice(index, 1);
    setChildren(updated);
  };

  const updateChild = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const startEdit = (record) => {
    setEditing(record);
    setChildren(
      record.child.map((c) => ({
        _id: c._id,
        url: c.url,
        label: c.label,
      }))
    );
    form.setFieldsValue({ header: record.header });
    setModalVisible(true);
  };

  const showCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    message.success("Login successful!");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    message.success("Logged out successfully");
  };

  const columns = [
    { title: "Header", dataIndex: "header", key: "header" },
    {
      title: "Children",
      render: (_, record) => (
        <ul>
          {record.child?.map((c, i) => (
            <li key={i}>{`${c.label} - ${c.url}`}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => startEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => deleteMutation.mutate(record._id)}
          >
            <Button danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Card
      title="Header Management"
      extra={
        <Space>
          <Button type="primary" onClick={showCreateModal}>
            Add New Header
          </Button>
          <Button danger onClick={handleLogout}>
            Logout
          </Button>
        </Space>
      }
    >
      <div style={{ marginTop: 20 }}>
        {isLoading ? (
          <Skeleton active />
        ) : (
          <Table dataSource={data} rowKey="_id" columns={columns} bordered />
        )}
      </div>

      <Modal
        title={editing ? "Edit Header" : "Create New Header"}
        visible={modalVisible}
        onCancel={resetForm}
        footer={null}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="header"
            label="Header Title"
            rules={[{ required: true, message: "Please input header!" }]}
          >
            <Input placeholder="Enter header" />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            {children.map((child, index) => (
              <Space key={index} style={{ display: "flex", marginBottom: 8 }}>
                <Input
                  placeholder="Label"
                  value={child.label}
                  onChange={(e) => updateChild(index, "label", e.target.value)}
                />
                <Input
                  placeholder="URL"
                  value={child.url}
                  onChange={(e) => updateChild(index, "url", e.target.value)}
                />
                <Button danger onClick={() => removeChild(index)}>
                  Remove
                </Button>
              </Space>
            ))}
            <Button onClick={addChild} style={{ marginBottom: 16 }}>
              + Add Child
            </Button>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isPending || updateMutation.isPending}
            block
          >
            {editing ? "Update Header" : "Create Header"}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
};

export default HeaderPanel;
