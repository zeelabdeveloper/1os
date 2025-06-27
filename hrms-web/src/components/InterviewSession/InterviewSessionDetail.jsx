import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from "../../axiosConfig";
import { 
  Card, 
  Descriptions, 
  Tag, 
  Button, 
  Divider, 
  Typography, 
  Badge,
  Avatar,
  Space,
  Alert,
  Collapse
} from 'antd';
import { 
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  FileTextOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Panel } = Collapse;

const fetchInterviewSession = async (id) => {
  const { data } = await axios.get(`/api/interviewSessions/${id}?populate=interviewRound,application,interviewRound.interviewer`);
  return data;
};

const InterviewSessionDetail = ({ sessionId, onEdit }) => {
  const { data: session, isLoading, error } = useQuery(
    ['interviewSession', sessionId],
    () => fetchInterviewSession(sessionId)
  );

  if (isLoading) return <Card loading />;
  if (error) return <Alert message="Error loading session details" type="error" />;

  const getStatusTag = () => {
    const statusMap = {
      scheduled: { color: 'blue', icon: <ClockCircleOutlined />, text: 'Scheduled' },
      in_progress: { color: 'orange', icon: <ClockCircleOutlined />, text: 'In Progress' },
      completed: { color: 'green', icon: <CheckCircleOutlined />, text: 'Completed' },
      cancelled: { color: 'red', icon: <CloseCircleOutlined />, text: 'Cancelled' },
      rescheduled: { color: 'purple', icon: <ClockCircleOutlined />, text: 'Rescheduled' }
    };
    
    return (
      <Tag icon={statusMap[session.status]?.icon} color={statusMap[session.status]?.color}>
        {statusMap[session.status]?.text}
      </Tag>
    );
  };

  const getOutcomeTag = () => {
    const outcomeMap = {
      selected: { color: 'success', text: 'Selected' },
      rejected: { color: 'error', text: 'Rejected' },
      hold: { color: 'warning', text: 'On Hold' },
      pending: { color: 'default', text: 'Pending' }
    };
    
    return <Badge status={outcomeMap[session.outcome]?.color} text={outcomeMap[session.outcome]?.text} />;
  };

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Interview Session Details
          </Title>
          {getStatusTag()}
          {getOutcomeTag()}
        </Space>
      }
      extra={
        <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
          Edit
        </Button>
      }
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Candidate">
          <Space>
            <Avatar src={session.application?.photo} icon={<UserOutlined />} />
            <div>
              <Text strong>{session.application?.name}</Text>
              <br />
              <Text type="secondary">{session.application?.email}</Text>
            </div>
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Interview Round">
          <Text strong>{session.interviewRound?.name}</Text> (Round {session.interviewRound?.roundNumber})
        </Descriptions.Item>
        
        <Descriptions.Item label="Interviewer">
          <Tag icon={<UserOutlined />}>{session.interviewRound?.interviewer?.name}</Tag>
        </Descriptions.Item>
        
        <Descriptions.Item label="Date & Time">
          <Space>
            <CalendarOutlined />
            <Text>{dayjs(session.startTime).format('DD MMMM YYYY')}</Text>
            <ClockCircleOutlined />
            <Text>{dayjs(session.startTime).format('h:mm A')} - {dayjs(session.endTime).format('h:mm A')}</Text>
          </Space>
        </Descriptions.Item>
        
        {session.meetingLink && (
          <Descriptions.Item label="Meeting Link">
            <Button 
              type="link" 
              href={session.meetingLink} 
              target="_blank" 
              icon={<LinkOutlined />}
            >
              Join Meeting
            </Button>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider />

      <Collapse bordered={false} defaultActiveKey={['feedback']}>
        <Panel header="Feedback" key="feedback" extra={<FileTextOutlined />}>
          {session.feedback ? (
            <Text>{session.feedback}</Text>
          ) : (
            <Text type="secondary">No feedback provided yet</Text>
          )}
        </Panel>
        
        {session.notes && (
          <Panel header="Notes" key="notes" extra={<FileTextOutlined />}>
            <Text>{session.notes}</Text>
          </Panel>
        )}
      </Collapse>
    </Card>
  );
};

export default InterviewSessionDetail;