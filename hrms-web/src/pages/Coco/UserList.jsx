import React, { useState, useRef } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Checkbox, 
  Card, 
  Space, 
  Typography,
  Grid,
  message,
  Popconfirm,
  Select,
  Tag,
  Divider,
  Dropdown,
  Menu,
  Badge,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
  MoreOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import UserPdfDocument from '../view/userview/UserPdfDocument';
 

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { Option } = Select;

// Mock API functions
const fetchUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      lastLogin: '2023-05-15T10:30:00Z',
      joinDate: '2022-01-10'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'HR',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      lastLogin: '2023-05-14T15:45:00Z',
      joinDate: '2022-03-15'
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Recruiter',
      status: 'inactive',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      lastLogin: '2023-04-20T08:20:00Z',
      joinDate: '2022-05-20'
    },
    {
      id: '4',
      name: 'Alice Williams',
      email: 'alice@example.com',
      role: 'Manager',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      lastLogin: '2023-05-12T11:10:00Z',
      joinDate: '2022-02-05'
    },
    {
      id: '5',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: 'Developer',
      status: 'inactive',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      lastLogin: '2023-03-28T14:30:00Z',
      joinDate: '2022-06-30'
    }
  ];
};

const fetchRoles = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return ['Admin', 'HR', 'Recruiter', 'Manager', 'Developer'];
};

const createUser = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { ...userData, id: Math.random().toString(36).substring(2, 9) };
};

const updateUser = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return userData;
};

const deleteUser = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return userId;
};

const UserManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterRole, setFilterRole] = useState(null);
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const csvLinkRef = useRef();

  // Fetch data
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      message.success('User created successfully');
      queryClient.invalidateQueries(['users']);
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to create user');
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      message.success('User updated successfully');
      queryClient.invalidateQueries(['users']);
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: () => {
      message.error('Failed to update user');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      message.success('User deleted successfully');
      queryClient.invalidateQueries(['users']);
    },
    onError: () => {
      message.error('Failed to delete user');
    }
  });

  // Handlers
  const handleCreate = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsModalVisible(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setIsViewModalVisible(true);
  };

  const handleDelete = (userId) => {
    deleteMutation.mutate(userId);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const userData = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`
      };

      if (editingUser) {
        updateMutation.mutate({ ...userData, id: editingUser.id });
      } else {
        createMutation.mutate(userData);
      }
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingUser(null);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setViewingUser(null);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
  };

  const handleRoleFilter = (value) => {
    setFilterRole(value);
  };

  const handleResetFilters = () => {
    setSearchText('');
    setFilterStatus(null);
    setFilterRole(null);
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Filter and search logic
  const filteredData = users?.filter(item => {
    const matchesSearch = searchText 
      ? item.name.toLowerCase().includes(searchText.toLowerCase()) || 
        item.email.toLowerCase().includes(searchText.toLowerCase())
      : true;
    
    const matchesStatus = filterStatus 
      ? item.status === filterStatus
      : true;
    
    const matchesRole = filterRole 
      ? item.role === filterRole
      : true;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Download handlers
  const handleExportCSV = () => {
    csvLinkRef.current.link.click();
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  const handleExportSelectedExcel = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select users to export');
      return;
    }
    const selectedData = users.filter(user => selectedRowKeys.includes(user.id));
    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Users");
    XLSX.writeFile(workbook, "selected_users.xlsx");
  };

  const handleExportPDF = async () => {
    const blob = await pdf(<UserPdfDocument data={filteredData} />).toBlob();
    saveAs(blob, 'users.pdf');
  };

  const handleExportSelectedPDF = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select users to export');
      return;
    }
    const selectedData = users.filter(user => selectedRowKeys.includes(user.id));
    const blob = await pdf(<UserPdfDocument data={selectedData} />).toBlob();
    saveAs(blob, 'selected_users.pdf');
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <Text strong>{text}</Text>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      filters: roles?.map(role => ({ text: role, value: role })),
      onFilter: (value, record) => record.role === value,
      sorter: (a, b) => a.role.localeCompare(b.role),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.lastLogin) - new Date(b.lastLogin),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            tooltip="View"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            tooltip="Edit"
          />
          <Popconfirm
            title="Delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} tooltip="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Dropdown menu for export options
  const exportMenu = (
    <Menu>
      <Menu.Item key="csv" onClick={handleExportCSV}>
        Export to CSV
      </Menu.Item>
      <Menu.Item key="excel" onClick={handleExportExcel}>
        Export to Excel
      </Menu.Item>
      <Menu.Item key="pdf" onClick={handleExportPDF}>
        Export to PDF
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="selectedExcel" onClick={handleExportSelectedExcel}>
        Export Selected to Excel
      </Menu.Item>
      <Menu.Item key="selectedPdf" onClick={handleExportSelectedPDF}>
        Export Selected to PDF
      </Menu.Item>
    </Menu>
  );

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div style={{ padding: screens.xs ? 12 : 24 }}>
      <Card 
        title={<Title level={4} style={{ margin: 0 }}>User Management</Title>}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreate}
            >
              {screens.md ? 'Create User' : 'Create'}
            </Button>
            <Dropdown overlay={exportMenu} placement="bottomRight">
              <Button icon={<DownloadOutlined />}>
                {screens.md ? 'Export' : ''}
              </Button>
            </Dropdown>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="Search by name or email"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              onChange={handleStatusFilter}
              value={filterStatus}
              allowClear
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
            <Select
              placeholder="Filter by role"
              style={{ width: 150 }}
              onChange={handleRoleFilter}
              value={filterRole}
              allowClear
            >
              {roles?.map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
            <Button onClick={handleResetFilters}>Reset Filters</Button>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={isLoading}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            }}
            scroll={{ x: true }}
            bordered
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Total: {filteredData?.length || 0} users</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={4}>
                    <Text strong>
                      Selected: {selectedRowKeys.length} user{selectedRowKeys.length !== 1 ? 's' : ''}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Space>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create User'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active'
          }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select role">
              {roles?.map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="User Details"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewingUser && (
          <div>
            <Space size="large" align="start">
              <Avatar size={128} src={viewingUser.avatar} />
              <div>
                <Title level={4}>{viewingUser.name}</Title>
                <Text type="secondary">{viewingUser.email}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color={viewingUser.status === 'active' ? 'green' : 'red'}>
                    {viewingUser.status.toUpperCase()}
                  </Tag>
                  <Tag color="blue">{viewingUser.role}</Tag>
                </div>
              </div>
            </Space>

            <Divider />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <Text strong>Last Login:</Text>
                <div>{new Date(viewingUser.lastLogin).toLocaleString()}</div>
              </div>
              <div>
                <Text strong>Join Date:</Text>
                <div>{new Date(viewingUser.joinDate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Hidden CSV Link */}
      <CSVLink
        data={filteredData || []}
        filename="users.csv"
        ref={csvLinkRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default UserManagement;