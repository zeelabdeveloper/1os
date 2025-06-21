import { useState } from "react";
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
  InputNumber,
} from "antd";
import { FiPlus, FiSearch, FiTrash2, FiEdit, FiSave } from "react-icons/fi";
import { FaExclamationCircle } from "react-icons/fa";

import {
  addCompanyBankAccounts,
  deleteCompanyBankAccounts,
  fetchCompanyBankAccounts,
  updateCompanyBankAccounts,
} from "../../api/auth";
import toast from "react-hot-toast";

// API base URL

// API functions

export default function BankAccountListPage() {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch accounts
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: fetchCompanyBankAccounts,
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    
    mutationFn: deleteCompanyBankAccounts,
    onSuccess: (data) => {
         
       queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
        toast.success(data.message || "Account deleted!");
    },
    onError: (error) => {
       
      toast.error(
        error.response?.data?.message ||
          "There was an error deleting the bank account."
      );
    },
  });

  // Add account mutation
  const addMutation = useMutation({
    mutationFn: addCompanyBankAccounts,
    
    onSuccess: (data) => {
     queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
        toast.success(data.message || "Account created!");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "There was an error adding the account."
      );
    },
  });

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: updateCompanyBankAccounts,
    onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
        toast.success(data.message || "Account Updated!");
      setEditingId(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "There was an error updating the account."
      );
    },
  });

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredAccounts = accounts?.filter(
    (account) =>
      account.accountHolder.toLowerCase().includes(searchText.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleAddAccount = () => {
    form.validateFields().then((values) => {
      addMutation.mutate(values);
    });
  };

  const handleEdit = (account) => {
    setEditingId(account._id);
    editForm.setFieldsValue(account);
  };

  const handleUpdate = (id) => {
    editForm.validateFields().then((values) => {
      updateMutation.mutate({ id, data: values });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const columns = [
    {
      title: "Account Holder",
      dataIndex: "accountHolder",
      key: "accountHolder",
      sorter: (a, b) => a.accountHolder.localeCompare(b.accountHolder),
      render: (text, record) =>
        editingId === record._id ? (
          <Form.Item
            name="accountHolder"
            initialValue={text}
            rules={[
              { required: true, message: "Please input account holder name!" },
            ]}
            className="mb-0"
          >
            <Input />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: "Account Number",
      dataIndex: "accountNumber",
      key: "accountNumber",
      sorter: (a, b) => a.accountNumber.localeCompare(b.accountNumber),
      render: (text, record) =>
        editingId === record._id ? (
          <Form.Item
            name="accountNumber"
            initialValue={text}
            rules={[
              { required: true, message: "Please input account number!" },
            ]}
            className="mb-0"
          >
            <Input disabled={true} />
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: "Balance (₹)",
      dataIndex: "balance",
      key: "balance",
      sorter: (a, b) => a.balance - b.balance,
      render: (text, record) =>
        editingId === record._id ? (
          <Form.Item
            name="balance"
            initialValue={text}
            rules={[{ required: true, message: "Please input balance!" }]}
            className="mb-0"
          >
            <InputNumber type="number" style={{ width: "100%" }} />
          </Form.Item>
        ) : (
          `₹${text.toLocaleString()}`
        ),
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      key: "accountType",
      sorter: (a, b) => a.accountType.localeCompare(b.accountType),
      render: (text, record) =>
        editingId === record._id ? (
          <Form.Item
            name="accountType"
            initialValue={text}
            rules={[{ required: true, message: "Please select account type!" }]}
            className="mb-0"
          >
            <Select>
              <Select.Option value="Savings">Savings</Select.Option>
              <Select.Option value="Current">Current</Select.Option>
              <Select.Option value="Fixed Deposit">Fixed Deposit</Select.Option>
              <Select.Option value="Recurring Deposit">
                Recurring Deposit
              </Select.Option>
            </Select>
          </Form.Item>
        ) : (
          text
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) =>
        editingId === record._id ? (
          <Form.Item name="status" initialValue={status} className="mb-0">
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
              <Select.Option value="Dormant">Dormant</Select.Option>
              <Select.Option value="Closed">Closed</Select.Option>
            </Select>
          </Form.Item>
        ) : (
          <Tag
            color={
              status === "Active"
                ? "green"
                : status === "Inactive"
                ? "orange"
                : status === "Dormant"
                ? "blue"
                : "red"
            }
          >
            {status}
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
                title="Delete Account"
                description="Are you sure you want to delete this bank account?"
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
        <h1 className="text-2xl font-bold text-gray-800">
          Bank Account Management
        </h1>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={editingId !== null}
        >
          Add Account
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search accounts..."
          prefix={<FiSearch className="text-gray-400" />}
          onChange={handleSearch}
          className="w-full md:w-1/3"
          allowClear
        />
      </div>

      <Form form={editForm} component={false}>
        <Table
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          className="shadow-sm rounded-lg overflow-hidden"
        />
      </Form>

      <Modal
        title="Add New Bank Account"
        open={isModalOpen}
        onOk={handleAddAccount}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={addMutation.isPending}
        okText="Add Account"
        okButtonProps={{ className: "bg-blue-600 hover:bg-blue-700" }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="accountHolder"
            label="Account Holder Name"
            rules={[
              { required: true, message: "Please input account holder name!" },
            ]}
          >
            <Input placeholder="Enter account holder name" />
          </Form.Item>
          <Form.Item
            name="accountNumber"
            label="Account Number"
            rules={[
              { required: true, message: "Please input account number!" },
              {
                pattern: /^\d{9,18}$/,
                message: "Account number must be 9-18 digits",
              },
            ]}
          >
            <Input placeholder="Enter account number" />
          </Form.Item>
          <Form.Item
            name="balance"
            label="Initial Balance (₹)"
            rules={[
              { required: true, message: "Please input initial balance!" },
            ]}
          >
            <InputNumber
            type="number"
              style={{ width: "100%" }}
              placeholder="Enter initial balance"
            />
          </Form.Item>
          <Form.Item
            name="accountType"
            label="Account Type"
            rules={[{ required: true, message: "Please select account type!" }]}
          >
            <Select placeholder="Select account type">
              <Select.Option value="Savings">Savings</Select.Option>
              <Select.Option value="Current">Current</Select.Option>
              <Select.Option value="Fixed Deposit">Fixed Deposit</Select.Option>
              <Select.Option value="Recurring Deposit">
                Recurring Deposit
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            initialValue="Active"
            rules={[{ required: true, message: "Please select status!" }]}
          >
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
              <Select.Option value="Dormant">Dormant</Select.Option>
              <Select.Option value="Closed">Closed</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
