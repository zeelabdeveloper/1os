import React, { useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Card,
  Tag,
  Space,
  Typography,
  Dropdown,
  Menu,
  message,
  Divider,
  Checkbox,
  Row,
  Col,
  Tabs,
  Badge,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  DatabaseOutlined,
  MenuOutlined,
  LockOutlined,
  ApartmentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Initial data structure with departments
const departments = [
  { id: 'dept-1', name: 'IT' },
  { id: 'dept-2', name: 'HR' },
  { id: 'dept-3', name: 'Finance' },
  { id: 'dept-4', name: 'Operations' },
  { id: 'dept-5', name: 'Marketing' },
];

const initialModules = [
  {
    name: "Database",
    permissions: [
      
      "Daily Quiz",
      "Contents",
      "Fun W Lean",
      "Guess The Word",
      "Audio Questions",
      "Maths Quiz",
      "Exam Module",
      "Users",
      "In App Users",
      "Activity Trades",
      "Payment Requests",
      "Leaderboard",
      "Settings",
      "Saved Notifications"
    ]
  },
  {
    name: "Use Commons",
    permissions: [
      "Enter Username",
      "Password",
      "Enter Password",
      "Role",
      "Select Reel"
    ]
  },
  {
    name: "Module/Formations",
    permissions: [
      "Users",
      "Languages",
      "Categories",
      "Subcategories",
      "Category Order",
      "Questions",
      "Daily Quiz",
      "Manage Context",
      "Manage Context Question",
      "Import Context Question",
      "Fun N Learn",
      "Guess The Word",
      "Audio Question",
      "Maths Questions",
      "Exam Module",
      "Question Report"
    ]
  }
];

const PermissionManagement = () => {
  const [groupForm] = Form.useForm();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([
    {
      id: 'group-1',
      name: 'Admin',
      description: 'Full access to all features',
      department: 'IT',
      permissions: initialModules.flatMap(module => 
        module.permissions.map(perm => `${module.name}::${perm}`)
      )
    },
    {
      id: 'group-2',
      name: 'Content Manager',
      description: 'Manages all content',
      department: 'Marketing',
      permissions: [
        "Database::Contents",
        "Database::Daily Quiz",
        "Module/Formations::Questions",
        "Module/Formations::Daily Quiz"
      ]
    }
  ]);

  // Create new group
  const createGroup = (values) => {
    setGroups([
      ...groups,
      {
        ...values,
        id: `group-${Date.now()}`,
        permissions: values.permissions || []
      }
    ]);
    message.success('Group created successfully');
    setIsGroupModalOpen(false);
    groupForm.resetFields();
  };

  // Update group
  const updateGroup = (values) => {
    setGroups(groups.map(group => 
      group.id === values.id ? { ...group, ...values } : group
    ));
    message.success('Group updated successfully');
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  // Delete group
  const deleteGroup = (groupId) => {
    setGroups(groups.filter(group => group.id !== groupId));
    message.success('Group deleted successfully');
  };

  const handleGroupSubmit = () => {
    groupForm.validateFields().then(values => {
      if (editingGroup) {
        updateGroup(values);
      } else {
        createGroup(values);
      }
    });
  };

  return (
    <div className="  h-[92vh] p-2 overflow-y-auto ]">
      <Card
        title={
          <Space>
            <LockOutlined className="text-xl text-blue-500" />
            <Title level={4} style={{ margin: 0 }}>
              Role & Permission Management
            </Title>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingGroup(null);
              setIsGroupModalOpen(true);
            }}
          >
            Add Role
          </Button>
        }
        bordered={false}
        className="shadow-lg rounded-lg"
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Roles" key="groups">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {groups.map(group => (
                <Card
                  key={group.id}
                  title={
                    <Space>
                      <FolderOutlined />
                      <Text strong>{group.name}</Text>
                    </Space>
                  }
                  extra={
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item
                            icon={<EditOutlined />}
                            onClick={() => {
                              setEditingGroup(group);
                              groupForm.setFieldsValue({
                                ...group,
                                permissions: group.permissions
                              });
                              setIsGroupModalOpen(true);
                            }}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => deleteGroup(group.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu>
                      }
                      trigger={['click']}
                    >
                      <Button type="text" icon={<MenuOutlined />} />
                    </Dropdown>
                  }
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  <Text type="secondary">{group.description}</Text>
                  <Divider dashed />
                  <div className="space-y-2">
                    <div>
                      <Text strong>Department: </Text>
                      <Tag color="blue" icon={<ApartmentOutlined />}>
                        {group.department}
                      </Tag>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text>
                        <Badge 
                          count={group.permissions.length} 
                          style={{ backgroundColor: '#1890ff' }} 
                          className="mr-2"
                        />
                        Permissions
                      </Text>
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => {
                          setEditingGroup(group);
                          groupForm.setFieldsValue({
                            ...group,
                            permissions: group.permissions
                          });
                          setIsGroupModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabPane>
          <TabPane tab="All Permissions" key="permissions">
            <div className="mt-4">
              {initialModules.map(module => (
                <Card
                  key={module.name}
                  title={
                    <Space>
                      <DatabaseOutlined />
                      <Text strong>{module.name}</Text>
                    </Space>
                  }
                  className="mb-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {module.permissions.map(permission => (
                      <Tag key={permission} color="blue" className="m-1 p-2">
                        {permission}
                      </Tag>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Role/Group Modal */}
      <Modal
        title={
          <Space>
            {editingGroup ? (
              <>
                <EditOutlined />
                <span>Edit Role</span>
              </>
            ) : (
              <>
                <PlusOutlined />
                <span>Create New Role</span>
              </>
            )}
          </Space>
        }
        open={isGroupModalOpen}
        onOk={handleGroupSubmit}
        onCancel={() => {
          setIsGroupModalOpen(false);
          setEditingGroup(null);
        }}
        width={800}
        destroyOnClose
      >
        <Form form={groupForm} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Role Name"
                rules={[{ required: true, message: 'Please input role name!' }]}
              >
                <Input placeholder="e.g., Software Engineer" prefix={<FolderOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please select department!' }]}
              >
                <Select
                  placeholder="Select department"
                  suffixIcon={<ApartmentOutlined />}
                >
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.name}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea rows={3} placeholder="Description of this role" />
          </Form.Item>
          
          <Divider orientation="left">Module Permissions</Divider>
          
          <Form.Item
            name="permissions"
            label="Select Permissions"
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                {initialModules.map(module => (
                  <Col span={24} key={module.name}>
                    <Card
                      title={
                        <Space>
                          <DatabaseOutlined />
                          <Text strong>{module.name}</Text>
                        </Space>
                      }
                      size="small"
                    >
                      <Row gutter={[16, 8]}>
                        {module.permissions.map(permission => (
                          <Col span={8} key={permission}>
                            <Checkbox 
                              value={`${module.name}::${permission}`}
                            >
                              {permission}
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PermissionManagement;
