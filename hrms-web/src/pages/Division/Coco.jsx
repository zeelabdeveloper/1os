import React, { useState } from "react";
import { Tabs } from "antd";
import UserManagementCoco from "../Coco/UserList";
import AdminRegularizationList from "../Coco/RequestList";
import Store from "../Coco/Store";
import Attendance from "../Coco/Attendance";

function Coco() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      children: <UserManagementCoco branchId="685a45cfac371d35857d3acf" />,
    },
    {
      key: "regularization",
      label: "Regularization",
      children: <AdminRegularizationList />,
    },
    {
      key: "attendance",
      label: "Attendance",
      children: <Attendance />,
    },
    {
      key: "store",
      label: "Store",
      children: <Store />,
    },
  ];

  return (
    <div className="p-2 h-[92vh] overflow-y-auto ">
      <h1 className="text-2xl font-bold mb-4">Coco</h1>
      <div className="bg-white rounded-lg shadow">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="p-4"
        />
      </div>
    </div>
  );
}

export default Coco;
