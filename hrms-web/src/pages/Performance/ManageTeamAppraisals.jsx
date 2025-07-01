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
  Select,
  Row,
  Col,
  Badge,
  
  Statistic,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAppraisals,
  deleteAppraisal,
  submitAppraisal,
  exportAppraisalsToPDF,
} from "../../api/performance";
 

import toast from "react-hot-toast";
import dayjs from "dayjs";
import UserAppraisalModal from "../../Tab/UserAppraisalModal.JSX";
import AppraisalForm from "../../components/performance/AppraisalFormForTeam";

const { Title,   } = Typography;
const { Option } = Select;

const statusColors = {
  Draft: "default",
  Submitted: "processing",
  Approved: "success",
  Rejected: "error",
};

const statusOptions = [
  { value: "Draft", label: "Draft", color: "default" },
  { value: "Submitted", label: "Submitted", color: "processing" },
  { value: "Approved", label: "Approved", color: "success" },
  { value: "Rejected", label: "Rejected", color: "error" },
];

const AppraisalList = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: null,
    year: dayjs().year(),
    month: null,
  });

  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);

  const {
    data: appraisals = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["appraisals", filters],
    queryFn: () => fetchAppraisals(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAppraisal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisals"] });
      toast.success("Appraisal deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error deleting appraisal");
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitAppraisal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appraisals"] });
      toast.success("Appraisal submitted successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error submitting appraisal"
      );
    },
  });

  const exportMutation = useMutation({
    mutationFn: exportAppraisalsToPDF,
    onSuccess: () => {
      toast.success("Export initiated successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error exporting appraisals"
      );
    },
  });

  const handleViewDetails = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setDetailVisible(true);
  };

  const handleEdit = (appraisal) => {
    setSelectedAppraisal(appraisal);
    setFormVisible(true);
  };

  const handleCreate = () => {
    setSelectedAppraisal(null);
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (id) => {
    submitMutation.mutate(id);
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const calculateStats = () => {
    const total = appraisals.length;
    const avgRating =
      total > 0
        ? (
            appraisals.reduce((sum, a) => sum + a.overallRating, 0) / total
          ).toFixed(1)
        : 0;

    const statusCounts = statusOptions.reduce((acc, status) => {
      acc[status.value] = appraisals.filter(
        (a) => a.status === status.value
      ).length;
      return acc;
    }, {});

    return { total, avgRating, statusCounts };
  };

  const { total, avgRating, statusCounts } = calculateStats();

  const columns = [
    {
      title: "Employee",
      dataIndex: ["user", "fullName"],
      key: "employee",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleViewDetails(record)}
          style={{ padding: 0 }}
        >
          {record.user?.firstName} {record.user?.lastName}
        </Button>
      ),
      width: 180,
      fixed: "left",
    },
    {
      title: "Designation",
      dataIndex: ["role", "name"],
      key: "role",
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 150,
    },
    {
      title: "Department",
      dataIndex: ["department", "name"],
      key: "department",
      render: (text) => <Tag color="purple">{text}</Tag>,
      width: 150,
    },
    {
      title: "Period",
      dataIndex: "month",
      key: "period",
      render: (month, record) => `${month} ${record.year}`,
      width: 120,
      sorter: (a, b) => {
        const monthOrder = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return (
          a.year - b.year ||
          monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
        );
      },
    },
    {
      title: "Rating",
      dataIndex: "overallRating",
      key: "rating",
      render: (rating) => (
        <Rate disabled value={rating} count={5} style={{ fontSize: 14 }} />
      ),
      width: 150,
      sorter: (a, b) => a.overallRating - b.overallRating,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Badge status={statusColors[status]} text={status} />,
      width: 120,
      filters: statusOptions.map((opt) => ({
        text: opt.label,
        value: opt.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Reviewer",
      dataIndex: ["reviewer", "fullName"],
      key: "reviewer",
      render: (_, record) =>
        record.reviewer
          ? `${record.reviewer.firstName} ${record.reviewer.lastName}`
          : "-",
      width: 150,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              type="text"
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>

          {record.status === "Draft" && (
            <>
              <Tooltip title="Edit">
                <Button
                  icon={<EditOutlined />}
                  type="text"
                  size="small"
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="Submit">
                <Button
                  icon={<CheckOutlined />}
                  type="text"
                  size="small"
                  onClick={() => handleSubmit(record._id)}
                  loading={
                    submitMutation.isPending &&
                    submitMutation.variables === record._id
                  }
                />
              </Tooltip>
            </>
          )}

          <Popconfirm
            title="Delete this appraisal?"
            description="This action cannot be undone"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                danger
                type="text"
                size="small"
                loading={
                  deleteMutation.isPending &&
                  deleteMutation.variables === record._id
                }
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="appraisal-list-container">
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        title={
          <div className="flex justify-between items-center">
            <Title level={4} style={{ margin: 0 }}>
              <span role="img" aria-label="appraisal">
                📊
              </span>{" "}
              Performance Appraisals
            </Title>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, visible: !prev.visible }))
                }
              >
                Filters
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                New Appraisal
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                onClick={handleExport}
                loading={exportMutation.isPending}
              >
                Export
              </Button>
            </Space>
          </div>
        }
      >
        {/* Filters Panel */}
        {filters.visible && (
          <Card
            size="small"
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: 12 }}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Select
                  placeholder="Select Status"
                  style={{ width: "100%" }}
                  allowClear
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                  options={statusOptions.map((opt) => ({
                    value: opt.value,
                    label: (
                      <span>
                        <Badge status={opt.color} /> {opt.label}
                      </span>
                    ),
                  }))}
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Select Year"
                  style={{ width: "100%" }}
                  value={filters.year}
                  onChange={(value) => handleFilterChange("year", value)}
                >
                  {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map(
                    (year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    )
                  )}
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Select Month"
                  style={{ width: "100%" }}
                  value={filters.month}
                  onChange={(value) => handleFilterChange("month", value)}
                  allowClear
                >
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month) => (
                    <Option key={month} value={month}>
                      {month}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Button
                  onClick={() =>
                    setFilters({
                      status: null,
                      year: dayjs().year(),
                      month: null,
                      visible: false,
                    })
                  }
                >
                  Reset Filters
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        {/* Stats Summary */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card size="small">
                <Statistic title="Total Appraisals" value={total} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Average Rating"
                  value={avgRating}
                  precision={1}
                  suffix="/ 5"
                />
              </Card>
            </Col>
            {statusOptions.map((status) => (
              <Col span={4} key={status.value}>
                <Card size="small">
                  <Statistic
                    title={status.label}
                    value={statusCounts[status.value]}
                    prefix={<Badge status={status.color} />}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Appraisals Table */}
        <div className="table-responsive">
          <Table
            size="middle"
            loading={isLoading}
            dataSource={appraisals}
            columns={columns}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) => `Total ${total} appraisals`,
            }}
            bordered
            scroll={{ x: 1500 }}
            style={{ marginTop: 16 }}
            locale={{
              emptyText: isError
                ? "Error loading appraisals"
                : "No appraisals found",
            }}
          />
        </div>
      </Card>

      {/* Modals */}
      <AppraisalForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        editData={selectedAppraisal}
      />

      <UserAppraisalModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        appraisal={selectedAppraisal}
      />
    </div>
  );
};

export default AppraisalList;
