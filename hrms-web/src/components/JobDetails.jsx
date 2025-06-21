import React from 'react';
import { Descriptions, Tag, Divider, Space } from 'antd';
import MDEditor from '@uiw/react-markdown-editor';

const JobDetails = ({ job }) => {
  if (!job) return null;

  return (
    <div>
      <Descriptions title="Basic Information" bordered column={1}>
        <Descriptions.Item label="Title">{job.title}</Descriptions.Item>
        <Descriptions.Item label="Location">{job.location}</Descriptions.Item>
        <Descriptions.Item label="Branch">{job.branch?.name}</Descriptions.Item>
        <Descriptions.Item label="Department">{job.department?.name}</Descriptions.Item>
        <Descriptions.Item label="Role">{job.role?.name}</Descriptions.Item>
        <Descriptions.Item label="Experience">
          <Tag color="blue">{job.experience}</Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Salary</Divider>
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Min Salary">
          {job.salary?.min} {job.salary?.currency}
        </Descriptions.Item>
        <Descriptions.Item label="Max Salary">
          {job.salary?.max} {job.salary?.currency}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Skills</Divider>
      <Space wrap>
        {job.skills?.map(skill => (
          <Tag key={skill}>{skill}</Tag>
        ))}
      </Space>

      <Divider orientation="left">Description</Divider>
      <MDEditor.Markdown source={job.description} />

      <Divider orientation="left">Requirements</Divider>
      <MDEditor.Markdown source={job.requirements} />
    </div>
  );
};

export default JobDetails;