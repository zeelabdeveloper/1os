import React from 'react';
import { Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getRolePermissions } from '../services/permissionService';

const { Text } = Typography;

const RolePermissionsList = ({ roleId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['rolePermissions', roleId],
    queryFn: () => getRolePermissions(roleId),
  });

  const columns = [
    {
      title: 'Route',
      dataIndex: ['route', 'label'],
      key: 'route',
    },
    {
      title: 'Access',
      dataIndex: 'access',
      key: 'access',
      render: (access) => (
        <Tag color={access ? 'green' : 'red'}>
          {access ? 'Allowed' : 'Denied'}
        </Tag>
      ),
    },
  ];

  if (isLoading) return <Text>Loading permissions...</Text>;
  if (!data?.data?.childRoutes?.length) return <Text>No permissions set for this role</Text>;

  return (
    <Table
      columns={columns}
      dataSource={data.data.childRoutes}
      rowKey={(record) => record.route._id}
      pagination={false}
      size="small"
    />
  );
};

export default RolePermissionsList;