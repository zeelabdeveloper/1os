import React, { memo, useState } from "react";
import {
  Form,
  Button,
  Divider,
  Input,
  Select,
  DatePicker,
  message,
  Table,
  Tag,
  Modal,
  Spin,
  Drawer,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const TrainingManagement = memo(() => {
  const [form] = Form.useForm();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const queryClient = useQueryClient();
  
  const getCandidateIdFromUrl = () => {
    const query = new URLSearchParams(window.location.search);
    return query.get("id");
  };

  // Fetch trainings
  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/v1/trainings/my-trainings/${getCandidateIdFromUrl()}`
      );
      return data.data;
    },
    onError: () => toast.error("Failed to load trainings"),
  });

  // Save trainings
  const { mutate: saveTraining, isPending: isSaving } = useMutation({
    mutationFn: async (trainingData) => {
      if (editingTraining) {
        trainingData.id = editingTraining._id;
      }
      const url = "/api/v1/trainings";
      const method = "post";

      const { data } = await axios[method](url, trainingData);
      return data;
    },
    onSuccess: () => {
      toast.success(
        `Training ${editingTraining ? "updated" : "added"} successfully`
      );
      queryClient.invalidateQueries(["trainings"]);
      setIsDrawerVisible(false);
      form.resetFields();
      setEditingTraining(null);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to save training");
    },
  });

  // Delete training
  const { mutate: deleteTraining } = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/v1/trainings/${id}`);
    },
    onSuccess: () => {
      toast.success("Training deleted successfully");
      queryClient.invalidateQueries(["trainings"]);
    },
    onError: () => {
      toast.error("Failed to delete training");
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const trainingData = {
        applicationId: getCandidateIdFromUrl(),
        trainingType: values.trainingType,
        trainingStartDate: values.trainingStartDate.toISOString(),
        trainingEndDate: values.trainingEndDate.toISOString(),
        description: values.description,
        notes: values.notes,
        status: values.status,
      };

      saveTraining(trainingData);
    } catch (error) {
      message.error("Please fill all required fields");
    }
  };

  const openEditDrawer = (training = null) => {
    setEditingTraining(training);
    if (training) {
      form.setFieldsValue({
        trainingType: training.trainingType,
        trainingStartDate: dayjs(training.trainingStartDate),
        trainingEndDate: dayjs(training.trainingEndDate),
        description: training.description,
        notes: training.notes,
        status: training.status,
      });
    } else {
      form.resetFields();
    }
    setIsDrawerVisible(true);
  };

  const columns = [
    {
      title: "Training Type",
      dataIndex: "trainingType",
      key: "trainingType",
    },
    {
      title: "Start Date",
      dataIndex: "trainingStartDate",
      key: "trainingStartDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "trainingEndDate",
      key: "trainingEndDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = '';
        switch (status) {
          case 'Completed':
            color = 'green';
            break;
          case 'Cancelled':
            color = 'red';
            break;
          default:
            color = 'blue';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteTraining(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Spin spinning={isLoading}>
        <div className="">
          <Divider orientation="left">Training & Development</Divider>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openEditDrawer()}
          >
            Add New Training
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={trainings}
          rowKey="_id"
          className="mt-4"
          pagination={{ pageSize: 5 }}
        />
        
        {/* Edit/Add Drawer */}
        <Drawer
          title={editingTraining ? "Edit Training" : "Add New Training"}
          placement="right"
          width={600}
          onClose={() => {
            setIsDrawerVisible(false);
            form.resetFields();
            setEditingTraining(null);
          }}
          open={isDrawerVisible}
          closable={false}
          extra={
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setIsDrawerVisible(false);
                form.resetFields();
                setEditingTraining(null);
              }}
            />
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="trainingType"
              label="Training Type"
              rules={[{ required: true, message: "Please select training type" }]}
            >
              <Select placeholder="Select training type">
                <Option value="Technical">Technical</Option>
                <Option value="Soft Skills">Soft Skills</Option>
                <Option value="Induction">Induction</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="trainingStartDate"
              label="Start Date"
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="trainingEndDate"
              label="End Date"
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={3} placeholder="Enter training description" />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea rows={2} placeholder="Enter any additional notes" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              initialValue="Scheduled"
            >
              <Select>
                <Option value="Scheduled">Scheduled</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Form.Item>

            <Button
              type="primary"
              onClick={handleSubmit}
              block
              loading={isSaving}
              className="mt-4"
            >
              {editingTraining ? "Update Training" : "Save Training"}
            </Button>
          </Form>
        </Drawer>
      </Spin>
    </div>
  );
});

export default TrainingManagement;