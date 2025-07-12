import {
  DashboardOutlined,
  UserOutlined,
  MediumOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { FcDataConfiguration } from "react-icons/fc";

import { IoIosAnalytics, IoIosPaper } from "react-icons/io";
import { FaHouse, FaHouseChimneyMedical } from "react-icons/fa6";

import {
  MdAccountBalance,
  MdOutlineSettingsSuggest,
  MdOutlinePayments,
} from "react-icons/md";
import { GiHelp } from "react-icons/gi";

const menuItems = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },

  {
    key: "division",
    icon: <FaHouse />,
    label: "Division",
    children: [
      {
        key: "/division/coco",
        label: "Coco",
      },
      {
        key: "/division/fofo",
        label: "Fofo",
      },
      {
        key: "/division/sis",
        label: "Sis",
      },
    ],
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







//  {
//     key: "Coco Management",
//     icon: <FaHouseChimneyMedical />,
//     label: "Coco ",
//     children: [
//       {
//         key: "/coco/userlist",
//         label: "User List",
//       },
//       {
//         key: "/coco/createuser",
//         label: "Create User",
//       },
//       {
//         key: "/coco/attendance",
//         label: "Attendance List",
//       },
//       {
//         key: "/coco/request-list",
//         label: "Request List",
//       },
//       {
//         key: "/coco/store",
//         label: "Store",
//       },
//     ],
//   },














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
    key: "team",
    icon: <TeamOutlined />,
    label: "My Team",
    children: [
      {
        key: "/team/logs",
        label: "Members",
      },
    ],
  },
  {
    key: "Support",
    icon: <GiHelp />,
    label: "Support",
    children: [
      {
        key: "/support/need-emp",
        label: "Need a Emoloyeee",
      },
      {
        key: "/support/manager-request",
        label: "Get Request From Manager",
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
      {
        key: "/content/news",
        label: "News",
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
        label: "Onboarding",
      },
      {
        key: "/recruitment/separation",
        label: "Separation",
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
      {
        key: "/performance/appraisals/team",
        label: "Team Appraisals",
      },
      {
        key: "/performance/appraisal",
        label: "My Appraisals",
      },
      {
        key: "/performance/my-task",
        label: "My Task",
      },
      {
        key: "/performance/team-task",
        label: "Team Task",
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
        key: "/permission/zones",

        label: "Sis Zones",
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
    icon: <MdOutlineSettingsSuggest />,
    label: "Settings",

    children: [
      {
        key: "/profiles",
        label: "Profiles",
      },
      {
        key: "/developer-settings",
        label: "Developer Access",
      },
      {
        key: "/controllers",

        label: "Settings",
      },
      {
        key: "/edit-profile",
        label: "Edit Profile",
      },
      {
        key: "/separation",
        label: "Resignation",
      },
      {
        key: "/faq",
        label: "Help",
      },
    ],
  },
];

export { menuItems };
