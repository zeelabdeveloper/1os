import React, { useState } from "react";
import { Upload, Button,    Modal, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { uploadCSVToServer } from "../api/auth";
import toast from "react-hot-toast";
 

const UploadCSV = () => {
  const [fileToUpload, setFileToUpload] = useState(null);

  const { mutate, isPending } = useMutation({
    mutationFn: uploadCSVToServer,
    onSuccess: (data) => {
     
      toast.success(`${fileToUpload?.name} uploaded successfully`);
      setFileToUpload(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error(`${fileToUpload?.name} upload failed`);
      setFileToUpload(null);
    },
  });

  const handleUpload = ({ file }) => {
    setFileToUpload(file);
    mutate(file);
  };

  return (
    <>
    
      <Upload   showUploadList={false} customRequest={handleUpload} accept=".csv, .xls, .xlsx">
      
        <Button icon={<UploadOutlined />} type="primary">
          Upload file
        </Button>
      </Upload>

      <Modal
        open={isPending}
        footer={null}
        closable={false}
        centered
        bodyStyle={{ textAlign: "center", padding: 40 }}
      >
        <Spin tip="Uploading..." size="large" />
      </Modal>
    </>
  );
};

export default UploadCSV;
