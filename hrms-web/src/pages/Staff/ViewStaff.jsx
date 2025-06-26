import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Avatar,
  message,
  Tag,
  Skeleton,
  Empty,
  Button,
  Space,
  Divider,
  Descriptions,
  Badge,
  Popconfirm,
  DatePicker,
  Switch,
  Select,
  Input,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  BankOutlined,
  DollarOutlined,
  ApartmentOutlined,
  ClockCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  TeamOutlined,
  UploadOutlined,
  PlusOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckOutlined,
  DeliveredProcedureOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";
import {
  fetchBranches,
  fetchDepartmentsByBranch,
  fetchRoleByDepartment,
} from "../../api/auth";
const { Option } = Select;

const ViewStaff = () => {
  const [searchParams] = useSearchParams();
  const empId = searchParams.get("emp");
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [error, setError] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const queryClient = useQueryClient();
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/user/staff/${empId}`);
      console.log(response.data);
      setStaffData(response.data.data);
    } catch (err) {
      console.error("Error fetching staff data:", err);
      setError(err.response?.data?.message || "Failed to fetch staff data");
      message.error("Failed to fetch staff details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (empId) {
      fetchStaffData();
    } else {
      setError("No employee ID provided");
      setLoading(false);
    }
  }, [empId]);

  const updateStaffMutation = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.put(
        `/api/v1/user/staff/${empId}`,
        updatedData
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Staff details updated successfully");
      fetchStaffData();
      setEditingSection(null);
    },
    onError: (error) => {
      message.error(
        `Update failed: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleEditSection = (section) => {
    setEditingSection(section);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSave = (sectionData) => {
    console.log(sectionData);
    updateStaffMutation.mutate({
      [editingSection]: sectionData,
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-lg">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-red-500">{error}</span>}
          >
            <Button type="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className=" h-[92vh] overflow-y-auto mx-auto px-4 py-8">
      <Card
        className="shadow-lg"
        title={
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Employee Details</span>
          </div>
        }
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 flex flex-col items-center">
            {loading ? (
              <>
                <Skeleton.Avatar active size={150} shape="circle" />
                <Skeleton.Input active className="mt-4 w-40" />
                <Skeleton.Input active className="mt-2 w-32" size="small" />
                <Skeleton.Input active className="mt-2 w-32" size="small" />
                <Skeleton.Button active className="mt-4" size="small" />
              </>
            ) : (
              <>
                <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-gray-300 shadow-2xl mb-4 flex items-center justify-center bg-gray-100">
                  {staffData?.Profile?.photo ? (
                    <img
                      src={staffData.Profile.photo}
                      alt="Profile"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <UserOutlined style={{ fontSize: "48px", color: "#aaa" }} />
                  )}
                </div>
                <h2 className="text-2xl mt-3 font-bold text-center">
                  {staffData?.firstName} {staffData?.lastName}
                </h2>
                <p className="text-gray-600 mb-2 flex items-center">
                  <MailOutlined className="mr-2" />
                  {staffData?.email}
                </p>
                {staffData?.contactNumber && (
                  <p className="text-gray-600 mb-4 flex items-center">
                    <PhoneOutlined className="mr-2" />
                    {staffData.contactNumber}
                  </p>
                )}
                <div className="flex gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm font-semibold transition-all duration-500 shadow-md
      ${
        staffData?.isActive
          ? "bg-green-500 animate-pulse"
          : "bg-red-500 animate-pulse"
      }
    `}
                  >
                    {staffData?.isActive ? "Active" : "Inactive"}
                  </span>

                  {staffData?.isCocoEmployee && (
                    <span className="px-3 py-1 rounded-full bg-green-600 text-white text-sm font-semibold transition-all duration-500 shadow-md hover:scale-105 animate-fade-in">
                      COCO
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Details Section */}
          <div className="w-full md:w-3/4 space-y-6">
            {/* Personal Details Card */}
            <PersonalDetailsCard
              data={staffData}
              loading={loading}
              isEditing={editingSection === "personal"}
              onEdit={() => handleEditSection("personal")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />
            <ProfileCard
              data={staffData?.Profile}
              loading={loading}
              isEditing={editingSection === "profile"}
              onEdit={() => handleEditSection("profile")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            {/* Organization Details Card */}
            <OrganizationCard
              data={staffData?.Organization}
              employee={staffData?.EmployeeId}
              loading={loading}
              isEditing={editingSection === "organization"}
              onEdit={() => handleEditSection("organization")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            {/* Bank Details Card */}
            <BankDetailsCard
              data={staffData?.Bank}
              loading={loading}
              isEditing={editingSection === "bank"}
              onEdit={() => handleEditSection("bank")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            {/* Salary Details Card */}
            <SalaryDetailsCard
              data={staffData?.Salary}
              loading={loading}
              isEditing={editingSection === "salary"}
              onEdit={() => handleEditSection("salary")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            {/* Experience Card */}
            <ExperienceCard
              data={staffData?.Experience}
              loading={loading}
              isEditing={editingSection === "experience"}
              onEdit={() => handleEditSection("experience")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />

            <AssetCard
              data={staffData?.Asset}
              loading={loading}
              isEditing={editingSection === "asset"}
              onEdit={() => handleEditSection("asset")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />
            <DocumentCard
              data={staffData?.Document}
              loading={loading}
              isEditing={editingSection === "document"}
              onEdit={() => handleEditSection("document")}
              onCancel={handleCancelEdit}
              onSave={handleSave}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

// Personal Details Card Component
const PersonalDetailsCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    firstName: data?.firstName || "",
    lastName: data?.lastName || "",
    email: data?.email || "",
    contactNumber: data?.contactNumber || "",
    dateOfJoining: data?.dateOfJoining || "",
    isActive: data?.isActive || false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        email: data?.email || "",
        contactNumber: data?.contactNumber || "",
        dateOfJoining: data?.dateOfJoining || "",
        isActive: data.isActive || false,
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <IdcardOutlined className="mr-2" />
            Personal Details
          </span>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={() => onSave(formData)}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="First Name"
            value={formData?.firstName}
            onChange={(value) => handleChange("firstName", value)}
          />
          <EditableField
            label="Last Name"
            value={formData?.lastName}
            onChange={(value) => handleChange("lastName", value)}
          />
          <EditableField
            label="Email"
            value={formData?.email}
            onChange={(value) => handleChange("email", value)}
          />
          <EditableField
            label="Contact Number"
            value={formData?.contactNumber}
            onChange={(value) => handleChange("contactNumber", value)}
          />
          <EditableField
            label="Date of Joining"
            value={formData?.dateOfJoining}
            type="date"
            onChange={(value) => handleChange("dateOfJoining", value)}
          />
          <EditableField
            label="Status"
            value={formData?.isActive}
            type="switch"
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            onChange={(value) => handleChange("isActive", value)}
          />
        </div>
      ) : (
        <Descriptions column={2}>
          <Descriptions.Item label="First Name">
            {data?.firstName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Last Name">
            {data?.lastName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {data?.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Contact Number">
            {data?.contactNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Date of Joining">
            {data?.dateOfJoining
              ? format(new Date(data.dateOfJoining), "PPP")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge
              status={data?.isActive ? "success" : "error"}
              text={data?.isActive ? "Active" : "Inactive"}
            />
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

const ProfileCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    address: "",
    state: "",
    district: "",

    family: {
      fatherName: "",
      fatherOccupation: "",
      motherName: "",
      motherOccupation: "",
      numberOfBrothers: 0,
      numberOfSisters: 0,
      hasCrimeRecord: false,
      crimeReason: "",
    },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "",
        address: data.address || "",
        state: data.state || "",
        district: data.district || "",

        family: {
          fatherName: data.family?.fatherName || "",
          fatherOccupation: data.family?.fatherOccupation || "",
          motherName: data.family?.motherName || "",
          motherOccupation: data.family?.motherOccupation || "",
          numberOfBrothers: data.family?.numberOfBrothers || 0,
          numberOfSisters: data.family?.numberOfSisters || 0,
          hasCrimeRecord: data.family?.hasCrimeRecord || false,
          crimeReason: data.family?.crimeReason || "",
        },
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleFileUpload = (info) => {
    if (info.file.status === "done") {
      handleChange("photo", info.file.response.url);
    }
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <UserOutlined className="mr-2" />
            Profile Details
          </span>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={() => onSave(formData)}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : isEditing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Date of Birth
              </label>
              <DatePicker
                className="w-full"
                value={
                  formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null
                }
                onChange={(date, dateString) =>
                  handleChange("dateOfBirth", dateString)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Gender
              </label>
              <Select
                className="w-full"
                value={formData.gender}
                onChange={(value) => handleChange("gender", value)}
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                State
              </label>
              <Input
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                District/City
              </label>
              <Input
                value={formData.district}
                onChange={(e) => handleChange("district", e.target.value)}
              />
            </div>
          </div>

          <Divider orientation="left" orientationMargin={0}>
            <TeamOutlined className="mr-2" />
            Family Details
          </Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Father's Name
              </label>
              <Input
                value={formData.family.fatherName}
                onChange={(e) =>
                  handleChange("family.fatherName", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Father's Occupation
              </label>
              <Input
                value={formData.family.fatherOccupation}
                onChange={(e) =>
                  handleChange("family.fatherOccupation", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Mother's Name
              </label>
              <Input
                value={formData.family.motherName}
                onChange={(e) =>
                  handleChange("family.motherName", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Mother's Occupation
              </label>
              <Input
                value={formData.family.motherOccupation}
                onChange={(e) =>
                  handleChange("family.motherOccupation", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Number of Brothers
              </label>
              <InputNumber
                className="w-full"
                value={formData.family.numberOfBrothers}
                onChange={(value) =>
                  handleChange("family.numberOfBrothers", value)
                }
                min={0}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Number of Sisters
              </label>
              <InputNumber
                className="w-full"
                value={formData.family.numberOfSisters}
                onChange={(value) =>
                  handleChange("family.numberOfSisters", value)
                }
                min={0}
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Has Crime Record
              </label>
              <Switch
                checked={
                  formData.family.hasCrimeRecord === "yes" ? true : false
                }
                onChange={(checked) =>
                  handleChange(
                    "family.hasCrimeRecord",
                    checked === true ? "yes" : "no"
                  )
                }
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1">
                Crime Reason
              </label>
              <Input
                value={formData.family.crimeReason}
                onChange={(e) =>
                  handleChange("family.crimeReason", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ) : (
        // <div className="space-y-6">
        //   <Descriptions column={2}>
        //     <Descriptions.Item label="Date of Birth">
        //       {data?.dateOfBirth
        //         ? dayjs(data.dateOfBirth).format("DD MMMM YYYY")
        //         : "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Gender">
        //       {data?.gender
        //         ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
        //         : "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Address">
        //       {data?.address || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="State">
        //       {data?.state || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="District/City">
        //       {data?.district || "N/A"}
        //     </Descriptions.Item>
        //   </Descriptions>

        //   <Divider orientation="left" orientationMargin={0}>
        //     <TeamOutlined className="mr-2" />
        //     Family Details
        //   </Divider>

        //   <Descriptions column={2}>
        //     <Descriptions.Item label="Father's Name">
        //       {data?.family?.fatherName || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Father's Occupation">
        //       {data?.family?.fatherOccupation || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Mother's Name">
        //       {data?.family?.motherName || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Mother's Occupation">
        //       {data?.family?.motherOccupation || "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Brothers">
        //       {data?.family?.numberOfBrothers ?? "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Sisters">
        //       {data?.family?.numberOfSisters ?? "N/A"}
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Crime Record">
        //       <Badge
        //         status={data?.family?.hasCrimeRecord ? "error" : "success"}
        //         text={data?.family?.hasCrimeRecord ? "Yes" : "No"}
        //       />
        //     </Descriptions.Item>
        //     <Descriptions.Item label="Crime Reason">
        //       {data?.family?.crimeReason ?? "N/A"}
        //     </Descriptions.Item>
        //   </Descriptions>
        // </div>

        <div className="space-y-6">
          <Descriptions column={2}>
            {data?.dateOfBirth && (
              <Descriptions.Item label="Date of Birth">
                {dayjs(data.dateOfBirth).format("DD MMMM YYYY")}
              </Descriptions.Item>
            )}

            {data?.gender && (
              <Descriptions.Item label="Gender">
                {data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}
              </Descriptions.Item>
            )}

            {data?.address && (
              <Descriptions.Item label="Address">
                {data.address}
              </Descriptions.Item>
            )}

            {data?.state && (
              <Descriptions.Item label="State">{data.state}</Descriptions.Item>
            )}

            {data?.district && (
              <Descriptions.Item label="District/City">
                {data.district}
              </Descriptions.Item>
            )}
          </Descriptions>

          {data?.family &&
            (data.family.fatherName ||
              data.family.fatherOccupation ||
              data.family.motherName ||
              data.family.motherOccupation ||
              data.family.numberOfBrothers != null ||
              data.family.numberOfSisters != null ||
              data.family.hasCrimeRecord != null ||
              data.family.crimeReason) && (
              <>
                <Divider orientation="left" orientationMargin={0}>
                  <TeamOutlined className="mr-2" />
                  Family Details
                </Divider>

                <Descriptions column={2}>
                  {data.family.fatherName && (
                    <Descriptions.Item label="Father's Name">
                      {data.family.fatherName}
                    </Descriptions.Item>
                  )}

                  {data.family.fatherOccupation && (
                    <Descriptions.Item label="Father's Occupation">
                      {data.family.fatherOccupation}
                    </Descriptions.Item>
                  )}

                  {data.family.motherName && (
                    <Descriptions.Item label="Mother's Name">
                      {data.family.motherName}
                    </Descriptions.Item>
                  )}

                  {data.family.motherOccupation && (
                    <Descriptions.Item label="Mother's Occupation">
                      {data.family.motherOccupation}
                    </Descriptions.Item>
                  )}

                  {data.family.numberOfBrothers != null && (
                    <Descriptions.Item label="Brothers">
                      {data.family.numberOfBrothers}
                    </Descriptions.Item>
                  )}

                  {data.family.numberOfSisters != null && (
                    <Descriptions.Item label="Sisters">
                      {data.family.numberOfSisters}
                    </Descriptions.Item>
                  )}

                  {data.family.hasCrimeRecord != null && (
                    <Descriptions.Item label="Crime Record">
                      <Badge
                        status={
                          data.family.hasCrimeRecord === "yes"
                            ? "error"
                            : "success"
                        }
                        text={
                          data.family.hasCrimeRecord === "yes" ? "Yes" : "No"
                        }
                      />
                    </Descriptions.Item>
                  )}

                  {data.family.crimeReason && (
                    <Descriptions.Item label="Crime Reason">
                      {data.family.crimeReason}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
        </div>
      )}
    </Card>
  );
};

// Organization Card Component

const OrganizationCard = ({
  data,
  employee,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  // Form state - stores only IDs
  const [formData, setFormData] = useState({
    branch: null,
    department: null,
    role: null,
    employmentType: "full-time",
    isActive: true,
  });

  // API Fetch Functions (replace with your actual API calls)

  // Data Fetching with React Query
  // Branches
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  // Departments (depends on formData.branch)
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", formData.branch],
    queryFn: () => fetchDepartmentsByBranch(formData.branch),
    enabled: !!formData.branch,
  });

  // Roles (depends on formData.department)
  const { data: roles = [] } = useQuery({
    queryKey: ["roles", formData.department],
    queryFn: () => fetchRoleByDepartment(formData.department),
    enabled: !!formData.department,
  });

  // Initialize form data
  useEffect(() => {
    if (data) {
      setFormData({
        branch: data?.branch?._id || null,
        department: data?.department?._id || null,
        role: data?.role?._id || null,
        employmentType: data?.employmentType || "full-time",
        isActive: data?.isActive ?? true,
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };

      // Reset logic
      if (field === "branch") {
        newState.department = null;
        newState.role = null;
      } else if (field === "department") {
        newState.role = null;
      }
      // Role change doesn't affect anything

      return newState;
    });
  };

  const handleSave = () => {
    if (!formData.branch || !formData.department || !formData.role) {
      toast.error("Please select branch, department and role");
      return;
    }
    onSave(formData);
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <ApartmentOutlined className="mr-2" />
            Organization Details
          </span>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={handleSave}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Branch Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <Select
              value={formData.branch}
              onChange={(value) => handleChange("branch", value)}
              placeholder="Select Branch"
              className="w-full"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              loading={!branches}
            >
              {branches.map((branch) => (
                <Option key={branch._id} value={branch._id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Select
              value={formData.department}
              onChange={(value) => handleChange("department", value)}
              placeholder="Select Department"
              className="w-full"
              disabled={!formData.branch}
              loading={formData.branch && departments.length === 0}
              showSearch
              optionFilterProp="children"
            >
              {departments.map((dept) => (
                <Option key={dept._id} value={dept._id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <Select
              value={formData.role}
              onChange={(value) => handleChange("role", value)}
              placeholder="Select Role"
              className="w-full"
              disabled={!formData.department}
              loading={formData.department && roles.length === 0}
              showSearch
              optionFilterProp="children"
            >
              {roles.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Employment Type
            </label>
            <Select
              value={formData.employmentType}
              onChange={(value) => handleChange("employmentType", value)}
              className="w-full"
            >
              <Option value="full-time">Full Time</Option>
              <Option value="part-time">Part Time</Option>
              <Option value="contract">Contract</Option>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex items-center">
              <Switch
                checked={formData.isActive}
                onChange={(checked) => handleChange("isActive", checked)}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </div>
          </div>
        </div>
      ) : (
        // View Mode
        <Descriptions column={2}>
          <Descriptions.Item label="Branch">
            {data?.branch?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Department">
            {data?.department?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            {data?.role?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Employee ID">
            {employee?.employeeId || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Employment Type">
            {data?.employmentType
              ? data.employmentType.charAt(0).toUpperCase() +
                data.employmentType.slice(1)
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge
              status={data?.isActive ? "success" : "error"}
              text={data?.isActive ? "Active" : "Inactive"}
            />
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

// Bank Details Card Component
const BankDetailsCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    accountNumber: data?.accountNumber || "",
    bankName: data?.bankName || "",
    accountType: data?.accountType || "savings",
    accountHolderName: data?.accountHolderName || "",
    ifscCode: data?.ifscCode || "",
    branch: data?.branch || "",
    verified: data?.verified || false,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        accountNumber: data.accountNumber || "",
        bankName: data.bankName || "",
        accountType: data.accountType || "savings",
        accountHolderName: data.accountHolderName || "",
        ifscCode: data.ifscCode || "",
        branch: data.branch || "",
        verified: data?.verified || false,
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <BankOutlined className="mr-2" />
              Bank Details
            </span>
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Add Bank Details
            </Button>
          </div>
        }
      >
        <Empty description="No bank details available" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <BankOutlined className="mr-2" />
            Bank Details
          </span>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={() => onSave(formData)}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="Bank Name"
            value={formData.bankName}
            onChange={(value) => handleChange("bankName", value)}
          />
          <EditableField
            label="Account Number"
            value={formData.accountNumber}
            onChange={(value) => handleChange("accountNumber", value)}
          />
          <EditableField
            label="Account Holder Name"
            value={formData.accountHolderName}
            onChange={(value) => handleChange("accountHolderName", value)}
          />
          <EditableField
            label="Account Type"
            value={formData.accountType}
            type="select"
            options={[
              { value: "savings", label: "Savings" },
              { value: "current", label: "Current" },
              { value: "salary", label: "Salary" },
            ]}
            onChange={(value) => handleChange("accountType", value)}
          />
          <EditableField
            label="IFSC Code"
            value={formData.ifscCode}
            onChange={(value) => handleChange("ifscCode", value)}
          />
          <EditableField
            label="Branch"
            value={formData.branch}
            onChange={(value) => handleChange("branch", value)}
          />

          <Switch
            checked={formData.verified}
            onChange={(checked) => handleChange("verified", checked)}
            checkedChildren="Varified"
            unCheckedChildren="Not Varified"
          />
        </div>
      ) : (
        <Descriptions column={2}>
          <Descriptions.Item label="Bank Name">
            {data.bankName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Account Number">
            {data.accountNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Account Holder">
            {data.accountHolderName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Account Type">
            {data.accountType
              ? data.accountType.charAt(0).toUpperCase() +
                data.accountType.slice(1)
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="IFSC Code">
            {data.ifscCode || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Branch">
            {data.branch || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Verification Status">
            <Badge
              status={data.verified ? "success" : "error"}
              text={data.verified ? "Verified" : "Not Verified"}
            />
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

// Salary Details Card Component
const SalaryDetailsCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    basicSalary: data?.basicSalary || 0,
    hra: data?.hra || 0,
    da: data?.da || 0,
    conveyance: data?.conveyance || 0,
    medical: data?.medical || 0,
    otherAllow: data?.otherAllow || 0,
    pf: data?.pf || 0,
    tds: data?.tds || 0,
    esi: data?.esi || 0,
    paymentFrequency: data?.paymentFrequency || "monthly",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        basicSalary: data.basicSalary || 0,
        hra: data.hra || 0,
        da: data.da || 0,
        conveyance: data.conveyance || 0,
        medical: data.medical || 0,
        otherAllow: data.otherAllow || 0,
        pf: data.pf || 0,
        tds: data.tds || 0,
        esi: data.esi || 0,
        paymentFrequency: data.paymentFrequency || "monthly",
      });
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value) => {
    return value ? `₹${value.toLocaleString("en-IN")}` : "₹0";
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <DollarOutlined className="mr-2" />
              Salary Details
            </span>
            <Button icon={<EditOutlined />} onClick={onEdit}>
              Add Salary Details
            </Button>
          </div>
        }
      >
        <Empty description="No salary details available" />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <DollarOutlined className="mr-2" />
            Salary Details
          </span>
          {!isEditing ? (
            <Button icon={<EditOutlined />} onClick={onEdit} disabled={loading}>
              Edit
            </Button>
          ) : (
            <Space>
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" onClick={() => onSave(formData)}>
                Save
              </Button>
            </Space>
          )}
        </div>
      }
    >
      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="Basic Salary"
            value={formData.basicSalary}
            type="number"
            onChange={(value) => handleChange("basicSalary", value)}
          />
          <EditableField
            label="HRA"
            value={formData.hra}
            type="number"
            onChange={(value) => handleChange("hra", value)}
          />
          <EditableField
            label="DA"
            value={formData.da}
            type="number"
            onChange={(value) => handleChange("da", value)}
          />
          <EditableField
            label="Conveyance"
            value={formData.conveyance}
            type="number"
            onChange={(value) => handleChange("conveyance", value)}
          />
          <EditableField
            label="Medical"
            value={formData.medical}
            type="number"
            onChange={(value) => handleChange("medical", value)}
          />
          <EditableField
            label="Other Allowances"
            value={formData.otherAllow}
            type="number"
            onChange={(value) => handleChange("otherAllow", value)}
          />
          <EditableField
            label="PF"
            value={formData.pf}
            type="number"
            onChange={(value) => handleChange("pf", value)}
          />
          <EditableField
            label="TDS"
            value={formData.tds}
            type="number"
            onChange={(value) => handleChange("tds", value)}
          />
          <EditableField
            label="ESI"
            value={formData.esi}
            type="number"
            onChange={(value) => handleChange("esi", value)}
          />
          <EditableField
            label="Payment Frequency"
            value={formData.paymentFrequency}
            type="select"
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "weekly", label: "Weekly" },
              { value: "bi-weekly", label: "Bi-Weekly" },
            ]}
            onChange={(value) => handleChange("paymentFrequency", value)}
          />
        </div>
      ) : (
        <div>
          <Descriptions column={2}>
            <Descriptions.Item label="Basic Salary">
              {formatCurrency(data.basicSalary)}
            </Descriptions.Item>
            <Descriptions.Item label="HRA">
              {formatCurrency(data.hra)}
            </Descriptions.Item>
            <Descriptions.Item label="DA">
              {formatCurrency(data.da)}
            </Descriptions.Item>
            <Descriptions.Item label="Conveyance">
              {formatCurrency(data.conveyance)}
            </Descriptions.Item>
            <Descriptions.Item label="Medical">
              {formatCurrency(data.medical)}
            </Descriptions.Item>
            <Descriptions.Item label="Other Allowances">
              {formatCurrency(data.otherAllow)}
            </Descriptions.Item>
            <Descriptions.Item label="PF">
              {formatCurrency(data.pf)}
            </Descriptions.Item>
            <Descriptions.Item label="TDS">
              {formatCurrency(data.tds)}
            </Descriptions.Item>
            <Descriptions.Item label="ESI">
              {formatCurrency(data.esi)}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Frequency">
              {data.paymentFrequency
                ? data.paymentFrequency.charAt(0).toUpperCase() +
                  data.paymentFrequency.slice(1)
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-700">Gross Salary</h4>
              <p className="text-xl font-bold">
                {formatCurrency(data.grossSalary)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700">Total Deductions</h4>
              <p className="text-xl font-bold">
                {formatCurrency(data.totalDeductions)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-700">Net Salary</h4>
              <p className="text-xl font-bold">
                {formatCurrency(data.netSalary)}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Experience Card Component
const ExperienceCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    employmentType: "full-time",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
  });

  const [experiences, setExperiences] = useState(data || []);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (data) {
      setExperiences(data);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddExperience = () => {
    setEditingIndex(null);
    setFormData({
      companyName: "",
      jobTitle: "",
      employmentType: "full-time",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      description: "",
    });
    onEdit();
  };

  const handleEditExperience = (index) => {
    setEditingIndex(index);
    setFormData({
      companyName: experiences[index].companyName || "",
      jobTitle: experiences[index].jobTitle || "",
      employmentType: experiences[index].employmentType || "full-time",
      startDate: experiences[index].startDate || "",
      endDate: experiences[index].endDate || "",
      currentlyWorking: experiences[index].currentlyWorking || false,
      description: experiences[index].description || "",
    });
    onEdit();
  };

  const handleSaveExperience = () => {
    if (editingIndex !== null) {
      // Update existing experience
      const updatedExperiences = [...experiences];
      updatedExperiences[editingIndex] = formData;
      setExperiences(updatedExperiences);
    } else {
      // Add new experience
      setExperiences((prev) => [...prev, formData]);
    }
    onSave(experiences);
  };

  const handleRemoveExperience = (index) => {
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(updatedExperiences);
    onSave(updatedExperiences);
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return "N/A";

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} years ${months} months`;
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <ClockCircleOutlined className="mr-2" />
            Work Experience
          </span>
          {!isEditing && (
            <Button
              icon={<EditOutlined />}
              onClick={handleAddExperience}
              disabled={loading}
            >
              Add Experience
            </Button>
          )}
        </div>
      }
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Company Name"
              value={formData.companyName}
              onChange={(value) => handleChange("companyName", value)}
            />
            <EditableField
              label="Job Title"
              value={formData.jobTitle}
              onChange={(value) => handleChange("jobTitle", value)}
            />
            <EditableField
              label="Employment Type"
              value={formData.employmentType}
              type="select"
              options={[
                { value: "full-time", label: "Full Time" },
                { value: "part-time", label: "Part Time" },
                { value: "contract", label: "Contract" },
                { value: "internship", label: "Internship" },
              ]}
              onChange={(value) => handleChange("employmentType", value)}
            />
            <EditableField
              label="Start Date"
              value={formData.startDate}
              type="date"
              onChange={(value) => handleChange("startDate", value)}
            />
            <EditableField
              label="Currently Working"
              value={formData.currentlyWorking}
              type="switch"
              checkedChildren="Yes"
              unCheckedChildren="No"
              onChange={(value) => handleChange("currentlyWorking", value)}
            />
            {!formData.currentlyWorking && (
              <EditableField
                label="End Date"
                value={formData.endDate}
                type="date"
                onChange={(value) => handleChange("endDate", value)}
              />
            )}
          </div>
          <EditableField
            label="Description"
            value={formData.description}
            type="textarea"
            onChange={(value) => handleChange("description", value)}
          />

          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSaveExperience}>
              {editingIndex !== null ? "Update Experience" : "Add Experience"}
            </Button>
          </div>
        </div>
      ) : experiences && experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <Card key={index} className="relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditExperience(index)}
                />
                <Popconfirm
                  title="Are you sure to delete this experience?"
                  onConfirm={() => handleRemoveExperience(index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>

              <Descriptions column={2}>
                <Descriptions.Item label="Company">
                  {exp.companyName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Position">
                  {exp.jobTitle || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Employment Type">
                  {exp.employmentType
                    ? exp.employmentType.charAt(0).toUpperCase() +
                      exp.employmentType.slice(1)
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {calculateDuration(exp.startDate, exp.endDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {exp.startDate
                    ? format(new Date(exp.startDate), "PPP")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {exp.currentlyWorking
                    ? "Present"
                    : exp.endDate
                    ? format(new Date(exp.endDate), "PPP")
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>

              {exp.description && (
                <div className="mt-4">
                  <p className="font-semibold">Description:</p>
                  <p className="text-gray-700">{exp.description}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="No work experience records found" />
      )}
    </Card>
  );
};
const AssetCard = ({ data, loading, isEditing, onEdit, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    purchaseDate: "",
    quantity: 1,
  });

  const [assets, setAssets] = useState(data || []);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (data) {
      setAssets(data);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAsset = () => {
    setEditingIndex(null);
    setFormData({
      name: "",
      price: "",
      purchaseDate: "",
      quantity: 1,
    });
    onEdit();
  };

  const handleEditAsset = (index) => {
    setEditingIndex(index);
    setFormData({
      name: assets[index].name || "",
      price: assets[index].price || "",
      purchaseDate: assets[index].purchaseDate || "",
      quantity: assets[index].quantity || 1,
    });
    onEdit();
  };

  const handleSaveAsset = () => {
    if (editingIndex !== null) {
      // Update existing asset
      const updatedAssets = [...assets];
      updatedAssets[editingIndex] = formData;
      setAssets(updatedAssets);
    } else {
      // Add new asset
      setAssets((prev) => [...prev, formData]);
    }
    onSave(assets);
  };

  const handleRemoveAsset = (index) => {
    const updatedAssets = assets.filter((_, i) => i !== index);
    setAssets(updatedAssets);
    onSave(updatedAssets);
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <ShoppingOutlined className="mr-2" />
            Assets
          </span>
          {!isEditing && (
            <Button
              icon={<PlusOutlined />}
              onClick={handleAddAsset}
              disabled={loading}
            >
              Add Asset
            </Button>
          )}
        </div>
      }
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Asset Name"
              value={formData.name}
              onChange={(value) => handleChange("name", value)}
            />
            <EditableField
              label="Price"
              value={formData.price}
              type="number"
              onChange={(value) => handleChange("price", value)}
            />
            <EditableField
              label="Purchase Date"
              value={formData.purchaseDate}
              type="date"
              onChange={(value) => handleChange("purchaseDate", value)}
            />
            <EditableField
              label="Quantity"
              value={formData.quantity}
              type="number"
              min={1}
              onChange={(value) => handleChange("quantity", value)}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSaveAsset}>
              {editingIndex !== null ? "Update Asset" : "Add Asset"}
            </Button>
          </div>
        </div>
      ) : assets && assets.length > 0 ? (
        <div className="space-y-4">
          {assets.map((asset, index) => (
            <Card key={index} className="relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditAsset(index)}
                />
                <Popconfirm
                  title="Are you sure to delete this asset?"
                  onConfirm={() => handleRemoveAsset(index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>

              <Descriptions column={2}>
                <Descriptions.Item label="Asset Name">
                  {asset.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  {asset.price ? `₹${asset.price}` : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Purchase Date">
                  {asset.purchaseDate
                    ? format(new Date(asset.purchaseDate), "PPP")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Quantity">
                  {asset.quantity || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Total Value">
                  {asset.price && asset.quantity
                    ? `₹${asset.price * asset.quantity}`
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="No asset records found" />
      )}
    </Card>
  );
};

const DocumentCard = ({
  data,
  loading,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onVerify,
}) => {
  const [formData, setFormData] = useState({
    documentType: "Aadhar Card",
    documentNumber: "",
    documentUrl: "",
    verified: false,
  });

  const [documents, setDocuments] = useState(data || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (data) {
      setDocuments(data);
    }
  }, [data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddDocument = () => {
    setEditingIndex(null);
    setFormData({
      documentType: "Aadhar Card",
      documentNumber: "",
      documentUrl: "",
      verified: false,
    });
    onEdit();
  };

  const handleEditDocument = (index) => {
    setEditingIndex(index);
    setFormData({
      ...documents[index],
    });
    onEdit();
  };

  const handleSaveDocument = () => {
    let updatedDocuments;

    if (editingIndex !== null) {
      // Update existing document
      updatedDocuments = [...documents];
      updatedDocuments[editingIndex] = formData;
    } else {
      // Add new document
      updatedDocuments = [...documents, formData];
    }

    setDocuments(updatedDocuments);
    onSave(updatedDocuments);
    onCancel();
  };

  const handleRemoveDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
    onSave(updatedDocuments);
  };

  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  const documentTypes = [
    "Aadhar Card",
    "PAN Card",
    "Passport",
    "Driving License",
    "Voter ID",
    "Ration Card",
    "Other",
  ];

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <FileTextOutlined className="mr-2 text-blue-500" />
            <span className="text-lg font-semibold">Documents</span>
          </span>
          {!isEditing && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddDocument}
              disabled={loading}
            >
              Add Document
            </Button>
          )}
        </div>
      }
      className="shadow-lg"
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Document Type"
              value={formData.documentType}
              type="select"
              options={documentTypes.map((type) => ({
                value: type,
                label: type,
              }))}
              onChange={(value) => handleChange("documentType", value)}
            />
            <EditableField
              label="Document Number"
              value={formData.documentNumber}
              onChange={(value) => handleChange("documentNumber", value)}
              placeholder="Enter document number"
            />

            <EditableField
              label="Verification"
              value={formData.verified}
              type="switch"
              checkedChildren="Verified"
              unCheckedChildren="Unverified"
              onChange={(value) => handleChange("verified", value)}
            />

            <EditableField
              label="Document URL"
              value={formData.documentUrl}
              onChange={(value) => handleChange("documentUrl", value)}
              placeholder="Paste document image URL"
              type="upload"
            />
          </div>

          {formData.documentUrl && (
            <div className="mt-4">
              <p className="font-medium mb-2">Document Preview:</p>
              <div className="w-48 h-32 border rounded-md overflow-hidden">
                <Avatar
                  shape="square"
                  src={formData.documentUrl}
                  alt="Document preview"
                  className="!w-full !h-full object-contain"
                  onClick={() => handlePreview(formData.documentUrl)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSaveDocument}>
              {editingIndex !== null ? "Update Document" : "Add Document"}
            </Button>
          </div>
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-6">
          {documents.map((doc, index) => (
            <Card
              key={index}
              className="relative border border-gray-100 hover:border-blue-100 transition-all"
              bodyStyle={{ padding: "16px" }}
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditDocument(index)}
                />
                <Popconfirm
                  title="Are you sure to delete this document?"
                  onConfirm={() => handleRemoveDocument(index)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button size="small" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                  <div
                    className="h-40 bg-gray-50 rounded-md flex items-center justify-center cursor-pointer overflow-hidden border"
                    onClick={() => handlePreview(doc.documentUrl)}
                  >
                    {doc.documentUrl ? (
                      <Avatar
                        size={"large"}
                        shape="square"
                        src={doc.documentUrl}
                        alt="Document"
                        className="w-full h-full !w-full !h-full object-contain"
                      />
                    ) : (
                      <FileTextOutlined className="text-4xl text-gray-400" />
                    )}
                  </div>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(doc.documentUrl)}
                    className="mt-2"
                  >
                    View Full
                  </Button>
                </div>

                <div className="w-full md:w-3/4">
                  <Descriptions
                    column={1}
                    size="small"
                    className="document-details"
                  >
                    <Descriptions.Item label="Document Type">
                      <span className="font-medium">
                        {doc.documentType || "N/A"}
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Document Number">
                      <Tag color="blue" className="text-sm">
                        {doc.documentNumber || "N/A"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Uploaded On">
                      {doc.createdAt
                        ? format(new Date(doc.createdAt), "PPP")
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag
                        color={doc.verified ? "green" : "orange"}
                        icon={
                          doc.verified ? <CheckOutlined /> : <CloseOutlined />
                        }
                      >
                        {doc.verified ? "Verified" : "Pending Verification"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>

                  {onVerify && !doc.verified && (
                    <div className="mt-4">
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => onVerify(doc._id)}
                      >
                        Verify Document
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          description={
            <span className="text-gray-500">No documents added yet</span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleAddDocument}>
            Add Your First Document
          </Button>
        </Empty>
      )}

      {previewVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Document Preview</h3>
              <Button
                icon={<CloseOutlined />}
                type="text"
                onClick={() => setPreviewVisible(false)}
              />
            </div>
            <div className="p-4 flex justify-center">
              <Avatar
                shape="square"
                src={previewImage}
                alt="Document preview"
                className="!w-full !h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const EditableField = ({
  label,
  value,
  type = "text",
  options,
  onChange,
  ...props
}) => {
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleSwitchChange = (checked) => {
    onChange(checked);
  };

  const handleSelectChange = (value) => {
    onChange(value);
  };

  const handleDateChange = (date, dateString) => {
    onChange(dateString);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-600 text-sm font-medium mb-1">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={handleInputChange}
          rows={3}
        />
      ) : type === "switch" ? (
        <div>
          <Switch checked={value} onChange={handleSwitchChange} {...props} />
        </div>
      ) : type === "select" ? (
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={(e) => handleSelectChange(e.target.value)}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "date" ? (
        <DatePicker
          className="w-full"
          value={value ? dayjs(value) : null}
          onChange={handleDateChange}
        />
      ) : (
        <input
          type={type}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={handleInputChange}
          {...props}
        />
      )}
    </div>
  );
};

export default ViewStaff;
