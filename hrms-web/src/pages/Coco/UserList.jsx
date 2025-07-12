// import React, { useState } from "react";
// import {
//   Card,
//   Row,
//   Col,
//   Table,
//   Select,
//   Button,
//   Typography,
//   Avatar,
//   Tag,
//   Space,
//   Grid,
//   DatePicker,
//   Input,
//   Statistic,
//   Empty,
//   Progress,
// } from "antd";

// import { useQuery } from "@tanstack/react-query";
// import axios from "../../axiosConfig";
// import toast from "react-hot-toast";
// import { fetchBranches } from "../../api/auth";
// import moment from "moment";

// const { Title, Text } = Typography;
// const { Option } = Select;
// const { useBreakpoint } = Grid;
// const { RangePicker } = DatePicker;
// const { Countdown } = Statistic;

// const EmployeeDashboard = ({ branchId }) => {
//   const [filters, setFilters] = useState({
//     status: "all",
//     search: "",
//   });
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 10,
//   });

//   const { data: dashboardData, isLoading } = useQuery({
//     queryKey: ["employees", branchId, filters, pagination],
//     queryFn: async () => {
//       if (!branchId) return null;

//       const params = {
//         page: pagination.current,
//         limit: pagination.pageSize,
//         status: filters.status === "all" ? undefined : filters.status,
//         search: filters.search || undefined,
//       };

//       const response = await axios.get(
//         `/api/v1/company/branch/analytics/${branchId}`,
//         { params }
//       );
//       return response.data.data;
//     },
//   });
// console.log(dashboardData)
//   const columns = [
//     {
//       title: "Employee",
//       dataIndex: "firstName",
//       key: "name",
//       render: (_, record) => (
//         <Space>
//           <Avatar src={record.Profile?.avatar}>
//             {record.firstName?.charAt(0)}
//             {record.lastName?.charAt(0)}
//           </Avatar>
//           <div>
//             <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
//             <br />
//             <Text type="secondary">{record.EmployeeId?.employeeId}</Text>
//           </div>
//         </Space>
//       ),
//     },
//     {
//       title: "Department",
//       dataIndex: ["Organization", "department", "name"],
//       key: "department",
//     },
//     {
//       title: "Role",
//       dataIndex: ["Organization", "role", "name"],
//       key: "role",
//     },
//     {
//       title: "Status",
//       dataIndex: "isActive",
//       key: "status",
//       render: (isActive) => (
//         <Tag color={isActive ? "green" : "red"}>
//           {isActive ? "ACTIVE" : "INACTIVE"}
//         </Tag>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 24 }}>
//       <Card title="Branch Employees">
//         <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
//           <Col xs={24} md={8}>
//             <Select
//               style={{ width: "100%" }}
//               placeholder="Filter by Status"
//               onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
//               value={filters.status}
//               disabled={!branchId}
//             >
//               <Option value="all">All Employees</Option>
//               <Option value="true">Active Only</Option>
//               <Option value="false">Inactive Only</Option>
//             </Select>
//           </Col>
//           <Col xs={24} md={8}>
//             <Input.Search
//               placeholder="Search by name or ID"
//               allowClear
//               onSearch={(value) =>
//                 setFilters((prev) => ({ ...prev, search: value }))
//               }
//               disabled={!branchId}
//             />
//           </Col>
//         </Row>

//         {branchId ? (
//           <Table
//             columns={columns}
//             dataSource={dashboardData?.employees || []}
//             rowKey="_id"
//             loading={isLoading}
//             pagination={{
//               current: pagination.current,
//               pageSize: pagination.pageSize,
//               total: dashboardData?.pagination?.total || 0,
//               showSizeChanger: true,
//               onChange: (page, pageSize) => {
//                 setPagination({ current: page, pageSize });
//               },
//             }}
//           />
//         ) : (
//           <Empty description="No branch selected" />
//         )}
//       </Card>
//     </div>
//   );
// };

// export default EmployeeDashboard;



import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Select,
  Typography,
  Avatar,
  Tag,
  Space,
  Input,
  Empty,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import axios from "../../axiosConfig";

const { Text } = Typography;
const { Option } = Select;

const EmployeeDashboard = ({ branchId }) => {
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["employees", branchId, filters, pagination],
    queryFn: async () => {
      if (!branchId) return null;

      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status === "all" ? undefined : filters.status,
        search: filters.search || undefined,
      };

      const response = await axios.get(
        `/api/v1/company/branch/analytics/${branchId}`,
        { params }
      );
      return response.data.data;
    },
    keepPreviousData: true,  
  });

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "firstName",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar src={record.Profile?.avatar}>
            {record.firstName?.charAt(0)}
            {record.lastName?.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{`${record.firstName} ${record.lastName}`}</Text>
            <br />
            <Text type="secondary">{record.EmployeeId?.employeeId}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: ["Organization", "department"],
      key: "department",
      render: (department) => department || "-",
    },
    {
      title: "Role",
      dataIndex: ["Organization", "role"],
      key: "role",
      render: (role) => role || "-",
    },
    {
      title: "Branch",
      dataIndex: ["Organization", "branch"],
      key: "branch",
      render: (branch) => branch || "-",
    },
    {
      title: "Zone",
      dataIndex: ["Organization", "zone"],
      key: "zone",
      render: (zone) => zone || "-",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Branch Employees">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by Status"
              onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
              value={filters.status}
              disabled={!branchId}
            >
              <Option value="all">All Employees</Option>
              <Option value="true">Active Only</Option>
              <Option value="false">Inactive Only</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Search by name or ID"
              allowClear
              onSearch={(value) =>
                setFilters((prev) => ({ ...prev, search: value }))
              }
              disabled={!branchId}
            />
          </Col>
        </Row>

        {branchId ? (
          <Table
            columns={columns}
            dataSource={dashboardData?.employees || []}
            rowKey="_id"
            loading={isLoading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: dashboardData?.pagination?.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} employees`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: isError ? "Error loading data" : "No employees found",
            }}
          />
        ) : (
          <Empty description="No branch selected" />
        )}
      </Card>
    </div>
  );
};

export default EmployeeDashboard;