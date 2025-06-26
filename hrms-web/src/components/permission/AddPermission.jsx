import React, { useState } from 'react';
import { Button, Form, Input, Modal, Select, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPermissionWithRoute } from '../services/permissionService';
import { toast } from 'react-hot-toast';

const { Option } = Select;

const AddPermission = ({ roles }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ roleId, url, label }) => 
      createPermissionWithRoute(roleId, url, label),
    onSuccess: () => {
      toast.success('Permission with new route created successfully');
      queryClient.invalidateQueries(['permissionRoutes']);
      queryClient.invalidateQueries(['rolePermissions']);
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create permission');
    },
  });

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        createMutation.mutate({
          roleId: values.role,
          url: values.url,
          label: values.label
        });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <>
      <Button type="primary" onClick={showModal} className="mb-4">
        Add New Permission
      </Button>
      
      <Modal
        title="Add New Permission"
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select placeholder="Select a role">
              {roles.map(role => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="label"
            label="Route Label"
            rules={[{ required: true, message: 'Please input route label' }]}
          >
            <Input placeholder="e.g. View Dashboard" />
          </Form.Item>
          
          <Form.Item
            name="url"
            label="Route URL"
            rules={[{ required: true, message: 'Please input route URL' }]}
          >
            <Input placeholder="e.g. /dashboard" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddPermission;