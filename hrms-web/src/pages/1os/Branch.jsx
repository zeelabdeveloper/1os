import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Input, Button, Modal, Form, Popconfirm, Tag } from "antd";
import { FiPlus, FiSearch, FiTrash2, FiEdit, FiSave } from "react-icons/fi";
import { FaExclamationCircle } from "react-icons/fa";
import {
  addBranch,
  deleteBranch,
  fetchBranches,
  updateBranch,
} from "../../api/auth";
import toast from "react-hot-toast";

const BranchManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch branches
  const {
    data: branches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    onError: (error) => toast.error(error.message),
  });


  // Memoized filtered branches
  const filteredBranches = useMemo(() => {
    return branches?.filter(
      (branch) =>
        branch.name.toLowerCase().includes(searchText.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [branches, searchText]);

  // Add branch mutation
  const addMutation = useMutation({
    mutationFn: addBranch,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["branches"]);

      toast.success(data.message || "Branch added successfully");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) =>
      toast.error(err.response.data.message || "Error adding branch"),
  });

  // Update branch mutation
  const updateMutation = useMutation({
    mutationFn: updateBranch,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["branches"]);
      toast.success(data.message || "Branch updated successfully");
      setEditingId(null);
    },
    onError: (err) =>
      toast.error(err.response.data.message || "Error update branch"),
  });

  // Delete branch mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["branches"]);
      toast.success(data.message || "Branch deleted successfully");
    },
    onError: (err) =>
      toast.error(err.response.data.message || "Error delete branch"),
  });

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      {
        title: "Branch Code",
        dataIndex: "code",
        key: "code",
        render: (text, record) =>
          editingId === record._id ? (
            <Form.Item
              name="code"
              initialValue={text}
              rules={[{ required: true, message: "Code is required" }]}
            >
              <Input />
            </Form.Item>
          ) : (
            <Tag color="blue">{text}</Tag>
          ),
      },
      {
        title: "Branch Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) =>
          editingId === record._id ? (
            <Form.Item
              name="name"
              initialValue={text}
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>
          ) : (
            text
          ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <div className="flex gap-2">
            {editingId === record._id ? (
              <>
                <Button
                  icon={<FiSave />}
                  onClick={() => handleUpdate(record._id)}
                  loading={updateMutation.isLoading}
                />
                <Button icon={<FiEdit />} onClick={() => setEditingId(null)} />
              </>
            ) : (
              <>
                <Button
                  icon={<FiEdit />}
                  onClick={() => {
                    setEditingId(record._id);
                    form.setFieldsValue(record);
                  }}
                  disabled={editingId !== null}
                />
                <Popconfirm
                  title="Delete Branch"
                  description="Are you sure?"
                  icon={<FaExclamationCircle className="text-red-500" />}
                  onConfirm={() => handleDelete(record._id)}
                >
                  <Button
                    icon={<FiTrash2 />}
                    danger
                    disabled={editingId !== null}
                  />
                </Popconfirm>
              </>
            )}
          </div>
        ),
      },
    ],
    [editingId, updateMutation.isLoading, form]
  );

  // Callbacks for handlers to maintain referential equality
  const handleAdd = useCallback(() => {
    form.validateFields().then((values) => {
      addMutation.mutate(values);
    });
  }, [form, addMutation]);

  const handleUpdate = useCallback(
    (id) => {
      form.validateFields().then((values) => {
        updateMutation.mutate({ id, ...values });
      });
    },
    [form, updateMutation]
  );

  const handleDelete = useCallback(
    (id) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleSearch = useCallback((e) => {
    setSearchText(e.target.value);
  }, []);

  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Branch Management</h1>
        <Button type="primary" icon={<FiPlus />} onClick={handleModalOpen}>
          Add Branch
        </Button>
      </div>

      <Input
        placeholder="Search branches..."
        prefix={<FiSearch />}
        onChange={handleSearch}
        className="mb-4"
      />

      <Form form={form} component={false}>
        <Table
          columns={columns}
          dataSource={filteredBranches}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Form>

      <Modal
        title="Add New Branch"
        open={isModalOpen}
        onOk={handleAdd}
        onCancel={handleModalClose}
        confirmLoading={addMutation.isLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Branch Code"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Branch Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BranchManagement;
