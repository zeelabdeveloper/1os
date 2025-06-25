import React from "react";
import { Tabs } from "antd";
import DocumentVerification from "./DocumentVerification";
import OnboardingChecklist from "./OnboardingChecklist";
import AssetManagement from "./AssetManagement"; // Similar to DocumentVerification but for assets

const OnboardingProcess = () => {
  const [form] = Form.useForm();

  return (
    <div className="p-4">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Onboarding Checklist" key="1">
          <OnboardingChecklist form={form} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Document Verification" key="2">
          <DocumentVerification form={form} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Asset Management" key="3">
          <AssetManagement form={form} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default OnboardingProcess;