import React, { useState } from "react";
import useAuthStore from "../stores/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Form,
  Input,
  Button,
  Spin,
  Skeleton,
  Card,
  Upload,
  Typography,
  Divider,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  CameraOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "../axiosConfig";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const EditProfile = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState("");

  const queryClient = useQueryClient();

  // Fetch user data with TanStack Query
  const { isLoading } = useQuery({
    queryKey: ["user", user?._id],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/user/staff/${user?._id}`);
      const userData = response?.data?.data;
      console.log(userData);
      setImageUrl(userData.Profile.photo || "");

      // Set form values
      form.setFieldsValue({
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        contactNumber: userData?.contactNumber,
      });

      return userData;
    },
    enabled: !!user?._id,
    onError: (error) => {
      toast.error("Failed to fetch user data");
      console.error("Error fetching user data:", error);
    },
  });

  // Update user mutation with TanStack Query
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async (values) => {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        contactNumber: values.contactNumber,
        ...(values.password && { password: values.password }),
        ...(imageUrl && { photo: imageUrl }),
      };
      const response = await axios.put(
        `/api/v1/user/staff/fromstaff/${user?._id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["user", user?._id]);
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    },
  });

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "newsimgupload");
      formData.append("cloud_name", "dikxwu8om");

      const response = await axios.post(
        0`https://api.cloudinary.com/v1_1/dikxwu8om/image/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: false,
        }
      );

      setImageUrl(response.data.secure_url);
      return false;
    } catch (error) {
      console.error("Detailed upload error:", {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });
      message.error("Failed to upload image. Please try again.");
      return false;
    }
  };

  const onFinish = (values) => {
    if (values.password && values.password !== values.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    updateUser(values);
  };

  if (isLoading) {
    return (
      <Card style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  return (
    <div
      className="h-[92vh] overflow-y-auto "
      style={{ padding: "24px", margin: "0 auto" }}
    >
      <Card
        title={
          <Title level={3} style={{ margin: 0 }}>
            Edit Profile
          </Title>
        }
        bordered={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            firstName: user?.firstName,
            lastName: user?.lastName,
            contactNumber: user?.contactNumber,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Upload
              name="avatar"
              listType="picture-circle"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              accept="image/*"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                />
              ) : (
                <div>
                  <CameraOutlined style={{ fontSize: 24 }} />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </div>

          <Divider orientation="left" plain>
            <Text type="secondary">Basic Information</Text>
          </Divider>

          <Form.Item
            name="firstName"
            label="First Name"
            rules={[
              { required: true, message: "Please input your first name!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              { required: true, message: "Please input your last name!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="contactNumber"
            label="Contact Number"
            rules={[
              {
                pattern: /^[0-9]{10,15}$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Contact Number" />
          </Form.Item>

          <Divider orientation="left" plain>
            <Text type="secondary">Change Password</Text>
          </Divider>

          <Form.Item
            name="password"
            label="New Password"
            rules={[
              {
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              icon={isUpdating ? null : <CheckCircleOutlined />}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Spin
                  indicator={
                    <span style={{ marginRight: 8 }}>Updating...</span>
                  }
                />
              ) : (
                "Update Profile"
              )}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditProfile;
