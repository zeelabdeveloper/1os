import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { Drawer, Form, Button, Select, Skeleton } from "antd";
import { toast } from "react-hot-toast";
import { getLetterTemp } from "../../api/letter";

const { Option } = Select;

const LetterManagement = () => {
  const [form] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  
  // Memoize the applicationId function since it doesn't change
  const applicationId = useMemo(() => {
    return () => {
      const query = new URLSearchParams(window.location.search);
      return query.get("id");
    };
  }, []);

  // Fetch available letter types
  const { data: letterTypes, isPending: typesLoading } = useQuery({
    queryKey: ["letterTypes"],
    queryFn: getLetterTemp,
    onError: useCallback(() => {
      toast.error("Failed to load letter types");
    }, []),
    enabled: drawerVisible,
  });

  // Memoize the generated letters query function
  const fetchGeneratedLetters = useCallback(async () => {
    const { data } = await axios.get(
      `/api/V1/letters/generated?applicationId=${applicationId()}`
    );
    return data.data;
  }, [applicationId]);

  const { data: generatedLetters, isPending: lettersLoading } = useQuery({
    queryKey: ["generatedLetters"],
    queryFn: fetchGeneratedLetters,
    onError: useCallback(() => {
      toast.error("Failed to load generated letters");
    }, []),
  });

  // Generate letter mutation
  const generateLetterMutation = useMutation({
    mutationFn: useCallback(async (templateId) => {
      const response = await axios.post("/api/v1/letters/generate", {
        templateId,
        applicationId: applicationId(),
      });
      return response.data;
    }, [applicationId]),
    onSuccess: useCallback((data) => {
      console.log(data);
      toast.success("Letter sent successfully");
      setDrawerVisible(false);
      form.resetFields();
    }, [form]),
    onError: useCallback((error) => {
      toast.error(error.response?.data?.message || "Failed to generate letter");
    }, []),
  });

  // Memoize the handleTypeChange function
  const handleTypeChange = useCallback((type) => {
    setSelectedType(type);
    form.setFieldsValue({ template: undefined });
  }, [form]);

  // Memoize the onFinish function
  const onFinish = useCallback((values) => {
    generateLetterMutation.mutate(values.template);
  }, [generateLetterMutation]);

  // Memoize unique letter types for the first Select
  const uniqueLetterTypes = useMemo(() => {
    return Array.isArray(letterTypes) 
      ? Array.from(new Map(letterTypes.map((item) => [item.type, item])).values())
      : [];
  }, [letterTypes]);

  // Memoize filtered templates for the second Select
  const filteredTemplates = useMemo(() => {
    return letterTypes?.filter((type) => type.type === selectedType) || [];
  }, [letterTypes, selectedType]);

  // Memoize generated letters list
  const lettersList = useMemo(() => {
    if (lettersLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} />;
    }
    return (
      <div className="space-y-4">
        {generatedLetters?.map((letter) => (
          <div key={letter._id} className="p-4 border rounded">
            <h3 className="font-medium">{letter.templateName}</h3>
            <p>Type: {letter.type}</p>
            <p>Generated: {new Date(letter.generatedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    );
  }, [generatedLetters, lettersLoading]);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Letter Management</h1>

        <Button
          type="primary"
          onClick={() => setDrawerVisible(true)}
          className="mb-4"
        >
          Generate Letter
        </Button>

        <h2 className="text-xl font-semibold mb-2">Generated Letters</h2>
        {lettersList}
      </div>

      <Drawer
        title="Generate New Letter"
        width={500}
        onClose={() => {
          setDrawerVisible(false);
          form.resetFields();
        }}
        visible={drawerVisible}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Letter Type"
            name="type"
            rules={[{ required: true, message: "Please select letter type" }]}
          >
            <Select
              placeholder="Select letter type"
              onChange={handleTypeChange}
              loading={typesLoading}
            >
              {uniqueLetterTypes.map((type) => (
                <Option key={type._id} value={type.type}>
                  {type.type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Letter Template"
            name="template"
            rules={[{ required: true, message: "Please select template" }]}
          >
            <Select
              placeholder="Select template"
              loading={typesLoading}
              disabled={!selectedType}
            >
              {filteredTemplates.map((template) => (
                <Option key={template._id} value={template._id}>
                  {template.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={generateLetterMutation.isLoading}
            >
              Generate Letter
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default React.memo(LetterManagement);