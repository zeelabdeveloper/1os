import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Input,
  Button,
  Modal,
  Tag,
  Avatar,
  Space,
   
  Card,
  Divider,
  Descriptions,
  Row,
  Col,
  Switch,
  Tooltip,
  Pagination,
} from "antd";
import {
  FiSearch,
  FiTrash2,
  FiUser,
  FiPhone,
  FiMail,
  
  FiCalendar,
  FiMapPin,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { FaExclamationCircle } from "react-icons/fa";
import { fetchStaff, deleteStaff } from "../../api/auth";

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function StaffListPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchText = useDebounce(searchInput, 500);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  const queryClient = useQueryClient();

  // Fetch staff data
  const { data, isLoading } = useQuery({
    queryKey: [
      "staff",
      pagination.current,
      pagination.pageSize,
      debouncedSearchText,
    ],
    queryFn: () =>
      fetchStaff({
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchText,
      }),
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
    },
  });

  // Update pagination
  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data.totalCount || 0,
      }));
    }
  }, [data]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize: pageSize,
    });
  };

  // Handle view details
  const handleViewDetails = (staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    Modal.confirm({
      title: (
        <div className="flex items-center">
          <FaExclamationCircle className="text-red-500 mr-2" />
          <span>Delete Staff Member</span>
        </div>
      ),
      icon: null, // Remove the default icon since we're using our own
      content: (
        <div className="flex items-start">
          <FiTrash2 className="text-red-500 mr-2 mt-1" />
          <span>
            Are you sure you want to delete this staff member? This action
            cannot be undone.
          </span>
        </div>
      ),
      okText: "Delete",
      okType: "danger",
      okButtonProps: {
        icon: <FiTrash2 />,
      },
      cancelText: "Cancel",
      width: 500,
      centered: true,
      onOk: () => deleteMutation.mutate(id),
    });
  };

  // Table columns
  const columns = [
    {
      title: "Staff Member",
      dataIndex: "Profile",
      key: "name",
      render: (profile, record) => (
        <div className="flex items-center">
          <Avatar src={profile?.photo} className="mr-3">
            {profile?.firstName?.charAt(0)}
            {profile?.lastName?.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium">
              {profile?.firstName} {profile?.lastName}
            </div>
            <div className="text-gray-500 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "Profile",
      key: "contact",
      render: (profile) => (
        <div className="flex items-center">
          <FiPhone className="mr-2 text-gray-500" />
          {profile?.contactNumber || "-"}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<FiUser />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<FiTrash2 />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <FiUser className="mr-2" /> Staff Management
        </h1>
        <div className="flex items-center">
          <Button.Group>
            <Button
              icon={<FiGrid />}
              type={viewMode === "grid" ? "primary" : "default"}
              onClick={() => setViewMode("grid")}
            />
            <Button
              icon={<FiList />}
              type={viewMode === "table" ? "primary" : "default"}
              onClick={() => setViewMode("table")}
            />
          </Button.Group>

          <Input
            placeholder="Search staff..."
            prefix={<FiSearch className="text-gray-400" />}
            value={searchInput}
            onChange={handleSearchChange}
            allowClear
            className="w-full md:w-64"
          />
        </div>
      </div>

      {viewMode === "table" ? (
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Total ${total} staff members`,
          }}
          onChange={({ current, pageSize }) =>
            handlePaginationChange(current, pageSize)
          }
        />
      ) : (
        <>
          <Row gutter={[16, 16]} className="mb-4">
            {data?.data?.map((staff) => (
              <Col xs={24} sm={12} md={8} lg={6} key={staff._id}>
                <Card
                  hoverable
                  actions={[
                    <Tooltip title="View Details">
                      <FiUser onClick={() => handleViewDetails(staff)} />
                    </Tooltip>,
                    <Tooltip title="Delete">
                      <FiTrash2
                        onClick={() => handleDelete(staff._id)}
                        className="text-red-500"
                      />
                    </Tooltip>,
                  ]}
                >
                  <div className="flex flex-col items-center text-center">
                    <Avatar
                      size={64}
                      src={staff.Profile?.photo}
                      className="mb-3"
                    >
                      {staff.Profile?.firstName?.charAt(0)}
                      {staff.Profile?.lastName?.charAt(0)}
                    </Avatar>
                    <h3 className="font-semibold text-lg">
                      {staff.Profile?.firstName} {staff.Profile?.lastName}
                    </h3>
                    <div className="flex items-center text-gray-500 mt-1">
                      <FiMail className="mr-1" />
                      <span className="text-sm">{staff.email}</span>
                    </div>
                    <div className="flex items-center text-gray-500 mt-1">
                      <FiPhone className="mr-1" />
                      <span className="text-sm">
                        {staff.Profile?.contactNumber || "N/A"}
                      </span>
                    </div>
                    <Tag
                      color={staff.status === "active" ? "green" : "red"}
                      className="mt-2"
                    >
                      {staff?.status?.toUpperCase()}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="flex justify-end mt-4">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              pageSizeOptions={["10", "20", "50"]}
              onChange={handlePaginationChange}
              onShowSizeChange={handlePaginationChange}
              showTotal={(total) => `Total ${total} staff members`}
            />
          </div>
        </>
      )}

      {/* Detailed View Modal */}
      <Modal
        title={
          <>
            <FiUser className="mr-2" /> Staff Details
          </>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedStaff && (
          <div className="mt-6">
            <div className="flex items-center mb-6">
              <Avatar
                size={64}
                src={selectedStaff.Profile?.photo}
                className="mr-4"
              >
                {selectedStaff.Profile?.firstName?.charAt(0)}
                {selectedStaff.Profile?.lastName?.charAt(0)}
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {selectedStaff.Profile?.firstName}{" "}
                  {selectedStaff.Profile?.lastName}
                </h2>
                <Tag
                  color={selectedStaff.status === "active" ? "green" : "red"}
                >
                  {selectedStaff?.status?.toUpperCase()}
                </Tag>
              </div>
            </div>

            <Divider orientation="left" className="mt-0">
              <FiUser className="mr-2" /> Basic Information
            </Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item
                label={
                  <>
                    <FiMail className="mr-1" /> Email
                  </>
                }
              >
                {selectedStaff.email}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <FiPhone className="mr-1" /> Contact
                  </>
                }
              >
                {selectedStaff.Profile?.contactNumber || "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <FiCalendar className="mr-1" /> Date of Birth
                  </>
                }
              >
                {selectedStaff.Profile?.dateOfBirth || "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <FiUser className="mr-1" /> Gender
                  </>
                }
              >
                {selectedStaff.Profile?.gender || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" className="mt-4">
              <FiMapPin className="mr-2" /> Address
            </Divider>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Address">
                {selectedStaff.Profile?.address?.street || "-"},{" "}
                {selectedStaff.Profile?.address?.city || "-"},{" "}
                {selectedStaff.Profile?.address?.state || "-"},{" "}
                {selectedStaff.Profile?.address?.country || "-"},{" "}
                {selectedStaff.Profile?.address?.postalCode || "-"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
