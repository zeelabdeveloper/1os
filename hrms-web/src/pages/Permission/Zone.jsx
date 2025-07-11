import { useState, useMemo, useCallback, useEffect } from "react";
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
  message,
  Spin,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiEdit,
  FiSave,
  FiX,
  FiMapPin,
  FiUser,
} from "react-icons/fi";
import { FaExclamationCircle } from "react-icons/fa";

import * as api from "../../api/auth";

import toast from "react-hot-toast";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Reusable components
const ZoneStatusTag = ({ isActive }) => (
  <Tag color={isActive ? "green" : "red"}>
    {isActive ? "Active" : "Inactive"}
  </Tag>
);

const ZoneCodeTag = ({ code }) => <Tag color="geekblue">{code}</Tag>;

const BranchSelect = ({
  loading,
  branches,
  onDropdownToggle,
  value,
  onChange,
}) => (
  <Select
    showSearch
    placeholder="Select branch"
    optionFilterProp="children"
    onDropdownVisibleChange={onDropdownToggle}
    loading={loading}
    size="large"
    notFoundContent={loading ? <Spin size="small" /> : "No branches found"}
    value={value}
    onChange={onChange}
  >
    {branches.map((branch) => (
      <Select.Option key={branch._id} value={branch._id}>
        {branch.name} ({branch.code})
      </Select.Option>
    ))}
  </Select>
);

const EmployeeSelect = ({ loading, employees, onSearch, value, onChange }) => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    onSearch?.(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  const filteredEmployees = useMemo(() => {
    if (!debouncedSearch) return employees;
    return employees.filter(
      (emp) =>
        emp.employeeId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        emp.fullName.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [employees, debouncedSearch]);

  return (
    <Select
      showSearch
      placeholder="Select zone head"
      optionFilterProp="children"
      onSearch={setSearchText}
      loading={loading}
      size="large"
      suffixIcon={<FiUser />}
      notFoundContent={loading ? <Spin size="small" /> : "No employees found"}
      value={value}
      onChange={onChange}
    >
      {filteredEmployees.map((emp) => (
        <Select.Option key={emp._id} value={emp._id}>
          {emp?.firstName} ({emp?.EmployeeId?.employeeId})
        </Select.Option>
      ))}
    </Select>
  );
};

const ActionButtons = ({
  record,
  editingId,
  updateLoading,
  deleteLoading,
  onEditStart,
  onEditCancel,
  onUpdate,
  onDelete,
}) => (
  <div className="flex gap-2">
    {editingId === record._id ? (
      <>
        <Button
          icon={<FiSave />}
          onClick={() => onUpdate(record._id)}
          loading={updateLoading}
          type="primary"
        />
        <Button icon={<FiX />} onClick={onEditCancel} danger />
      </>
    ) : (
      <>
        <Button
          icon={<FiEdit />}
          onClick={() => onEditStart(record)}
          disabled={editingId !== null}
        />
        <Popconfirm
          title="Delete Zone"
          description="Are you sure to delete this zone?"
          icon={<FaExclamationCircle style={{ color: "red" }} />}
          onConfirm={() => onDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            icon={<FiTrash2 />}
            danger
            disabled={editingId !== null || deleteLoading}
            loading={deleteLoading}
          />
        </Popconfirm>
      </>
    )}
  </div>
);

const ZoneModal = ({
  visible,
  onOk,
  onCancel,
  confirmLoading,
  form,
  branches,
  employees,
  isBranchesLoading,
  isEmployeesLoading,
  onBranchDropdownToggle,
  onEmployeeSearch,
}) => (
  <Modal
    title="Add New Zone"
    open={visible}
    onOk={onOk}
    onCancel={onCancel}
    confirmLoading={confirmLoading}
    okText="Add Zone"
    cancelText="Cancel"
    width={600}
    centered
    destroyOnClose
  >
    <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
      <Form.Item
        name="name"
        label="Zone Name"
        rules={[
          { required: true, message: "Name required" },
          { min: 3, message: "Minimum 3 characters" },
        ]}
      >
        <Input
          prefix={<FiMapPin />}
          placeholder="e.g. North Zone"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="code"
        label="Zone Code"
        rules={[{ required: true, message: "Code required" }]}
      >
        <Input
          placeholder="e.g. NZ"
          size="large"
          style={{ textTransform: "uppercase" }}
        />
      </Form.Item>
      <Form.Item
        name="branch"
        label="Branch"
        rules={[{ required: true, message: "Branch required" }]}
      >
        <BranchSelect
          loading={isBranchesLoading}
          branches={branches}
          onDropdownToggle={onBranchDropdownToggle}
        />
      </Form.Item>
      <Form.Item name="head" label="Zone Head">
        <EmployeeSelect
          loading={isEmployeesLoading}
          employees={employees}
          onSearch={onEmployeeSearch}
        />
      </Form.Item>
      <Form.Item name="isActive" label="Status">
        <Select size="large">
          <Select.Option value={true}>Active</Select.Option>
          <Select.Option value={false}>Inactive</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  </Modal>
);

const ZoneManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // API queries
  const { data: zones = [], isLoading: isZonesLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: api.fetchZones,
    select: (data) => data?.data || [],
    onError: (err) =>
      toast.error(err.response.data.message || "Failed to load zones"),
  });

  const { data: branches = [], isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: api.fetchBranches,
    enabled: branchDropdownOpen,
    select: (data) => data || [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: api.fetchEmployees,
    select: (data) => data?.data || [],
  });

  // Debounced search
  const debouncedSearch = useDebounce(searchText, 300);

  // Memoized filtered zones
  const filteredZones = useMemo(() => {
    if (!debouncedSearch) return zones;
    const searchLower = debouncedSearch.toLowerCase();
    return zones.filter(
      (zone) =>
        zone.name.toLowerCase().includes(searchLower) ||
        zone.code.toLowerCase().includes(searchLower) ||
        zone.branch?.name.toLowerCase().includes(searchLower)
    );
  }, [zones, debouncedSearch]);

  // Mutations
  const addMutation = useMutation({
    mutationFn: api.addZone,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["zones"]);
      toast.success(data.message || "Zone added");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) =>
      toast.error(err.response.data.message || "Failed to create zone"),
  });

  const updateMutation = useMutation({
    mutationFn: api.updateZone,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["zones"]);
      message.success(data.message || "Zone updated");
      setEditingId(null);
      form.resetFields();
    },
    onError: (err) =>
      toast.error(err.response.data.message || "Failed to update zone"),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteZone,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["zones"]);
      message.success(data.message || "Zone deleted");
    },
    onError: (err) =>
      toast.error(err.response.data.message || "Failed to delete zone"),
  });

  // Handlers
  const handleSearch = useCallback((e) => setSearchText(e.target.value), []);

  const handleAdd = useCallback(() => {
    form.validateFields().then((values) => addMutation.mutate(values));
  }, [form, addMutation]);

  const handleUpdate = useCallback(
    (id) => {
      form
        .validateFields()
        .then((values) => updateMutation.mutate({ id, ...values }));
    },
    [form, updateMutation]
  );

  const handleDelete = useCallback(
    (id) => deleteMutation.mutate(id),
    [deleteMutation]
  );

  const handleEditStart = useCallback(
    (record) => {
      setEditingId(record._id);
      form.setFieldsValue({
        ...record,
        branch: record.branch?._id,
        head: record.head?._id,
      });
    },
    [form]
  );

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    form.resetFields();
  }, [form]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleEmployeeSearch = useCallback(
    (search) => {
      queryClient.invalidateQueries(["employees"]);
    },
    [queryClient]
  );

  // Memoized columns
  const columns = useMemo(
    () => [
      {
        title: "Code",
        dataIndex: "code",
        render: (text, record) =>
          editingId === record._id ? (
            <Form.Item
              name="code"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input style={{ width: 120 }} />
            </Form.Item>
          ) : (
            <ZoneCodeTag code={text} />
          ),
      },
      {
        title: "Name",
        dataIndex: "name",
        render: (text, record) =>
          editingId === record._id ? (
            <Form.Item
              name="name"
              rules={[
                { required: true, message: "Required" },
                { min: 3, message: "Minimum 3 characters" },
              ]}
            >
              <Input />
            </Form.Item>
          ) : (
            text
          ),
      },
      {
        title: "Branch",
        dataIndex: "branch",
        render: (branch, record) =>
          editingId === record._id ? (
            <Form.Item name="branch" rules={[{ required: true }]}>
              <BranchSelect
                loading={isBranchesLoading}
                branches={branches}
                onDropdownToggle={setBranchDropdownOpen}
              />
            </Form.Item>
          ) : (
            `${branch?.name} (${branch?.code})`
          ),
      },
      {
        title: "Head",
        dataIndex: "head",
        render: (head, record) =>
          editingId === record._id ? (
            <Form.Item name="head">
              <EmployeeSelect
                loading={isEmployeesLoading}
                employees={employees}
                onSearch={handleEmployeeSearch}
              />
            </Form.Item>
          ) : (
            (head?.EmployeeId && head?.firstName) || "-"
          ),
      },
      {
        title: "Status",
        dataIndex: "isActive",
        render: (isActive, record) =>
          editingId === record._id ? (
            <Form.Item name="isActive">
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          ) : (
            <ZoneStatusTag isActive={isActive} />
          ),
      },
      {
        title: "Actions",
        render: (_, record) => (
          <ActionButtons
            record={record}
            editingId={editingId}
            updateLoading={updateMutation.isLoading}
            deleteLoading={
              deleteMutation.isLoading &&
              deleteMutation.variables === record._id
            }
            onEditStart={handleEditStart}
            onEditCancel={handleEditCancel}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [
      editingId,
      form,
      isBranchesLoading,
      isEmployeesLoading,
      branches,
      employees,
      handleEditStart,
      handleEditCancel,
      handleUpdate,
      handleDelete,
      updateMutation.isLoading,
      deleteMutation.isLoading,
      deleteMutation.variables,
      handleEmployeeSearch,
    ]
  );

  return (
    <div className="p-4 h-[92vh] overflow-y-auto bg-white rounded-lg shadow">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Zones</h1>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setIsModalOpen(true)}
          size="large"
        >
          Add
        </Button>
      </div>

      <Input
        placeholder="Search zones..."
        prefix={<FiSearch />}
        onChange={handleSearch}
        className="mb-6 max-w-md"
        size="large"
        allowClear
      />

      <Form form={form} component={false}>
        <Table
          columns={columns}
          dataSource={filteredZones}
          rowKey="_id"
          loading={isZonesLoading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} zones`,
          }}
          bordered
        />
      </Form>

      <ZoneModal
        visible={isModalOpen}
        onOk={handleAdd}
        onCancel={handleModalClose}
        confirmLoading={addMutation.isLoading}
        form={form}
        branches={branches}
        employees={employees}
        isBranchesLoading={isBranchesLoading}
        isEmployeesLoading={isEmployeesLoading}
        onBranchDropdownToggle={setBranchDropdownOpen}
        onEmployeeSearch={handleEmployeeSearch}
      />
    </div>
  );
};

export default ZoneManagement;