import React, { useState, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import {
  Modal,
  Form,
  Select,
  Rate,
  Row,
  Col,
  Button,
  Spin,
  Divider,
  Input,
  DatePicker,
  List,
  Tag,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createAppraisal, updateAppraisal } from "../../api/performance";
import {
  fetchBranches,
  fetchDepartmentsByBranch,
  fetchRoleByDepartment,
  fetchUserById,
  fetchUsersByRole,
} from "../../api/auth";
import { toast } from "react-hot-toast";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;
const { MonthPicker } = DatePicker;

const competencies = {
  technical: [
    { name: "Technical Skills", key: "technicalSkills" },
    { name: "Productivity", key: "productivity" },
  ],
  interpersonal: [
    { name: "Teamwork", key: "teamwork" },
    { name: "Communication", key: "communication" },
  ],
  personal: [{ name: "Initiative", key: "initiative" }],
};

const AppraisalForm = ({ visible, onClose, editData }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [strengths, setStrengths] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  // Reset form when modal closes or opens
  const resetForm = () => {
    form.resetFields();
    setStrengths([]);
    setImprovements([]);
    setSelectedBranch(null);
    setSelectedDept(null);
    setSelectedRole(null);
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    if (editData && visible) {
      // Set form values for edit mode
      form.setFieldsValue({
        branch: editData.branch._id,
        department: editData.department._id,
        role: editData.role._id,
        user: editData.user._id,
        period: moment(`${editData.month} ${editData.year}`, "MMMM YYYY"),
        ...editData.competencies,
        strengths: editData.strengths,
        areasForImprovement: editData.areasForImprovement,
        feedback: editData.feedback,
      });

      // Set the state arrays
      setStrengths(editData.strengths || []);
      setImprovements(editData.areasForImprovement || []);

      setSelectedBranch(editData.branch._id);
      setSelectedDept(editData.department._id);
      setSelectedRole(editData.role._id);
    }
  }, [editData, visible]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments", selectedBranch],
    queryFn: () => fetchDepartmentsByBranch(selectedBranch),
    enabled: !!selectedBranch,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles", selectedDept],
    queryFn: () => fetchRoleByDepartment(selectedDept),
    enabled: !!selectedDept,
  });

  const usersQuery = useQuery({
    queryKey: ["users", selectedRole],
    queryFn: () => fetchUsersByRole(selectedRole),
    enabled: !!selectedRole,
  });

  const mutation = useMutation({
    mutationFn: editData
      ? ({ id, data }) => updateAppraisal(id, data)
      : createAppraisal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisals"] });
      toast.success(
        `Appraisal ${editData ? "updated" : "created"} successfully!`
      );
      handleClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error updating or creating appraisal"
      );
    },
  });

  const onFinish = (values) => {
    setLoading(true);

    // Extract month and year from the period field
    const period = moment(values.period);
    const month = period.format("MMMM");
    const year = period.year();

    // Map competencies from form values
    const competenciesData = {};
    Object.keys(competencies).forEach((category) => {
      competencies[category].forEach((item) => {
        if (values[item.key] !== undefined) {
          competenciesData[item.key] = values[item.key];
        }
      });
    });

    // Calculate overall rating (simple average for this example)
    const ratings = Object.values(competenciesData);
    const overallRating = (
      ratings.reduce((sum, val) => sum + val, 0) / ratings.length
    ).toFixed(1);

    const payload = {
      branch: values.branch,
      department: values.department,
      role: values.role,
      user: values.user,
      month,
      year,
      overallRating: parseFloat(overallRating),
      competencies: competenciesData,
      strengths: values.strengths || [],
      areasForImprovement: values.areasForImprovement || [],
      feedback: values.feedback || "",
      reviewer: "authenticated-user-id", // Replace with actual user ID from auth context
    };

    if (editData) {
      mutation.mutate({ id: editData._id, data: payload });
    } else {
      mutation.mutate(payload);
    }
    setLoading(false);
  };

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedDept(null);
    setSelectedRole(null);
    form.setFieldsValue({
      department: undefined,
      role: undefined,
      user: undefined,
    });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDept(value);
    setSelectedRole(null);
    form.setFieldsValue({ role: undefined, user: undefined });
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    form.setFieldsValue({ user: undefined });
  };

  const addStrength = () => {
    const strength = form.getFieldValue("newStrength");
    if (strength && strength.trim()) {
      const newStrengths = [...strengths, strength.trim()];
      setStrengths(newStrengths);
      form.setFieldsValue({
        strengths: newStrengths,
        newStrength: "",
      });
    }
  };

  const removeStrength = (index) => {
    const newStrengths = strengths.filter((_, i) => i !== index);
    setStrengths(newStrengths);
    form.setFieldsValue({
      strengths: newStrengths,
    });
  };

  const addImprovement = () => {
    const improvement = form.getFieldValue("newImprovement");
    if (improvement && improvement.trim()) {
      const newImprovements = [...improvements, improvement.trim()];
      setImprovements(newImprovements);
      form.setFieldsValue({
        areasForImprovement: newImprovements,
        newImprovement: "",
      });
    }
  };

  const removeImprovement = (index) => {
    const newImprovements = improvements.filter((_, i) => i !== index);
    setImprovements(newImprovements);
    form.setFieldsValue({
      areasForImprovement: newImprovements,
    });
  };

  return (
    <Modal
      open={visible}
      title={editData ? "Edit Appraisal" : "Create New Appraisal"}
      onCancel={handleClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading || mutation.isPending}>
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={editData || {}}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="branch"
                label="Branch"
                rules={[{ required: true, message: "Please select branch" }]}
              >
                <Select
                  placeholder="Select branch"
                  onChange={handleBranchChange}
                  loading={branchesQuery.isLoading}
                  allowClear
                >
                  {branchesQuery.data?.map((branch) => (
                    <Option key={branch._id} value={branch._id}>
                      {branch.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="department"
                label="Department"
                rules={[
                  { required: true, message: "Please select department" },
                ]}
              >
                <Select
                  placeholder="Select department"
                  onChange={handleDepartmentChange}
                  loading={departmentsQuery.isLoading}
                  disabled={!selectedBranch}
                  allowClear
                >
                  {departmentsQuery.data?.map((dept) => (
                    <Option key={dept._id} value={dept._id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select
                  placeholder="Select role"
                  onChange={handleRoleChange}
                  loading={rolesQuery.isLoading}
                  disabled={!selectedDept}
                  allowClear
                >
                  {rolesQuery.data?.map((role) => (
                    <Option key={role._id} value={role._id}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="user"
                label="Employee"
                rules={[{ required: true, message: "Please select employee" }]}
              >
                <Select
                  placeholder="Select employee"
                  loading={usersQuery.isLoading}
                  disabled={!selectedRole}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {usersQuery.data?.map((user) => (
                    <Option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="period"
                label="Appraisal Period"
                rules={[{ required: true, message: "Please select period" }]}
              >
                <MonthPicker
                  style={{ width: "100%" }}
                  placeholder="Select month and year"
                  format="MMMM YYYY"
                  disabledDate={(current) =>
                    current && current > moment().endOf("month")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Competencies Rating</Divider>

          {Object.entries(competencies).map(([category, items]) => (
            <React.Fragment key={category}>
              <h3>
                {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
                Competencies
              </h3>
              {items.map((item) => (
                <Form.Item
                  key={item.key}
                  name={item.key}
                  label={item.name}
                  rules={[
                    { required: true, message: `Please rate ${item.name}` },
                  ]}
                >
                  <Rate allowHalf />
                </Form.Item>
              ))}
            </React.Fragment>
          ))}

          <Divider orientation="left">Strengths</Divider>
          <Form.Item name="strengths" hidden />
          <Form.Item label="Add Strength">
            <Input.Group compact>
              <Form.Item name="newStrength" noStyle>
                <Input
                  style={{ width: "calc(100% - 80px)" }}
                  placeholder="Enter strength"
                />
              </Form.Item>
              <Button type="primary" onClick={addStrength}>
                Add
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item>
            <List
              size="small"
              dataSource={strengths}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<IoIosCloseCircle />}
                      onClick={() => removeStrength(index)}
                    />,
                  ]}
                >
                  <Tag color="green">{item}</Tag>
                </List.Item>
              )}
              locale={{ emptyText: "No strengths added yet" }}
            />
          </Form.Item>

          <Divider orientation="left">Areas for Improvement</Divider>
          <Form.Item name="areasForImprovement" hidden />
          <Form.Item label="Add Area for Improvement">
            <Input.Group compact>
              <Form.Item name="newImprovement" noStyle>
                <Input
                  style={{ width: "calc(100% - 80px)" }}
                  placeholder="Enter area for improvement"
                />
              </Form.Item>
              <Button type="primary" onClick={addImprovement}>
                Add
              </Button>
            </Input.Group>
          </Form.Item>
          <Form.Item>
            <List
              size="small"
              dataSource={improvements}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<IoIosCloseCircle />}
                      onClick={() => removeImprovement(index)}
                    />,
                  ]}
                >
                  <Tag color="orange">{item}</Tag>
                </List.Item>
              )}
              locale={{ emptyText: "No areas for improvement added yet" }}
            />
          </Form.Item>

          <Divider orientation="left">Additional Feedback</Divider>
          <Form.Item name="feedback" label="Reviewer Comments">
            <TextArea
              rows={4}
              placeholder="Enter any additional feedback"
              maxLength={1000}
            />
          </Form.Item>

          <div className="flex justify-end mt-6 gap-2">
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
            >
              {editData ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AppraisalForm;