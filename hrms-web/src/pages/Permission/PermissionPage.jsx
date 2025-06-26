import React, { useState } from 'react';
import { Tabs, Card, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import PermissionManager from '../components/PermissionManager';
import RolePermissionsList from '../components/RolePermissionsList';
import { getRoles } from '../services/roleService';

const { TabPane } = Tabs;

const PermissionsPage = () => {
  const [activeTab, setActiveTab] = useState('manage');

  // Fetch roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to load roles');
    },
  });

  if (isLoading) return <Spin size="large" className="flex justify-center mt-8" />;

  return (
    <div className="p-4">
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Manage Permissions" key="manage">
            <PermissionManager roles={roles?.data || []} />
          </TabPane>
          <TabPane tab="View Permissions" key="view">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Select a role to view permissions:</h3>
              <select className="border p-2 rounded">
                {roles?.data?.map(role => (
                  <option key={role._id} value={role._id}>{role.name}</option>
                ))}
              </select>
            </div>
            {/* Implement role selection and display here */}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PermissionsPage;