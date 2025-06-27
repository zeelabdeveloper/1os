import React, { memo, useState } from "react";
import {
  Form,
  Upload,
  Button,
  Divider,
  Card,
  Input,
  message,
  Table,
  Tag,
  Modal,
  Spin,
  Switch,
  Drawer,
  Space,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import toast from "react-hot-toast";

const DocumentVerification = memo(() => {
  const [form] = Form.useForm();
  const [currentDocument, setCurrentDocument] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const queryClient = useQueryClient();
  const getCandidateIdFromUrl = () => {
    const query = new URLSearchParams(window.location.search);
    return query.get("id");
  };
  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/v1/documents/my-documents/${getCandidateIdFromUrl()}`
      );
      return data.data;
    },
    onError: () => toast.error("Failed to load documents"),
  });

  // Save documents
  const { mutate: saveDocuments, isPending: isSaving } = useMutation({
    mutationFn: async (docData) => {
      console.log(editingDoc);
      if (editingDoc) {
        docData.id = editingDoc._id;
      }
      const url = "/api/v1/documents";
      const method = "post";

      const { data } = await axios[method](url, docData);
      return data;
    },
    onSuccess: () => {
      toast.success(
        `Document ${editingDoc ? "updated" : "saved"} successfully`
      );
      queryClient.invalidateQueries(["documents"]);
      setIsDrawerVisible(false);
      form.resetFields();
      setEditingDoc(null);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to save document");
    },
  });

  // Delete document
  const { mutate: deleteDocument } = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/v1/documents/${id}`);
    },
    onSuccess: () => {
      toast.success("Document deleted successfully");
      queryClient.invalidateQueries(["documents"]);
    },
    onError: () => {
      toast.error("Failed to delete document");
    },
  });

  // Handle document upload
  const handleUpload = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    setUploadingIndex(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "newsimgupload");
      formData.append("cloud_name", "dikxwu8om");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dikxwu8om/image/upload",
        formData,
        {
          onUploadProgress: (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress({ percent }, file);
            }
          },
        }
      );

      const url = response.data.secure_url;
      form.setFieldsValue({ documentUrl: url });
      onSuccess(url, file);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      onError(error);
      message.error(`${file.name} upload failed`);
    } finally {
      setUploadingIndex(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const docData = {
        applicationId: getCandidateIdFromUrl(),
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        documentUrl: values.documentUrl,
      };

      if (editingDoc) {
        docData.verified = values.verified || false;
      }

      saveDocuments(docData);
    } catch (error) {
      message.error("Please fill all required fields");
    }
  };

  const showDocumentModal = (document) => {
    if (!document?.documentUrl) {
      message.error("Document URL not found");
      return;
    }
    setCurrentDocument(document);
    setIsPreviewVisible(true);
  };

  const openEditDrawer = (document = null) => {
    setEditingDoc(document);
    if (document) {
      form.setFieldsValue({
        documentType: document.documentType,
        documentNumber: document.documentNumber,
        documentUrl: document.documentUrl,
        verified: document.verified,
      });
    } else {
      form.resetFields();
    }
    setIsDrawerVisible(true);
  };

  const columns = [
    {
      title: "Document Type",
      dataIndex: "documentType",
      key: "documentType",
    },
    {
      title: "Document Number",
      dataIndex: "documentNumber",
      key: "documentNumber",
    },
    {
      title: "Status",
      key: "verified",
      dataIndex: "verified",
      render: (verified) => (
        <Tag color={verified ? "green" : "volcano"}>
          {verified ? "VERIFIED" : "PENDING"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDocumentModal(record)}
            disabled={!record.documentUrl}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteDocument(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Spin spinning={isLoading}>
        <div className=" ">
          <Divider orientation="left">Document Verification</Divider>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openEditDrawer()}
          >
            Add New Document
          </Button>
        </div>{" "}
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="_id"
          className="mt-4"
          pagination={{ pageSize: 5 }}
        />
        {/* Edit/Upload Drawer */}
        <Drawer
          title={editingDoc ? "Edit Document" : "Add New Document"}
          placement="right"
          width={600}
          onClose={() => {
            setIsDrawerVisible(false);
            form.resetFields();
            setEditingDoc(null);
          }}
          open={isDrawerVisible}
          closable={false}
          extra={
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setIsDrawerVisible(false);
                form.resetFields();
                setEditingDoc(null);
              }}
            />
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="documentType"
              label="Document Type"
              rules={[
                { required: true, message: "Document type is required" },
                { max: 50, message: "Maximum 50 characters allowed" },
              ]}
            >
              <Input placeholder="e.g., Aadhar Card, Passport, Driving License" />
            </Form.Item>

            <Form.Item
              name="documentNumber"
              label="Document Number"
              rules={[
                { required: true, message: "Document number is required" },
                { max: 30, message: "Maximum 30 characters allowed" },
              ]}
            >
              <Input placeholder="Enter document number" />
            </Form.Item>

            <Form.Item
              name="documentUrl"
              label="Document URL"
              rules={[
                { required: true, message: "Please upload the document" },
                { type: "url", message: "Invalid URL format" },
              ]}
            >
              <Input
                placeholder="Document URL will appear here after upload"
                readOnly
              />
            </Form.Item>

            {editingDoc && (
              <Form.Item
                name="verified"
                label="Verification Status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Verified"
                  unCheckedChildren="Pending"
                />
              </Form.Item>
            )}

            <Upload
              customRequest={handleUpload}
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
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} loading={uploadingIndex} block>
                Upload Document (Max 5MB)
              </Button>
            </Upload>

            <Button
              type="primary"
              onClick={handleSubmit}
              block
              loading={isSaving}
              className="mt-4"
            >
              {editingDoc ? "Update Document" : "Save Document"}
            </Button>
          </Form>
        </Drawer>
        {/* Document Preview Modal */}
        <Modal
          title="Document Preview"
          open={isPreviewVisible}
          onCancel={() => setIsPreviewVisible(false)}
          footer={null}
          width={800}
          destroyOnClose
        >
          {currentDocument && (
            <div className="flex flex-col items-center">
              <h3 className="mb-4">
                {currentDocument.documentType} -{" "}
                {currentDocument.documentNumber}
              </h3>
              {currentDocument.documentUrl?.endsWith(".pdf") ? (
                <iframe
                  src={currentDocument.documentUrl}
                  width="100%"
                  height="500px"
                  title="Document Preview"
                  style={{ border: "none" }}
                />
              ) : (
                <img
                  src={currentDocument.documentUrl}
                  alt="Document"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "500px",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          )}
        </Modal>
      </Spin>
    </div>
  );
});

export default DocumentVerification;
