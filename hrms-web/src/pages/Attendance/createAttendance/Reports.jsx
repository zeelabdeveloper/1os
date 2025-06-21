// src/components/Reports.jsx
import React, { useState } from 'react';
import { Card, Typography, DatePicker, Table, Progress, Row, Col, Statistic } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const Reports = ({ user }) => {
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['attendanceReport', user._id, dateRange],
    queryFn: async () => {
      const response = await axios.get(`/api/v1/attendance/report?userId=${user._id}&startDate=${dateRange[0].toISOString()}&endDate=${dateRange[1].toISOString()}`);
      return response.data;
    },
  });

  const handleDateChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  const columns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: (month) => dayjs(month).format('MMMM YYYY'),
    },
    {
      title: 'Present',
      dataIndex: 'present',
      key: 'present',
      render: (present) => `${present} days`,
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      key: 'absent',
      render: (absent) => `${absent} days`,
    },
    {
      title: 'Leave',
      dataIndex: 'leave',
      key: 'leave',
      render: (leave) => `${leave} days`,
    },
    {
      title: 'Attendance %',
      dataIndex: 'attendancePercentage',
      key: 'attendancePercentage',
      render: (percentage) => (
        <Progress percent={percentage} status={percentage > 90 ? 'success' : percentage > 75 ? 'normal' : 'exception'} />
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Attendance Reports</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <RangePicker
          value={dateRange}
          onChange={handleDateChange}
          picker="month"
          style={{ width: 300 }}
        />
      </Card>

      {reportData && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Present Days"
                value={reportData.summary.present}
                precision={0}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Absent Days"
                value={reportData.summary.absent}
                precision={0}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Leave Days"
                value={reportData.summary.leave}
                precision={0}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Overall Attendance"
                value={reportData.summary.attendancePercentage}
                suffix="%"
                precision={2}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Table
        columns={columns}
        dataSource={reportData?.monthlyReports || []}
        rowKey="month"
        loading={isLoading}
        pagination={false}
      />
    </div>
  );
};

export default Reports;