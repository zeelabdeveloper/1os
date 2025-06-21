import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Popconfirm,
  Tag,
  Select,
  Card,
  Divider,
} from "antd";
import { FiPlus, FiSearch, FiTrash2, FiEdit, FiSave } from "react-icons/fi";
import { FaExclamationCircle } from "react-icons/fa";
import { TeamOutlined,  ApartmentOutlined, BankOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import axios from "axios";
import { addRole, deleteRole, fetchBranches, fetchDepartmentsByBranch, fetchRoles, updateRole } from "../../api/auth";

 

// The rest of the component remains the same as provided
export default function RoleManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedBranchForEdit, setSelectedBranchForEdit] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  // Fetch branches
  const { data: branches, isLoading: branchLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  // Fetch departments based on selected branch for add form
  const { data: departments, isLoading: deptLoading } = useQuery({
    queryKey: ["departments", selectedBranch],
    queryFn: () => fetchDepartmentsByBranch(selectedBranch),
    enabled: !!selectedBranch,
  });

  // Fetch departments based on selected branch for edit form
  const { data: editDepartments, isLoading: editDeptLoading } = useQuery({
    queryKey: ["departments", selectedBranchForEdit],
    queryFn: () => fetchDepartmentsByBranch(selectedBranchForEdit),
    enabled: !!selectedBranchForEdit,
  });

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(data.message || "Role deleted!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "There was an error deleting the role."
      );
    },
  });

  // Add role mutation
  const addMutation = useMutation({
    mutationFn: addRole,
    onSuccess: (data) => {
      console.log( data)
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(data.message || "Role created!");
      setIsModalOpen(false);
      form.resetFields();
      setSelectedBranch(null);
    },
    onError: (error) => {
      console.log( error)
      toast.error(
        error.response?.data?.message ||
          "There was an error adding the role."
      );
    },
  });

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(data.message || "Role updated!");
      setEditingId(null);
      setSelectedBranchForEdit(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "There was an error updating the role."
      );
    },
  });

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredRoles = roles?.filter(
    (role) =>
      role.name.toLowerCase().includes(searchText?.toLowerCase()) ||
      (role.department?.name &&
        role.department.name?.toLowerCase().includes(searchText?.toLowerCase())) ||
      (role.branch?.name &&
        role.branch.name?.toLowerCase().includes(searchText?.toLowerCase()))
  );

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleAddRole = () => {
    form.validateFields().then((values) => {
      const roleData = {
        ...values,
        branchId: selectedBranch,
      };
      addMutation.mutate(roleData);
    });
  };

  const handleEdit = (role) => {
    setEditingId(role._id);
    setSelectedBranchForEdit(role.branch?._id);
    editForm.setFieldsValue({
      ...role,
      branchId: role.branch?._id,
      departmentId: role.department?._id,
    });
  };

  const handleUpdate = (id) => {
    editForm.validateFields().then((values) => {
      const updateData = {
        ...values,
        branchId: selectedBranchForEdit,
      };
      updateMutation.mutate({ id, data: updateData });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedBranchForEdit(null);
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranch(branchId);
    form.setFieldsValue({ departmentId: undefined });
  };

  const handleBranchChangeForEdit = (branchId) => {
    setSelectedBranchForEdit(branchId);
    editForm.setFieldsValue({ departmentId: undefined });
  };

  const columns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) =>
        editingId === record._id ? (
          <Form.Item
            name="name"
            initialValue={text}
            rules={[{ required: true, message: "Please input role name!" }]}
            className="mb-0"
          >
            <Input />
          </Form.Item>
        ) : (
          <strong>{text}</strong>
        ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text, record) =>
        editingId === record._id ? (
          <Form.Item
            name="description"
            initialValue={text}
            rules={[{ required: true, message: "Please input description!" }]}
            className="mb-0"
          >
            <Input.TextArea />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: "Branch",
      dataIndex: "branchId",
      key: "branch",
      render: (branch, record) =>
       
        editingId === record._id ? (
          <Form.Item
            name="branchId"
            initialValue={branch?._id}
            rules={[{ required: true, message: "Please select branch!" }]}
            className="mb-0"
          >
            <Select
              loading={branchLoading}
              onChange={handleBranchChangeForEdit}
              placeholder="Select branch"
            >
              {branches?.map((branch) => (
                <Select.Option key={branch._id} value={branch._id}>
                  <div className="flex items-center">
                    <BankOutlined className="mr-2" />
                    {branch.name} ({branch.code})
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Tag icon={<BankOutlined />} color="purple">
            {branch?.name || "N/A"}

          
          </Tag>
        ),
      sorter: (a, b) =>
        (a.branch?.name || "").localeCompare(b.branch?.name || ""),
    },
    {
      title: "Department",
      dataIndex: "departmentId",
      key: "department",
      render: (department, record) =>
        editingId === record._id ? (
          <Form.Item
            name="departmentId"
            initialValue={department?._id}
            rules={[{ required: true, message: "Please select department!" }]}
            className="mb-0"
          >
            <Select
              loading={editDeptLoading}
              placeholder="Select department"
              disabled={!selectedBranchForEdit}
            >
              {editDepartments?.map((dept) => (
                <Select.Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Tag icon={<ApartmentOutlined />} color="blue">
            {department?.name || "N/A"}
          </Tag>
        ),
      sorter: (a, b) =>
        (a.department?.name || "").localeCompare(b.department?.name || ""),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (status, record) =>
        editingId === record._id ? (
          <Form.Item name="isActive" initialValue={status} className="mb-0">          
            <Select>
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </Form.Item>
        ) : (
          <Tag
            color={status  ? "green" : "orange"}
            icon={  <TeamOutlined />}
          >  
            {status? "Active" : "Deactive"}
          </Tag>
        ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          {editingId === record._id ? (
            <>
              <Button
                icon={<FiSave className="text-green-500" />}
                type="text"
                onClick={() => handleUpdate(record._id)}
                loading={updateMutation.isPending}
              />
              <Button
                icon={<FiEdit className="text-gray-500" />}
                type="text"
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
              />
            </>
          ) : (
            <>
              <Button
                icon={<FiEdit className="text-blue-500" />}
                type="text"
                onClick={() => handleEdit(record)}
                disabled={editingId !== null}
              />
              <Popconfirm
                title="Delete Role"
                description="Are you sure you want to delete this role?"
                icon={<FaExclamationCircle className="text-red-500" />}
                onConfirm={() => handleDelete(record._id)}
                okText="Yes"
                cancelText="No"
                disabled={editingId !== null}
              >
                <Button
                  icon={<FiTrash2 className="text-red-500" />}
                  type="text"
                  danger
                  disabled={editingId !== null}
                />
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container h-[92vh] overflow-y-auto mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <TeamOutlined className="mr-2" />
          Role Management
        </h1>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={editingId !== null}
        >
          Add Role
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search roles by name, department, or branch..."
          prefix={<FiSearch className="text-gray-400" />}
          onChange={handleSearch}
          className="w-full md:w-1/2"
          allowClear
        />
      </div>

      <Form form={editForm} component={false}>
        <Table
          columns={columns}
          dataSource={filteredRoles}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="shadow-sm rounded-lg overflow-hidden"
        />
      </Form>

      <Modal
        title={
          <div className="flex items-center">
            <TeamOutlined className="mr-2" />
            Add New Role
          </div>
        }
        open={isModalOpen}
        onOk={handleAddRole}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setSelectedBranch(null);
        }}
        confirmLoading={addMutation.isPending}
        okText="Create Role"
        cancelText="Cancel"
        okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700" }}
        width={600}
      >
        <Card className="mt-4 border-0 shadow-none">
          <Form form={form} layout="vertical">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <BankOutlined className="mr-2" />
                Branch Selection
              </h4>
              <Form.Item
                name="branchId"
                label="Select Branch"
                rules={[{ required: true, message: "Please select a branch!" }]}
              >
                <Select
                  placeholder="Choose branch first"
                  loading={branchLoading}
                  onChange={handleBranchChange}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.props.children[1]
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {branches?.map((branch) => (
                    <Select.Option key={branch._id} value={branch._id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BankOutlined className="mr-2" />
                          <span>{branch.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({branch.code})
                        </span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Divider />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <TeamOutlined className="mr-2" />
                Role Details
              </h4>

              <Form.Item
                name="name"
                label="Role Name"
                rules={[
                  { required: true, message: "Please input role name!" },
                  {
                    min: 2,
                    message: "Role name must be at least 2 characters!",
                  },
                ]}
              >
                <Input placeholder="Enter role name (e.g., Senior Developer, HR Manager)" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Role Description"
                rules={[
                  { required: true, message: "Please input role description!" },
                  {
                    min: 10,
                    message: "Description must be at least 10 characters!",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="Describe the role responsibilities and requirements..."
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                name="departmentId"
                label="Department"
                rules={[
                  { required: true, message: "Please select a department!" },
                ]}
              >
                <Select
                  placeholder={
                    selectedBranch
                      ? "Select department"
                      : "Please select branch first"
                  }
                  loading={deptLoading}
                  disabled={!selectedBranch}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {departments?.map((dept) => (
                    <Select.Option key={dept._id} value={dept._id}>
                      <div className="flex items-center">
                        <ApartmentOutlined className="mr-2" />
                        {dept.name} - {dept.isActive?"Activated":"Inactivated"}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                initialValue="Active"
                rules={[{ required: true, message: "Please select status!" }]}
              >
                <Select>
                  <Select.Option value="Active">
                    <Tag color="green" className="mr-2">
                      Active
                    </Tag>
                    Active - Role is available for assignment
                  </Select.Option>
                  <Select.Option value="Inactive">
                    <Tag color="orange" className="mr-2">
                      Inactive
                    </Tag>
                    Inactive - Role is temporarily disabled
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
          </Form>
        </Card>
      </Modal>
    </div>
  );
}