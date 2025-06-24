import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Divider,
  Spin,
  Row,
  Col,
  Select,
  message,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchemailSettings, updateemailSettings } from "../../api/setting";
import toast from "react-hot-toast";

const { Option } = Select;

const EmailSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: emailSettings, isLoading } = useQuery({
    queryKey: ["emailSettings"],
    queryFn: fetchemailSettings,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (emailSettings) {
      form.setFieldsValue(emailSettings);
    }
  }, [emailSettings, form]);

  const updateEmailSettingsMutation = useMutation({
    mutationFn: updateemailSettings,
    onSuccess: () => {
      toast.success("Email settings updated successfully");
      queryClient.invalidateQueries(["emailSettings"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update email settings"
      );
    },
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      await updateEmailSettingsMutation.mutateAsync(values);
    } catch (err) {
      console.error("Error saving email settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderCol = (children) => (
    <Col xs={24} sm={24} md={12} lg={12} xl={8}>
      {children}
    </Col>
  );

  if (isLoading) return <Spin size="large" />;

  return (
    <Card title="Email Settings" bordered={false}>
      <Form form={form} layout="vertical">
        <Divider orientation="left">SMTP Configuration</Divider>
        <Row gutter={16}>
          {renderCol(
            <Form.Item
              name="mailHost"
              label="Mail Host"
              rules={[{ required: true, message: "Please input mail host!" }]}
            >
              <Input placeholder="smtp.example.com" />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="mailPort"
              label="Mail Port"
              rules={[{ required: true, message: "Please input mail port!" }]}
            >
              <Input type="number" placeholder="587" />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="mailUsername"
              label="Mail Username"
              rules={[
                { required: true, message: "Please input mail username!" },
              ]}
            >
              <Input placeholder="your@email.com" />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="mailPassword"
              label="Mail Password"
              rules={[
                { required: true, message: "Please input mail password!" },
              ]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="mailEncryption"
              label="Mail Encryption"
              rules={[
                { required: true, message: "Please select mail encryption!" },
              ]}
            >
              <Select placeholder="Select encryption">
                <Option value="tls">TLS</Option>
                <Option value="ssl">SSL</Option>
                <Option value="none">None</Option>
              </Select>
            </Form.Item>
          )}
        </Row>

        <Divider orientation="left">Sender Information</Divider>
        <Row gutter={16}>
          {renderCol(
            <Form.Item
              name="mailFromAddress"
              label="From Address"
              rules={[
                {
                  required: true,
                  message: "Please input from email address!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input placeholder="noreply@example.com" />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="mailFromName"
              label="From Name"
              rules={[
                { required: true, message: "Please input from name!" },
              ]}
            >
              <Input placeholder="Company Name" />
            </Form.Item>
          )}
        </Row>

        <Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={loading}
          >
            Save Email Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EmailSettings;