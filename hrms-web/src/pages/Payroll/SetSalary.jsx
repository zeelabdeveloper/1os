import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Row, 
  Col, 
  Divider,
  message 
} from "antd";
import { 
  SaveOutlined, 
  UserOutlined, 
  DollarOutlined,
  CalculatorOutlined 
} from "@ant-design/icons";

const { Option } = Select;

function SetSalary() {
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState(null);
  const queryClient = useQueryClient();

  const salaryMutation = useMutation({
    mutationFn: (values) => axios.post("/api/salary", values),
    onSuccess: () => {
      message.success("Salary data saved successfully!");
      queryClient.invalidateQueries("salaries");
      form.resetFields();
      setSelectedRole(null);
    },
    onError: () => {
      message.error("Failed to save salary data");
    },
  });

  const onFinish = (values) => {
    salaryMutation.mutate(values);
  };

  const onRoleChange = (value) => {
    setSelectedRole(value);
    if (value) {
      form.setFieldsValue({ empCode: undefined });
    }
  };

  return (
    <div className="h-[92vh] overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title={
            <div className="flex items-center">
              <CalculatorOutlined className="mr-2" />
              <span>Salary Upload Form</span>
            </div>
          }
          bordered={false}
          className="shadow-md"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true, message: "Please select role!" }]}
                >
                  <Select
                    placeholder="Select role"
                    onChange={onRoleChange}
                    allowClear
                  >
                    <Option value="manager">Manager</Option>
                    <Option value="developer">Developer</Option>
                    <Option value="designer">Designer</Option>
                    <Option value="hr">HR</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="empCode"
                  label="Employee Code"
                  rules={[
                    { 
                      required: !selectedRole, 
                      message: "Please select employee code!" 
                    }
                  ]}
                >
                  <Select
                    placeholder="Select employee code"
                    disabled={!!selectedRole}
                    showSearch
                    optionFilterProp="children"
                  >
                    <Option value="E1001">E1001</Option>
                    <Option value="E1002">E1002</Option>
                    <Option value="E1003">E1003</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            

            <Divider orientation="left">Salary Components</Divider>
            
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item 
                  name="basic" 
                  label="Basic Salary"
                  rules={[{ required: true, message: "Please input basic salary!" }]}
                >
                  <Input type="number" prefix={<DollarOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="hra" label="H.R.A">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="conveyance" label="Conveyance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="medical" label="Medical">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="otherAllo" label="Other Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="totalSalary" label="Total Salary">
                  <Input type="number"  disabled />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Deductions</Divider>
            
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="advance" label="Advance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="pf" label="PF">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="esi" label="ESI">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="lpd" label="L.P.D">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="otherDeduction" label="Other Deduction">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="tds" label="T.D.S">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="lwf" label="L.W.F">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="deduction" label="Total Deduction">
                  <Input type="number" value={0} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="netPay" label="Net Pay">
                  <Input type="number" disabled />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="text-right">
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={salaryMutation.isPending}
              >
                Save Salary
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}

export default SetSalary;