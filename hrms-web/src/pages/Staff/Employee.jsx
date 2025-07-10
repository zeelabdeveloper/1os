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
  Tooltip,
  Pagination,
  Skeleton,
  message,
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
  FiDownload,
} from "react-icons/fi";
import { FaExclamationCircle } from "react-icons/fa";
import { fetchStaff, deleteStaff } from "../../api/auth";
import { debounce } from "lodash";
import { exportToExcel } from "../../utils/exportUtils";
import toast from "react-hot-toast";
import SystemDashboard from "../DashBoardForSystem/SystemDashboard";

// Custom skeleton components
const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <Skeleton active paragraph={{ rows: 1 }} key={i} className="my-2" />
    ))}
  </>
);

const CardSkeleton = () => (
  <Row gutter={[16, 16]}>
    {[...Array(8)].map((_, i) => (
      <Col xs={24} sm={12} md={8} lg={6} key={i}>
        <Card>
          <Skeleton active avatar paragraph={{ rows: 3 }} />
        </Card>
      </Col>
    ))}
  </Row>
);

export default function StaffListPage() {
  const [searchInput, setSearchInput] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [viewMode, setViewMode] = useState("table");
  const [isSearching, setIsSearching] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  // Fetch staff data
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["staff", pagination.current, pagination.pageSize, searchInput],
    queryFn: () =>
      fetchStaff({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchInput,
      }),
    keepPreviousData: true,
  });
  console.log(data);
  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      messageApi.success("Staff member deleted successfully");
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to delete staff"
      );
    },
  });

  // Update pagination when data changes
  useEffect(() => {
    if (data) {
      setPagination((prev) => ({
        ...prev,
        total: data.totalCount || 0,
      }));
    }
  }, [data]);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((value) => {
      setSearchInput(value);
      setPagination((prev) => ({ ...prev, current: 1 }));
      setIsSearching(false);
    }, 500)
  ).current;

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setIsSearching(true);
    debouncedSearch(value);
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
  // const handleDelete = async(id) => {

  //  await Modal.confirm({
  //     title: (
  //       <div className="flex items-center">
  //         <FaExclamationCircle className="text-red-500 mr-2" />
  //         <span>Delete Staff Member</span>
  //       </div>
  //     ),
  //     icon: null,
  //     content: (
  //       <div className="flex items-start">
  //         <FiTrash2 className="text-red-500 mr-2 mt-1" />
  //         <span>
  //           Are you sure you want to delete this staff member? This action
  //           cannot be undone.
  //         </span>
  //       </div>
  //     ),
  //     okText: "Delete",
  //     okType: "danger",
  //     okButtonProps: {
  //       icon: <FiTrash2 />,
  //       loading: deleteMutation.isLoading,
  //     },
  //     cancelText: "Cancel",
  //     width: 500,
  //     centered: true,
  //     onOk: () => deleteMutation.mutate(id),
  //   });
  // };

  const handleDelete = async (id) => {
    toast.custom((t) => (
      <div
        className={`bg-white border rounded-lg shadow-lg p-4 w-[400px] ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
      >
        <div className="flex items-start gap-3">
          <FaExclamationCircle className="text-red-500 mt-1 text-xl" />
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Delete Staff Member</p>
            <p className="text-sm text-gray-600 mt-1">
              Are you sure you want to delete this staff member? This action
              cannot be undone.
            </p>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-4 py-1 rounded-md text-gray-600 border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  deleteMutation.mutate(id);
                }}
                className="px-4 py-1 rounded-md bg-red-600 text-white flex items-center gap-1 hover:bg-red-700 transition"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  // Handle export to Excel
  const handleExport = () => {
    if (data?.data?.length) {
      const exportData = data.data.map((staff) => ({
        Name: `${staff.Profile?.firstName || ""} ${
          staff.Profile?.lastName || ""
        }`,
        Email: staff.email,
        Contact: staff.Profile?.contactNumber || "N/A",
        Status: staff.status,
        "Date of Joining": new Date(staff.dateOfJoining).toLocaleDateString(),
      }));

      exportToExcel(exportData, "staff_members");
      messageApi.success("Export started successfully");
    } else {
      messageApi.warning("No data to export");
    }
  };

  // Table columns
  const columns = [
    {
      title: "Staff Member",
      dataIndex: "Profile",
      key: "name",
      render: (profile, record) => (
        <div
          onClick={() =>
            (window.location.href = `/staff/employee?emp=${record._id}`)
          }
          className="flex gap-1 cursor-pointer items-center"
        >
          {console.log(record)}
          <Avatar src={profile?.photo} className="mr-3">
            {record?.firstName?.charAt(0)}
            {record?.lastName?.charAt(0)}
          </Avatar>
          <div>
            <div className="font-medium">
              {record?.firstName} {record?.lastName}
            </div>
            <div className="text-gray-500 text-sm">{record?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "Profile",
      key: "contact",
      render: (profile, record) => (
        <div className="flex items-center">
          <FiPhone className="mr-2 text-gray-500" />
          {record?.contactNumber || "-"}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Coco",
      dataIndex: "isCocoEmployee",
      key: "isCocoEmployee",
      render: (status) => (
        <Tag color={status ? "blue" : "green"}>{status ? "Coco" : "Staff"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
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
              loading={
                deleteMutation.isLoading &&
                deleteMutation.variables === record._id
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container h-[92vh] overflow-y-auto mx-auto p-4">
      {contextHolder}

      <SystemDashboard />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <FiUser className="mr-2" /> Staff Management
        </h1>

        <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto gap-3">
          <div className="flex items-center gap-2 w-full md:w-auto">
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

            <Button
              icon={<FiDownload />}
              onClick={handleExport}
              disabled={!data?.data?.length}
            >
              Export
            </Button>
          </div>

          <Input
            placeholder="Search staff..."
            prefix={<FiSearch className="text-gray-400" />}
            onChange={handleSearchChange}
            allowClear
            className="w-full md:w-64"
            loading={isSearching}
          />
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          Failed to load staff: {error.message}
        </div>
      )}

      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="_id"
            loading={isLoading || isFetching}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Total ${total} staff members`,
            }}
            onChange={({ current, pageSize }) =>
              handlePaginationChange(current, pageSize)
            }
            locale={{
              emptyText:
                isLoading || isFetching ? (
                  <TableSkeleton />
                ) : (
                  "No staff members found"
                ),
            }}
          />
        </div>
      ) : (
        <>
          {isLoading || isFetching ? (
            <CardSkeleton />
          ) : (
            <>
              <Row gutter={[16, 16]} className="mb-4">
                {Array.isArray(data?.data) &&
                  data?.data?.map((staff) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={staff._id}>
                      <Card
                        hoverable
                        actions={[
                          <Tooltip title="View Details">
                            <FiUser
                              onClick={() => handleViewDetails(staff)}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer"
                            />
                          </Tooltip>,
                          <Tooltip title="Delete">
                            <FiTrash2
                              onClick={() => handleDelete(staff._id)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
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
                            {staff?.firstName}
                            {staff?.lastName}
                          </Avatar>
                          <h3 className="font-semibold text-lg">
                            {staff?.firstName} {staff?.lastName}
                          </h3>
                          <div className="flex items-center text-gray-500 mt-1">
                            <FiMail className="mr-1" />
                            <span className="text-sm truncate w-full">
                              {staff.email}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500 mt-1">
                            <FiPhone className="mr-1" />
                            <span className="text-sm">
                              {staff?.contactNumber || "N/A"}
                            </span>
                          </div>
                          <Tag
                            color={staff.status ? "green" : "red"}
                            className="mt-2"
                          >
                            {staff?.status ? "Active" : "Inactive"}
                          </Tag>
                          <Tag
                            color={staff.isCocoEmployee ? "green" : "blue"}
                            className="!mt-2"
                          >
                            {staff?.isCocoEmployee ? "Coco" : "Staff"}
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
                  pageSizeOptions={["10", "50", "100"]}
                  onChange={handlePaginationChange}
                  onShowSizeChange={handlePaginationChange}
                  showTotal={(total) => `Total ${total} staff members`}
                  disabled={isLoading || isFetching}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Detailed View Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <FiUser className="mr-2" />
            <span>Staff Details</span>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width={800}
        centered
      >
        {selectedStaff ? (
          <div className="mt-6">
            <div className="flex gap-2 items-center mb-6">
              <Avatar
                size={64}
                src={selectedStaff.Profile?.photo}
                className="mr-4"
              >
                {selectedStaff?.firstName}
                {selectedStaff?.lastName}
              </Avatar>
              <div>
                <h2 className="text-xl my-3 font-bold">
                  {selectedStaff?.firstName} {selectedStaff?.lastName}
                </h2>
                <Tag color={selectedStaff.status ? "green" : "red"}>
                  {selectedStaff?.status ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>

            <Divider orientation="left" className="mt-0">
              <FiUser className="mr-2" /> Basic Information
            </Divider>
            <Descriptions column={2} bordered>
              <Descriptions.Item
                label={
                  <span className="flex items-center">
                    <FiMail className="mr-1" /> Email
                  </span>
                }
              >
                {selectedStaff.email || "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center">
                    <FiPhone className="mr-1" /> Contact
                  </span>
                }
              >
                {selectedStaff?.contactNumber || "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center">
                    <FiCalendar className="mr-1" /> Date of Birth
                  </span>
                }
              >
                {selectedStaff?.Profile?.dateOfBirth
                  ? new Date(
                      selectedStaff.Profile.dateOfBirth
                    ).toLocaleDateString()
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span className="flex items-center">
                    <FiUser className="mr-1" /> Gender
                  </span>
                }
              >
                {selectedStaff?.Profile?.gender || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" className="mt-4">
              <FiMapPin className="mr-2" /> Address
            </Divider>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Address">
                {selectedStaff.Profile?.address || "-"},{" "}
                {selectedStaff.Profile?.district || "-"},{" "}
                {selectedStaff.Profile?.state || "-"},{" "}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <Skeleton active paragraph={{ rows: 6 }} />
        )}
      </Modal>
    </div>
  );
}
