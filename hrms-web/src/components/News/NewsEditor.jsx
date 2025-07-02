import React, { useState } from "react";
import { Form, Input, Button, Select, Upload, message, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import MarkdownEditor from "@uiw/react-markdown-editor";
import { useCreateNews, useUpdateNews, getUserRole } from "../../hooks/useNews";
import NewsSkeleton from "./NewsSkeleton";
import useAuthStore from "../../stores/authStore";

const { TextArea } = Input;
const { Option } = Select;

const NewsEditor = ({ newsData, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState(newsData?.content || "");
  const [imageUrl, setImageUrl] = useState(newsData?.image || "");
  const [uploading, setUploading] = useState(false);
  const { data: roles, isLoading: rolesLoading } = getUserRole();
  const { mutate: createNews, isPending: isCreating } = useCreateNews();
  const { mutate: updateNews, isPending: isUpdating } = useUpdateNews();
  const { user } = useAuthStore();

  // Cloudinary configuration
  const CLOUDINARY_UPLOAD_PRESET = "newsimgupload";
  const CLOUDINARY_URL =
    "https://api.cloudinary.com/v1_1/dikxwu8om/image/upload";

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      createdBy: user?._id,
      content,
      image: imageUrl,
    };

    const mutation = newsData
      ? () => updateNews({ id: newsData._id, data: payload })
      : () => createNews(payload);

    mutation({
      onSuccess: () => {
        message.success(
          `News ${newsData ? "updated" : "created"} successfully`
        );
        onSuccess();
      },
      onError: () => {
        message.error(`Failed to ${newsData ? "update" : "create"} news`);
      },
    });
  };

  const handleImageUpload = async (file) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        message.success("Image uploaded successfully");
        return data.secure_url;
      } else {
        throw new Error("Upload failed - no secure URL returned");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleBeforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return isImage;
  };

  const handleUploadChange = async (info) => {
    try {
      if (info.file.status === "removed") {
        setImageUrl("");
        form.setFieldsValue({ image: [] });
        return;
      }

      if (info.file.originFileObj) {
        const url = await handleImageUpload(info.file.originFileObj);
        if (url) {
          form.setFieldsValue({
            image: [
              {
                uid: info.file.uid,
                name: info.file.name,
                status: "done",
                url,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  if (rolesLoading) return <NewsSkeleton />;

  return (
    <Card
      title={newsData ? "Edit News" : "Create News"}
      bordered={false}
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: newsData?.title || "",
          summary: newsData?.summary || "",
          targetRoles: newsData?.targetRoles?.map((role) => role._id) || [],
          image: newsData?.image
            ? [
                {
                  uid: "-1",
                  name: "current-image",
                  status: "done",
                  url: newsData.image,
                },
              ]
            : [],
        }}
        onFinish={handleSubmit}
      >
        {/* Title Field */}
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: "Please input the title!" },
            { max: 100, message: "Title cannot exceed 100 characters" },
          ]}
        >
          <Input placeholder="Enter news title" />
        </Form.Item>

        {/* Summary Field */}
        <Form.Item
          name="summary"
          label="Summary"
          rules={[
            { required: true, message: "Please input the summary!" },
            { max: 200, message: "Summary cannot exceed 200 characters" },
          ]}
        >
          <TextArea rows={3} placeholder="Enter brief summary" />
        </Form.Item>

        {/* Content Editor */}
        <Form.Item
          label="Content"
          required
          validateStatus={content ? "" : "error"}
          help={content ? "" : "Content is required"}
        >
          <MarkdownEditor
            value={content}
            onChange={(value) => setContent(value)}
            height="300px"
            style={{
              border: content ? "1px solid #d9d9d9" : "1px solid #ff4d4f",
            }}
          />
        </Form.Item>

        {/* Target Roles Selector */}
        <Form.Item
          name="targetRoles"
          label="Target Roles"
          rules={[{ required: true, message: "Please select target roles!" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select roles"
            loading={rolesLoading}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {roles?.map((role) => (
              <Option key={role._id} value={role._id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Image Upload */}
        <Form.Item
          name="image"
          label="Featured Image"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList || [];
          }}
          extra="Recommended size: 1200x630 pixels"
        >
          <Upload
            name="image"
            listType="picture-card"
            accept="image/*"
            beforeUpload={handleBeforeUpload}
            onChange={handleUploadChange}
            maxCount={1}
            fileList={form.getFieldValue("image")}
            onRemove={() => {
              setImageUrl("");
              return true;
            }}
          >
            {imageUrl ? null : (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        {/* Image Preview */}
        {imageUrl && (
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <img
              src={imageUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: 200,
                borderRadius: 4,
                border: "1px solid #f0f0f0",
              }}
            />
          </div>
        )}

        {/* Form Actions */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating || uploading}
            disabled={!content}
            style={{ marginRight: 8 }}
          >
            {newsData ? "Update News" : "Publish News"}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NewsEditor;
