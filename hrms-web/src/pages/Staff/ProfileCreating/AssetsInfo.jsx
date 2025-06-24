import React, { memo } from "react";
import { Form, Input, DatePicker, Button, Divider, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const AssetInfo = memo(() => (
  <div className="p-4">
    <Divider orientation="left">Assets Information</Divider>
    <Form.List name={["assets"]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <div key={key} className="mb-6 p-4 border rounded">
              <Form.Item
                {...restField}
                name={[name, "name"]}
                label="Asset Name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input placeholder="e.g., MacBook Pro, Toyota Car" />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "price"]}
                label="Price (₹)"
                rules={[{ required: true, message: "Price is required" }]}
              >
                <InputNumber 
                  style={{ width: "100%" }}
                  min={0}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  placeholder="e.g., 75,000"
                />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "quantity"]}
                label="Quantity"
                initialValue={1}
                rules={[{ required: true, message: "Quantity is required" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "purchaseDate"]}
                label="Purchase Date"
                rules={[{ required: true, message: "Date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Button
                type="primary"
                danger
                onClick={() => remove(name)}
                className="mt-2"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="dashed"
            onClick={() => add()}
            block
            icon={<PlusOutlined />}
          >
            Add Asset
          </Button>
        </>
      )}
    </Form.List>
  </div>
));

export default AssetInfo;