import React, { useState, useEffect } from "react";
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
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIndicator,
  
  updateIndicator,
} from "../../api/performance";
import {
  fetchBranches,
  fetchDepartmentsByBranch,
  fetchRoleByDepartment,
} from "../../api/auth";
import { toast } from "react-hot-toast";

const { Option } = Select;

const competencies = {
  organizational: [
    { name: "Leadership", key: "leadership" },
    { name: "Project Management", key: "projectManagement" },
  ],
  technical: [{ name: "Allocating Resources", key: "allocatingResources" }],
  behavioural: [
    { name: "Business Process", key: "businessProcess" },
    { name: "Oral Communication", key: "oralCommunication" },
  ],
};

const IndicatorForm = ({ visible, onClose, editData }) => {
  console.log( editData)
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setSelectedBranch(null);
      setSelectedDept(null);
    }
  }, [visible]);

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

  const mutation = useMutation({
    mutationFn: editData
      ? ({ id, data }) => updateIndicator(id, data)
      : createIndicator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] });
      toast.success(
        `Indicator ${editData ? "updated" : "created"} successfully!`
      );
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || "Error updating Or Creating indicator"
      );
    },
  });

  const onFinish = (values) => {
    setLoading(true);
    const competenciesData = {};

    // Map competencies from form values
    Object.keys(competencies).forEach((category) => {
      competencies[category].forEach((item) => {
        if (values[item.key] !== undefined) {
          competenciesData[item.key] = values[item.key];
        }
      });
    });

    const payload = {
      branch: values.branch,
      department: values.department,
      role: values.role,
      competencies: competenciesData,
    };
    if (editData) {
      mutation.mutate({ id: editData._id, data: payload });
    } else {
      mutation.mutate(payload);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (editData && visible) {
      form.setFieldsValue({
        branch: editData.branch._id,
        department: editData.department._id,
        role: editData.role._id,
        ...editData.competencies,
      });
      setSelectedBranch(editData.branch._id);
      setSelectedDept(editData.department._id);
    }
  }, [editData, visible]);

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedDept(null);
    form.setFieldsValue({ department: undefined, role: undefined });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDept(value);
    form.setFieldsValue({ role: undefined });
  };

  return (
    <Modal
      open={visible}
      title={
        editData
          ? "Edit Performance Indicator"
          : "Create New Performance Indicator"
      }
      onCancel={onClose}
      footer={null}
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
            <Col span={24}>
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
          </Row>

          <Row gutter={16}>
            <Col span={24}>
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
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select
                  placeholder="Select role"
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

          <Divider orientation="left">Competencies Rating</Divider>

          <h3>Organizational Competencies</h3>
          {competencies.organizational.map((item) => (
            <Form.Item
              key={item.key}
              name={item.key}
              label={item.name}
              rules={[{ required: true, message: `Please rate ${item.name}` }]}
            >
              <Rate allowHalf />
            </Form.Item>
          ))}

          <h3>Technical Competencies</h3>
          {competencies.technical.map((item) => (
            <Form.Item
              key={item.key}
              name={item.key}
              label={item.name}
              rules={[{ required: true, message: `Please rate ${item.name}` }]}
            >
              <Rate allowHalf />
            </Form.Item>
          ))}

          <h3>Behavioural Competencies</h3>
          {competencies.behavioural.map((item) => (
            <Form.Item
              key={item.key}
              name={item.key}
              label={item.name}
              rules={[{ required: true, message: `Please rate ${item.name}` }]}
            >
              <Rate allowHalf />
            </Form.Item>
          ))}

          <div className="flex justify-end mt-6 gap-2">
            <Button onClick={onClose}>Cancel</Button>
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

export default IndicatorForm;
