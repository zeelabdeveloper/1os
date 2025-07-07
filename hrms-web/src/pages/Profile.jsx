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
  TeamOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import axios from "../axiosConfig";
import dayjs from "dayjs";
import { format } from "date-fns";
import useAuthStore from "../stores/authStore";
import toast from "react-hot-toast";

const ViewProfile = () => {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/user/staff/${user._id}`);

      setStaffData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch staff data");
      toast.error("Failed to fetch staff details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user._id) {
      fetchStaffData();
    } else {
      setError("No employee ID provided");
      setLoading(false);
    }
  }, []);

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
            <PersonalDetailsCard data={staffData} loading={loading} />
            <ProfileCard data={staffData?.Profile} loading={loading} />

            {/* Organization Details Card */}
            <OrganizationCard
              data={staffData?.Organization}
              employee={staffData?.EmployeeId}
              loading={loading}
            />

            {/* Bank Details Card */}
            <BankDetailsCard data={staffData?.Bank} loading={loading} />

            {/* Salary Details Card */}
            <SalaryDetailsCard data={staffData?.Salary} loading={loading} />

            {/* Experience Card */}
            <ExperienceCard data={staffData?.Experience} loading={loading} />

            <AssetCard data={staffData?.Asset} loading={loading} />
            <DocumentCard data={staffData?.Document} loading={loading} />
          </div>
        </div>
      </Card>
    </div>
  );
};

// Personal Details Card Component
const PersonalDetailsCard = ({ data, loading }) => {
  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <IdcardOutlined className="mr-2" />
            Personal Details
          </span>
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
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

const ProfileCard = ({ data, loading }) => {
  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <UserOutlined className="mr-2" />
            Profile Details
          </span>
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
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
const OrganizationCard = ({ data, employee, loading }) => {
  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <ApartmentOutlined className="mr-2" />
            Organization Details
          </span>
        </div>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
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
const BankDetailsCard = ({ data, loading }) => {
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
        </div>
      }
    >
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
    </Card>
  );
};

// Salary Details Card Component
const SalaryDetailsCard = ({ data, loading }) => {
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
        </div>
      }
    >
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
    </Card>
  );
};

// Experience Card Component
const ExperienceCard = ({ data, loading }) => {
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
        </div>
      }
    >
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((exp, index) => (
            <Card key={index} className="relative">
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

const AssetCard = ({ data, loading }) => {
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
        </div>
      }
    >
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((asset, index) => (
            <Card key={index} className="relative">
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

const DocumentCard = ({ data, loading }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
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
            <FileTextOutlined className="mr-2 text-blue-500" />
            <span className="text-lg font-semibold">Documents</span>
          </span>
        </div>
      }
      className="shadow-lg"
    >
      {data && data.length > 0 ? (
        <div className="space-y-6">
          {data.map((doc, index) => (
            <Card
              key={index}
              className="relative border border-gray-100 hover:border-blue-100 transition-all"
              bodyStyle={{ padding: "16px" }}
            >
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
        />
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

export default ViewProfile;
