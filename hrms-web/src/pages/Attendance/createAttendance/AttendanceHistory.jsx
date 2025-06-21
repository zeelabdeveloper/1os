// src/components/AttendanceHistory.jsx
import React, { useState } from 'react';
import { Table, DatePicker, Card, Typography, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const AttendanceHistory = ({ user }) => {
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendanceHistory', user._id, dateRange],
    queryFn: async () => {
      const response = await axios.get(
        `/api/v1/attendance/history?userId=${user._id}&startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`
      );
      return response.data;
    },
  });

 const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    render: (date) => dayjs(date).format('MMM D, YYYY'),
    sorter: (a, b) => new Date(a.date) - new Date(b.date),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      let color = '';
      switch (status) {
        case 'present': color = 'green'; break;
        case 'absent': color = 'red'; break;
        case 'leave': color = 'orange'; break;
        case 'half-day': color = 'blue'; break;
        default: color = 'gray';
      }
      return <span style={{ color }}>{status.toUpperCase()}</span>;
    },
    filters: [
      { text: 'Present', value: 'present' },
      { text: 'Absent', value: 'absent' },
      { text: 'Leave', value: 'leave' },
      { text: 'Half Day', value: 'half-day' },
    ],
    onFilter: (value, record) => record.status === value,
  },
  {
    title: 'Check In',
    dataIndex: 'checkInTime',
    key: 'checkInTime',
    render: (time) => time ? dayjs(time).format('h:mm A') : '--',
  },
  {
    title: 'Check Out',
    dataIndex: 'checkOutTime',
    key: 'checkOutTime',
    render: (time) => time ? dayjs(time).format('h:mm A') : '--',
  },
  {
    title: 'Hours',
    dataIndex: 'hoursWorked',
    key: 'hoursWorked',
    render: (hours) => hours ? `${hours.toFixed(2)}h` : '--',
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    render: (_, record) =>
      record.status === 'present' || record.status === 'half-day'
        ? record.location || '--'
        : '--',
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks',
    key: 'remarks',
    render: (text) => text || '--',
  },
  {
    title: 'Approved',
    dataIndex: 'isApproved',
    key: 'isApproved',
    render: (val) => (
      <span style={{ color: val ? 'green' : 'red' }}>
        {val ? 'Approved' : 'Pending'}
      </span>
    ),
    filters: [
      { text: 'Approved', value: true },
      { text: 'Pending', value: false },
    ],
    onFilter: (value, record) => record.isApproved === value,
  },
];


  const handleDateChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  return (
    <div>
      <Title level={3}>Attendance History</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space size="large" align="center">
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            style={{ width: 300 }}
          />
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={attendanceData}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} records`,
        }}
      />
    </div>
  );
};

export default AttendanceHistory;
