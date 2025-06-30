import React from "react";
import { Table, Space, Button, Tag, Popconfirm, message, Spin } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SyncOutlined
} from "@ant-design/icons";
import { useDeleteStore, useStores } from "../../hooks/useStores";
 
const StoreList = ({ setEditStoreId, showDrawer }) => {
  const { data: stores, isLoading, isError, error, refetch } = useStores();
  const deleteStoreMutation = useDeleteStore();

  const handleDelete = (id) => {
    deleteStoreMutation.mutate(id);
  };

  const columns = [
    {
      title: "Store Code",
      dataIndex: "storeCode",
      key: "storeCode",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Store Name",
      dataIndex: "storeName",
      key: "storeName",
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <span>
          {record.city}, {record.district}, {record.state} - {record.pincode}
        </span>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div>{record.contactPerson}</div>
          <div>{record.contactNumber}</div>
          {record.email && <div>{record.email}</div>}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditStoreId(record._id);
              showDrawer();
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this store?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) return <Spin size="large" />;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditStoreId(null);
              showDrawer();
            }}
          >
            Add Store
          </Button>
          <Button icon={<SyncOutlined />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={Array.isArray(stores) ? stores : []}
        rowKey="_id"
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
      />
    </div>
  );
};

export default StoreList;