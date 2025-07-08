import React, { useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Divider,
  Card,
  Row,
  Col,
  Tabs,
  Typography,
  Alert,
  Skeleton,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import MDEditor from "@uiw/react-markdown-editor";
import { toast } from "react-hot-toast";
import { getLetterTemp } from "../../api/letter";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

// Skeleton Loading Components
const TableSkeleton = () => (
  <div className="p-4">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} active paragraph={{ rows: 1 }} className="mb-2" />
    ))}
  </div>
);

const FormSkeleton = () => (
  <div className="p-4">
    <Skeleton active paragraph={{ rows: 2 }} className="mb-4" />
    <Skeleton active paragraph={{ rows: 6 }} className="mb-4" />
    <Skeleton active paragraph={{ rows: 3 }} />
  </div>
);

const LetterTemplates = () => {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();
  const [templateContent, setTemplateContent] = useState("");
  const [variables, setVariables] = useState([]);
  const [previewContent, setPreviewContent] = useState("");
  const [activeTab, setActiveTab] = useState("offer");
  const [variableHelpVisible, setVariableHelpVisible] = useState(false);

  const letterTypes = [
    { key: "offer", name: "Offer Letter" },
    { key: "appointment", name: "Appointment Letter" },
    { key: "termination", name: "Termination Letter" },
    { key: "promotion", name: "Promotion Letter" },
    { key: "warning", name: "Warning Letter" },
    { key: "experience", name: "Experience Letter" },
    { key: "resignation", name: "Resignation Letter" },
    { key: "custom", name: "Custom Letter" },
  ];

  // Fetch all templates using React Query
  const {
    data: templates = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["letterTemplates"],
    queryFn: getLetterTemp,
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to fetch templates");
    },
  });
   
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (templateData) =>
      axios.post("/api/v1/manage-letter", templateData),
    onSuccess: () => {
      toast.success("Template created successfully");
      queryClient.invalidateQueries(["letterTemplates"]);
      setCurrentTemplate(null);
      setIsModalVisible(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create template");
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, templateData }) =>
      axios.put(`/api/v1/manage-letter/${id}`, templateData),
    onSuccess: () => {
      toast.success("Template updated successfully");
      queryClient.invalidateQueries(["letterTemplates"]);
      setCurrentTemplate(null);
      setIsModalVisible(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update template");
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/v1/manage-letter/${id}`),
    onSuccess: () => {
      toast.success("Template deleted successfully");
      queryClient.invalidateQueries(["letterTemplates"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete template");
    },
  });

  const handleAddVariable = () => {
    setVariables([...variables, { name: "", description: "" }]);
  };

  const handleVariableChange = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const handleRemoveVariable = (index) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
  };

  const showModal = (template = null) => {
    if (template) {
      setCurrentTemplate(template);
      form.setFieldsValue({
        name: template.name,
        type: template.type || "custom",
      });
      setTemplateContent(template.content);
      setVariables(template.variables || []);
      setActiveTab(template.type || "custom");
    } else {
      form.resetFields();
      form.setFieldsValue({ type: activeTab });
      setTemplateContent(
        `# ${
          letterTypes.find((t) => t.key === activeTab)?.name || "Letter"
        }\n\nDear {recipient_name},\n\n{body_content}\n\nSincerely,\n{company_name}`
      );
      setVariables([]);
    }
    setIsModalVisible(true);
  };

  const generatePreview = () => {
    if (!templateContent) {
      toast.warning("Please add some content first");
      return;
    }

    let preview = templateContent;
    variables.forEach((variable) => {
      if (variable.name) {
        preview = preview.replace(
          new RegExp(`{${variable.name}}`, "g"),
          `<span class="variable-preview">[${variable.name}]</span>`
        );
      }
    });
    setPreviewContent(preview);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Validate variables
      const variableErrors = [];
      variables.forEach((v, i) => {
        if (!v.name || !v.description) {
          variableErrors.push(i);
        }
      });

      if (variableErrors.length > 0) {
        toast.error("Please fill all variable fields");
        return;
      }

      const templateData = {
        name: values.name,
        type: values.type,
        content: templateContent,
        variables: variables.filter((v) => v.name && v.description),
      };

      if (currentTemplate) {
        await updateTemplateMutation.mutateAsync({
          id: currentTemplate._id,
          templateData,
        });
      } else {
        await createTemplateMutation.mutateAsync(templateData);
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleDelete = (id) => {
    deleteTemplateMutation.mutate(id);
  };

  const columns = [
    {
      title: "Template Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary">
            {letterTypes.find((t) => t.key === record.type)?.name || "Custom"}
          </Text>
        </div>
      ),
    },
    {
      title: "Variables",
      key: "variables",
      render: (_, record) => (
        <Space wrap>
          {record.variables?.map((v, i) => (
            <Tag key={i}>{v.name}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            disabled={isLoading}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
            loading={
              deleteTemplateMutation.isLoading &&
              deleteTemplateMutation.variables?.id === record._id
            }
          />
        </Space>
      ),
    },
  ];

  const isLoadingState =
    isLoading ||
    createTemplateMutation.isLoading ||
    updateTemplateMutation.isLoading ||
    deleteTemplateMutation.isLoading;

  return (
    <div className="p-4">
      <Card
        title="Letter Templates Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            loading={createTemplateMutation.isLoading}
          >
            New Template
          </Button>
        }
      >
        {isError ? (
          <Alert
            message="Error"
            description={
              error.response?.data?.message ||
              "Failed to load templates. Please try again later."
            }
            type="error"
            showIcon
            className="mb-4"
          />
        ) : null}

        <Tabs
          defaultActiveKey="offer"
          onChange={(key) => setActiveTab(key)}
          tabBarExtraContent={
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => setVariableHelpVisible(!variableHelpVisible)}
            >
              Variable Help
            </Button>
          }
        >
          {letterTypes.map((type) => (
            <TabPane tab={type.name} key={type.key}>
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <Table
                  columns={columns}
                  dataSource={templates.filter((t) => t.type === type.key)}
                  rowKey="_id"
                  loading={isLoading}
                  pagination={{ pageSize: 10 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No templates found"
                      />
                    ),
                  }}
                />
              )}
            </TabPane>
          ))}
        </Tabs>

        {variableHelpVisible && (
          <Alert
            message="How to use variables"
            description={
              <div>
                <p>
                  1. Create variables that will be replaced with actual values
                  when generating letters
                </p>
                <p>
                  2. Use the format {"{variable_name}"} in your template content
                </p>
                <p>
                  3. Example:{" "}
                  {"Dear {employee_name}, your salary is {salary_amount}"}
                </p>
                <p>
                  4. When generating a letter, you'll be prompted to provide
                  values for each variable
                </p>
              </div>
            }
            type="info"
            closable
            onClose={() => setVariableHelpVisible(false)}
            className="mt-4"
          />
        )}
      </Card>

      <Modal
        title={
          currentTemplate
            ? `Edit ${
                letterTypes.find((t) => t.key === currentTemplate.type)?.name ||
                "Letter"
              } Template`
            : `Create New ${
                letterTypes.find((t) => t.key === activeTab)?.name || "Letter"
              } Template`
        }
        width={1000}
        visible={isModalVisible}
        onCancel={() => {
          setCurrentTemplate(null);
          setIsModalVisible(false);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setCurrentTemplate(null);
              setIsModalVisible(false);
            }}
          >
            Cancel
          </Button>,
          <Button key="preview" onClick={generatePreview}>
            Generate Preview
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={
              createTemplateMutation.isLoading ||
              updateTemplateMutation.isLoading
            }
            icon={<SaveOutlined />}
            onClick={handleSubmit}
          >
            Save Template
          </Button>,
        ]}
      >
        {isLoadingState ? (
          <FormSkeleton />
        ) : (
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="name"
                  label="Template Name"
                  rules={[
                    { required: true, message: "Please enter template name" },
                  ]}
                >
                  <Input placeholder="e.g., Standard Offer Letter, Executive Appointment Letter, etc." />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="type"
                  label="Letter Type"
                  rules={[{ required: true }]}
                >
                  <Select>
                    {letterTypes.map((type) => (
                      <Option key={type.key} value={type.key}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Template Content</Divider>
            <Text type="secondary" className="mb-4 block">
              Use variables in curly braces like {"{variable_name}"}. Click
              "Generate Preview" to see how it will look.
            </Text>

            <div className="mb-4">
              <MDEditor
                value={templateContent}
                onChange={setTemplateContent}
                height={300}
                preview="edit"
                className="markdown-editor"
              />
            </div>

            <Divider orientation="left">Template Variables</Divider>
            <Text type="secondary" className="mb-4 block">
              Define variables that will be replaced with actual values when
              generating letters.
            </Text>

            {variables.length === 0 && (
              <Alert
                message="No variables defined"
                description="Add variables that you've used in your template content"
                type="info"
                showIcon
                className="mb-4"
              />
            )}

            {variables.map((variable, index) => (
              <Card key={index} className="mb-2" size="small">
                <Row gutter={16}>
                  <Col span={10}>
                    <Input
                      placeholder="Variable name (e.g., employee_name)"
                      value={variable.name}
                      onChange={(e) =>
                        handleVariableChange(index, "name", e.target.value)
                      }
                      addonBefore="{"
                      addonAfter="}"
                    />
                  </Col>
                  <Col span={12}>
                    <Input
                      placeholder="Description (e.g., Full name of employee)"
                      value={variable.description}
                      onChange={(e) =>
                        handleVariableChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </Col>
                  <Col span={2}>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => handleRemoveVariable(index)}
                    />
                  </Col>
                </Row>
              </Card>
            ))}

            <Button
              type="dashed"
              onClick={handleAddVariable}
              icon={<PlusOutlined />}
              className="mt-2"
              block
            >
              Add Variable
            </Button>

            {previewContent && (
              <>
                <Divider orientation="left">Preview</Divider>
                <div
                  className="preview-content p-4 border rounded"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default LetterTemplates;
