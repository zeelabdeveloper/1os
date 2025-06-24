import React, { useState, useCallback, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  ColorPicker,
  Upload,
  message,
  Select,
  Divider,
  Spin,
  Row,
  Col,
  Image,
} from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { fetchsetting, updatesetting } from "../../api/setting";
import toast from "react-hot-toast";

const { Option } = Select;

const SystemSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: fetchsetting,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        ...settings,
        themeColor: settings.themeColor || "#1890ff",
        iconColor: settings.iconColor || "#1890ff",
        buttonColor: settings.buttonColor || "#1890ff",
        sidebarBgColor: settings.sidebarBgColor || "#001529",
      });
      if (settings.logo) {
        setLogoPreview(
          `${import.meta.env.VITE_IMAGE_URL}/company/${settings.logo}`
        );
      }
      if (settings.favicon) {
        setFaviconPreview(
          `${import.meta.env.VITE_IMAGE_URL}/company/${settings.favicon}`
        );
      }
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: updatesetting,
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries(["systemSettings"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update settings"
      );
    },
  });

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Convert color values to hex strings
      const colorFields = [
        "themeColor",
        "iconColor",
        "buttonColor",
        "sidebarBgColor",
      ];
      colorFields.forEach((field) => {
        if (values[field] && typeof values[field] === "object") {
          values[field] = values[field].toHexString();
        }
      });

      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      if (logoFile) formData.append("logo", logoFile);
      if (faviconFile) formData.append("favicon", faviconFile);

      await updateSettingsMutation.mutateAsync(formData);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setLoading(false);
    }
  }, [form, logoFile, faviconFile, updateSettingsMutation]);

  const handleLogoChange = useCallback((info) => {
    const file = info.file;
    if (file.status === "removed") {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
      return;
    }

    setLogoFile(file.originFileObj);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file.originFileObj);
  }, []);

  const handleFaviconChange = useCallback((info) => {
    const file = info.file;
    if (file.status === "removed") {
      setFaviconFile(null);
      setFaviconPreview(null);
      return;
    }

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
      return;
    }

    setFaviconFile(file.originFileObj);
    const reader = new FileReader();
    reader.onload = () => setFaviconPreview(reader.result);
    reader.readAsDataURL(file.originFileObj);
  }, []);

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return isImage && isLt2M;
  };

  const renderCol = (children) => (
    <Col xs={24} sm={24} md={12} lg={8} xl={6}>
      {children}
    </Col>
  );

  if (isLoading) return <Spin size="large" />;

  return (
    <Card title="System Settings" bordered={false}>
      <Form form={form} layout="vertical">
        <Divider orientation="left">Company Information</Divider>
        <Row gutter={16}>
          {renderCol(
            <Form.Item
              name="companyName"
              label="Company Name"
              rules={[
                { required: true, message: "Please input company name!" },
              ]}
            >
              <Input />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please select country!" }]}
            >
              <Select placeholder="Select country">
                <Option value="USA">United States</Option>
                <Option value="UK">United Kingdom</Option>
                <Option value="India">India</Option>
              </Select>
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="zipCode"
              label="Zip/Post Code"
              rules={[
                { required: true, message: "Please input zip/post code!" },
              ]}
            >
              <Input />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="telephone"
              label="Telephone"
              rules={[
                { required: true, message: "Please input telephone number!" },
              ]}
            >
              <Input />
            </Form.Item>
          )}
        </Row>

        <Divider orientation="left">Currency Settings</Divider>
        <Row gutter={16}>
          {renderCol(
            <Form.Item
              name="currency"
              label="Currency"
              rules={[{ required: true, message: "Please select currency!" }]}
            >
              <Select placeholder="Select currency">
                <Option value="USD">US Dollar ($)</Option>
                <Option value="EUR">Euro (€)</Option>
                <Option value="GBP">British Pound (£)</Option>
                <Option value="INR">Indian Rupee (₹)</Option>
              </Select>
            </Form.Item>
          )}
          {renderCol(
            <Form.Item
              name="currencySymbol"
              label="Currency Symbol"
              rules={[
                { required: true, message: "Please input currency symbol!" },
              ]}
            >
              <Input maxLength={3} />
            </Form.Item>
          )}
        </Row>

        <Divider orientation="left">Appearance</Divider>
        <Row gutter={16}>
          {renderCol(
            <Form.Item name="themeColor" label="Theme Color">
              <ColorPicker format="hex" />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item name="iconColor" label="Icon Color">
              <ColorPicker format="hex" />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item name="buttonColor" label="Button Color">
              <ColorPicker format="hex" />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item name="sidebarBgColor" label="Sidebar Background Color">
              <ColorPicker format="hex" />
            </Form.Item>
          )}
        </Row>

        <Divider orientation="left">Branding</Divider>
        <Row gutter={16}>
          {renderCol(
            <Form.Item name="titleText" label="Website Title">
              <Input />
            </Form.Item>
          )}
          {renderCol(
            <Form.Item label="Logo">
              <Upload
                name="logo"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleLogoChange}
                accept="image/*"
                maxCount={1}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="logo" style={{ width: "100%" }} />
                ) : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload Logo</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          )}
          {renderCol(
            <Form.Item label="Favicon">
              <Upload
                name="favicon"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleFaviconChange}
                accept="image/*"
                maxCount={1}
              >
                {faviconPreview ? (
                  <img
                    src={faviconPreview}
                    alt="favicon"
                    style={{ width: "100%" }}
                  />
                ) : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload Favicon</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          )}
        </Row>

        <Divider orientation="left">Footer</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="footerText" label="Footer Text">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={loading}
          >
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SystemSettings;
