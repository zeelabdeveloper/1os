import React, { useState, useRef } from 'react';
import { 
  Table, Tabs, Card, Button, Modal, Form, Input, Select, Upload, 
  Divider, Tag, Space, Popconfirm, message, Descriptions, Badge, 
  Row,
  Col
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, DownloadOutlined, 
  UploadOutlined, PrinterOutlined, MailOutlined, 
  SearchOutlined, FileExcelOutlined, FilePdfOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

const { TabPane } = Tabs;
const { Option } = Select;

// Salary Slip Component
const SalarySlip = React.forwardRef(({ salaryData }, ref) => {
  // ... (same as previous implementation)
});

// Main Component
const RoleBasedSalaryManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSlipVisible, setIsSlipVisible] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [activeRole, setActiveRole] = useState('developer');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchText, setSearchText] = useState('');
  const queryClient = useQueryClient();
  const slipRef = useRef();

  // Fetch salaries based on role and branch
  const { data: salaries = [], isLoading } = useQuery({
    queryKey: ['salaries', activeRole, selectedBranch],
    queryFn: () => 
      axios.get('/api/salaries', { 
        params: { 
          role: activeRole === 'all' ? undefined : activeRole,
          branch: selectedBranch === 'all' ? undefined : selectedBranch
        }
      }).then(res => res.data),
  });

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => axios.get('/api/branches').then(res => res.data),
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/salaries/${id}`),
    onSuccess: () => {
      message.success('Salary record deleted successfully');
      queryClient.invalidateQueries(['salaries']);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values) => axios.put(`/api/salaries/${values.id}`, values),
    onSuccess: () => {
      message.success('Salary updated successfully');
      queryClient.invalidateQueries(['salaries']);
      setIsModalVisible(false);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branch', selectedBranch);
      return axios.post('/api/salaries/upload', formData);
    },
    onSuccess: () => {
      message.success('Salaries uploaded successfully');
      queryClient.invalidateQueries(['salaries']);
      setIsUploadModalVisible(false);
    },
    onError: () => {
      message.error('Failed to upload salaries');
    }
  });

  // Handlers
  const handleRoleChange = (key) => {
    setActiveRole(key);
  };

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
  };

  const handleEdit = (record) => {
    setSelectedSalary(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleViewSlip = (record) => {
    setSelectedSalary(record);
    setIsSlipVisible(true);
  };

  const handleUpdate = () => {
    form.validateFields().then(values => {
      updateMutation.mutate({ ...values, id: selectedSalary.id });
    });
  };

  const handlePrint = useReactToPrint({
    content: () => slipRef.current,
  });

  const handleDownload = (format) => {
    window.open(`/api/salaries/export?role=${activeRole}&branch=${selectedBranch}&format=${format}`);
  };

  const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel';
    if (!isExcel) {
      message.error('You can only upload Excel files!');
    }
    return isExcel;
  };

  const handleUpload = (info) => {
    if (info.file.status === 'done') {
      uploadMutation.mutate(info.file.originFileObj);
    }
  };

  // Columns for the table
  const columns = [
    {
      title: 'Emp Code',
      dataIndex: 'empCode',
      key: 'empCode',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          record.empCode.toLowerCase().includes(value.toLowerCase()) ||
          (record.employeeName && record.employeeName.toLowerCase().includes(value.toLowerCase())) ||
          record.department.toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: 'Employee Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Basic Salary',
      dataIndex: 'basic',
      key: 'basic',
      render: (value) => `₹${value?.toLocaleString() || '0'}`
    },
    {
      title: 'Net Pay',
      key: 'netPay',
      render: (_, record) => {
        const earnings = (record.basic || 0) + (record.hra || 0) + (record.conveyance || 0) + 
                        (record.medical || 0) + (record.otherAllo || 0);
        const deductions = (record.advance || 0) + (record.pf || 0) + (record.esi || 0) + 
                          (record.lpd || 0) + (record.otherDeduction || 0) + 
                          (record.tds || 0) + (record.lwf || 0);
        return `₹${(earnings - deductions).toLocaleString()}`;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'blue'}>
          {status?.toUpperCase() || 'DRAFT'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              type="text" 
              icon={<PrinterOutlined />} 
              onClick={() => handleViewSlip(record)}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Popconfirm
              title="Are you sure to delete this salary record?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </motion.div>
        </Space>
      )
    }
  ];

  // Dummy data if API returns empty
  const dummyData = {
    developer: [
      {
        id: '1',
        empCode: 'DEV001',
        employeeName: 'John Doe',
        department: 'Engineering',
        role: 'developer',
        branch: 'bangalore',
        month: 'June 2023',
        basic: 50000,
        hra: 20000,
        conveyance: 2000,
        medical: 1500,
        otherAllo: 3000,
        advance: 5000,
        pf: 1800,
        esi: 1200,
        status: 'paid'
      }
    ],
    hr: [
      {
        id: '2',
        empCode: 'HR001',
        employeeName: 'Jane Smith',
        department: 'Human Resources',
        role: 'hr',
        branch: 'delhi',
        month: 'June 2023',
        basic: 45000,
        hra: 18000,
        conveyance: 1500,
        medical: 1200,
        otherAllo: 2500,
        advance: 0,
        pf: 1600,
        esi: 1000,
        status: 'paid'
      }
    ],
    manager: [
      {
        id: '3',
        empCode: 'MGR001',
        employeeName: 'Robert Johnson',
        department: 'Management',
        role: 'manager',
        branch: 'mumbai',
        month: 'June 2023',
        basic: 80000,
        hra: 32000,
        conveyance: 3000,
        medical: 2500,
        otherAllo: 5000,
        advance: 0,
        pf: 2800,
        esi: 1800,
        status: 'pending'
      }
    ]
  };

  const filteredSalaries = salaries.length > 0 ? salaries : 
    (activeRole === 'all' ? 
      Object.values(dummyData).flat() : 
      dummyData[activeRole] || []);

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title="Salary Management System"
          bordered={false}
          className="shadow-md"
          extra={
            <Space>
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                onChange={handleBranchChange}
              >
                <Option value="all">All Branches</Option>
                {branches.map(branch => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<UploadOutlined />}
                onClick={() => setIsUploadModalVisible(true)}
              >
                Upload Salaries
              </Button>
            </Space>
          }
        >
          <Tabs 
            defaultActiveKey="developer" 
            onChange={handleRoleChange}
            tabBarExtraContent={
              <div className="flex items-center">
                <Input
                  placeholder="Search..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="mr-2"
                  style={{ width: 200 }}
                />
                <Space>
                  <Button 
                    icon={<FileExcelOutlined />} 
                    onClick={() => handleDownload('excel')}
                  >
                    Excel
                  </Button>
                  <Button 
                    icon={<FilePdfOutlined />} 
                    onClick={() => handleDownload('pdf')}
                  >
                    PDF
                  </Button>
                </Space>
              </div>
            }
          >
            <TabPane tab="Developers" key="developer">
              <Table 
                columns={columns} 
                dataSource={filteredSalaries.filter(s => activeRole === 'all' || s.role === 'developer')} 
                loading={isLoading}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </TabPane>
            <TabPane tab="HR" key="hr">
              <Table 
                columns={columns} 
                dataSource={filteredSalaries.filter(s => activeRole === 'all' || s.role === 'hr')} 
                loading={isLoading}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </TabPane>
            <TabPane tab="Managers" key="manager">
              <Table 
                columns={columns} 
                dataSource={filteredSalaries.filter(s => activeRole === 'all' || s.role === 'manager')} 
                loading={isLoading}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </TabPane>
            <TabPane tab="All Employees" key="all">
              <Table 
                columns={columns} 
                dataSource={filteredSalaries} 
                loading={isLoading}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </motion.div>

      {/* Edit Modal */}
        {/* Edit Modal */}
      <Modal
        title="Edit Salary Record"
        visible={isModalVisible}
        onOk={handleUpdate}
         onCancel={() => setIsModalVisible(false)}
        confirmLoading={updateMutation.isLoading}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="empCode" label="Employee Code">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="Role">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Salary Components</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="basic" label="Basic Salary">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hra" label="H.R.A">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="conveyance" label="Conveyance">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="medical" label="Medical">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="otherAllo" label="Other Allowance">
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Deductions</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="advance" label="Advance">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pf" label="PF">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="esi" label="ESI">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lpd" label="L.P.D">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="otherDeduction" label="Other Deduction">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tds" label="T.D.S">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lwf" label="L.W.F">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="month" label="Month">
                <Input placeholder="e.g. June 2023" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select>
                  <Option value="draft">Draft</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="paid">Paid</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Salary Slip Modal */}
      <Modal
        title="Salary Slip"
        visible={isSlipVisible}
        onCancel={() => setIsSlipVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print
          </Button>,
          <Button key="download" icon={<DownloadOutlined />}>
            Download
          </Button>,
          <Button key="email" icon={<MailOutlined />}>
            Email
          </Button>,
        ]}
        width={800}
      >
        <SalarySlip ref={slipRef} salaryData={selectedSalary || {}} />
      </Modal>

      {/* Upload Modal */}
      <Modal
        title="Upload Salary Details"
        visible={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Branch">
            <Select
              placeholder="Select branch"
              value={selectedBranch === 'all' ? undefined : selectedBranch}
              onChange={setSelectedBranch}
            >
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Salary File (Excel)">
            <Upload
              accept=".xlsx, .xls"
              beforeUpload={beforeUpload}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => onSuccess("ok"), 0);
              }}
              onChange={handleUpload}
              showUploadList={true}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            <p className="text-gray-500 mt-2">
              Please upload an Excel file with salary details. 
              <a href="/templates/salary-template.xlsx" download className="ml-2">
                Download template
              </a>
            </p>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleBasedSalaryManagement;