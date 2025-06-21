import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Space,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import MDEditor from "@uiw/react-markdown-editor";
import {
  PlusOutlined,
  MinusCircleOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchBranches,
  fetchDepartmentsByBranch,
  fetchRoleByDepartment,
} from "../api/auth";
import { updateJob } from "../api/jobs";
import moment from "moment";

const { Option } = Select;
const { Text } = Typography;

const EditJobForm = ({ jobData, onSuccess }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isActive, setIsActive] = useState(jobData?.isActive || true);

  useEffect(() => {
    if (jobData) {
      form.setFieldsValue({
        ...jobData,
        branch: jobData.branch?._id,
        department: jobData.department?._id,
        isActive: jobData.isActive,
        role: jobData.role?._id,
        startDate: jobData.startDate ? moment(jobData.startDate) : null,
        endDate: jobData.endDate ? moment(jobData.endDate) : null,
        salary: jobData.salary || { min: 0, max: 0, currency: "INR" },
        skills: jobData.skills || [],
        customQuestions: jobData.customQuestions || [],
      });
      setIsActive(jobData.isActive);
      setDescription(jobData.description || "");
      setRequirements(jobData.requirements || "");
      setSelectedBranch(jobData.branch?._id || null);
      setSelectedDepartment(jobData.department?._id || null);
    }
  }, [jobData, form]);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", selectedBranch],
    queryFn: () => fetchDepartmentsByBranch(selectedBranch),
    enabled: !!selectedBranch,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles", selectedDepartment],
    queryFn: () => fetchRoleByDepartment(selectedDepartment),
    enabled: !!selectedDepartment,
  });

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedDepartment(null);
    form.setFieldsValue({ department: undefined, role: undefined });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
    form.setFieldsValue({ role: undefined });
  };

  const { mutate: updateJobMutation, isLoading } = useMutation({
    mutationFn: updateJob,
    onSuccess: () => {
      message.success("Job updated successfully");
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: () => message.error("Failed to update job"),
  });

  const onFinish = (values) => {
    const updatedJob = {
      ...values,
      _id: jobData._id,
      description,
      isActive,
      requirements,
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString(),
    };
    updateJobMutation(updatedJob);
  };

  return (
    <div className="p-4 h-[92vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        <FileTextOutlined /> Edit Job
      </h2>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[16, 16]}>
          {/* Basic Information Card */}
          <Col xs={24} md={12}>
            <Card title="Basic Information" className="h-full">
              <Form.Item
                name="title"
                label="Job Title"
                rules={[{ required: true, message: "Please enter job title" }]}
              >
                <Input
                  prefix={<FileTextOutlined />}
                  placeholder="e.g. React Developer"
                />
              </Form.Item>

              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input
                  prefix={<FileTextOutlined />}
                  placeholder="e.g. Remote / Delhi"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Organization Structure Card */}
          <Col xs={24} md={12}>
            <Card title="Organization Structure" className="h-full">
              <Form.Item
                name="branch"
                label="Branch"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select Branch"
                  onChange={handleBranchChange}
                  allowClear
                >
                  {branches.map((b) => (
                    <Option key={b._id} value={b._id}>
                      {b.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select Department"
                  onChange={handleDepartmentChange}
                  disabled={!selectedBranch}
                  allowClear
                >
                  {departments.map((d) => (
                    <Option key={d._id} value={d._id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                <Select
                  placeholder="Select Role"
                  disabled={!selectedDepartment}
                  allowClear
                >
                  {roles.map((r) => (
                    <Option key={r._id} value={r._id}>
                      {r.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* Job Details Card */}
          <Col xs={24}>
            <Card title="Job Details">
              <Form.Item label="Job Description" required>
                <MDEditor
                  value={description}
                  onChange={setDescription}
                  preview="edit"
                  placeholder="Write a detailed job description..."
                />
              </Form.Item>

              <Form.Item label="Job Requirements" required>
                <MDEditor
                  value={requirements}
                  onChange={setRequirements}
                  preview="edit"
                  placeholder="List required qualifications or skills..."
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Dates and Salary Card */}
          <Col xs={24} md={12}>
            <Card title="Dates">
              <Form.Item name="startDate" label="Start Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="endDate" label="End Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Salary Information">
              <Form.Item name={["salary", "min"]} label="Min Salary">
                <InputNumber
                  prefix={<DollarOutlined />}
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Min"
                />
              </Form.Item>
              <Form.Item name={["salary", "max"]} label="Max Salary">
                <InputNumber
                  prefix={<DollarOutlined />}
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="Max"
                />
              </Form.Item>
              <Form.Item name={["salary", "currency"]} label="Currency">
                <Select prefix={<DollarOutlined />} defaultValue="INR">
                  <Option value="INR">INR</Option>
                  <Option value="USD">USD</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* Experience and Skills Card */}
          <Col xs={24} md={12}>
            <Card title="Requirements">
              <Form.Item name="experience" label="Experience Required">
                <Select
                  prefix={<TagOutlined />}
                  placeholder="Select Experience"
                >
                  <Option value="0-1">0-1 Year</Option>
                  <Option value="1-3">1-3 Years</Option>
                  <Option value="3-5">3-5 Years</Option>
                  <Option value="5+">5+ Years</Option>
                </Select>
              </Form.Item>

              <Form.Item name="skills" label="Skills (Add multiple)">
                <Select
                  prefix={<TagOutlined />}
                  mode="tags"
                  placeholder="e.g. React, Node.js, MongoDB"
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Status Card */}
          <Col xs={24} md={12}>
            <Card title="Job Status">
              <Form.Item name="isActive" label="Status">
                <Space>
                  <Switch
                    checked={isActive}
                    onChange={(checked) => setIsActive(checked)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                  />
                  <Text type={isActive ? "success" : "danger"}>
                    {isActive ? "Active" : "Inactive"}
                  </Text>
                </Space>
              </Form.Item>
            </Card>
          </Col>

          {/* Custom Questions Card */}
          <Col xs={24}>
            <Card title="Custom Questions">
              <Form.List name="customQuestions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "question"]}
                          rules={[
                            { required: true, message: "Enter question" },
                          ]}
                        >
                          <Input placeholder="Custom Question" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "type"]}
                          rules={[{ required: true }]}
                        >
                          <Select placeholder="Type" style={{ width: 140 }}>
                            <Option value="text">Text</Option>
                            <Option value="multiple-choice">
                              Multiple Choice
                            </Option>
                            <Option value="file">File Upload</Option>
                          </Select>
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                      >
                        Add Question
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>
        </Row>

        {/* Submit Button */}
        <Row justify="end" className="mt-6">
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{ minWidth: "150px" }}
            >
              Update Job
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default EditJobForm;