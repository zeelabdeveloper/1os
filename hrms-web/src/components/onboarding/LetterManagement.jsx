// import React, { useState } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import axios from "axios";
// import {
//   Drawer,
//   Form,
//   Input,
//   Button,
//   Select,
//   Skeleton,
//   notification,
// } from "antd";
// import { toast } from "react-hot-toast";
// import { getLetterTemp } from "../../api/letter";

// const { Option } = Select;
// const { TextArea } = Input;

// const LetterManagement = () => {
//   const [form] = Form.useForm();
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const [selectedType, setSelectedType] = useState("");
//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [variables, setVariables] = useState([]);

//   // Fetch available letter types
//   const { data: letterTypes, isPending: typesLoading } = useQuery({
//     queryKey: ["letterTypes"],
//     queryFn: getLetterTemp,
//     onError: () => {
//       toast.error("Failed to load letter types");
//     },
//   });
// console.log(letterTypes)
//   // Fetch letter templates by type
//   const { data: templates, isPending: templatesLoading } = useQuery({
//     queryKey: ["letterTemplates", selectedType],
//     queryFn: async () => {
//       if (!selectedType) return [];
//       const { data } = await axios.get(
//         `/api/letters/templates/${selectedType}`
//       );
//       return data.data;
//     },
//     enabled: !!selectedType,
//     onError: () => {
//       toast.error("Failed to load templates");
//     },
//   });

//   // Fetch sent letters
//   const { data: sentLetters, isPending: sentLettersLoading } = useQuery({
//     queryKey: ["sentLetters"],
//     queryFn: async () => {
//       const { data } = await axios.get("/api/letters/sent");
//       return data.data;
//     },
//     onError: () => {
//       toast.error("Failed to load sent letters");
//     },
//   });

//   // Send letter mutation
//   const sendLetterMutation = useMutation({
//     mutationFn: async (values) => {
//       const response = await axios.post("/api/letters/generate", values);
//       return response.data;
//     },
//     onSuccess: () => {
//       toast.success("Letter sent successfully");
//       setDrawerVisible(false);
//       form.resetFields();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || "Failed to send letter");
//     },
//   });

//   const handleTypeChange = (type) => {
//     setSelectedType(type);
//     setSelectedTemplate(null);
//     setVariables([]);
//     form.setFieldsValue({ template: undefined }); // Reset template selection
//   };

//   const handleTemplateChange = (templateId) => {
//     const template = templates.find((t) => t._id === templateId);
//     setSelectedTemplate(template);
//     setVariables(template.variables || []);
//   };

//   const onFinish = (values) => {
//     sendLetterMutation.mutate({
//       templateId: selectedTemplate._id,
//       variables: values.variables,
//       recipientEmail: values.recipientEmail,
//       subject: values.subject,
//       notes: values.notes,
//     });
//   };

//   return (
//     <div className="p-4">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold mb-4">Letter Management</h1>

//         <Button
//           type="primary"
//           onClick={() => setDrawerVisible(true)}
//           className="mb-4"
//         >
//           Generate Letter
//         </Button>

//         <h2 className="text-xl font-semibold mb-2">Sent Letters</h2>
//         {sentLettersLoading ? (
//           <Skeleton active paragraph={{ rows: 4 }} />
//         ) : (
//           <div className="space-y-4">
//             {sentLetters?.map((letter) => (
//               <div key={letter._id} className="p-4 border rounded">
//                 <h3 className="font-medium">{letter.subject}</h3>
//                 <p>To: {letter.recipientEmail}</p>
//                 <p>Sent: {new Date(letter.sentAt).toLocaleString()}</p>
//                 {letter.notes && <p>Notes: {letter.notes}</p>}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <Drawer
//         title="Generate New Letter"
//         width={600}
//         onClose={() => {
//           setDrawerVisible(false);
//           form.resetFields();
//         }}
//         visible={drawerVisible}
//         footer={null}
//       >
//         <Form form={form} layout="vertical" onFinish={onFinish}>
//           <Form.Item
//             label="Letter Type"
//             name="type"
//             rules={[{ required: true, message: "Please select letter type" }]}
//           >
//             <Select
//               placeholder="Select letter type"
//               onChange={handleTypeChange}
//               loading={typesLoading}
//             >
//               {letterTypes?.map((type) => (
//                 <Option key={type} value={type}>
//                   {type?.charAt(0)?.toUpperCase() + type?.slice(1)} Letter
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             label="Letter Template"
//             name="template"
//             rules={[{ required: true, message: "Please select template" }]}
//           >
//             <Select
//               placeholder="Select template"
//               onChange={handleTemplateChange}
//               loading={templatesLoading}
//               disabled={!selectedType}
//             >
//               {templates?.map((template) => (
//                 <Option key={template._id} value={template._id}>
//                   {template.name}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             label="Recipient Email"
//             name="recipientEmail"
//             rules={[
//               { required: true, message: "Please input recipient email" },
//               { type: "email", message: "Please enter a valid email" },
//             ]}
//           >
//             <Input placeholder="Enter recipient email" />
//           </Form.Item>

//           <Form.Item
//             label="Subject"
//             name="subject"
//             rules={[{ required: true, message: "Please input subject" }]}
//           >
//             <Input placeholder="Enter email subject" />
//           </Form.Item>

//           {variables.length > 0 && (
//             <div className="mb-4">
//               <h4 className="font-medium mb-2">Template Variables</h4>
//               {variables.map((variable) => (
//                 <Form.Item
//                   key={variable.name}
//                   label={variable.description}
//                   name={["variables", variable.name]}
//                   rules={[
//                     {
//                       required: true,
//                       message: `Please enter ${variable.description}`,
//                     },
//                   ]}
//                 >
//                   <Input placeholder={`Enter ${variable.description}`} />
//                 </Form.Item>
//               ))}
//             </div>
//           )}

//           <Form.Item label="Notes" name="notes">
//             <TextArea rows={4} placeholder="Add any notes (optional)" />
//           </Form.Item>

//           <Form.Item>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={sendLetterMutation.isLoading}
//             >
//               Send Letter
//             </Button>
//           </Form.Item>
//         </Form>
//       </Drawer>
//     </div>
//   );
// };

// export default LetterManagement;

import React from 'react'

function LetterManagement() {
  return (
    <div>LetterManagement</div>
  )
}

export default LetterManagement