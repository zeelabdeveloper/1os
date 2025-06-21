import React, { memo } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Divider,
  Select,
  Switch,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
const { TextArea } = Input;

const WorkExperience = memo(() => (
  <div className="p-4">
    <Divider orientation="left">Work Experience</Divider>
    <Form.List name={["experiences"]}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <div key={key} className="mb-6 p-4 border rounded">
              <Form.Item
                {...restField}
                name={[name, "companyName"]}
                label="Company Name"
                rules={[{ required: true, message: "Company name is required" }]}
              >
                <Input placeholder="e.g., Google" />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "jobTitle"]}
                label="Job Title"
                rules={[{ required: true, message: "Job title is required" }]}
              >
                <Input placeholder="e.g., Software Engineer" />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "employmentType"]}
                label="Employment Type"
                rules={[{ required: true, message: "Employment type is required" }]}
              >
                <Select placeholder="Select type">
                  <Select.Option value="full-time">Full-time</Select.Option>
                  <Select.Option value="part-time">Part-time</Select.Option>
                  <Select.Option value="contract">Contract</Select.Option>
                  <Select.Option value="internship">Internship</Select.Option>
                  <Select.Option value="freelance">Freelance</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "location"]}
                label="Location"
              >
                <Input placeholder="e.g., Bangalore, India" />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "startDate"]}
                label="Start Date"
                rules={[{ required: true, message: "Start date is required" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "endDate"]}
                label="End Date"
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              

              <Form.Item
                {...restField}
                name={[name, "description"]}
                label="Description"
              >
                <TextArea rows={3} placeholder="Describe your role/responsibilities" />
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
            Add Experience
          </Button>
        </>
      )}
    </Form.List>
  </div>
));

export default WorkExperience;
