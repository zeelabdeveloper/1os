import React, { useState } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
  Progress,
  Badge,
  Modal,
  Descriptions,
  Timeline,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleFilled,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchGoals, deleteGoal } from "../../api/performance";
import GoalForm from "../../components/performance/GoalForm";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const statusColors = {
  "not-started": "default",
  "in-progress": "processing",
  completed: "success",
};

const goalTypeColors = {
  "short-term": "blue",
  "long-term": "purple",
  quarterly: "cyan",
  annual: "green",
  other: "orange",
};

const GoalList = () => {
  const queryClient = useQueryClient();
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
  });

  const [formVisible, setFormVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [editData, setEditData] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success(data.message || "Goal deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error deleting goal");
    },
  });

  const handleEdit = (record) => {
    setEditData(record);
    setFormVisible(true);
  };

  const handleView = (record) => {
    setSelectedGoal(record);
    setViewModalVisible(true);
  };

  const handleCreate = () => {
    setEditData(null);
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const columns = [
    {
      title: "Branch",
      dataIndex: ["branch", "name"],
      key: "branch",
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 120,
      ellipsis: true,
    },
    {
      title: "Dept",
      dataIndex: ["department", "name"],
      key: "department",
      render: (text) => <Tag color="purple">{text}</Tag>,
      width: 120,
      ellipsis: true,
    },
    {
      title: "Role",
      dataIndex: ["role", "name"],
      key: "role",
      render: (text) => <Tag color="geekblue">{text}</Tag>,
      width: 120,
      ellipsis: true,
    },
    {
      title: "Goal Type",
      dataIndex: "goalType",
      key: "goalType",
      render: (text) => (
        <Tag color={goalTypeColors[text]}>
          {text
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      width: 150,
    },
    {
      title: "Progress",
      dataIndex: "currentProgress",
      key: "progress",
      render: (progress, record) => (
        <Progress
          percent={progress}
          status={record.status === "completed" ? "success" : "active"}
          size="small"
        />
      ),
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={statusColors[status]}
          text={status
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        />
      ),
      width: 120,
    },
    {
      title: "Timeline",
      key: "timeline",
      render: (_, record) => (
        <div>
          <div>
            <CalendarOutlined /> {dayjs(record.startDate).format("DD/MM/YY")}
          </div>
          <div>
            <CalendarOutlined /> {dayjs(record.endDate).format("DD/MM/YY")}
          </div>
        </div>
      ),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              type="text"
              size="small"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              type="text"
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this goal?"
            description="Are you sure to delete this goal?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                danger
                type="text"
                size="small"
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        padding: 12,
      }}
      title={
        <div className="flex justify-between items-center">
          <Title level={5} style={{ margin: 0 }}>
            🎯 Goal Tracking
          </Title>
          <Button
            type="primary"
            icon={<PlusCircleFilled />}
            size="small"
            onClick={handleCreate}
          >
            Add Goal
          </Button>
        </div>
      }
      extra={<Text type="secondary">Total: {goals.length}</Text>}
    >
      <div className="overflow-auto rounded-xl">
        <Table
          size="small"
          loading={isLoading}
          dataSource={goals}
          columns={columns}
          rowKey="_id"
          pagination={{
            pageSize: 6,
            showSizeChanger: true,
            pageSizeOptions: ["6", "10", "20", "50"],
          }}
          bordered
          scroll={{ x: "max-content" }}
          className="min-w-[900px]"
        />
      </div>

      <GoalForm
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setEditData(null);
        }}
        editData={editData}
      />

      {/* View Goal Modal */}
      <Modal
        title="Goal Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedGoal && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Branch" span={2}>
                <Tag color="blue">{selectedGoal.branch?.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Department" span={2}>
                <Tag color="purple">{selectedGoal.department?.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Role" span={2}>
                <Tag color="geekblue">{selectedGoal.role?.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Goal Type">
                <Tag color={goalTypeColors[selectedGoal.goalType]}>
                  {selectedGoal.goalType
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge
                  status={statusColors[selectedGoal.status]}
                  text={selectedGoal.status
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Subject" span={2}>
                {selectedGoal.subject}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedGoal.description || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {dayjs(selectedGoal.startDate).format("DD MMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {dayjs(selectedGoal.endDate).format("DD MMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Target Achievement" span={2}>
                {selectedGoal.targetAchievement}
              </Descriptions.Item>
              <Descriptions.Item label="Current Progress" span={2}>
                <Progress
                  percent={selectedGoal.currentProgress}
                  status={
                    selectedGoal.status === "completed" ? "success" : "active"
                  }
                />
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Progress History</Divider>

            {selectedGoal.progressHistory?.length > 0 ? (
              <Timeline>
                {selectedGoal.progressHistory.map((item, index) => (
                  <Timeline.Item key={index}>
                    <div className="flex justify-between">
                      <div>
                        <strong>{item.progress}%</strong> on{" "}
                        {dayjs(item.date).format("DD MMM YYYY - hh:mm A")}
                      </div>
                      <div>
                        {item.notes && (
                          <Text type="secondary">Notes: {item.notes}</Text>
                        )}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Text type="secondary">No progress history available</Text>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default GoalList;
