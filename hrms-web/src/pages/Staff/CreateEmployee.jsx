import React, { useState, useCallback, memo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserOutlined,
  IdcardOutlined,
  BankOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  LaptopOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { Steps, Button, Form, Switch } from "antd";
import toast from "react-hot-toast";

// Import your components
import ConfirmationStaffCreate from "./ProfileCreating/Confirmation";
import SalaryDetails from "./ProfileCreating/SalaryDetails";
import ProfileInfo from "./ProfileCreating/ProfileInfo";
import BankDetails from "./ProfileCreating/BankDetails";
import WorkExperience from "./ProfileCreating/WorkExperience";
import CreateBasicInfo from "./ProfileCreating/BasicInfo";
import {
  createStaff,
  fetchBranches,
  fetchDepartmentsByBranch,
  fetchRoleByDepartment,
  fetchZonesByBranch,
} from "../../api/auth";
import AssetInfo from "./ProfileCreating/AssetsInfo";
import DocumentVerification from "./ProfileCreating/DocumentInfo";

const { Step } = Steps;

const CreateEmployeeMain = () => {
  const [current, setCurrent] = useState(0);
  const [isCocoStaff, setIsCocoStaff] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // State for branch and department selection
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Fetch branches
  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    enabled: !isCocoStaff,
  });

  // Fetch departments based on selected branch
  const { data: departments } = useQuery({
    queryKey: ["departments", selectedBranch],
    queryFn: () => fetchDepartmentsByBranch(selectedBranch),
    enabled: !!selectedBranch && !isCocoStaff,
  });
  // Fetch Zone based on selected branch
  const { data: zones } = useQuery({
    queryKey: ["zones", selectedBranch],
    queryFn: () => fetchZonesByBranch(selectedBranch),
    enabled: !!selectedBranch && !isCocoStaff,
  });

  // Fetch roles based on selected department
  const { data: roles } = useQuery({
    queryKey: ["roles", selectedDepartment],
    queryFn: () => fetchRoleByDepartment(selectedDepartment),
    enabled: !!selectedDepartment && !isCocoStaff,
  });

  // Mutation for creating user
  const {
    mutate: createUser,
    data,
    isLoading,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: createStaff,
    onSuccess: (data) => {
      toast.success(data.message || "User created successfully!");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  // Wizard steps configuration
  const steps = [
    {
      title: "Basic Info",
      icon: <UserOutlined />,
      content: (
        <CreateBasicInfo
          form={form}
          isCocoStaff={isCocoStaff}
          branches={branches}
          departments={departments}
          zones={zones}
          roles={roles}
          selectedBranch={selectedBranch}
          selectedDepartment={selectedDepartment}
          setSelectedBranch={setSelectedBranch}
          setSelectedDepartment={setSelectedDepartment}
        />
      ),
    },
    {
      title: "Profile",
      icon: <IdcardOutlined />,
      content: <ProfileInfo form={form} />,
    },
    {
      title: "Bank Details",
      icon: <BankOutlined />,
      content: <BankDetails form={form} />,
    },
    {
      title: "Experience",
      icon: <HistoryOutlined />,
      content: <WorkExperience form={form} />,
    },
    {
      title: "Document",
      icon: <PaperClipOutlined />,
      content: <DocumentVerification form={form} />,
    },
    {
      title: "Assets",
      icon: <LaptopOutlined />,
      content: <AssetInfo form={form} />,
    },
    {
      title: "Salary",
      icon: <DollarOutlined />,
      content: <SalaryDetails form={form} />,
    },
    {
      title: "Confirmation",
      icon: <CheckCircleOutlined />,
      content: (
        <ConfirmationStaffCreate
          isLoading={isLoading}
          isError={isError}
          isSuccess={isSuccess}
          data={data}
        />
      ),
    },
  ];

  const next = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue();
        if (values.organization?.branch) {
          setSelectedBranch(values.organization.branch);
        }
        if (values.organization?.department) {
          setSelectedDepartment(values.organization.department);
        }
        setCurrent(current + 1);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        toast.error("Please fill all required fields correctly");
      });
  }, [form, current]);

  const prev = useCallback(() => {
    setCurrent(current - 1);
  }, [current]);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);
        createUser(form.getFieldValue());
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        toast.error("Please fill all required fields correctly");
      });
  }, [form, createUser, isCocoStaff]);

  const handleCocoToggle = (checked) => {
    setIsCocoStaff(checked);
    form.setFieldsValue({
      organization: {
        branch: null,
        department: null,
        role: null,
      },
    });
    setSelectedBranch(null);
    setSelectedDepartment(null);
  };

  return (
    <div className="h-[92vh] overflow-y-auto p-10 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">New Staff Entry</h2>
        <div className="flex hidden items-center">
          <span className="mr-2">COCO Staff</span>
          <Switch
            className="hidden"
            checked={isCocoStaff}
            onChange={handleCocoToggle}
            checkedChildren="Yes"
            unCheckedChildren="No"
          />
        </div>
      </div>

      <Steps current={current} className="mb-8">
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={current === steps.length - 1 ? handleSubmit : next}
        initialValues={{ experiences: [] }}
      >
        <div className="min-h-64">{steps[current].content}</div>
        <div className="mt-8 flex justify-between">
          {current > 0 && (
            <Button onClick={prev} className="mr-2">
              Previous
            </Button>
          )}
          {current < steps.length - 1 ? (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Submit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default CreateEmployeeMain;
