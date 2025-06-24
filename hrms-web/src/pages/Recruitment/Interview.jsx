// InterviewRoundManagement.js
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Popconfirm,
  Tag,
  Select,
} from "antd";
import { FiPlus, FiSearch, FiTrash2, FiEdit, FiSave } from "react-icons/fi";
import { FaExclamationCircle } from "react-icons/fa";

import toast from "react-hot-toast";
import {
  addInterviewRound,
  deleteInterviewRound,
  fetchInterviewRounds,
  updateInterviewRound,
  fetchInterviewersByrole,
} from "../../api/interview";
import { fetchRoles } from "../../api/auth";

const InterviewRoundManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch interview rounds
  const {
    data: interviewRounds,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interviewRounds"],
    queryFn: fetchInterviewRounds,
    onError: (error) => toast.error(error.message),
  });

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => fetchRoles(),
  });
  
  // Fetch interviewers based on selected department
  const { data: interviewers, isLoading: interviewersLoading } = useQuery({
    queryKey: ["interviewers", selectedDepartment],
    queryFn: () => fetchInterviewersByrole(selectedDepartment),
    enabled: !!selectedDepartment,
  });

  // Memoized filtered interview rounds
  const filteredInterviewRounds = useMemo(() => {
    return interviewRounds?.filter(
      (round) =>
        round.name.toLowerCase().includes(searchText.toLowerCase()) ||
        round.interviewer?.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [interviewRounds, searchText]);

  // Add interview round mutation
  const addMutation = useMutation({
    mutationFn: addInterviewRound,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["interviewRounds"]);
      toast.success(data.message || "Interview round added successfully");
      setIsModalOpen(false);
      form.resetFields();
      setSelectedDepartment(null);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Error adding interview round"
      ),
  });

  // Update interview round mutation
  const updateMutation = useMutation({
    mutationFn: updateInterviewRound,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["interviewRounds"]);
      toast.success(data.message || "Interview round updated successfully");
      setEditingId(null);
      form.resetFields();
      setSelectedDepartment(null);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Error updating interview round"
      ),
  });

  // Delete interview round mutation
  const deleteMutation = useMutation({
    mutationFn: deleteInterviewRound,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["interviewRounds"]);
      toast.success(data.message || "Interview round deleted successfully");
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.message || "Error deleting interview round"
      ),
  });

  // Handle department change
  const handleDepartmentChange = useCallback(
    (value) => {
      setSelectedDepartment(value);
      form.setFieldsValue({ interviewer: undefined }); // Reset interviewer when department changes
    },
    [form]
  );

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      {
        title: "Round No",
        dataIndex: "roundNumber",
        key: "roundNumber",
        render: (text, record) =>
          editingId === record._id ? (
            <Form.Item
              name="roundNumber"
              initialValue={text}
              rules={[{ required: true, message: "Round number is required" }]}
            >
              <Input type="number" />
            </Form.Item>
          ) : (
            <Tag color="blue">{text}</Tag>
          ),
      },
      {
        title: "Round Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) =>
          editingId === record._id ? (
            <Form.Item
              name="name"
              initialValue={text}
              rules={[{ required: true, message: "Round name is required" }]}
            >
              <Input />
            </Form.Item>
          ) : (
            text
          ),
      },
      {
        title: "Interviewer",
        dataIndex: ["interviewer", "firstName"],
        key: "interviewer",
        render: (text, record) =>
          editingId === record._id ? (
            <>
              <Form.Item
                name="role"
                label="Role"
                initialValue={record.interviewer?.department?._id}
                rules={[{ required: true, message: "Role is required" }]}
              >
                <Select
                  placeholder="Select Role"
                  onChange={handleDepartmentChange}
                  options={departments?.map((d) => ({
                    value: d._id,
                    label: d.name,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="interviewer"
                label="Interviewer"
                initialValue={record.interviewer?._id}
                rules={[{ required: true, message: "Interviewer is required" }]}
              >
                <Select
                  placeholder="Select interviewer"
                  loading={interviewersLoading}
                  options={interviewers?.map((i) => ({
                    value: i._id,
                    label: `${i.firstName} ${i.lastName || ''} (${i.email})`,
                  }))}
                />
              </Form.Item>
            </>
          ) : (
            text
          ),
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        render: (text, record) =>
          editingId === record._id ? (
            <Form.Item name="description" initialValue={text}>
              <Input.TextArea />
            </Form.Item>
          ) : (
            text || "-"
          ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <div className="flex gap-2">
            {editingId === record._id ? (
              <>
                <Button
                  icon={<FiSave />}
                  onClick={() => handleUpdate(record._id)}
                  loading={updateMutation.isLoading}
                />
                <Button 
                  icon={<FiEdit />} 
                  onClick={handleEditCancel} 
                  disabled={updateMutation.isLoading}
                />
              </>
            ) : (
              <>
                <Button
                  icon={<FiEdit />}
                  onClick={() => {
                    setEditingId(record._id);
                    const departmentId = record.interviewer?.department?._id;
                    setSelectedDepartment(departmentId);
                    
                    setTimeout(() => {
                      form.setFieldsValue({
                        roundNumber: record.roundNumber,
                        name: record.name,
                        role: departmentId,
                        interviewer: record.interviewer?._id,
                        description: record.description
                      });
                    }, 0);
                  }}
                  disabled={editingId !== null}
                />
                <Popconfirm
                  title="Delete Interview Round"
                  description="Are you sure?"
                  icon={<FaExclamationCircle className="text-red-500" />}
                  onConfirm={() => handleDelete(record._id)}
                >
                  <Button
                    icon={<FiTrash2 />}
                    danger
                    disabled={editingId !== null}
                  />
                </Popconfirm>
              </>
            )}
          </div>
        ),
      },
    ],
    [
      editingId,
      updateMutation.isLoading,
      form,
      departments,
      interviewers,
      interviewersLoading,
      handleDepartmentChange,
    ]
  );

  // Callbacks for handlers to maintain referential equality
  const handleAdd = useCallback(() => {
    form.validateFields().then((values) => {
      addMutation.mutate(values);
    });
  }, [form, addMutation]);

  const handleUpdate = useCallback(
    (id) => {
      form.validateFields().then((values) => {
        updateMutation.mutate({ id, ...values });
      });
    },
    [form, updateMutation]
  );

  const handleDelete = useCallback(
    (id) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  const handleSearch = useCallback((e) => {
    setSearchText(e.target.value);
  }, []);

  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedDepartment(null);
  }, [form]);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    setSelectedDepartment(null);
  }, [form]);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Interview Round Management</h1>
        <Button type="primary" icon={<FiPlus />} onClick={handleModalOpen}>
          Add Interview Round
        </Button>
      </div>

      <Input
        placeholder="Search interview rounds..."
        prefix={<FiSearch />}
        onChange={handleSearch}
        className="mb-4"
      />

      <Form form={form} component={false}>
        <Table
          columns={columns}
          dataSource={filteredInterviewRounds}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Form>

      <Modal
        title={editingId ? "Edit Interview Round" : "Add New Interview Round"}
        open={isModalOpen}
        onOk={handleAdd}
        onCancel={handleModalClose}
        confirmLoading={addMutation.isLoading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="roundNumber"
            label="Round Number"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Round Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select Role"
              onChange={handleDepartmentChange}
              options={departments?.map((d) => ({
                value: d._id,
                label: d.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="interviewer"
            label="Interviewer"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select interviewer"
              disabled={!selectedDepartment}
              loading={interviewersLoading}
              options={interviewers?.map((i) => ({
                value: i._id,
                label: `${i.firstName} ${i.lastName || ''} (${i.email})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InterviewRoundManagement;