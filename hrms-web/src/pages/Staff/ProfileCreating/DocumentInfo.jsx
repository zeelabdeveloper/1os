 
// import React, { memo, useState } from "react";
// import { Form, Upload, Button, Divider, Card, Input, message } from "antd";
// import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
// import toast from "react-hot-toast";

// const DocumentVerification = memo(() => {
//   const [loading, setLoading] = useState(false);

//   // Cloudinary upload handler
//   const handleUpload = async (options) => {
//     const { file, onSuccess, onError, onProgress } = options;
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "newsimgupload");
//       formData.append("cloud_name", "dikxwu8om");

//       const xhr = new XMLHttpRequest();
//       xhr.open(
//         "POST",
//         "https://api.cloudinary.com/v1_1/dikxwu8om/image/upload",
//         true
//       );

//       xhr.upload.onprogress = (e) => {
//         if (e.lengthComputable) {
//           const percent = Math.round((e.loaded / e.total) * 100);
//           onProgress({ percent }, file);
//         }
//       };

//       xhr.onload = () => {
//         if (xhr.status === 200) {
//           const response = JSON.parse(xhr.responseText);
//           onSuccess(response, file);
//           toast.success(`${file.name} uploaded successfully`);
//         } else {
//           onError(new Error("Upload failed"));
//           toast.error(`${file.name} upload failed`);
//         }
//         setLoading(false);
//       };

//       xhr.onerror = () => {
//         onError(new Error("Upload failed"));
//         toast.error(`${file.name} upload failed`);
//         setLoading(false);
//       };

//       xhr.send(formData);
//     } catch (error) {
//       onError(error);
//       toast.error("Upload failed");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <Divider orientation="left">Background + Document Verification</Divider>
//       <Form.List name={["documents"]}>
//         {(fields, { add, remove }) => (
//           <>
//             {fields.map(({ key, name, ...restField }) => (
//               <Card
//                 key={key}
//                 className="mb-6"
//                 style={{ background: "#f0f2f5" }}
//               >
//                 <Form.Item
//                   {...restField}
//                   name={[name, "documentType"]}
//                   label="Document Type"
//                   rules={[
//                     { required: true, message: "Document type is required" },
//                   ]}
//                 >
//                   <Input placeholder="e.g., Aadhar Card, Passport, Driving License" />
//                 </Form.Item>

//                 <Form.Item
//                   {...restField}
//                   name={[name, "documentNumber"]}
//                   label="Document Number"
//                   rules={[
//                     { required: true, message: "Document number is required" },
//                   ]}
//                 >
//                   <Input placeholder="Enter document number" />
//                 </Form.Item>

//                 <Form.Item
//                   {...restField}
//                   name={[name, "documentFile"]}
//                   label="Upload Document"
//                   valuePropName="fileList"
//                   rules={[
//                     { required: true, message: "Document upload is required" },
//                   ]}
//                   getValueFromEvent={(e) => {
//                     if (Array.isArray(e)) return e;
//                     return e && e.fileList;
//                   }}
//                 >
//                   <Upload
//                     customRequest={handleUpload}
//                     listType="picture"
//                     maxCount={1}
//                     accept="image/*,.pdf"
//                     beforeUpload={(file) => {
//                       const isLt5M = file.size / 1024 / 1024 < 5;
//                       if (!isLt5M) {
//                         message.error("File must be smaller than 5MB!");
//                       }
//                       return isLt5M;
//                     }}
//                   >
//                     <Button icon={<UploadOutlined />} loading={loading}>
//                       Click to Upload (Max 5MB)
//                     </Button>
//                   </Upload>
//                 </Form.Item>

//                 <Button
//                   type="primary"
//                   danger
//                   onClick={() => remove(name)}
//                   className="mt-2"
//                 >
//                   Remove Document
//                 </Button>
//               </Card>
//             ))}
//             <Button
//               type="dashed"
//               onClick={() => add()}
//               block
//               icon={<PlusOutlined />}
//               style={{ background: "#f0f2f5" }}
//             >
//               Add Document
//             </Button>
//           </>
//         )}
//       </Form.List>
//     </div>
//   );
// });

// export default DocumentVerification;


// import React, { memo, useState } from "react";
// import { Form, Upload, Button, Divider, Card, Input, message } from "antd";
// import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
// import toast from "react-hot-toast";

// const DocumentVerification = memo(() => {
//   const [loading, setLoading] = useState(false);

//   // Cloudinary upload handler
//   const handleUpload = async (options) => {
//     const { file, onSuccess, onError, onProgress } = options;
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "newsimgupload");
//       formData.append("cloud_name", "dikxwu8om");

//       const xhr = new XMLHttpRequest();
//       xhr.open(
//         "POST",
//         "https://api.cloudinary.com/v1_1/dikxwu8om/image/upload",
//         true
//       );

//       xhr.upload.onprogress = (e) => {
//         if (e.lengthComputable) {
//           const percent = Math.round((e.loaded / e.total) * 100);
//           onProgress({ percent }, file);
//         }
//       };

//       xhr.onload = () => {
//         if (xhr.status === 200) {
//           const response = JSON.parse(xhr.responseText);
           
         
//           onSuccess(response.secure_url, file);
//           toast.success(`${file.name} uploaded successfully`);
//         } else {
//           onError(new Error("Upload failed"));
//           toast.error(`${file.name} upload failed`);
//         }
//         setLoading(false);
//       };

//       xhr.onerror = () => {
//         onError(new Error("Upload failed"));
//         toast.error(`${file.name} upload failed`);
//         setLoading(false);
//       };

//       xhr.send(formData);
//     } catch (error) {
//       onError(error);
//       toast.error("Upload failed");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <Divider orientation="left">Background + Document Verification</Divider>
//       <Form.List name={["documents"]}>
//         {(fields, { add, remove }) => (
//           <>
//             {fields.map(({ key, name, ...restField }) => (
//               <Card
//                 key={key}
//                 className="mb-6"
//                 style={{ background: "#f0f2f5" }}
//               >
//                 <Form.Item
//                   {...restField}
//                   name={[name, "documentType"]}
//                   label="Document Type"
//                   rules={[
//                     { required: true, message: "Document type is required" },
//                   ]}
//                 >
//                   <Input placeholder="e.g., Aadhar Card, Passport, Driving License" />
//                 </Form.Item>

//                 <Form.Item
//                   {...restField}
//                   name={[name, "documentNumber"]}
//                   label="Document Number"
//                   rules={[
//                     { required: true, message: "Document number is required" },
//                   ]}
//                 >
//                   <Input placeholder="Enter document number" />
//                 </Form.Item>

//                 <Form.Item
//                   {...restField}
//                   name={[name, "documentFile"]}
//                   label="Upload Document"
//                   valuePropName="fileList"
//                   rules={[
//                     { required: true, message: "Document upload is required" },
//                   ]}
                  
//                   getValueFromEvent={(e) => {
                     
//                     if (Array.isArray(e)) return e;
//                     return e && e.fileList;
//                   }}
//                 >
//                   <Upload
//                     customRequest={handleUpload}
//                     listType="picture"
//                     maxCount={1}
//                     accept="image/*,.pdf"
//                     beforeUpload={(file) => {
//                       const isLt5M = file.size / 1024 / 1024 < 5;
//                       if (!isLt5M) {
//                         message.error("File must be smaller than 5MB!");
//                       }
//                       return isLt5M;
//                     }}
//                   >
//                     <Button icon={<UploadOutlined />} loading={loading}>
//                       Click to Upload (Max 5MB)
//                     </Button>
//                   </Upload>
//                 </Form.Item>

//                 <Button
//                   type="primary"
//                   danger
//                   onClick={() => remove(name)}
//                   className="mt-2"
//                 >
//                   Remove Document
//                 </Button>
//               </Card>
//             ))}
//             <Button
//               type="dashed"
//               onClick={() => add()}
//               block
//               icon={<PlusOutlined />}
//               style={{ background: "#f0f2f5" }}
//             >
//               Add Document
//             </Button>
//           </>
//         )}
//       </Form.List>
//     </div>
//   );
// });

// export default DocumentVerification;

//  import React, { memo, useState } from "react";
// import { Form, Upload, Button, Divider, Card, Input, message, Modal } from "antd";
// import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
// import toast from "react-hot-toast";

// const DocumentVerification = memo(() => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [uploadModalVisible, setUploadModalVisible] = useState(false);
//   const [currentFieldName, setCurrentFieldName] = useState(null);
//   const [tempFileList, setTempFileList] = useState([]);

//   // Cloudinary upload handler
//   const handleUpload = async (options) => {
//     const { file, onSuccess, onError, onProgress } = options;
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "newsimgupload");
//       formData.append("cloud_name", "dikxwu8om");

//       const xhr = new XMLHttpRequest();
//       xhr.open(
//         "POST",
//         "https://api.cloudinary.com/v1_1/dikxwu8om/image/upload",
//         true
//       );

//       xhr.upload.onprogress = (e) => {
//         if (e.lengthComputable) {
//           const percent = Math.round((e.loaded / e.total) * 100);
//           onProgress({ percent }, file);
//         }
//       };

//       xhr.onload = () => {
//         if (xhr.status === 200) {
//           const response = JSON.parse(xhr.responseText);
//           onSuccess(response, file);
//           setTempFileList([{
//             uid: file.uid,
//             name: file.name,
//             status: 'done',
//             url: response.secure_url,
//             response: response.secure_url // Important for form submission
//           }]);
//           toast.success(`${file.name} uploaded successfully`);
//         } else {
//           onError(new Error("Upload failed"));
//           toast.error(`${file.name} upload failed`);
//         }
//         setLoading(false);
//       };

//       xhr.onerror = () => {
//         onError(new Error("Upload failed"));
//         toast.error(`${file.name} upload failed`);
//         setLoading(false);
//       };

//       xhr.send(formData);
//     } catch (error) {
//       onError(error);
//       toast.error("Upload failed");
//       setLoading(false);
//     }
//   };

//   const handleUploadClick = (fieldName) => {
//     setCurrentFieldName(fieldName);
//     setUploadModalVisible(true);
//     setTempFileList([]);
//   };

//   const handleModalOk = () => {
//     if (tempFileList.length > 0 && tempFileList[0].url) {
//       const documents = form.getFieldValue('documents') || [];
//       const updatedDocuments = [...documents];
      
//       if (updatedDocuments[currentFieldName]) {
//         updatedDocuments[currentFieldName].documentFile = tempFileList[0].url;
//         form.setFieldsValue({ documents: updatedDocuments });
//       }
//     }
//     setUploadModalVisible(false);
//   };

//   const handleModalCancel = () => {
//     setUploadModalVisible(false);
//     setTempFileList([]);
//   };

//   return (
//     <div className="p-4">
//       <Divider orientation="left">Background + Document Verification</Divider>
//       <Form form={form}>
//         <Form.List name="documents">
//           {(fields, { add, remove }) => (
//             <>
//               {fields.map(({ key, name, ...restField }) => {
//                 const documentFile = form.getFieldValue(['documents', name, 'documentFile']);
                
//                 return (
//                   <Card
//                     key={key}
//                     className="mb-6"
//                     style={{ background: "#f0f2f5" }}
//                   >
//                     <Form.Item
//                       {...restField}
//                       name={[name, "documentType"]}
//                       label="Document Type"
//                       rules={[
//                         { required: true, message: "Document type is required" },
//                       ]}
//                     >
//                       <Input placeholder="e.g., Aadhar Card, Passport, Driving License" />
//                     </Form.Item>

//                     <Form.Item
//                       {...restField}
//                       name={[name, "documentNumber"]}
//                       label="Document Number"
//                       rules={[
//                         { required: true, message: "Document number is required" },
//                       ]}
//                     >
//                       <Input placeholder="Enter document number" />
//                     </Form.Item>

//                     <Form.Item
//                       label="Upload Document"
//                     >
//                       <div>
//                         <Button 
//                           icon={<UploadOutlined />} 
//                           onClick={() => handleUploadClick(name)}
//                         >
//                           Click to Upload Document
//                         </Button>
//                         {documentFile && (
//                           <div style={{ marginTop: 8 }}>
//                             <a href={documentFile} target="_blank" rel="noopener noreferrer">
//                               View Uploaded Document
//                             </a>
//                           </div>
//                         )}
//                       </div>
//                       <Form.Item
//                         {...restField}
//                         name={[name, "documentFile"]}
//                         hidden
//                       />
//                     </Form.Item>

//                     <Button
//                       type="primary"
//                       danger
//                       onClick={() => remove(name)}
//                       className="mt-2"
//                     >
//                       Remove Document
//                     </Button>
//                   </Card>
//                 );
//               })}
//               <Button
//                 type="dashed"
//                 onClick={() => add()}
//                 block
//                 icon={<PlusOutlined />}
//                 style={{ background: "#f0f2f5" }}
//               >
//                 Add Document
//               </Button>
//             </>
//           )}
//         </Form.List>
//       </Form>

//       {/* Upload Modal */}
//       <Modal
//         title="Upload Document"
//         visible={uploadModalVisible}
//         onOk={handleModalOk}
//         onCancel={handleModalCancel}
//         okButtonProps={{ disabled: tempFileList.length === 0 }}
//       >
//         <Upload
//           customRequest={handleUpload}
//           listType="picture-card"
//           maxCount={1}
//           accept="image/*,.pdf"
//           fileList={tempFileList}
//           beforeUpload={(file) => {
//             const isLt5M = file.size / 1024 / 1024 < 5;
//             if (!isLt5M) {
//               message.error("File must be smaller than 5MB!");
//               return Upload.LIST_IGNORE;
//             }
//             return false; // Return false to handle upload manually
//           }}
//           onChange={({ fileList }) => {
//             setTempFileList(fileList);
//             if (fileList.length > 0 && fileList[0].status === 'done') {
//               // Auto-close modal after successful upload if needed
//               // handleModalOk();
//             }
//           }}
//         >
//           {tempFileList.length >= 1 ? null : (
//             <div>
//               <UploadOutlined style={{ fontSize: '20px' }} />
//               <div style={{ marginTop: 8 }}>Click to Upload</div>
//             </div>
//           )}
//         </Upload>
//       </Modal>
//     </div>
//   );
// });

// export default DocumentVerification;


// import React, { memo, useState } from "react";
// import { Form, Upload, Button, Divider, Card, Input } from "antd";
// import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
// import toast from "react-hot-toast";

// const DocumentVerification = memo(() => {
//   const [loading, setLoading] = useState(false);
//   const [uploadedUrls, setUploadedUrls] = useState({});

//   // Cloudinary upload handler
//   const handleUpload = async (options, fieldName) => {
//     const { file, onSuccess, onError, onProgress } = options;
//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "newsimgupload");
//       formData.append("cloud_name", "dikxwu8om");

//       const xhr = new XMLHttpRequest();
//       xhr.open(
//         "POST",
//         "https://api.cloudinary.com/v1_1/dikxwu8om/image/upload",
//         true
//       );

//       xhr.upload.onprogress = (e) => {
//         if (e.lengthComputable) {
//           const percent = Math.round((e.loaded / e.total) * 100);
//           onProgress({ percent }, file);
//         }
//       };

//       xhr.onload = () => {
//         if (xhr.status === 200) {
//           const response = JSON.parse(xhr.responseText);
//           const url = response.secure_url;
//           console.log(uploadedUrls)
        
//           setUploadedUrls(prev => ({
//             ...prev,
//             [fieldName]: url
//           }));
          
//           onSuccess(url, file);
//           toast.success(`${file.name} uploaded successfully`);
//         } else {
//           onError(new Error("Upload failed"));
//           toast.error(`${file.name} upload failed`);
//         }
//         setLoading(false);
//       };

//       xhr.onerror = () => {
//         onError(new Error("Upload failed"));
//         toast.error(`${file.name} upload failed`);
//         setLoading(false);
//       };

//       xhr.send(formData);
//     } catch (error) {
//       onError(error);
//       toast.error("Upload failed");
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4">
//       <Divider orientation="left">Background + Document Verification</Divider>
//       <Form.List name={["documents"]}>
//         {(fields, { add, remove }) => (
//           <>
//             {fields.map(({ key, name, ...restField }) => {
//               console.log(name)

//               const fieldKey = `document-${name}`;
             
//               return (
//                 <Card
//                   key={key}
//                   className="mb-6"
//                   style={{ background: "#f0f2f5" }}
//                 >
//                   <Form.Item
//                     {...restField}
//                     name={[name, "documentType"]}
//                     label="Document Type"
//                     rules={[
//                       { required: true, message: "Document type is required" },
//                     ]}
//                   >
//                     <Input placeholder="e.g., Aadhar Card, Passport, Driving License" />
//                   </Form.Item>

//                   <Form.Item
//                     {...restField}
//                     name={[name, "documentNumber"]}
//                     label="Document Number"
//                     rules={[
//                       { required: true, message: "Document number is required" },
//                     ]}
//                   >
//                     <Input placeholder="Enter document number" />
//                   </Form.Item>

//                   <Form.Item
//                     {...restField}
//                     name={[name, "documentUrl"]}
//                     label="Document URL"
//                     rules={[
//                       { required: true, message: "Document URL is required" },
//                     ]}
//                   >
//                     <Input 
//                       placeholder="Document URL will appear here after upload" 
                       
//                       value={uploadedUrls[fieldKey] || "" }
//                     />
//                   </Form.Item>
// <p> {uploadedUrls[fieldKey] } </p>
//                   <Upload
//                     customRequest={(options) => handleUpload(options, fieldKey)}
//                     listType="text"
//                     maxCount={1}
//                     accept="image/*,.pdf"
//                     beforeUpload={(file) => {
//                       const isLt5M = file.size / 1024 / 1024 < 5;
//                       if (!isLt5M) {
//                         message.error("File must be smaller than 5MB!");
//                         return false;
//                       }
//                       return true;
//                     }}
//                     onChange={(info) => {
//                       if (info.file.status === 'done') {
//                         // URL is already set in handleUpload
//                       } else if (info.file.status === 'error') {
//                         message.error(`${info.file.name} file upload failed.`);
//                       }
//                     }}
//                     showUploadList={false}
//                   >
//                     <Button icon={<UploadOutlined />} loading={loading}>
//                       Click to Upload Document (Max 5MB)
//                     </Button>
//                   </Upload>

//                   <Button
//                     type="primary"
//                     danger
//                     onClick={() => {
//                       remove(name);
//                       // Remove the URL from state when removing the field
//                       setUploadedUrls(prev => {
//                         const newUrls = {...prev};
//                         delete newUrls[fieldKey];
//                         return newUrls;
//                       });
//                     }}
//                     className="mt-2"
//                   >
//                     Remove Document
//                   </Button>
//                 </Card>
//               );
//             })}
//             <Button
//               type="dashed"
//               onClick={() => add()}
//               block
//               icon={<PlusOutlined />}
//               style={{ background: "#f0f2f5" }}
//             >
//               Add Document
//             </Button>
//           </>
//         )}
//       </Form.List>
//     </div>
//   );
// });

// export default DocumentVerification;


import React, { memo, useState } from "react";
import { Form, Upload, Button, Divider, Card, Input, message } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

const DocumentVerification = memo(({ form }) => {
  const [loading, setLoading] = useState(false);

  // Cloudinary upload handler
  const handleUpload = async (options, fieldIndex) => {
    const { file, onSuccess, onError, onProgress } = options;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "newsimgupload");
      formData.append("cloud_name", "dikxwu8om");

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        "https://api.cloudinary.com/v1_1/dikxwu8om/image/upload",
        true
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress({ percent }, file);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const url = response.secure_url;
          
          // Get current documents array from form
          const documents = form.getFieldValue('documents') || [];
          
          // Update the specific document's URL
          documents[fieldIndex] = {
            ...documents[fieldIndex],
            documentUrl: url
          };
          
          // Update the form
          form.setFieldsValue({
            documents: documents
          });
          
          onSuccess(url, file);
          toast.success(`${file.name} uploaded successfully`);
        } else {
          onError(new Error("Upload failed"));
          toast.error(`${file.name} upload failed`);
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        onError(new Error("Upload failed"));
        toast.error(`${file.name} upload failed`);
        setLoading(false);
      };

      xhr.send(formData);
    } catch (error) {
      onError(error);
      toast.error("Upload failed");
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Divider orientation="left">Background + Document Verification</Divider>
      <Form.List name="documents">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => {
              return (
                <Card
                  key={key}
                  className="mb-6"
                  style={{ background: "#f0f2f5" }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "documentType"]}
                    label="Document Type"
                    rules={[
                      { required: true, message: "Document type is required" },
                    ]}
                  >
                    <Input placeholder="e.g., Aadhar Card, Passport, Driving License" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "documentNumber"]}
                    label="Document Number"
                    rules={[
                      { required: true, message: "Document number is required" },
                    ]}
                  >
                    <Input placeholder="Enter document number" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "documentUrl"]}
                    label="Document URL"
                    rules={[
                      { required: true, message: "Document URL is required" },
                    ]}
                  >
                    <Input 
                      placeholder="Document URL will appear here after upload" 
                      readOnly
                    />
                  </Form.Item>

                  <Upload
                    customRequest={(options) => handleUpload(options, name)}
                    listType="text"
                    maxCount={1}
                    accept="image/*,.pdf"
                    beforeUpload={(file) => {
                      const isLt5M = file.size / 1024 / 1024 < 5;
                      if (!isLt5M) {
                        message.error("File must be smaller than 5MB!");
                        return false;
                      }
                      return true;
                    }}
                    onChange={(info) => {
                      if (info.file.status === 'done') {
                        // URL is already set in handleUpload
                      } else if (info.file.status === 'error') {
                        message.error(`${info.file.name} file upload failed.`);
                      }
                    }}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />} loading={loading}>
                      Click to Upload Document (Max 5MB)
                    </Button>
                  </Upload>

                  <Button
                    type="primary"
                    danger
                    onClick={() => remove(name)}
                    className="mt-2"
                  >
                    Remove Document
                  </Button>
                </Card>
              );
            })}
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
              style={{ background: "#f0f2f5" }}
            >
              Add Document
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
});

export default DocumentVerification;