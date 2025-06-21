 
import { Layout, Button, Dropdown, Avatar, Space, Badge, Modal } from "antd";
import {
  BellOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { FiLogOut } from "react-icons/fi";
import { FullLogo } from "../../locale/local";
import useAuthStore from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const { Header } = Layout;

const TopHeader = () => {
  const { user, logout } = useAuthStore((state) => state);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
console.log("fgfgfgf")
  const notifications = [
    { id: 1, title: "New report generated", time: "2 hours ago" },
    { id: 2, title: "System update available", time: "1 day ago" },
  ];

  const handleMenuClick = (e) => {
    if (e.key === "1") {
      navigate("/profile");
    } else if (e.key === "3") {
      setIsLogoutModalOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const menuItems = [
    {
      key: "1",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "2",
      label: "Settings",
      icon: <UserOutlined />,
    },
    { type: "divider" },
    {
      key: "3",
      label: "Logout",
      icon: <FiLogOut className="mr-2" />,
      danger: true,
    },
  ];

  return (
    <>
      <Header className="flex items-center justify-between !px-1 !h-[8vh]    !bg-white shadow-2xl">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img
            src={FullLogo}
            alt="Logo"
            style={{
              maxWidth: "150px",
              maxHeight: "70px",
            }}
          />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          <Button
            type="text"
            onClick={() => navigate("/faq")}
            icon={<QuestionCircleOutlined className="text-gray-500" />}
            className="hidden sm:flex"
          />

          <Dropdown
            menu={{
              items: notifications.map((item) => ({
                key: item.id,
                label: (
                  <div className="w-64 p-2">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                ),
              })),
            }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Badge count={notifications.length} size="small">
              <Button
                type="text"
                icon={<BellOutlined className="text-gray-500" />}
              />
            </Badge>
          </Dropdown>

          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
          >
            <Space className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <DownOutlined className="text-xs text-gray-500" />
            </Space>
          </Dropdown>
        </div>
      </Header>

      <Modal
        title="Confirm Logout"
        open={isLogoutModalOpen}
        onOk={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        okText="Logout"
        okButtonProps={{
          danger: true,
          icon: <FiLogOut className="mr-1" />,
        }}
        cancelButtonProps={{
          type: "text",
        }}
      >
        <div className="flex items-center">
          <FiLogOut className="text-lg mr-3 text-gray-600" />
          <p>Are you sure you want to logout?</p>
        </div>
      </Modal>
    </>
  );
};

export default TopHeader;
