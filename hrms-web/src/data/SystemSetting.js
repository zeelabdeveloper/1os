import EmailNotification from "../components/setting/EmailNotification";
import EmailSetting from "../components/setting/EmailSetting";
import SystemSettings from "../components/setting/SystemSettings";

export const settingsSections = [
  {
    key: "brand-settings",
    label: "Brand Settings",

    Component: SystemSettings,
  },
  {
    key: "email-settings",
    label: "Email Settings",

    Component: EmailSetting,
  },
  {
    key: "email-notification",
    label: "Email Notification",

    Component: EmailNotification,
  },
];
