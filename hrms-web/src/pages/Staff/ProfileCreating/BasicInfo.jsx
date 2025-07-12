import React, { memo } from "react";
import { Form, Input, Select, Divider, DatePicker } from "antd";

const { Option } = Select;

const CreateBasicInfo = memo(
  ({
    form,
    managers,
    isCocoStaff,
    branches,
    departments,
    zones,
    roles,
    selectedBranch,
    selectedDepartment,
    setSelectedBranch,
    setSelectedDepartment,
  }) => {
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
        <>
          <Divider orientation="left">Organization Details</Divider>
          <Form.Item
            name={["organization", "branch"]}
            label="Branch"
            rules={[{ required: true, message: "Please select branch!" }]}
          >
            <Select
              placeholder="Select Branch"
              onChange={(value) => {
                setSelectedBranch(value);
                setSelectedDepartment(null);
                form.setFieldsValue({
                  organization: {
                    department: null,
                    role: null,
                  },
                });
              }}
            >
              {branches?.map((branch) => (
                <Option key={branch._id} value={branch._id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={["organization", "department"]}
            label="Department"
            rules={[{ required: true, message: "Please select department!" }]}
          >
            <Select
              placeholder="Select Department"
              disabled={!selectedBranch}
              onChange={(value) => {
                setSelectedDepartment(value);
                form.setFieldsValue({
                  organization: {
                    role: null,
                  },
                });
              }}
            >
              {departments?.map((dept) => (
                <Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name={["organization", "zone"]}
            label={
              <p>
                {" "}
                Zone*{" "}
                <span className="text-[9px] text-orange-500">
                  Only For Store Side
                </span>{" "}
              </p>
            }
          >
            <Select placeholder="Select Zone" disabled={!selectedBranch}>
              {zones?.map((dept) => (
                <Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={["organization", "role"]}
            label="Role"
            rules={[{ required: true, message: "Please select role!" }]}
          >
            <Select placeholder="Select Role" disabled={!selectedDepartment}>
              {roles?.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.name}
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
        </>
        {isCocoStaff && (
          <Form.Item
            name={["user", "reportingto"]}
            label="Reporting To"
            rules={[{ required: true, message: "Please select Reporter!" }]}
          >
            <Select placeholder="Select Reporter">
              {managers?.data?.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role?.firstName} {role?.EmployeeId?.employeeId}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </div>
    );
  }
);

export default CreateBasicInfo;
