import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Avatar,
} from "antd";
import { FiUpload, FiUser, FiMail, FiLock, FiCheck } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  updateUser,
} from "../../api/auth";
import toast from "react-hot-toast";

const { Option } = Select;

const UserModal = ({ visible, onCancel, user }) => {
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
      setAvatar(user.avatar);
    } else {
      form.resetFields();
      setAvatar(null);
    }
  }, [user, form]);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.message || "User created successfully!");
      onCancel();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "There was an error creating the user."
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.message || "User updated successfully!");
      onCancel();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "There was an error updating the user."
      );
    },
  });

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const formData = new FormData();
        for (const key in values) {
          formData.append(key, values[key]);
        }
        if (avatar && avatar instanceof File) {
          formData.append("avatar", avatar);
        }

        if (user) {
          updateMutation.mutate({ id: user._id, data: formData });
        } else {
          createMutation.mutate(formData);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    return isImage && isLt2M;
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === "done") {
      setAvatar(info.file.originFileObj);
    }
  };

  return (
    <Modal
      title={user ? "Edit User" : "Add New User"}
      visible={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      okText={user ? "Update" : "Create"}
      okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700" }}
      width={700}
    >
      <Form form={form} layout="vertical">
        <div className="flex items-center justify-center mb-6">
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleAvatarChange}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
          >
            {avatar ? (
              typeof avatar === "string" ? (
                <Avatar src={avatar} size={100} />
              ) : (
                <Avatar
                  src={URL.createObjectURL(avatar)}
                  size={100}
                />
              )
            ) : (
              <div>
                <FiUser size={24} />
                <div className="mt-2">Upload Avatar</div>
              </div>
            )}
          </Upload>
        </div>

        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please input user name!" }]}
        >
          <Input prefix={<FiUser />} placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input user email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<FiMail />}
            placeholder="Enter email"
            disabled={!!user}
          />
        </Form.Item>

        {!user && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<FiLock />}
              placeholder="Enter password"
            />
          </Form.Item>
        )}

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select user role!" }]}
        >
          <Select placeholder="Select role">
            <Option value="admin">Admin</Option>
            <Option value="manager">Manager</Option>
            <Option value="user">User</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          initialValue="active"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;