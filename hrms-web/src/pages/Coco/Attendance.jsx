import React, { useState, useMemo } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Input,
  DatePicker,
  Select,
  Image,
  Modal,
  Spin,
  Badge,
} from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  CameraOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { CSVLink } from "react-csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import AttendanceApprovalPopup from "../../components/modals/AttendanceApprovalPopup";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Reusable components
const StatusTag = ({ status }) => {
  const statusColors = {
    approved: "green",
    pending: "orange",
    rejected: "red",
  };
  return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
};

const ReportTag = ({ report }) => {
  const reportColors = {
    "On Time": "green",
    Late: "orange",
    "Early Leave": "red",
  };
  return <Tag color={reportColors[report]}>{report}</Tag>;
};

const TimeWithPhoto = ({ time, photo, type, onPhotoClick }) => (
  <Space>
    <span>{time ? moment(time).format("DD-MM-YYYY HH:mm") : "-"}</span>
    {time && photo && (
      <Button
        type="link"
        icon={<CameraOutlined />}
        onClick={() => onPhotoClick(photo, type)}
      />
    )}
  </Space>
);

// Main component
const Attendance = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    dateRange: [],
    status: null,
    searchText: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [modalState, setModalState] = useState({
    isPhotoModalVisible: false,
    photoPreview: "",
    photoType: "",
  });
  const [exportData, setExportData] = useState([]);

  // Fetch attendance data with TanStack Query
  const {
    data: attendanceData,
    isLoading,

    isFetching,
  } = useQuery({
    queryKey: [
      "attendancelist",
      {
        page: pagination.current,
        limit: pagination.pageSize,
        startDate: filters.dateRange[0]?.format("YYYY-MM-DD"),
        endDate: filters.dateRange[1]?.format("YYYY-MM-DD"),
        status: filters.status,
        search: filters.searchText,
      },
    ],
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey;
      const response = await axios.get(
        "/api/v1/attendance/getAttendanceRecords",
        {
          params: {
            page: params.page,
            limit: params.pageSize,
            status: params.status,
            startDate: params.startDate,
            endDate: params.endDate,
            search: params.search,
          },
        }
      );
      return response.data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
console.log(attendanceData)
  // Export data handler
  const handleExport = async () => {
    try {
      const params = {
        startDate: filters.dateRange[0]?.format("YYYY-MM-DD"),
        endDate: filters.dateRange[1]?.format("YYYY-MM-DD"),
        status: filters.status,
      };

      const { data } = await axios.get("/api/attendance", {
        params: { ...params, limit: 1000 },
      });
      setExportData(data.data);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // Event handlers
  const showPhotoModal = (photo, type) => {
    setModalState({
      isPhotoModalVisible: true,
      photoPreview: photo,
      photoType: type,
    });
  };

  const closePhotoModal = () => {
    setModalState({
      ...modalState,
      isPhotoModalVisible: false,
    });
  };

  const handleSearch = (value) => {
    setFilters({
      ...filters,
      searchText: value,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      dateRange: dates,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleStatusFilterChange = (value) => {
    setFilters({
      ...filters,
      status: value,
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: [],
      status: null,
      searchText: "",
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // Columns configuration
  const columns = useMemo(
    () => [
      {
        title: "Sr. No",
        dataIndex: "srNo",
        key: "srNo",
        width: 80,
        render: (_, __, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: "Name",
        dataIndex: ["userId", "fullName"],
        key: "name",
        width: 150,
        sorter: (a, b) => a.userId.fullName.localeCompare(b.userId.fullName),
      },
      {
        title: "Employee ID",
        dataIndex: ["userId", "EmployeeId" , "employeeId"   ],
        key: "employeeId",
        fixed: "left",
        width: 120,
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 120,
        render: (date) => moment(date).format("DD-MM-YYYY"),
        sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      },
      {
        title: "Check In",
        dataIndex: "checkInTime",
        key: "checkInTime",
        width: 150,
        render: (time, record) => (
          <TimeWithPhoto
            time={time}
            photo={record.checkInPhoto}
            type="checkIn"
            onPhotoClick={showPhotoModal}
          />
        ),
        sorter: (a, b) =>
          moment(a.checkInTime || 0).unix() - moment(b.checkInTime || 0).unix(),
      },
      {
        title: "Check Out",
        dataIndex: "checkOutTime",
        key: "checkOutTime",
        width: 150,
        render: (time, record) => (
          <TimeWithPhoto
            time={time}
            photo={record.checkOutPhoto}
            type="checkOut"
            onPhotoClick={showPhotoModal}
          />
        ),
        sorter: (a, b) =>
          moment(a.checkOutTime || 0).unix() -
          moment(b.checkOutTime || 0).unix(),
      },
      {
        title: "Hours",
        dataIndex: "hoursWorked",
        key: "hoursWorked",
        width: 120,
        render: (hours) =>
          hours
            ? `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`
            : "-",
        sorter: (a, b) => (a.hoursWorked || 0) - (b.hoursWorked || 0),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        fixed: "right",
        render: (status) => <StatusTag status={status} />,
      },
    ],
    [pagination.current, pagination.pageSize]
  );

  return (
    <div style={{ padding: 24, height: "92vh", overflowY: "auto" }}>
      <Card
        title="Attendance Records"
        extra={
          <Space>
            <Input.Search
              placeholder="Search employees..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              style={{ width: 250 }}
              onSearch={handleSearch}
              onChange={(e) =>
                setFilters({ ...filters, searchText: e.target.value })
              }
              value={filters.searchText}
            />
            <RangePicker
              style={{ width: 250 }}
              onChange={handleDateRangeChange}
              value={filters.dateRange}
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              onChange={handleStatusFilterChange}
              value={filters.status}
              allowClear
            >
              <Option value="approved">Approved</Option>
              <Option value="pending">Pending</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
            <Button
              icon={<SyncOutlined />}
              onClick={handleResetFilters}
              disabled={
                !filters.dateRange.length &&
                !filters.status &&
                !filters.searchText
              }
            >
              Reset
            </Button>
            <CSVLink
              data={exportData}
              filename={`attendance_${moment().format("YYYYMMDD")}.csv`}
              asyncOnClick
              onClick={handleExport}
            >
              <Button type="primary" icon={<DownloadOutlined />}>
                Export
              </Button>
            </CSVLink>
          </Space>
        }
      >
        <Space className="flex justify-end w-full mb-4">
      
            <AttendanceApprovalPopup />
          
        </Space>

        <Spin spinning={isLoading || isFetching}>
          <Table
            columns={columns}
            dataSource={attendanceData?.data || []}
            scroll={{ x: 1500 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: attendanceData?.pagination?.total || 0,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} records`,
            }}
            onChange={handleTableChange}
            rowKey="_id"
            rowClassName={(record) => `row-status-${record.status}`}
          />
        </Spin>
      </Card>

      {/* Photo Modal */}
      <Modal
        title={`${
          modalState.photoType === "checkIn" ? "Check-In" : "Check-Out"
        } Photo`}
        open={modalState.isPhotoModalVisible}
        footer={null}
        onCancel={closePhotoModal}
      >
        <Image
          width="100%"
          src={modalState.photoPreview}
          alt={`${modalState.photoType} photo`}
        />
      </Modal>
    </div>
  );
};

export default Attendance;
