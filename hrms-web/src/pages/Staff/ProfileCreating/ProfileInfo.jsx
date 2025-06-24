import React, { memo, useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import {
  Form,
  Upload,
  DatePicker,
  Divider,
  Button,
  message,
  Select,
  Input,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { State, City } from "country-state-city";
import toast from "react-hot-toast";

const { Option } = Select;

const ProfileInfo = memo(({ form }) => {
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [img, setImg] = useState("");
  // Load states
  const states = State.getStatesOfCountry("IN");

  // Load districts when state changes
  useEffect(() => {
    if (selectedState) {
      const state = states.find((s) => s.isoCode === selectedState);
      const citiesInState = City.getCitiesOfState("IN", selectedState);
      const districts = [
        ...new Set(citiesInState.map((city) => city.district || city.name)),
      ];
      setAvailableDistricts(districts);
    } else {
      setAvailableDistricts([]);
    }
  }, [selectedState]);

  const handleUpload = async (options) => {
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

          // Set the photo URL directly in the form
          form.setFieldsValue({
            profile: {
              ...form.getFieldValue("profile"),
              photo: url,
            },
          });
          setImg(url);
          console.log(form.getFieldValue("profile"));
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
      message.error("Upload failed");
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Divider orientation="left">Profile Information</Divider>

     
        <Upload
          customRequest={handleUpload}
          listType="text"
          maxCount={1}
          accept="image/*"
          beforeUpload={(file) => {
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
              message.error("Image must be smaller than 5MB!");
              return false;
            }
            return true;
          }}
          onChange={(info) => {
            if (info.file.status === "done") {
              // URL is already set in handleUpload
            } else if (info.file.status === "error") {
              message.error(`${info.file.name} file upload failed.`);
            }
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            Click to Upload Photo (Max 5MB)
          </Button>
        </Upload>

        
      {form.getFieldValue("profile")?.photo && (
        <div style={{ marginBottom: 16, marginTop:12, }}>
          <img
            src={img}
            alt="Profile preview"
            style={{ maxWidth: "100%", maxHeight: 200 }}
          />
        </div>
      )}

      <Form.Item name={["profile", "dateOfBirth"]} label="Date of Birth">
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name={["profile", "gender"]} label="Gender">
        <Select placeholder="Select gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
          <Option value="other">Other</Option>
        </Select>
      </Form.Item>

      <Form.Item name={["profile", "address"]} label="Address">
        <TextArea rows={4} placeholder="Full address" />
      </Form.Item>

      <Form.Item name={["profile", "state"]} label="State">
        <Select
          placeholder="Select state"
          onChange={(value) => setSelectedState(value)}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {states.map((state) => (
            <Option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name={["profile", "district"]} label="District">
        <Select
          placeholder="Select district"
          disabled={!selectedState}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {availableDistricts.map((district) => (
            <Option key={district} value={district}>
              {district}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Divider orientation="left">Family Information</Divider>

      <Form.Item name={["family", "fatherName"]} label="Father's Name">
        <Input placeholder="Enter father's name" />
      </Form.Item>

      <Form.Item
        name={["family", "fatherOccupation"]}
        label="Father's Occupation"
      >
        <Input placeholder="Enter father's occupation" />
      </Form.Item>

      <Form.Item name={["family", "motherName"]} label="Mother's Name">
        <Input placeholder="Enter mother's name" />
      </Form.Item>

      <Form.Item
        name={["family", "motherOccupation"]}
        label="Mother's Occupation"
      >
        <Input placeholder="Enter mother's occupation" />
      </Form.Item>

      <Form.Item
        name={["family", "numberOfBrothers"]}
        label="Number of Brothers"
      >
        <Input type="number" min={0} placeholder="Enter number of brothers" />
      </Form.Item>

      <Form.Item name={["family", "numberOfSisters"]} label="Number of Sisters">
        <Input type="number" min={0} placeholder="Enter number of sisters" />
      </Form.Item>

      <Form.Item name={["family", "hasCrimeRecord"]} label="Any Crime Record?">
        <Select placeholder="Select option">
          <Option value="no">No</Option>
          <Option value="yes">Yes</Option>
        </Select>
      </Form.Item>

      <Form.Item name={["family", "crimeReason"]} label="Reason (if any)">
        <TextArea rows={3} placeholder="Mention reason if applicable" />
      </Form.Item>
    </div>
  );
});

export default ProfileInfo;
