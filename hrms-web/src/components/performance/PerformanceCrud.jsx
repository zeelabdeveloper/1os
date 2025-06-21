import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Typography, 
  Tag, 
  Space, 
  Popconfirm, 
  message,
  Tabs,
  Divider,
  Row,
  Col,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckOutlined,MinusCircleOutlined,
  UserOutlined,
  ApartmentOutlined,
  BankOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PerformanceCRUD = ({ level, id }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const queryClient = useQueryClient();

  // Fetch performance records
  const { data: records, isLoading } = useQuery({
    queryKey: ['performanceRecords', level, id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/performance/${level}/${id}/records`);
      return data;
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newRecord) => axios.post(`/api/performance/${level}/${id}`, newRecord),
    onSuccess: () => {
      message.success('Performance record created successfully');
      queryClient.invalidateQueries(['performanceRecords', level, id]);
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Error creating record: ${error.response?.data?.message || error.message}`);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (updatedRecord) => 
      axios.put(`/api/performance/records/${currentRecord?._id}`, updatedRecord),
    onSuccess: () => {
      message.success('Performance record updated successfully');
      queryClient.invalidateQueries(['performanceRecords', level, id]);
      setIsModalVisible(false);
      setCurrentRecord(null);
    },
    onError: (error) => {
      message.error(`Error updating record: ${error.response?.data?.message || error.message}`);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (recordId) => axios.delete(`/api/performance/records/${recordId}`),
    onSuccess: () => {
      message.success('Performance record deleted successfully');
      queryClient.invalidateQueries(['performanceRecords', level, id]);
    },
    onError: (error) => {
      message.error(`Error deleting record: ${error.response?.data?.message || error.message}`);
    }
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (recordId) => 
      axios.post(`/api/performance/records/${recordId}/publish`, { userId: 'current-user-id' }),
    onSuccess: () => {
      message.success('Performance record published successfully');
      queryClient.invalidateQueries(['performanceRecords', level, id]);
    },
    onError: (error) => {
      message.error(`Error publishing record: ${error.response?.data?.message || error.message}`);
    }
  });

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentRecord) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Open modal for editing
  const handleEdit = (record) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null
    });
    setIsModalVisible(true);
  };

  // Open modal for viewing
  const handleView = (record) => {
    setCurrentRecord(record);
    // Open in view mode (readonly)
    setIsModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Period',
      dataIndex: 'period',
      render: (text, record) => (
        <Text strong>
          {text.charAt(0).toUpperCase() + text.slice(1)} {new Date(record.startDate).getFullYear()}
        </Text>
      )
    },
    {
      title: 'Date Range',
      render: (_, record) => (
        <Text>
          {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        let color;
        switch (status) {
          case 'draft': color = 'default'; break;
          case 'under_review': color = 'orange'; break;
          case 'published': color = 'green'; break;
          case 'archived': color = 'gray'; break;
          default: color = 'default';
        }
        return <Tag color={color}>{status.replace('_', ' ')}</Tag>;
      }
    },
    {
      title: 'Overall Score',
      dataIndex: 'overallRating',
      render: (rating) => rating ? `${rating}/5` : '-'
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
          />
          
          {record.status === 'draft' && (
            <>
              <Button 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              />
              
              <Popconfirm
                title="Are you sure to delete this record?"
                onConfirm={() => deleteMutation.mutate(record._id)}
              >
                <Button icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </>
          )}
          
          {record.status === 'under_review' && (
            <Button 
              icon={<CheckOutlined />} 
              onClick={() => publishMutation.mutate(record._id)}
            >
              Publish
            </Button>
          )}
        </Space>
      )
    }
  ];

  // KPI form items
  const renderKpiFields = () => {
    return (
      <Form.List name="kpis">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  rules={[{ required: true, message: 'Missing KPI name' }]}
                >
                  <Input placeholder="KPI Name" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'weight']}
                  rules={[{ required: true, message: 'Missing weight' }]}
                >
                  <InputNumber placeholder="Weight" min={1} max={100} />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'target']}
                  rules={[{ required: true, message: 'Missing target' }]}
                >
                  <InputNumber placeholder="Target" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'actual']}
                  rules={[{ required: true, message: 'Missing actual' }]}
                >
                  <InputNumber placeholder="Actual" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'unit']}
                  initialValue="percentage"
                >
                  <Select style={{ width: 120 }}>
                    <Option value="percentage">%</Option>
                    <Option value="number">Number</Option>
                    <Option value="currency">Currency</Option>
                    <Option value="days">Days</Option>
                  </Select>
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add KPI
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    );
  };

  // Goal form items
  const renderGoalFields = () => {
    return (
      <Form.List name="goals">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'title']}
                    rules={[{ required: true, message: 'Missing goal title' }]}
                  >
                    <Input placeholder="Goal Title" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                  >
                    <Input.TextArea placeholder="Description" rows={2} />
                  </Form.Item>
                  <Space>
                    <Form.Item
                      {...restField}
                      name={[name, 'startDate']}
                      rules={[{ required: true, message: 'Missing start date' }]}
                    >
                      <DatePicker placeholder="Start Date" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'endDate']}
                      rules={[{ required: true, message: 'Missing end date' }]}
                    >
                      <DatePicker placeholder="End Date" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'status']}
                      initialValue="not_started"
                    >
                      <Select style={{ width: 150 }}>
                        <Option value="not_started">Not Started</Option>
                        <Option value="in_progress">In Progress</Option>
                        <Option value="completed">Completed</Option>
                        <Option value="overdue">Overdue</Option>
                      </Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Goal
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <Space>
            {level === 'individual' && <UserOutlined />}
            {level === 'department' && <ApartmentOutlined />}
            {level === 'branch' && <BankOutlined />}
            {level === 'role' && <TeamOutlined />}
            <Title level={4} style={{ margin: 0 }}>
              {level?.charAt(0)?.toUpperCase() + level?.slice(1)} Performance Records
            </Title>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setCurrentRecord(null);
              setIsModalVisible(true);
              form.resetFields();
            }}
          >
            New Record
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={records || []}
          rowKey="_id"
          loading={isLoading}
          pagination={false}
        />
      </Card>

      {/* Performance Record Modal */}
      <Modal
        title={currentRecord ? `Edit Performance Record` : 'Create Performance Record'}
        visible={isModalVisible}
        width={800}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            period: 'monthly',
            status: 'draft'
          }}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="Basic Info" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="period"
                    label="Period"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                      <Option value="quarterly">Quarterly</Option>
                      <Option value="annual">Annual</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                  >
                    <Select disabled={!!currentRecord}>
                      <Option value="draft">Draft</Option>
                      <Option value="under_review">Under Review</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="startDate"
                    label="Start Date"
                    rules={[{ required: true }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="endDate"
                    label="End Date"
                    rules={[{ required: true }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="KPIs" key="kpis">
              {renderKpiFields()}
            </TabPane>
            
            <TabPane tab="Goals" key="goals">
              {renderGoalFields()}
            </TabPane>
            
            <TabPane tab="Competencies" key="competencies">
              <Form.Item name={['competencies', 'technical']} label="Technical">
                <Select>
                  <Option value={1}>1 - Needs Improvement</Option>
                  <Option value={2}>2 - Developing</Option>
                  <Option value={3}>3 - Competent</Option>
                  <Option value={4}>4 - Advanced</Option>
                  <Option value={5}>5 - Expert</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name={['competencies', 'behavioral']} label="Behavioral">
                <Select>
                  <Option value={1}>1 - Needs Improvement</Option>
                  <Option value={2}>2 - Developing</Option>
                  <Option value={3}>3 - Competent</Option>
                  <Option value={4}>4 - Advanced</Option>
                  <Option value={5}>5 - Expert</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name={['competencies', 'leadership']} label="Leadership">
                <Select>
                  <Option value={1}>1 - Needs Improvement</Option>
                  <Option value={2}>2 - Developing</Option>
                  <Option value={3}>3 - Competent</Option>
                  <Option value={4}>4 - Advanced</Option>
                  <Option value={5}>5 - Expert</Option>
                </Select>
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
};

export default PerformanceCRUD;