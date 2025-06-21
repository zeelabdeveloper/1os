 

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  Row,
  Col,
  Button,
  Spin,
  Divider,
  Slider,
  Alert,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGoal,
  updateGoal,
} from "../../api/performance";
import {
  fetchBranches,
  fetchDepartmentsByBranch,
  fetchRoleByDepartment,
} from "../../api/auth";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const goalTypes = [
  { value: "short-term", label: "Short Term" },
  { value: "long-term", label: "Long Term" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const GoalForm = ({ visible, onClose, editData }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);

  const mutation = useMutation({
    mutationFn: editData
      ? ({ id, data }) => updateGoal(id, data)
      : createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(
        `Goal ${editData ? "updated" : "created"} successfully!`
      );
      handleClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error updating or creating goal"
      );
    },
  });

  const handleClose = () => {
    form.resetFields();
    setSelectedBranch(null);
    setSelectedDept(null);
     setLoading(false);
    onClose();

  };

  const onFinish = (values) => {
    setLoading(true);
    
    const payload = {
      branch: values.branch,
      department: values.department,
      role: values.role,
      goalType: values.goalType,
      subject: values.subject,
      description: values.description,
      startDate: values.startDate ? values.startDate.toDate() : null,
      endDate: values.endDate ? values.endDate.toDate() : null,
      targetAchievement: values.targetAchievement,
    };

    if (editData) {
      payload.currentProgress = values.currentProgress;
      payload.status = values.status;
      payload.progressNotes = values.progressNotes;
    }

    mutation.mutate(editData ? { id: editData._id, data: payload } : payload);
  };

  useEffect(() => {
    if (editData && visible) {
      form.setFieldsValue({
        branch: editData.branch?._id,
        department: editData.department?._id,
        role: editData.role?._id,
        goalType: editData.goalType,
        subject: editData.subject,
        description: editData.description,
        startDate: editData.startDate ? dayjs(editData.startDate) : null,
        endDate: editData.endDate ? dayjs(editData.endDate) : null,
        targetAchievement: editData.targetAchievement,
        currentProgress: editData.currentProgress || 0,
        status: editData.status || 'not-started',
      });
      setSelectedBranch(editData.branch?._id);
      setSelectedDept(editData.department?._id);
    }
  }, [editData, visible, form]);

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedDept(null);
    form.setFieldsValue({ department: undefined, role: undefined });
  };

  const handleDepartmentChange = (value) => {
    setSelectedDept(value);
    form.setFieldsValue({ role: undefined });
  };

  const disabledEndDate = (current) => {
    const startDate = form.getFieldValue('startDate');
    if (!startDate) return false;
    return current && current < startDate.startOf('day');
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

  return (
    <Modal
      open={visible}
      title={editData ? "Edit Goal" : "Create New Goal"}
      onCancel={handleClose}
      footer={null}
      destroyOnClose
      width={800}
    >
      <Spin spinning={loading || mutation.isPending}>
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="goalType"
                label="Goal Type"
                rules={[{ required: true, message: "Please select goal type" }]}
              >
                <Select placeholder="Select goal type">
                  {goalTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: "Please enter subject" }]}
              >
                <Input placeholder="Enter goal subject" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter goal description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[
                  { 
                    required: true, 
                    message: "Please select start date",
                    validator: (_, value) => {
                      if (value && dayjs.isDayjs(value) && value.isValid()) {
                        return Promise.resolve();
                      }
                      return Promise.reject('Please select a valid date');
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="End Date"
                rules={[
                  { 
                    required: true, 
                    message: "Please select end date",
                    validator: (_, value) => {
                      if (value && dayjs.isDayjs(value) && value.isValid()) {
                        return Promise.resolve();
                      }
                      return Promise.reject('Please select a valid date');
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={disabledEndDate}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="targetAchievement"
            label="Target Achievement"
            rules={[{ required: true, message: "Please enter target achievement" }]}
          >
            <Input placeholder="What needs to be achieved?" />
          </Form.Item>

          {editData && (
            <>
              <Divider orientation="left">Progress Update</Divider>
              
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  {statusOptions.map((status) => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="currentProgress"
                label="Current Progress (%)"
              >
                <Slider 
                  min={0}
                  max={100}
                  step={5}
                  marks={{
                    0: '0%',
                    25: '25%',
                    50: '50%',
                    75: '75%',
                    100: '100%'
                  }}
                />
              </Form.Item>

              <Form.Item
                name="progressNotes"
                label="Progress Notes"
              >
                <TextArea rows={2} placeholder="Any notes about this progress update" />
              </Form.Item>

              {editData.progressHistory?.length > 0 && (
                <Form.Item label="Progress History">
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {editData.progressHistory.map((item, index) => (
                      <Alert
                        key={index}
                        message={`${item.progress}% on ${dayjs(item.date).format('DD MMM YYYY')}`}
                        description={item.notes}
                        type="info"
                        showIcon
                        style={{ marginBottom: 8 }}
                      />
                    ))}
                  </div>
                </Form.Item>
              )}
            </>
          )}

          <div className="flex justify-end mt-6 gap-2">
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
            >
              {editData ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default GoalForm;