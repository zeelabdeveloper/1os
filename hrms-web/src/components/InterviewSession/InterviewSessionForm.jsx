 
import React from 'react';
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button,
  Row,
  Col,
  Card,
  Divider,
  Typography,
  Spin,
  Alert
} from 'antd';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from '../../axiosConfig';
import dayjs from 'dayjs';
import { fetchApplicationById } from '../../api/jobs';
import { fetchInterviewRounds } from '../../api/interview';
import toast from 'react-hot-toast';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const InterviewSessionForm = ({ session, onSuccess }) => {
  const [form] = Form.useForm();
  const [selectedRound, setSelectedRound] = React.useState(null);
  
  const getCandidateIdFromUrl = () => {
    const query = new URLSearchParams(window.location.search);
    return query.get('id');
  };
  
  const candidateId = getCandidateIdFromUrl();

  const { data: candidate, isPending: candidateLoading, error: candidateError } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => fetchApplicationById(candidateId),
    enabled: !!candidateId
  });

  const { data: interviewRounds, isPending: roundsLoading } = useQuery({
    queryKey: ['interviewRounds'],
    queryFn: fetchInterviewRounds
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        ...values,
        applicationId: candidateId,
        startTime: values.timeRange[0].toISOString(),
        endTime: values.timeRange[1].toISOString()
      };
      
      if (session?._id) {
        return await axios.put(`/api/v1/interview/interviewSessions/${session._id}`, payload);
      } else {
        return await axios.post('/api/v1/interview/interviewSessions', payload);
      }
    },
    onSuccess: () => {
      toast.success(`Session ${session?._id ? 'updated' : 'created'} successfully`);
      form.resetFields();
      onSuccess();
    },
    onError: (error) => {
      console.log( error)
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  });

  const handleRoundChange = (roundId) => {
    const actualId = typeof roundId === 'object' ? roundId._id : roundId;
    const round = interviewRounds?.find(r => r._id === actualId);
    setSelectedRound(round);
  };

  const handleSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
    //  toast.error('Submission error:', error);
    }
  };

  React.useEffect(() => {
    if (session && interviewRounds) {
      const initialValues = {
        ...session,
        timeRange: [dayjs(session.startTime), dayjs(session.endTime)]
      };
      
      initialValues.interviewRoundId = 
        typeof session.interviewRoundId === 'object' 
          ? session.interviewRoundId._id 
          : session.interviewRoundId;
      
      form.setFieldsValue(initialValues);
      handleRoundChange(initialValues.interviewRoundId);
    }
  }, [session, form, interviewRounds]);

  if (!candidateId) {
    return (
      <Alert 
        type="error" 
        message="Candidate ID missing" 
        description="Please access this page with a valid candidate ID in the URL (e.g., ?id=123)"
        showIcon
      />
    );
  }

  if (candidateLoading) return <Spin />;
  
  if (candidateError) {
    return (
      <Alert 
        type="error" 
        message="Failed to load candidate" 
        description={candidateError.message}
        showIcon
      />
    );
  }

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
        <Col span={24}>
          <Card size="small" className="mb-4">
            <div>
              <Text strong>Candidate: </Text>
              <Text>{candidate?.name} ({candidate?.email})</Text>
            </div>
            <div>
              <Text strong>Status: </Text>
              <Text>{candidate?.status || 'Not specified'}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
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
              disabled={roundsLoading}
              value={form.getFieldValue('interviewRoundId')}
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
              <Text>{selectedRound.interviewer?.firstName}</Text>
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
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={mutation.isPending}
          disabled={mutation.isPending}
        >
          {session?._id ? 'Update Session' : 'Schedule Session'}
        </Button>
        <Button onClick={onSuccess} style={{ marginLeft: 8 }} disabled={mutation.isPending}>
          Cancel
        </Button>
      </Form.Item>
    </Form>
  );
};

export default InterviewSessionForm;