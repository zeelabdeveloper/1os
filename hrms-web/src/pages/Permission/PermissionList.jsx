import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Skeleton,
  Spin,
  Table,
  Tag,
  Tree,
  Typography
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  SaveOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';

import { fetchRoles } from '../../api/auth';
import {
  getPermissionTree,
  updateRolePermissions,
  getRolePermissionsSummary
} from '../../api/permissionService';

const { Title, Text } = Typography;
const { DirectoryTree } = Tree;
const { Search } = Input;

const PermissionsManager = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const queryClient = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    staleTime: 1000 * 60 * 5
  });

  const {
    data: permissionTree,
    isLoading: treeLoading
  } = useQuery({
    queryKey: ['permissionTree', selectedRole],
    queryFn: () => getPermissionTree(selectedRole),
    enabled: !!selectedRole
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['permissionsSummary'],
    queryFn: getRolePermissionsSummary
  });

  const updatePermissions = useMutation({
    mutationFn: (selectedRoutes) =>
      updateRolePermissions(selectedRole, selectedRoutes),
    onSuccess: () => {
      queryClient.invalidateQueries(['permissionTree', selectedRole]);
      queryClient.invalidateQueries(['permissionsSummary']);
    }
  });

  useEffect(() => {
    if (permissionTree?.data && selectedRole) {
      const selected = permissionTree.data
        .flatMap(header => header.children)
        .filter(child => child.selected)
        .map(child => child.key);

      setCheckedKeys(selected);
      setExpandedKeys(permissionTree.data.map(header => header.key));
    } else {
      setCheckedKeys([]);
    }
  }, [permissionTree, selectedRole]);

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setSearchValue('');
  };

  const handleCheck = (checked) => {
    const onlyLeafChecked = permissionTree?.data
      ?.flatMap(header => header.children)
      ?.filter(child => checked.includes(child.key))
      ?.map(child => child.key) || [];

    setCheckedKeys(onlyLeafChecked);
  };

  const handleExpand = (expanded) => {
    setExpandedKeys(expanded);
    setAutoExpandParent(false);
  };

  const handleSearch = debounce((value) => {
    setSearchValue(value);

    if (!value) {
      setExpandedKeys(permissionTree?.data?.map(header => header.key) || []);
      return;
    }

    const matchedKeys = [];
    const expanded = [];

    permissionTree?.data?.forEach(header => {
      const matchedChildren = header.children.filter(child =>
        child.title.toLowerCase().includes(value.toLowerCase()) ||
        child.path.toLowerCase().includes(value.toLowerCase())
      );

      if (matchedChildren.length > 0) {
        expanded.push(header.key);
        matchedKeys.push(...matchedChildren.map(child => child.key));
      }
    });

    setExpandedKeys(expanded);
    setAutoExpandParent(true);
  }, 300);

  const filteredTreeData = useMemo(() => {
    if (!searchValue || !permissionTree?.data) return permissionTree?.data;

    return permissionTree.data.map(header => ({
      ...header,
      children: header.children.filter(child =>
        child.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        child.path.toLowerCase().includes(searchValue.toLowerCase())
      )
    })).filter(header => header.children.length > 0);
  }, [permissionTree, searchValue]);

  const handleSave = () => {
    if (!selectedRole) return;
    updatePermissions.mutate(checkedKeys);
  };

  const handleSelectAll = (select) => {
    if (!permissionTree?.data) return;

    const allLeafKeys = permissionTree.data
      .flatMap(header => header.children)
      .map(child => child.key);

    setCheckedKeys(select ? allLeafKeys : []);
  };

  return (
    <div className="permissions-manager p-4 bg-gray-50 min-h-screen">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            className="shadow-md rounded-xl"
            headStyle={{ backgroundColor: '#f0f5ff' }}
          >
            <Title level={3} className="!mb-0 text-indigo-600">
              <TeamOutlined className="mr-2" />
              Role Permissions Manager
            </Title>
            <Text type="secondary">
              Manage access for different user roles using an interactive tree.
            </Text>
          </Card>
        </Col>

        <Col span={24}>
          <Card className="rounded-xl shadow-sm">
            <Row gutter={16} align="middle">
              <Col flex="200px">
                {rolesLoading ? (
                  <Skeleton.Input active size="default" />
                ) : (
                  <Select
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="Select a role"
                    onChange={handleRoleChange}
                    value={selectedRole}
                    optionLabelProp="label"
                    options={roles?.map(role => ({
                      value: role._id,
                      label: (
                        <span>
                          <UserOutlined className="mr-2 text-blue-600" />
                          {role.name}
                        </span>
                      )
                    }))}
                  />
                )}
              </Col>

              <Col flex="auto">
                <Search
                  size="large"
                  placeholder="Search routes..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={!permissionTree?.data}
                />
              </Col>

              <Col>
                <Button.Group>
                  <Button
                    size="large"
                    onClick={() => handleSelectAll(true)}
                    disabled={!permissionTree?.data}
                    className="bg-blue-100 text-blue-700 border-blue-300"
                  >
                    Select All
                  </Button>
                  <Button
                    size="large"
                    onClick={() => handleSelectAll(false)}
                    disabled={!permissionTree?.data}
                    className="bg-red-100 text-red-700 border-red-300"
                  >
                    Deselect All
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={updatePermissions.isLoading}
                    disabled={!selectedRole || !permissionTree?.data}
                    className="bg-indigo-600 text-white"
                  >
                    Save
                  </Button>
                </Button.Group>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Route Permissions" className="rounded-xl shadow-sm" loading={treeLoading}>
            {treeLoading ? (
              <Skeleton active paragraph={{ rows: 10 }} />
            ) : permissionTree?.data ? (
              <DirectoryTree
                checkable
                showIcon={false}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                checkedKeys={checkedKeys}
                onExpand={handleExpand}
                onCheck={handleCheck}
                treeData={filteredTreeData}
                height={600}
                selectable={false}
                titleRender={(node) => {
                  if (node.isLeaf) {
                    return (
                      <div className="tree-leaf-node">
                        <span className="tree-leaf-title">
                          {node.title}
                          <Tag color="geekblue" className="ml-2">{node.path}</Tag>
                        </span>
                        {checkedKeys.includes(node.key) ? (
                          <CheckOutlined className="text-green-500" />
                        ) : (
                          <CloseOutlined className="text-red-500" />
                        )}
                      </div>
                    );
                  }
                  return <Text strong>{node.title}</Text>;
                }}
              />
            ) : (
              <Empty description="No routes available" />
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Permissions Summary" className="rounded-xl shadow-sm mb-4">
            {summaryLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : summaryData?.data ? (
              <Table
                dataSource={summaryData.data}
                rowKey="roleId"
                pagination={false}
                columns={[
                  {
                    title: 'Role',
                    dataIndex: 'roleName',
                    key: 'roleName'
                  },
                  {
                    title: 'Allowed',
                    dataIndex: 'allowedRoutes',
                    key: 'allowedRoutes',
                    render: (allowed, record) => (
                      <Tag color="blue">{allowed} / {record.totalRoutes}</Tag>
                    )
                  },
                  {
                    title: 'Last Updated',
                    dataIndex: 'lastUpdated',
                    key: 'lastUpdated',
                    render: (date) => new Date(date).toLocaleString()
                  }
                ]}
                onRow={(record) => ({
                  onClick: () => handleRoleChange(record.roleId)
                })}
              />
            ) : (
              <Empty description="No summary data" />
            )}
          </Card>

          <Card title="Selected Permissions" className="rounded-xl shadow-sm">
            {selectedRole && checkedKeys.length > 0 ? (
              <div className="selected-permissions-list">
                {permissionTree?.data
                  ?.flatMap(header => header.children)
                  ?.filter(child => checkedKeys.includes(child.key))
                  ?.map(child => (
                    <div key={child.key} className="selected-permission-item">
                      <Text ellipsis>{child.title}</Text>
                      <Tag color="green">{child.path}</Tag>
                    </div>
                  ))}
                <div className="mt-3">
                  <Text strong>Total Selected: {checkedKeys.length}</Text>
                </div>
              </div>
            ) : (
              <Empty description={selectedRole ? "No routes selected" : "No role selected"} />
            )}
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .permissions-manager {
          font-family: 'Inter', sans-serif;
        }

        .tree-leaf-node {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .tree-leaf-title {
          display: flex;
          align-items: center;
        }

        .selected-permissions-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .selected-permission-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .ant-tree .ant-tree-node-content-wrapper {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default PermissionsManager;
