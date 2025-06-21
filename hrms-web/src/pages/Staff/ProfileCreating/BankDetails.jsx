 // src/components/UserCreationWizard.jsx
import React, { useState, useCallback, memo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
 
import {
  UserOutlined,
  IdcardOutlined,
  BankOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  PlusOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  Steps,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  Divider,
  Switch,
  message,
} from "antd";
import toast from "react-hot-toast";
 
 
const BankDetails = memo(() => (
  <div className="p-4">
    <Divider orientation="left">Bank Information</Divider>
    <Form.Item
      name={["bank", "accountNumber"]}
      label="Account Number"
      rules={[{ required: true, message: "Please input account number!" }]}
    >
      <Input placeholder="Account Number" />
    </Form.Item>
    <Form.Item
      name={["bank", "accountHolderName"]}
      label="Account Holder Name"
      
    >
      <Input placeholder="Account Holder Name" />
    </Form.Item>
    <Form.Item
      name={["bank", "bankName"]}
      label="Bank Name"
      rules={[{ required: true, message: "Please input bank name!" }]}
    >
      <Input placeholder="Bank Name" />
    </Form.Item>
    <Form.Item name={["bank", "branch"]} label="Branch">
      <Input placeholder="Branch" />
    </Form.Item>
    <Form.Item name={["bank", "ifscCode"]} label="IFSC Code">
      <Input placeholder="IFSC Code" />
    </Form.Item>
  </div>
));

 
 export default BankDetails
 