import React, { useState } from "react";
import {
  Table,
  Button,
  Card,
  Rate,
  Typography,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleFilled,
  StarFilled,
  RocketOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchIndicators, deleteIndicator } from "../../api/performance";
import IndicatorForm from "../../components/performance/PerformanceForm";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const IndicatorList = () => {
  const queryClient = useQueryClient();
  const { data: indicators = [], isLoading } = useQuery({
    queryKey: ["indicators"],
    queryFn: fetchIndicators,
  });

  const [formVisible, setFormVisible] = useState(false);
  const [editData, setEditData] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: deleteIndicator,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["indicators"] });
      toast.success(data.message || "Indicator deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error deleting indicator");
    },
  });

  const handleEdit = (record) => {
    setEditData(record);
    setFormVisible(true);
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
      title: "Leadership",
      dataIndex: ["competencies", "leadership"],
      render: (val) => (
        <Rate character={<StarFilled style={{ fontSize: 14 }} />} disabled value={val} count={5} />
      ),
      width: 130,
      responsive: ["md"],
    },
    {
      title: "Project",
      dataIndex: ["competencies", "projectManagement"],
      render: (val) => (
        <Rate character={<RocketOutlined style={{ fontSize: 14 }} />} disabled value={val} count={5} />
      ),
      width: 130,
      responsive: ["md"],
    },
    {
      title: "Resources",
      dataIndex: ["competencies", "allocatingResources"],
      render: (val) => <Rate style={{ fontSize: 14 }} disabled value={val} count={5} />,
      width: 130,
      responsive: ["lg"],
    },
    {
      title: "Business",
      dataIndex: ["competencies", "businessProcess"],
      render: (val) => <Rate style={{ fontSize: 14 }} disabled value={val} count={5} />,
      width: 130,
      responsive: ["lg"],
    },
    {
      title: "Comm.",
      dataIndex: ["competencies", "oralCommunication"],
      render: (val) => <Rate style={{ fontSize: 14 }} disabled value={val} count={5} />,
      width: 130,
      responsive: ["xl"],
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              type="default"
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this indicator?"
            description="Are you sure to delete this performance indicator?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                danger
                type="default"
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
      style={{ borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.05)", padding: 12 }}
      title={
        <div className="flex justify-between items-center">
          <Title level={5} style={{ margin: 0 }}>
            🎯 Performance Indicators
          </Title>
          <Button
            type="primary"
            icon={<PlusCircleFilled />}
            size="small"
            onClick={handleCreate}
          >
            Add
          </Button>
        </div>
      }
      extra={<Text type="secondary">Total: {indicators.length}</Text>}
    >
      <div className="overflow-auto rounded-xl">
        <Table
          size="small"
          loading={isLoading}
          dataSource={indicators}
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

      <IndicatorForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        editData={editData}
      />
    </Card>
  );
};

export default IndicatorList;
