import React, { memo } from "react";
import { Form, Input, Select, Divider, DatePicker } from "antd";

const { Option } = Select;

const CreateBasicInfo = memo(
  ({ form, roles, managers, selectedRole, setSelectedRole }) => {
    return (
      <div className="p-4">
        <Divider orientation="left">Personal Information</Divider>
        <Form.Item
          name={["user", "firstName"]}
          label="First Name"
          rules={[{ required: true, message: "Please input first name!" }]}
        >
          <Input placeholder="First Name" />
        </Form.Item>
        <Form.Item
          name={["user", "lastName"]}
          label="Last Name"
          rules={[{ required: true, message: "Please input last name!" }]}
        >
          <Input placeholder="Last Name" />
        </Form.Item>
        <Form.Item
          name={["user", "email"]}
          label="Email"
          rules={[
            { required: true, message: "Please input email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name={["user", "password"]}
          label="Password"
          rules={[
            { required: true, message: "Please input password!" },
            { min: 8, message: "Password must be at least 8 characters!" },
          ]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item
          name={["user", "contactNumber"]}
          label="Phone Number"
          rules={[
            {
              pattern: /^\d{10}$/,
              message: "Please enter 10 digit phone number!",
            },
          ]}
        >
          <Input placeholder="Phone Number" />
        </Form.Item>

        <Divider orientation="left">Role & Reporting</Divider>
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select role!" }]}
        >
          <Select
            placeholder="Select Role"
            onChange={(value) => {
              setSelectedRole(value);
              form.setFieldsValue({ reportingTo: null });
            }}
          >
            {roles?.map((role) => (
              <Option key={role._id} value={role._id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="reportingTo"
          label="Reporting To"
          rules={[{ required: true, message: "Please select manager!" }]}
        >
          <Select placeholder="Select Manager" disabled={!selectedRole}>
            {managers?.map((manager) => (
              <Option key={manager._id} value={manager._id}>
                {`${manager.user.firstName} ${manager.user.lastName}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          rules={[
            { required: true, message: "Please select Date Of Joining!" },
          ]}
          name={["user", "dateOfJoining"]}
          label="Date of Join"
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </div>
    );
  }
);

export default CreateBasicInfo;