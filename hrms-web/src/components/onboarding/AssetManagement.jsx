import React, { memo, useState } from "react";
import {
  Form,
  Button,
  Divider,
  Input,
  InputNumber,
  DatePicker,
  message,
  Table,
  Modal,
  Spin,
  Drawer,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const AssetManagement = memo(() => {
  const [form] = Form.useForm();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const queryClient = useQueryClient();
  
  const getCandidateIdFromUrl = () => {
    const query = new URLSearchParams(window.location.search);
    return query.get("id");
  };

  // Fetch assets
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/v1/assets/my-assets/${getCandidateIdFromUrl()}`
      );
      return data.data;
    },
    onError: () => toast.error("Failed to load assets"),
  });

  // Save assets
  const { mutate: saveAssets, isPending: isSaving } = useMutation({
    mutationFn: async (assetData) => {
      if (editingAsset) {
        assetData.id = editingAsset._id;
      }
      const url = "/api/v1/assets";
      const method = "post";

      const { data } = await axios[method](url, assetData);
      return data;
    },
    onSuccess: () => {
      toast.success(
        `Asset ${editingAsset ? "updated" : "added"} successfully`
      );
      queryClient.invalidateQueries(["assets"]);
      setIsDrawerVisible(false);
      form.resetFields();
      setEditingAsset(null);
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to save asset");
    },
  });

  // Delete asset
  const { mutate: deleteAsset } = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/v1/assets/${id}`);
    },
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      queryClient.invalidateQueries(["assets"]);
    },
    onError: () => {
      toast.error("Failed to delete asset");
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const assetData = {
        applicationId: getCandidateIdFromUrl(),
        name: values.name,
        price: values.price,
        quantity: values.quantity,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : null,
      };

      saveAssets(assetData);
    } catch (error) {
      message.error("Please fill all required fields");
    }
  };

  const openEditDrawer = (asset = null) => {
    setEditingAsset(asset);
    if (asset) {
      form.setFieldsValue({
        name: asset.name,
        price: asset.price,
        quantity: asset.quantity,
        purchaseDate: asset.purchaseDate ? dayjs(asset.purchaseDate) : null,
      });
    } else {
      form.resetFields();
    }
    setIsDrawerVisible(true);
  };

  const columns = [
    {
      title: "Asset Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price.toLocaleString()}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Purchase Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteAsset(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Spin spinning={isLoading}>
        <div className="">
          <Divider orientation="left">Asset Management</Divider>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openEditDrawer()}
          >
            Add New Asset
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={assets}
          rowKey="_id"
          className="mt-4"
          pagination={{ pageSize: 5 }}
        />
        
        {/* Edit/Add Drawer */}
        <Drawer
          title={editingAsset ? "Edit Asset" : "Add New Asset"}
          placement="right"
          width={600}
          onClose={() => {
            setIsDrawerVisible(false);
            form.resetFields();
            setEditingAsset(null);
          }}
          open={isDrawerVisible}
          closable={false}
          extra={
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setIsDrawerVisible(false);
                form.resetFields();
                setEditingAsset(null);
              }}
            />
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Asset Name"
              rules={[
                { required: true, message: "Asset name is required" },
                { max: 100, message: "Maximum 100 characters allowed" },
              ]}
            >
              <Input placeholder="Enter asset name" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price (₹)"
              rules={[
                { required: true, message: "Price is required" },
                { type: "number", min: 0, message: "Price must be positive" },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                placeholder="Enter price"
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[
                { required: true, message: "Quantity is required" },
                { type: "number", min: 1, message: "Minimum quantity is 1" },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="Enter quantity"
              />
            </Form.Item>

            <Form.Item
              name="purchaseDate"
              label="Purchase Date"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Button
              type="primary"
              onClick={handleSubmit}
              block
              loading={isSaving}
              className="mt-4"
            >
              {editingAsset ? "Update Asset" : "Save Asset"}
            </Button>
          </Form>
        </Drawer>
      </Spin>
    </div>
  );
});

export default AssetManagement;