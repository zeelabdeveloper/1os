import React, { memo, useState, useEffect } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Form, Upload, Divider, Image, DatePicker, Select, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { State, City } from "country-state-city";

const { Option } = Select;

const ProfileInfo = memo(() => {
  const [fileList, setFileList] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);
 

  // Load states
  const states = State.getStatesOfCountry("IN"); 

  // Load districts when state changes
  useEffect(() => {
    if (selectedState) {
      // Fetch districts using an alternative approach
      const state = states.find((s) => s.isoCode === selectedState);
      const citiesInState = City.getCitiesOfState("IN", selectedState);
      const districts = [...new Set(citiesInState.map((city) => city.district || city.name))]; // Extract unique districts
      setAvailableDistricts(districts);
      setSelectedDistrict(null); // Reset district
       
    } else {
      setAvailableDistricts([]);
    }
  }, [selectedState]);

 

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      console.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    file.preview = URL.createObjectURL(file);
    setFileList([file]);
    return false;
  };

  const handleRemove = () => {
    if (fileList[0]?.preview) {
      URL.revokeObjectURL(fileList[0].preview);
    }
    setFileList([]);
  };

  useEffect(() => {
    return () => {
      if (fileList[0]?.preview) {
        URL.revokeObjectURL(fileList[0].preview);
      }
    };
  }, [fileList]);

  return (
    <div className="p-4">
      <Divider orientation="left">Profile Information</Divider>

      <Form.Item name={["profile", "photo"]} label="Profile Photo">
        <Upload
          listType="picture-card"
          fileList={fileList}
          beforeUpload={beforeUpload}
          onRemove={handleRemove}
          maxCount={1}
          accept="image/*"
        >
          {fileList.length >= 1 ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src={fileList[0].preview}
                alt="profile preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          ) : (
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </Form.Item>

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
          onChange={(value) => setSelectedDistrict(value)}
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

      <Form.Item name={["family", "fatherOccupation"]} label="Father's Occupation">
        <Input placeholder="Enter father's occupation" />
      </Form.Item>

      <Form.Item name={["family", "motherName"]} label="Mother's Name">
        <Input placeholder="Enter mother's name" />
      </Form.Item>

      <Form.Item name={["family", "motherOccupation"]} label="Mother's Occupation">
        <Input placeholder="Enter mother's occupation" />
      </Form.Item>

      <Form.Item name={["family", "numberOfBrothers"]} label="Number of Brothers">
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