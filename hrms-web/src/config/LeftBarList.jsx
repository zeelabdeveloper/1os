import {
  DashboardOutlined,
  UserOutlined,
  MediumOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { FcDataConfiguration } from "react-icons/fc";
import { RiListSettingsLine } from "react-icons/ri";
import { IoIosAnalytics, IoIosPaper } from "react-icons/io";
import { FaHouseChimneyMedical } from "react-icons/fa6";

import {
  MdAccountBalance,
  MdOutlineSettingsSuggest,
  MdOutlinePayments,
} from "react-icons/md";

const menuItems = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },

  {
    key: "staff",
    icon: <UserOutlined />,
    label: "Staff",
    children: [
      {
        key: "/staff/employees",
        label: "All Employees",
      },

      {
        key: "/staff/create",
        label: "Create Employee",
      },
    ],
  },

  {
    key: "attendance",
    icon: <ClockCircleOutlined />,
    label: "Attendance",
    children: [
      {
        key: "/attendance/daily",
        label: "Daily Logs",
      },
      {
        key: "/attendance/monthly",
        label: "Monthly View",
      },

      {
        key: "/attendance/reports",
        label: "Reports",
      },
    ],
  },
  {
    key: "Coco Management",
    icon: <FaHouseChimneyMedical />,
    label: "Coco Management",
    children: [
      {
        key: "/coco/userlist",
        label: "User List",
      },
      {
        key: "/coco/createuser",
        label: "Create User",
      },
      {
        key: "/coco/attendance",
        label: "Attendance List",
      },
      {
        key: "/coco/request-list",
        label: "Request List",
      },
    ],
  },
  {
    key: "Store",
    icon: <FaHouseChimneyMedical />,
    label: "Stores",
    children: [
      {
        key: "/store/Store",
        label: "Store List",
      },
      {
        key: "/store/storegroup",
        label: "Store Group",
      },
      {
        key: "/store/staff",
        label: "Staff",
      },
    ],
  },
  {
    key: "content",
    icon: <MediumOutlined />,
    label: "Content",
    children: [
      {
        key: "/content/letter",
        label: "Letter",
      },
    ],
  },

  {
    key: "recruitment",
    icon: <IoIosPaper />,
    label: "Recruitment",
    children: [
      {
        key: "/recruitment/jobs",
        label: "Jobs",
      },
      {
        key: "/recruitment/create",
        label: "Job Create",
      },
      {
        key: "/recruitment/applications",
        label: "Job Applications",
      },

      {
        key: "/recruitment/onboarding",
        label: "Job Onboarding",
      },

      {
        key: "/recruitment/interviews",
        label: "Interviews",
      },
    ],
  },

  {
    key: "performance",
    icon: <IoIosAnalytics />,
    label: "Performance",
    children: [
      {
        key: "/performance/indicators",
        label: "KPIs & Indicators",
      },
      {
        key: "/performance/goals",
        label: "Goal Tracking",
      },
      {
        key: "/performance/appraisals",
        label: "Appraisals",
      },
    ],
  },

  {
    key: "finance",
    icon: <MdAccountBalance />,
    label: "Finance",
    children: [
      {
        key: "/account/list",
        label: "Account List",
      },
      {
        key: "/account/balance",
        label: "Account Balance",
      },
      {
        key: "/account/payee",
        label: "Payee",
      },
      {
        key: "/account/payer",
        label: "Payer",
      },
      {
        key: "/account/trasnfer-balance",
        label: "Transfer Balance",
      },
      {
        key: "/account/expense",
        label: "Expense",
      },
    ],
  },
  {
    key: "Payroll",
    icon: <MdOutlinePayments />,
    label: "Payroll",
    children: [
      {
        key: "/payroll/set-salary",
        label: "Set Salary",
      },
      {
        key: "/payroll/pay-slip",
        label: "Pay Slip",
      },
    ],
  },

  {
    key: "/permissions",
    icon: <FcDataConfiguration />,
    label: "Permissions",
    children: [
      {
        key: "/permission/roles",

        label: "Roles",
      },
      {
        key: "/permission/branches",

        label: "Branch",
      },
      {
        key: "/permission/departments",

        label: "Departments",
      },
      {
        key: "/permission/permissions-list",
        label: "Permissions List",
      },
      {
        key: "/permission/storegrp",
        label: "Store Group",
      },
      {
        key: "/permission/store",
        label: "Store",
      },
      {
        key: "/permission/storecontrollers",
        label: "Store Controllers",
      },
    ],
  },

  {
    key: "/1os/setup?type=initial",
    icon: <DashboardOutlined />,
    label: "HRMS System Setup",
  },

  {
    key: "/settings",
    icon: <RiListSettingsLine />,
    label: "Settings",
  },

  {
    key: "/settings",
    icon: <MdOutlineSettingsSuggest />,
    label: "Settings",

    children: [
      {
        key: "/profiles",
        label: "Profiles",
      },

      {
        key: "/helps",
        label: "Helps",
      },
      {
        key: "/developer-settings",
        label: "Developer Access",
      },
    ],
  },
];

export { menuItems };
