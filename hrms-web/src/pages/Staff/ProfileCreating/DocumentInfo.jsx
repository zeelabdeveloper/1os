 
import React, { memo, useState } from "react";
import { Form, Upload, Button, Divider, Card, Input, message } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

const DocumentVerification = memo(({ form }) => {
  const [loading, setLoading] = useState(false);

  // Cloudinary upload handler
  const handleUpload = async (options, fieldIndex) => {
    const { file, onSuccess, onError, onProgress } = options;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "newsimgupload");
      formData.append("cloud_name", "dikxwu8om");

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        "https://api.cloudinary.com/v1_1/dikxwu8om/image/upload",
        true
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress({ percent }, file);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const url = response.secure_url;
          
          // Get current documents array from form
          const documents = form.getFieldValue('documents') || [];
          
          // Update the specific document's URL
          documents[fieldIndex] = {
            ...documents[fieldIndex],
            documentUrl: url
          };
          
          // Update the form
          form.setFieldsValue({
            documents: documents
          });
          
          onSuccess(url, file);
          toast.success(`${file.name} uploaded successfully`);
        } else {
          onError(new Error("Upload failed"));
          toast.error(`${file.name} upload failed`);
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        onError(new Error("Upload failed"));
        toast.error(`${file.name} upload failed`);
        setLoading(false);
      };

      xhr.send(formData);
    } catch (error) {
      onError(error);
      toast.error("Upload failed");
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Divider orientation="left">Background + Document Verification</Divider>
      <Form.List name="documents">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => {
              return (
                <Card
                  key={key}
                  className="mb-6"
                  style={{ background: "#f0f2f5" }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "documentType"]}
                    label="Document Type"
                    rules={[
                      { required: true, message: "Document type is required" },
                    ]}
                  >
                    <Input placeholder="e.g., Aadhar Card, Passport, Driving License" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "documentNumber"]}
                    label="Document Number"
                    rules={[
                      { required: true, message: "Document number is required" },
                    ]}
                  >
                    <Input placeholder="Enter document number" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "documentUrl"]}
                    label="Document URL"
                    rules={[
                      { required: true, message: "Document URL is required" },
                    ]}
                  >
                    <Input 
                      placeholder="Document URL will appear here after upload" 
                      readOnly
                    />
                  </Form.Item>

                  <Upload
                    customRequest={(options) => handleUpload(options, name)}
                    listType="text"
                    maxCount={1}
                    accept="image/*,.pdf"
                    beforeUpload={(file) => {
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        message.error("File must be smaller than 5MB!");
                        return false;
                      }
                      return true;
                    }}
                    onChange={(info) => {
                      if (info.file.status === 'done') {
                        // URL is already set in handleUpload
                      } else if (info.file.status === 'error') {
                        message.error(`${info.file.name} file upload failed.`);
                      }
                    }}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} loading={loading}>
                      Click to Upload Document (Max 5MB)
                    </Button>
                  </Upload>

                  <Button
                    type="primary"
                    danger
                    onClick={() => remove(name)}
                    className="mt-2"
                  >
                    Remove Document
                  </Button>
                </Card>
              );
            })}
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
              style={{ background: "#f0f2f5" }}
            >
              Add Document
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
});

export default DocumentVerification;