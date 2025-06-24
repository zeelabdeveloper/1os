import React from 'react';
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  TimePicker,
  Row,
  Col,
  Card,
  message,
  Divider,
  Typography,
  Alert
} from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const fetchApplications = async () => {
  const { data } = await axios.get('/api/applications?status=applied,phone_screen,interview');
  return data;
};

const fetchInterviewRounds = async () => {
  const { data } = await axios.get('/api/interviewRounds?populate=interviewer');
  return data;
};

const InterviewSessionForm = ({ session, onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedRound, setSelectedRound] = React.useState(null);

  const { data: applications, isLoading: appsLoading } = useQuery(
    ['applications'], 
    fetchApplications
  );

  const { data: interviewRounds, isLoading: roundsLoading } = useQuery(
    ['interviewRounds'], 
    fetchInterviewRounds
  );

  const mutation = useMutation(
    (values) => {
      const payload = {
        ...values,
        startTime: values.timeRange[0].toISOString(),
        endTime: values.timeRange[1].toISOString()
      };
      
      return session?._id 
        ? axios.put(`/api/interviewSessions/${session._id}`, payload)
        : axios.post('/api/interviewSessions', payload);
    },
    {
      onSuccess: () => {
        message.success(`Session ${session?._id ? 'updated' : 'created'} successfully`);
        onSuccess();
      },
      onError: (error) => {
        message.error(error.response?.data?.message || 'An error occurred');
      }
    }
  );

  const handleRoundChange = (roundId) => {
    const round = interviewRounds?.find(r => r._id === roundId);
    setSelectedRound(round);
  };

  const handleSubmit = (values) => {
    mutation.mutate(values);
  };

  React.useEffect(() => {
    if (session) {
      form.setFieldsValue({
        ...session,
        timeRange: [dayjs(session.startTime), dayjs(session.endTime)]
      });
      handleRoundChange(session.interviewRoundId);
    }
  }, [session, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        meetingLink: '',
        notes: ''
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="applicationId"
            label="Candidate"
            rules={[{ required: true, message: 'Please select a candidate' }]}
          >
            <Select
              placeholder="Select candidate"
              loading={appsLoading}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              disabled={!!session}
            >
              {applications?.map(app => (
                <Option key={app._id} value={app._id}>
                  {app.name} ({app.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="interviewRoundId"
            label="Interview Round"
            rules={[{ required: true, message: 'Please select an interview round' }]}
          >
            <Select
              placeholder="Select interview round"
              loading={roundsLoading}
              onChange={handleRoundChange}
              showSearch
              optionFilterProp="children"
            >
              {interviewRounds?.map(round => (
                <Option key={round._id} value={round._id}>
                  {round.name} (Round {round.roundNumber})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {selectedRound && (
        <Card size="small" className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Interviewer: </Text>
              <Text>{selectedRound.interviewer?.name}</Text>
            </div>
            <div>
              <Text strong>Description: </Text>
              <Text>{selectedRound.description || 'No description'}</Text>
            </div>
          </div>
        </Card>
      )}

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="timeRange"
            label="Date & Time"
            rules={[{ required: true, message: 'Please select date and time' }]}
          >
            <RangePicker 
              showTime 
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="meetingLink"
            label="Meeting Link"
            rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
          >
            <Input placeholder="https://zoom.us/j/123456789" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} placeholder="Any special instructions or notes" />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isLoading}>
          {session?._id ? 'Update Session' : 'Schedule Session'}
        </Button>
        <Button onClick={onSuccess} style={{ marginLeft: 8 }}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

export default InterviewSessionForm;