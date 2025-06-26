import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Checkbox, Collapse, List, Select, Spin, Typography } from 'antd';
import { toast } from 'react-hot-toast';
import { getAllRoutes, getRolePermissions, updatePermissions } from '../../api/permissionService';
 

const { Title, Text } = Typography;
const { Panel } = Collapse;

const PermissionManager = ({ roles }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [expandedHeaders, setExpandedHeaders] = useState([]);
  const queryClient = useQueryClient();

  // Fetch all routes
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['permissionRoutes'],
    queryFn: getAllRoutes,
  });

  // Fetch permissions for selected role
  const { data: rolePermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['rolePermissions', selectedRole],
    queryFn: () => getRolePermissions(selectedRole),
    enabled: !!selectedRole,
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: (childRoutes) => updatePermissions(selectedRole, childRoutes),
    onSuccess: () => {
      toast.success('Permissions updated successfully');
      queryClient.invalidateQueries(['rolePermissions', selectedRole]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    },
  });

  // Initialize selected routes when role permissions load
  useEffect(() => {
    if (rolePermissions?.data?.childRoutes) {
      setSelectedRoutes(rolePermissions.data.childRoutes.map(cr => cr.route._id));
    } else {
      setSelectedRoutes([]);
    }
  }, [rolePermissions]);

  // Handle role change
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    setExpandedHeaders([]);
  };

  // Toggle all children of a header
  const toggleHeaderChildren = (headerId, children) => {
    const allChildrenSelected = children.every(child => selectedRoutes.includes(child._id));
    
    if (allChildrenSelected) {
      // Remove all children
      setSelectedRoutes(prev => prev.filter(id => !children.some(child => child._id === id)));
    } else {
      // Add all children
      const newSelected = [...selectedRoutes];
      children.forEach(child => {
        if (!newSelected.includes(child._id)) {
          newSelected.push(child._id);
        }
      });
      setSelectedRoutes(newSelected);
    }
  };

  // Toggle individual child route
  const toggleChildRoute = (childId) => {
    setSelectedRoutes(prev => 
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  // Handle save permissions
  const handleSavePermissions = () => {
    if (!selectedRole) {
      toast.error('Please select a role first');
      return;
    }
    
    const childRoutes = selectedRoutes.map(id => ({ _id: id }));
    updatePermissionsMutation.mutate(childRoutes);
  };

  // Expand/collapse header
  const handleHeaderExpand = (key) => {
    setExpandedHeaders(prev => 
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  return (
    <Card title="Permission Management" className="permission-manager">
      <div className="mb-4">
        <Text strong className="mr-2">Select Role:</Text>
        <Select
          style={{ width: 200 }}
          placeholder="Select a role"
          options={roles.map(role => ({ value: role._id, label: role.name }))}
          onChange={handleRoleChange}
          value={selectedRole}
        />
      </div>

      {(routesLoading || permissionsLoading) ? (
        <Spin size="large" className="flex justify-center my-8" />
      ) : (
        <>
          <Title level={4} className="mb-4">Routes</Title>
          <Collapse activeKey={expandedHeaders} onChange={handleHeaderExpand}>
            {routes?.data?.map(header => (
              <Panel
                key={header._id}
                header={
                  <div className="flex items-center">
                    <Checkbox
                      checked={header.child.every(child => selectedRoutes.includes(child._id))}
                      indeterminate={
                        header.child.some(child => selectedRoutes.includes(child._id)) &&
                        !header.child.every(child => selectedRoutes.includes(child._id))
                      }
                      onChange={() => toggleHeaderChildren(header._id, header.child)}
                      onClick={e => e.stopPropagation()}
                    />
                    <span className="ml-2">{header.header}</span>
                  </div>
                }
              >
                <List
                  dataSource={header.child}
                  renderItem={child => (
                    <List.Item className="pl-8">
                      <Checkbox
                        checked={selectedRoutes.includes(child._id)}
                        onChange={() => toggleChildRoute(child._id)}
                      >
                        <span className="ml-2">{child.label}</span>
                      </Checkbox>
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>

          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              onClick={handleSavePermissions}
              loading={updatePermissionsMutation.isLoading}
              disabled={!selectedRole}
            >
              Save Permissions
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default PermissionManager;