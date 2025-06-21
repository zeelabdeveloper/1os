import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  Card,
  Typography,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { City, State } from "country-state-city";

const { Title } = Typography;
const { Option } = Select;

const Store = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const queryClient = useQueryClient();

  // Fetch all stores
  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/stores");
      return response.data;
    },
  });

  // Fetch store groups
  const { data: storeGroups } = useQuery({
    queryKey: ["storeGroups"],
    queryFn: async () => {
      const response = await axios.get("/api/v1/stores/store-groups");
      return response.data;
    },
  });

  // Load states on component mount
  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
  }, []);

  // Handle state change
  const handleStateChange = (value) => {
    setSelectedState(value);
    const stateCities = City.getCitiesOfState("IN", value);
    setCities(stateCities);
    form.setFieldsValue({ city: undefined, district: undefined });
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values) => {
      const response = await axios.post("/api/v1/stores", values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      toast.success("Store created successfully");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create store");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const response = await axios.put(`/api/v1/stores/${id}`, values);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      toast.success("Store updated successfully");
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      setSelectedState("");
      setCities([]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update store");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/v1/stores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
      toast.success("Store deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete store");
    },
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        updateMutation.mutate({ id: editingId, values });
      } else {
        createMutation.mutate(values);
      }
    });
  };

  const handleEdit = (record) => {
    setEditingId(record._id);

    // Set state and cities for the record being edited
    const stateCode = states.find((s) => s.name === record.state)?.isoCode;
    if (stateCode) {
      setSelectedState(stateCode);
      const stateCities = City.getCitiesOfState("IN", stateCode);
      setCities(stateCities);
    }

    form.setFieldsValue({
      ...record,
      storeGroup: record.storeGroup._id,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingId(null);
    setSelectedState("");
    setCities([]);
  };

  const columns = [
    {
      title: "Store Code",
      dataIndex: "storeCode",
      key: "storeCode",
    },
    {
      title: "Store Name",
      dataIndex: "storeName",
      key: "storeName",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Store Group",
      dataIndex: ["storeGroup", "name"],
      key: "storeGroup",
    },
    {
      title: "Contact",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete this store?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <Card>
        <Title level={4}>Stores</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ marginBottom: 16 }}
        >
          Add Store
        </Button>

        <Table
          columns={columns}
          dataSource={stores}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? "Edit Store" : "Add Store"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="storeCode"
                label="Store Code"
                rules={[{ required: true, message: "Please enter store code" }]}
              >
                <Input placeholder="Enter store code" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="storeId" label="Store ID">
                <Input placeholder="Enter store ID" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="storeName"
                label="Store Name"
                rules={[{ required: true, message: "Please enter store name" }]}
              >
                <Input placeholder="Enter store name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="storeGroup"
                label="Store Group"
                rules={[
                  { required: true, message: "Please select store group" },
                ]}
              >
                <Select placeholder="Select store group">
                  {storeGroups?.map((group) => (
                    <Option key={group._id} value={group._id}>
                      {group.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="storeAddress"
            label="Store Address"
            rules={[{ required: true, message: "Please enter store address" }]}
          >
            <Input.TextArea rows={3} placeholder="Enter store address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "Please select state" }]}
              >
                <Select
                  showSearch
                  placeholder="Select state"
                  onChange={handleStateChange}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {states.map((state) => (
                    <Option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: "Please select city" }]}
              >
                <Select
                  showSearch
                  placeholder="Select city"
                  disabled={!selectedState}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {cities.map((city) => (
                    <Option key={city.name} value={city.name}>
                      {city.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="pincode"
                label="Pincode"
                rules={[{ required: true, message: "Please enter pincode" }]}
              >
                <Input placeholder="Enter pincode" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="contactPerson" label="Contact Person">
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[
                  { required: true, message: "Please enter contact number" },
                ]}
              >
                <Input placeholder="Enter contact number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Invalid email format" }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gstNumber" label="GST Number">
                <Input placeholder="Enter GST number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="panNumber" label="PAN Number">
                <Input placeholder="Enter PAN number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dlNumber" label="Drug License No.">
                <Input placeholder="Enter DL number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="fssaiNumber" label="FSSAI Number">
                <Input placeholder="Enter FSSAI number" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Store;
