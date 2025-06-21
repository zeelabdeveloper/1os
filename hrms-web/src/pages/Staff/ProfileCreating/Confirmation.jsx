// src/components/UserCreationWizard.jsx
import React, { memo } from "react";
import { 
  FaUser, 
 
  FaBuilding, 
  FaMoneyBillWave, 
  FaUniversity, 
  FaBriefcase,
  FaIdCard,
 
} from "react-icons/fa";

// Memoized Step Content Components
const ConfirmationStaffCreate = memo(({ form }) => {
  const summary = form || {};

  const renderSection = (title, icon, items) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mt-6 p-4 border rounded bg-gray-50 shadow-sm">
        <h4 className="font-medium mb-3 flex items-center text-blue-600">
          {React.createElement(icon, { className: "mr-2" })}
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, index) => (
            item.value && (
              <div key={index} className="flex items-start">
                <span className="font-medium text-gray-600 min-w-[120px]">{item.label}:</span>
                <span className="text-gray-800">{item.value}</span>
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!summary.experiences || summary.experiences.length === 0) return null;

    return (
      <div className="mt-6 p-4 border rounded bg-gray-50 shadow-sm">
        <h4 className="font-medium mb-3 flex items-center text-blue-600">
          <FaBriefcase className="mr-2" />
          Work Experience
        </h4>
        {summary.experiences.map((exp, index) => (
          <div key={index} className="mb-4 last:mb-0 pb-4 border-b last:border-b-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exp.company && (
                <div className="flex">
                  <span className="font-medium text-gray-600 min-w-[120px]">Company:</span>
                  <span className="text-gray-800">{exp.company}</span>
                </div>
              )}
              {exp.position && (
                <div className="flex">
                  <span className="font-medium text-gray-600 min-w-[120px]">Position:</span>
                  <span className="text-gray-800">{exp.position}</span>
                </div>
              )}
              {exp.duration && (
                <div className="flex">
                  <span className="font-medium text-gray-600 min-w-[120px]">Duration:</span>
                  <span className="text-gray-800">{exp.duration}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Basic Information
  const basicInfoItems = [
    { label: "First Name", value: summary.user?.firstName },
    { label: "Last Name", value: summary.user?.lastName },
    { label: "Email", value: summary.user?.email },
    { label: "Phone", value: summary.user?.contactNumber },
    { label: "Gender", value: summary.profile?.gender },
    { label: "Address", value: summary.profile?.address },
  ].filter(item => item.value);

  // Bank Information
  const bankItems = [
    { label: "Bank Name", value: summary.bank?.bankName },
    { label: "Account Number", value: summary.bank?.accountNumber },
    { label: "Branch", value: summary.bank?.branch },
    { label: "IFSC Code", value: summary.bank?.ifscCode },
  ].filter(item => item.value);

  // Salary Information
  const salaryItems = [
    { label: "Basic Salary", value: summary.salary?.basicSalary },
    { label: "HRA", value: summary.salary?.hra },
    { label: "DA", value: summary.salary?.da },
    { label: "Other Allowances", value: summary.salary?.otherAllowances },
    { label: "PF", value: summary.salary?.pf },
    { label: "Tax", value: summary.salary?.tax },
    { label: "Payment Frequency", value: summary.salary?.paymentFrequency },
  ].filter(item => item.value);

  // Organization Information
  const orgItems = [
    { label: "Branch", value: summary.organization?.branch },
    { label: "Department", value: summary.organization?.department },
    { label: "Role", value: summary.organization?.role },
  ].filter(item => item.value);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h3 className="text-2xl font-semibold mb-6 text-center text-blue-700 flex justify-center items-center">
        <FaIdCard className="mr-3" />
        Review Your Information
      </h3>
      <p className="text-gray-600 text-center mb-8">
        Please review all the information below before submitting.
      </p>

      {renderSection("Personal Information", FaUser, basicInfoItems)}
      {renderSection("Bank Details", FaUniversity, bankItems)}
      {renderSection("Salary Information", FaMoneyBillWave, salaryItems)}
      {renderSection("Organization Details", FaBuilding, orgItems)}
      {renderExperience()}

      <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-100">
        <p className="text-blue-700 text-center">
          <strong>Note:</strong> After submission, you'll receive a confirmation email with these details.
        </p>
      </div>
    </div>
  );
});

export default ConfirmationStaffCreate;