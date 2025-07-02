import React, { useState } from 'react';
import { Collapse, Typography, Divider, Input, Button, Space, Card } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const HRMSFAQ = () => {
  const [searchText, setSearchText] = useState('');
  const [activeKey, setActiveKey] = useState(null);

  const faqCategories = [
    {
      key: 'employee-management',
      title: 'Employee Management',
      questions: [
        {
          q: 'How do I add a new employee to the system?',
          a: 'Navigate to the Employees section, click "Add New Employee", fill in the required details, and submit. The HR team will review and approve the new employee profile.'
        },
        {
          q: 'Can I edit employee information after creation?',
          a: 'Yes, but certain fields like employee ID may require HR approval to change. Most information can be edited by clicking the edit button on the employee profile.'
        }
      ]
    },
    {
      key: 'leave-management',
      title: 'Leave Management',
      questions: [
        {
          q: 'How do I apply for leave?',
          a: 'Go to the Leave Management section, click "Apply for Leave", select the dates and leave type, add any comments, and submit. Your manager will be notified for approval.'
        },
        {
          q: 'What types of leave are available?',
          a: 'Our system supports annual leave, sick leave, maternity/paternity leave, bereavement leave, and unpaid leave. Specific policies vary by location.'
        }
      ]
    },
    {
      key: 'payroll',
      title: 'Payroll',
      questions: [
        {
          q: 'When will I receive my payslip?',
          a: 'Payslips are generated on the 25th of each month and available in your employee portal by the 28th.'
        },
        {
          q: 'How do I update my bank details for payroll?',
          a: 'Go to My Profile > Payment Information. Changes made before the 15th of the month will reflect in the current month\'s payroll.'
        }
      ]
    },
    {
      key: 'performance',
      title: 'Performance Management',
      questions: [
        {
          q: 'How often are performance reviews conducted?',
          a: 'Formal reviews are quarterly, with continuous feedback available year-round through the system.'
        },
        {
          q: 'Can I see my past performance reviews?',
          a: 'Yes, all your performance reviews are archived and accessible in the Performance section under "My Reviews".'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(item => 
      item.q.toLowerCase().includes(searchText.toLowerCase()) || 
      item.a.toLowerCase().includes(searchText.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setActiveKey(null); // Collapse all when searching
  };

  return (
    <Card 
      title={<Title level={3}>HRMS Help Center</Title>} 
      bordered={true}
      
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Input
          placeholder="Search FAQs..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
          allowClear
          style={{ maxWidth: 500 }}
        />

        <Text type="secondary">
          {searchText ? `Showing ${filteredCategories.reduce((acc, curr) => acc + curr.questions.length, 0)} results` : 
          'Browse our frequently asked questions below'}
        </Text>

        <Divider />

        {filteredCategories.length > 0 ? (
          <Collapse 
            accordion 
            activeKey={activeKey}
            onChange={(key) => setActiveKey(key)}
            bordered={false}
          >
            {filteredCategories.map(category => (
              <Panel 
                header={<Text strong>{category.title}</Text>} 
                key={category.key}
                style={{ marginBottom: 16, border: '1px solid #f0f0f0' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {category.questions.map((item, index) => (
                    <div key={index}>
                      <Text strong style={{ color: '#1890ff' }}>Q: {item.q}</Text>
                      <div style={{ marginTop: 8, marginBottom: 16 }}>
                        <Text>A: {item.a}</Text>
                      </div>
                      {index < category.questions.length - 1 && <Divider style={{ margin: '8px 0' }} />}
                    </div>
                  ))}
                </Space>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Text>No results found for "{searchText}". Try different keywords or submit a new question.</Text>
        )}
      </Space>
    </Card>
  );
};

export default HRMSFAQ;