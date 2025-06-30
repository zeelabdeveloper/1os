import React from 'react';
import { Form, Input, Button, Drawer, message, Select, Row, Col, Switch } from 'antd';
import { useCreateStore, useUpdateStore, useStores } from '../../hooks/useStores';

const { Option } = Select;

const StoreForm = ({ visible, onClose, editStoreId }) => {
  const [form] = Form.useForm();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const { data: stores } = useStores();

  React.useEffect(() => {
    if (editStoreId && stores) {
      const storeToEdit = stores.find((store) => store._id === editStoreId);
      if (storeToEdit) {
        form.setFieldsValue({
          storeCode: storeToEdit.storeCode,
          storeId: storeToEdit.storeId,
          storeName: storeToEdit.storeName,
          storeAddress: storeToEdit.storeAddress,
          city: storeToEdit.city,
          district: storeToEdit.district,
          state: storeToEdit.state,
          pincode: storeToEdit.pincode,
          gstNumber: storeToEdit.gstNumber,
          panNumber: storeToEdit.panNumber,
          dlNumber: storeToEdit.dlNumber,
          fssaiNumber: storeToEdit.fssaiNumber,
          contactPerson: storeToEdit.contactPerson,
          contactNumber: storeToEdit.contactNumber,
          email: storeToEdit.email,
          storeGroup: storeToEdit.storeGroup,
          isActive: storeToEdit.isActive
        });
      }
    } else {
      form.resetFields();
    }
  }, [editStoreId, stores, form]);

  const onFinish = async (values) => {
    try {
      if (editStoreId) {
        await updateStore.mutateAsync({ id: editStoreId, storeData: values });
      } else {
        await createStore.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Drawer
      title={editStoreId ? 'Edit Store' : 'Add New Store'}
      width={720}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={createStore.isLoading || updateStore.isLoading}
          >
            {editStoreId ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="storeCode"
              label="Store Code"
              rules={[{ required: true, message: 'Please enter store code' }]}
            >
              <Input placeholder="Enter store code" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="storeId"
              label="Store ID"
            >
              <Input placeholder="Enter store ID" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="storeName"
              label="Store Name"
            >
              <Input placeholder="Enter store name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactNumber"
              label="Contact Number"
              rules={[{ required: true, message: 'Please enter contact number' }]}
            >
              <Input placeholder="Enter contact number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="storeAddress"
          label="Store Address"
        >
          <Input.TextArea rows={2} placeholder="Enter store address" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="city"
              label="City"
            >
              <Input placeholder="Enter city" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="district"
              label="District"
            >
              <Input placeholder="Enter district" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="state"
              label="State"
            >
              <Input placeholder="Enter state" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="pincode"
              label="Pincode"
            >
              <Input placeholder="Enter pincode" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              label="Contact Person"
            >
              <Input placeholder="Enter contact person name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gstNumber"
              label="GST Number"
            >
              <Input placeholder="Enter GST number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="panNumber"
              label="PAN Number"
            >
              <Input placeholder="Enter PAN number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dlNumber"
              label="Drug License Number"
            >
              <Input placeholder="Enter DL number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="fssaiNumber"
              label="FSSAI Number"
            >
              <Input placeholder="Enter FSSAI number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default StoreForm;