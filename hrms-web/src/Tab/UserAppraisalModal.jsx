import React from "react";
import {
  Modal,
  Descriptions,
  Rate,
  Tag,
  Divider,
  Typography,
  Button,
  Badge,
  List,
  Card,
  Space,
  Row,
  Col
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  FilePdfOutlined,
  PrinterOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const competencyLabels = {
  technicalSkills: "Technical Skills",
  productivity: "Productivity",
  teamwork: "Teamwork",
  communication: "Communication",
  initiative: "Initiative"
};

const statusColors = {
  Draft: "default",
  Submitted: "processing",
  Approved: "success",
  Rejected: "error"
};

const UserAppraisalModal = ({ visible, onClose, appraisal }) => {
  if (!appraisal) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // PDF export logic here
    console.log("Exporting to PDF:", appraisal._id);
  };

  return (
    <Modal
      title={`Appraisal Details - ${appraisal.user?.firstName} ${appraisal.user?.lastName}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="back" onClick={onClose}>
          Close
        </Button>,
        <Button 
          key="print" 
          icon={<PrinterOutlined />} 
          onClick={handlePrint}
        >
          Print
        </Button>,
        <Button 
          key="pdf" 
          type="primary" 
          icon={<FilePdfOutlined />} 
          onClick={handleExportPDF}
        >
          Export PDF
        </Button>
      ]}
      className="appraisal-detail-modal"
    >
      <div className="print-only" style={{ display: 'none' }}>
        <Title level={3} style={{ textAlign: 'center' }}>
          Performance Appraisal Report
        </Title>
        <Divider />
      </div>

      <Descriptions bordered column={2}>
        <Descriptions.Item label="Employee Name">
          {appraisal.user?.firstName} {appraisal.user?.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Employee ID">
          {appraisal.user?.employeeId || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Designation">
          <Tag color="blue">{appraisal.role?.name}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Department">
          <Tag color="purple">{appraisal.department?.name}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Appraisal Period">
          {appraisal.month} {appraisal.year}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Badge 
            status={statusColors[appraisal.status]} 
            text={appraisal.status} 
          />
        </Descriptions.Item>
        <Descriptions.Item label="Reviewer">
          {appraisal.reviewer ? 
            `${appraisal.reviewer.firstName} ${appraisal.reviewer.lastName}` : 
            'Not assigned'}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {dayjs(appraisal.updatedAt).format('DD MMM YYYY')}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Performance Ratings</Divider>

      <Card title="Overall Rating" style={{ marginBottom: 16 }}>
        <Rate 
          disabled 
          value={appraisal.overallRating} 
          count={5} 
          style={{ fontSize: 24 }} 
        />
        <Text style={{ marginLeft: 16 }}>
          {appraisal.overallRating.toFixed(1)} out of 5
        </Text>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Competency Ratings" style={{ marginBottom: 16 }}>
            {Object.entries(appraisal.competencies).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <Text strong>{competencyLabels[key] || key}:</Text>
                <Rate 
                  disabled 
                  value={value} 
                  count={5} 
                  style={{ marginLeft: 8 }} 
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Feedback Summary" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Strengths">
                {appraisal.strengths?.length > 0 ? (
                  <List
                    size="small"
                    dataSource={appraisal.strengths}
                    renderItem={item => (
                      <List.Item>
                        <CheckOutlined style={{ color: 'green', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No strengths recorded</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Areas for Improvement">
                {appraisal.areasForImprovement?.length > 0 ? (
                  <List
                    size="small"
                    dataSource={appraisal.areasForImprovement}
                    renderItem={item => (
                      <List.Item>
                        <CloseOutlined style={{ color: 'red', marginRight: 8 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No improvement areas recorded</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card title="Reviewer Comments">
        {appraisal.feedback ? (
          <Text>{appraisal.feedback}</Text>
        ) : (
          <Text type="secondary">No additional comments provided</Text>
        )}
      </Card>

      <div className="print-only" style={{ marginTop: 24, display: 'none' }}>
        <Divider />
        <Space>
          <Text>Generated on: {dayjs().format('DD MMM YYYY hh:mm A')}</Text>
          <Text>© {dayjs().year()} Company Name</Text>
        </Space>
      </div>
    </Modal>
  );
};

export default UserAppraisalModal;