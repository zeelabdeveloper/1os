import React, { useState } from "react";
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
} from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { CSVLink } from "react-csv";
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
  // State management
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

  // Mock data generator
  const generateMockData = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      key: i + 1,
      srNo: i + 1,
      name: `User ${i + 1}`,
      userId: `UID${1000 + i}`,
      mobileNo: `98765${Math.floor(10000 + Math.random() * 90000)}`,
      store: `Store ${Math.floor(1 + Math.random() * 5)}`,
      manager: `Manager ${Math.floor(1 + Math.random() * 3)}`,
      loginTime: moment()
        .subtract(Math.floor(Math.random() * 10), "days")
        .set({
          hour: 9 + Math.floor(Math.random() * 2),
          minute: Math.floor(Math.random() * 60),
        })
        .format("YYYY-MM-DD HH:mm:ss"),
      logoutTime: moment()
        .subtract(Math.floor(Math.random() * 10), "days")
        .set({
          hour: 18 + Math.floor(Math.random() * 2),
          minute: Math.floor(Math.random() * 60),
        })
        .format("YYYY-MM-DD HH:mm:ss"),
      loginPhoto: `https://randomuser.me/api/portraits/${
        Math.random() > 0.5 ? "men" : "women"
      }/${Math.floor(Math.random() * 50)}.jpg`,
      logoutPhoto: `https://randomuser.me/api/portraits/${
        Math.random() > 0.5 ? "men" : "women"
      }/${Math.floor(Math.random() * 50)}.jpg`,
      hours: `${Math.floor(8 + Math.random() * 2)}h ${Math.floor(
        Math.random() * 60
      )}m`,
      status: ["approved", "pending", "rejected"][
        Math.floor(Math.random() * 3)
      ],
      report: ["On Time", "Late", "Early Leave"][Math.floor(Math.random() * 3)],
    }));
  };

  const attendanceData = generateMockData(50);

  // Filter data based on current filters
  const filteredData = attendanceData.filter((record) => {
    const matchesDate =
      filters.dateRange.length === 0 ||
      (moment(record.loginTime).isSameOrAfter(filters.dateRange[0]) &&
        moment(record.loginTime).isSameOrBefore(filters.dateRange[1]));

    const matchesStatus = !filters.status || record.status === filters.status;

    const matchesSearch =
      !filters.searchText ||
      Object.keys(record).some(
        (key) =>
          typeof record[key] === "string" &&
          record[key].toLowerCase().includes(filters.searchText.toLowerCase())
      );

    return matchesDate && matchesStatus && matchesSearch;
  });

  // Columns configuration
  const columns = [
    {
      title: "Sr. No",
      dataIndex: "srNo",
      key: "srNo",
      width: 80,

      sorter: (a, b) => a.srNo - b.srNo,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,

      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      fixed: "left",
      width: 120,
    },
    {
      title: "Mobile No",
      dataIndex: "mobileNo",
      key: "mobileNo",
      width: 150,
    },
    {
      title: "Store",
      dataIndex: "store",
      key: "store",
      width: 120,
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      width: 150,
    },
    {
      title: "Login Time",
      dataIndex: "loginTime",
      key: "loginTime",
      width: 200,
      sorter: (a, b) => moment(a.loginTime).unix() - moment(b.loginTime).unix(),
      render: (time, record) => (
        <TimeWithPhoto
          time={time}
          photo={record.loginPhoto}
          type="login"
          onPhotoClick={showPhotoModal}
        />
      ),
    },
    {
      title: "Logout Time",
      dataIndex: "logoutTime",
      key: "logoutTime",
      width: 200,
      sorter: (a, b) =>
        moment(a.logoutTime).unix() - moment(b.logoutTime).unix(),
      render: (time, record) => (
        <TimeWithPhoto
          time={time}
          photo={record.logoutPhoto}
          type="logout"
          onPhotoClick={showPhotoModal}
        />
      ),
    },
    {
      title: "Hours",
      dataIndex: "hours",
      key: "hours",
      width: 120,
      sorter: (a, b) => {
        const [ah, am] = a.hours.split(" ").map((part) => parseInt(part));
        const [bh, bm] = b.hours.split(" ").map((part) => parseInt(part));
        return ah * 60 + am - (bh * 60 + bm);
      },
    },
    {
      title: "Report",
      dataIndex: "report",
      key: "report",
      width: 150,
      render: (report) => <ReportTag report={report} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      fixed: "right",
      render: (status) => <StatusTag status={status} />,
    },
  ];

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
  };

  const handleStatusFilterChange = (value) => {
    setFilters({
      ...filters,
      status: value,
    });
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: [],
      status: null,
      searchText: "",
    });
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  return (
    <div style={{ padding: 24, height: "92vh", overflowY: "auto" }}>
      <Card
        title="Attendance Records"
        extra={
          <Space className={"hidden"}>
            <Input.Search
              placeholder="Search records..."
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
            <CSVLink
              data={filteredData}
              filename={`attendance_${moment().format("YYYYMMDD")}.csv`}
            >
              <Button type="primary" icon={<DownloadOutlined />}>
                Export
              </Button>
            </CSVLink>
          </Space>
        }
      >
        <Space className="  flex justify-end w-full">
          <AttendanceApprovalPopup />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          scroll={{ x: 1500 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} records`,
          }}
          onChange={handleTableChange}
          rowClassName={(record) => `row-status-${record.status}`}
        />
      </Card>

      {/* Photo Modal */}
      <Modal
        title={`${modalState.photoType === "login" ? "Login" : "Logout"} Photo`}
        visible={modalState.isPhotoModalVisible}
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
