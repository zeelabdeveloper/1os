import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Popconfirm,
  Modal,
  Card,
  Row,
  Col,
  message,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJobs, deleteJob } from "../../api/jobs";
import JobDetails from "../../components/JobDetails";
import JobForm from "../../components/JobForm";
import JobStatsDashboard from "./JobState";

const { Search } = Input;

const JobsTable = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionType, setActionType] = useState("create");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const queryClient = useQueryClient();

  // Fetch jobs with TanStack Query
  const { data: jobsData = {}, isLoading } = useQuery({
    queryKey: ["jobs", pagination.current, searchText],
    queryFn: () =>
      fetchJobs({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
      }),
    keepPreviousData: true,
  });

  const jobs = jobsData.data || [];
  const totalJobs = jobsData.total || 0;
console.log(jobs)
  // Delete mutation
  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      message.success("Job deleted successfully");
      queryClient.invalidateQueries(["jobs"]);
    },
    onError: () => message.error("Failed to delete job"),
  });

  const handleTableChange = (pagination) => {
    setPagination({
      ...pagination,
      current: pagination.current,
    });
  };

  const onSearch = (value) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      current: 1, // Reset to first page when searching
    });
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      sorter: (a, b) => a.location.localeCompare(b.location),
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      render: (exp) => <Tag color="blue">{exp}</Tag>,
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      render: (skills) => (
        <div style={{ maxWidth: 200 }}>
          {skills.map((skill) => (
            <Tag key={skill} style={{ marginBottom: 4 }}>
              {skill}
            </Tag>
          ))}
        </div>
      ),
    },


   {
  title: "Status",
  dataIndex: "isActive",
  key: "isActive",
  render: (isActive) => (
    <Tag color={isActive ? "green" : "red"}>
      {isActive ? "Active" : "Inactive"}
    </Tag>
  ),
  filters: [
    { text: 'Active', value: true },
    { text: 'Inactive', value: false },
  ],
  onFilter: (value, record) => record.isActive === value,
},
     
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedJob(record);
              setIsDetailsModalVisible(true);
            }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedJob(record);
              setActionType("edit");
              setIsModalVisible(true);
            }}
          />
          <Popconfirm
            title="Are you sure to delete this job?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 h-[92vh] overflow-y-auto ">
      <Card
        title="Job Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              window.location.href = "/recruitment/create";
            }}
          >
            Add Job
          </Button>
        }
      >
        <JobStatsDashboard />

        <Row gutter={[16, 16]} className="mb-4">
          <Col span={24} md={12}>
            <Search
              placeholder="Search jobs by title, location or skills"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={onSearch}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: true }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalJobs,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} jobs`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Job Form Modal */}
      <Modal
        title={actionType === "create" ? "Create New Job" : "Edit Job"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <JobForm
          jobData={selectedJob}
          onSuccess={() => {
            setIsModalVisible(false);
            queryClient.invalidateQueries(["jobs"]);
          }}
        />
      </Modal>

      {/* Job Details Modal */}
      <Modal
        title="Job Details"
        visible={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={700}
      >
        <JobDetails job={selectedJob} />
      </Modal>
    </div>
  );
};

export default JobsTable;
