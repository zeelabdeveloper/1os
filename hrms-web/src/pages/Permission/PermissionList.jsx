import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  Tree,
  Typography,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  SaveOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";

import { fetchRoles } from "../../api/auth";
import {
  getPermissionTree,
  updateRolePermissions,
  getRolePermissionsSummary,
} from "../../api/permissionService";

const { Title, Text } = Typography;
const { DirectoryTree } = Tree;
const { Search } = Input;

const PermissionsManager = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: permissionTree,
    isLoading: treeLoading,
    refetch: refetchTree,
  } = useQuery({
    queryKey: ["permissionTree", selectedRole],
    queryFn: () => getPermissionTree(selectedRole),
    enabled: true,
  });

  const { data: summaryData } = useQuery({
    queryKey: ["permissionsSummary"],
    queryFn: getRolePermissionsSummary,
  });

  const updatePermissions = useMutation({
    mutationFn: (selectedRoutes) =>
      updateRolePermissions(selectedRole, selectedRoutes),
    onSuccess: () => {
      queryClient.invalidateQueries(["permissionTree", selectedRole]);
      queryClient.invalidateQueries(["permissionsSummary"]);
    },
  });

  useEffect(() => {
    if (permissionTree?.data && selectedRole) {
      const selected = permissionTree.data
        .flatMap((header) => header.children)
        .filter((child) => child.selected)
        .map((child) => child.key);

      setSelectedKeys(selected);
      setExpandedKeys(permissionTree.data.map((header) => header.key));
    } else {
      setSelectedKeys([]);
    }
  }, [permissionTree, selectedRole]);

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setSearchValue("");
  };

  const handleSelect = (keys, { node, selected }) => {
    console.log(node);
    console.log(selected);
    console.log(selectedKeys);
    if (!node.isLeaf) return;

    setSelectedKeys((prev) => {
      if (selected) {
        return [...prev, node.key];
      } else {
        return prev.filter((key) => key !== node.key);
      }
    });
  };

  const handleExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  const handleSearch = debounce((value) => {
    setSearchValue(value);

    if (!value) {
      setExpandedKeys(permissionTree?.data?.map((header) => header.key) || []);
      return;
    }

    const matchedKeys = [];
    const expanded = [];

    permissionTree?.data?.forEach((header) => {
      const matchedChildren = header.children.filter(
        (child) =>
          child.title.toLowerCase().includes(value.toLowerCase()) ||
          child.path.toLowerCase().includes(value.toLowerCase())
      );

      if (matchedChildren.length > 0) {
        expanded.push(header.key);
        matchedKeys.push(...matchedChildren.map((child) => child.key));
      }
    });

    setExpandedKeys(expanded);
    setAutoExpandParent(true);
  }, 300);

  const filteredTreeData = useMemo(() => {
    if (!searchValue || !permissionTree?.data) return permissionTree?.data;

    return permissionTree.data
      .map((header) => ({
        ...header,
        children: header.children.filter(
          (child) =>
            child.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            child.path.toLowerCase().includes(searchValue.toLowerCase())
        ),
      }))
      .filter((header) => header.children.length > 0);
  }, [permissionTree, searchValue]);

  const handleSave = () => {
    if (!selectedRole) return;
    updatePermissions.mutate(selectedKeys);
  };

  const handleSelectAll = (select) => {
    if (!permissionTree?.data) return;

    const allLeafKeys = permissionTree.data
      .flatMap((header) => header.children)
      .map((child) => child.key);

    setSelectedKeys(select ? allLeafKeys : []);
  };

  return (
    <div className="permissions-manager">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={4} className="mb-0">
              Role Permissions Manager
            </Title>
          </Card>
        </Col>

        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col flex="200px">
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select a role"
                  loading={rolesLoading}
                  onChange={handleRoleChange}
                  value={selectedRole}
                  options={roles?.map((role) => ({
                    value: role._id,
                    label: role.name,
                  }))}
                />
              </Col>

              <Col flex="auto">
                <Search
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
                    onClick={() => handleSelectAll(true)}
                    disabled={!permissionTree?.data}
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={() => handleSelectAll(false)}
                    disabled={!permissionTree?.data}
                  >
                    Deselect All
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={updatePermissions.isLoading}
                    disabled={!selectedRole || !permissionTree?.data}
                  >
                    Save Permissions
                  </Button>
                </Button.Group>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Route Permissions" loading={treeLoading}>
            {permissionTree?.data ? (
              <DirectoryTree
                multiple
                checkable
                showIcon={false}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                selectedKeys={selectedKeys}
                checkedKeys={selectedKeys}
                onExpand={handleExpand}
                onSelect={handleSelect}
                onCheck={setSelectedKeys}
                treeData={filteredTreeData}
                height={600}
                titleRender={(node) => {
                  if (node.isLeaf) {
                    return (
                      <div className="tree-leaf-node">
                        <span className="tree-leaf-title">
                          {node.title}
                          <Tag color="geekblue" className="ml-2">
                            {node.path}
                          </Tag>
                        </span>
                        {selectedKeys.includes(node.key) ? (
                          <CheckOutlined className="text-success" />
                        ) : (
                          <CloseOutlined className="text-danger" />
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
          <Card title="Permissions Summary">
            {summaryData?.data ? (
              <Table
                dataSource={summaryData.data}
                rowKey="roleId"
                pagination={false}
                columns={[
                  {
                    title: "Role",
                    dataIndex: "roleName",
                    key: "roleName",
                  },
                  {
                    title: "Allowed",
                    dataIndex: "allowedRoutes",
                    key: "allowedRoutes",
                    render: (allowed, record) => (
                      <Text>
                        {allowed} of {record.totalRoutes}
                      </Text>
                    ),
                  },
                  {
                    title: "Last Updated",
                    dataIndex: "lastUpdated",
                    key: "lastUpdated",
                    render: (date) => new Date(date).toLocaleString(),
                  },
                ]}
                onRow={(record) => ({
                  onClick: () => handleRoleChange(record.roleId),
                })}
              />
            ) : (
              <Spin spinning={!summaryData} />
            )}
          </Card>

          <Card title="Selected Permissions" className="mt-4">
            {selectedRole && selectedKeys.length > 0 ? (
              <div className="selected-permissions-list">
                {permissionTree?.data
                  ?.flatMap((header) => header.children)
                  ?.filter((child) => selectedKeys.includes(child.key))
                  ?.map((child) => (
                    <div key={child.key} className="selected-permission-item">
                      <Text ellipsis>{child.title}</Text>
                      <Tag color="blue">{child.path}</Tag>
                    </div>
                  ))}
              </div>
            ) : (
              <Empty
                description={
                  selectedRole ? "No routes selected" : "No role selected"
                }
              />
            )}

            {selectedKeys.length > 0 && (
              <div className="mt-3">
                <Text strong>Total Selected: {selectedKeys.length}</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .permissions-manager {
          padding: 16px;
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
