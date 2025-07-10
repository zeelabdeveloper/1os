import React ,{useState} from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../axiosConfig";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Divider, 
  DatePicker, 
  Select, 
  Table, 
  Progress 
} from "antd";
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  UserDeleteOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const { Option } = Select;
const { RangePicker } = DatePicker;

const SeparationAnalytics = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [separationType, setSeparationType] = useState(null);

  // Fetch separation analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['separationAnalytics', dateRange, separationType],
    queryFn: async () => {
      const params = {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        type: separationType
      };
      const response = await axios.get('/api/v1/separations/analytics', { params });
      return response.data;
    }
  });

  // Columns for recent separations table
  const columns = [
    {
      title: 'Employee',
      dataIndex: ['user', 'firstName'],
      key: 'employee',
      render: (_, record) => (
        <span>{record.user.firstName} {record.user.lastName}</span>
      )
    },
    {
      title: 'Type',
      dataIndex: 'separationType',
      key: 'type',
      render: (type) => (
        <span style={{ textTransform: 'capitalize' }}>{type}</span>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          approved: { color: 'green', icon: <CheckCircleOutlined /> },
          pending: { color: 'orange', icon: <ClockCircleOutlined /> },
          rejected: { color: 'red', icon: <CloseCircleOutlined /> },
          under_review: { color: 'blue', icon: <FileDoneOutlined /> }
        };
        return (
          <span style={{ color: statusMap[status]?.color || 'gray' }}>
            {statusMap[status]?.icon} {status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
          </span>
        );
      }
    }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Separation Analytics</h2>
        <div className="flex space-x-4">
          <RangePicker
            defaultValue={dateRange}
            onChange={(dates) => setDateRange(dates)}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
          <Select
            placeholder="Filter by type"
            style={{ width: 180 }}
            allowClear
            onChange={setSeparationType}
          >
            <Option value="resignation">Resignation</Option>
            <Option value="termination">Termination</Option>
            <Option value="retirement">Retirement</Option>
            <Option value="other">Other</Option>
          </Select>
        </div>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Separations"
              value={analyticsData?.totalSeparations || 0}
              prefix={<UserDeleteOutlined />}
            />
            {analyticsData?.percentageChange && (
              <span className={analyticsData.percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {analyticsData.percentageChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(analyticsData.percentageChange)}% from last period
              </span>
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved"
              value={analyticsData?.approvedCount || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
            <Progress 
              percent={analyticsData?.approvalRate || 0} 
              size="small" 
              status="active" 
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={analyticsData?.pendingCount || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={analyticsData?.rejectedCount || 0}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col span={12}>
          <Card title="Separation Types Breakdown">
            <div className="flex justify-around">
              {analyticsData?.typeBreakdown?.map(type => (
                <div key={type._id} className="text-center">
                  <div className="text-2xl font-bold">{type.count}</div>
                  <div className="text-gray-500 capitalize">{type._id}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Monthly Trend">
            {/* This would require chart.js or similar for visualization */}
            <div className="h-64 flex items-center justify-center text-gray-400">
              Monthly trend chart would appear here
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Recent Separations">
        <Table
          columns={columns}
          dataSource={analyticsData?.recentSeparations || []}
          rowKey="_id"
          loading={isLoading}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default SeparationAnalytics;