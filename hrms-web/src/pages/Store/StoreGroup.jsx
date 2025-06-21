import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  message, 
  Card, 
  Typography 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const { Title } = Typography;

const StoreGroup = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all store groups
  const { data: storeGroups, isLoading } = useQuery({
    queryKey: ['storeGroups'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/store/storeGroups');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post('/api/v1/store/storeGroups', values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['storeGroups']);
      toast.success('Store group created successfully');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create store group');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const response = await axios.put(`/api/v1/store/storeGroups/${id}`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['storeGroups']);
      toast.success('Store group updated successfully');
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update store group');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/v1/store/storeGroups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['storeGroups']);
      toast.success('Store group deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete store group');
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        updateMutation.mutate({ id: editingId, values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue({ name: record.name });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingId(null);
  };

  const columns = [
    {
      title: 'Store Group Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this store group?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Title level={4}>Store Groups</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ marginBottom: 16 }}
        >
          Add Store Group
        </Button>

        <Table
          columns={columns}
          dataSource={storeGroups}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Store Group' : 'Add Store Group'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Store Group Name"
            rules={[
              { required: true, message: 'Please enter store group name' },
              { max: 100, message: 'Name must be less than 100 characters' },
            ]}
          >
            <Input placeholder="Enter store group name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StoreGroup;