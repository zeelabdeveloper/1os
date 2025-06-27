// import React, { useState, useEffect } from "react";
// import { Layout, Menu, Button } from "antd";
// import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

// import { useNavigate, useLocation } from "react-router-dom";

// import { SiOpenzeppelin } from "react-icons/si";

// import useAuthStore from "../stores/authStore";
// import { menuItems } from "../config/LeftBarList";
// const { Sider } = Layout;
// const { SubMenu } = Menu;

// const LeftMenu = () => {
//   const { user, webSetting, EmployeeId, permissions } = useAuthStore(
//     (state) => state
//   );
//   console.log(EmployeeId, permissions)
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [collapsed, setCollapsed] = useState(false);
//   const [openKeys, setOpenKeys] = useState([]);

//   useEffect(() => {
//     const currentPath = location.pathname;
//     const selectedSubmenu = menuItems.find(
//       (item) =>
//         item.children &&
//         item.children.some((child) => child.key === currentPath)
//     );
//     setOpenKeys(selectedSubmenu ? [selectedSubmenu.key] : []);
//   }, [location.pathname]);

//   const toggleCollapsed = () => {
//     setCollapsed(!collapsed);
//   };

//   const onOpenChange = (keys) => {
//     const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
//     setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
//   };

//   const renderMenuItems = (items) => {
//     return items.map((item) => {
//       if (item.children) {
//         return (
//           <SubMenu key={item.key} icon={item.icon} title={item.label}>
//             {renderMenuItems(item.children)}
//           </SubMenu>
//         );
//       }
//       return (
//         <Menu.Item className="" key={item.key} icon={item.icon}>
//           <span className="flex items-center gap-2">
//             <SiOpenzeppelin
//               size={8}
//               style={{ color: webSetting?.leftSideBarTextColor || "#fff" }}
//             />
//             | {item.label}
//           </span>
//         </Menu.Item>
//       );
//     });
//   };

//   return (
//     <Sider
//       collapsible
//       collapsed={collapsed}
//       trigger={null}
//       style={{
//         Height: "100vh",
//         background: webSetting?.leftSideBarBackgroundColor || "#0AA699",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <div
//         style={{
//           padding: "10px",
//           height: "8vh",
//           background: webSetting?.buttonColor || "#001529",
//           color: webSetting?.leftSideBarTextColor || "#fff",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: collapsed ? "flex-end" : "space-between",
//           flexShrink: 0,
//         }}
//       >
//         {!collapsed && (
//           <p
//             style={{
//               fontSize: "1.25rem",
//               fontWeight: "bold",
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               margin: 0,
//               color: webSetting?.leftSideBarTextColor || "#fff",
//             }}
//           >
//             {user?.fullName ? user.fullName : "Zee Lab"}
//           </p>
//         )}

//         <Button
//           type="text"
//           icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//           onClick={toggleCollapsed}
//           style={{
//             color: webSetting?.iconColor || "#fff",
//           }}
//         />
//       </div>

//       <div
//         style={{
//           flex: 1,
//           height: "92vh",
//           overflowY: "auto",
//           overflowX: "hidden",
//         }}
//       >
//         <h1
//           style={{ fontSize: collapsed ? "1rem" : "1.4rem" }}
//           className="  text-center bg-white py-2 font-semibold text-gray-800"
//         >
//           1OS
//         </h1>

//         <Menu
//           theme="dark"
//           mode="inline"
//           className="flex-1   bg-red-600"
//           style={{
//             borderRight: 0,
//           }}
//           selectedKeys={[location.pathname]}
//           onClick={({ key }) => navigate(key)}
//           openKeys={collapsed ? [] : openKeys}
//           onOpenChange={onOpenChange}
//         >
//           {renderMenuItems(menuItems)}
//         </Menu>
//       </div>
//     </Sider>
//   );
// };

// export default LeftMenu;


import React, { useState, useEffect } from "react";
import { Layout, Menu, Button } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { SiOpenzeppelin } from "react-icons/si";
import useAuthStore from "../stores/authStore";
import { menuItems } from "../config/LeftBarList";

const { Sider } = Layout;
const { SubMenu } = Menu;

const LeftMenu = () => {
  const { user, webSetting, EmployeeId, permissions } = useAuthStore(
    (state) => state
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    const currentPath = location.pathname;
    const selectedSubmenu = menuItems.find(
      (item) =>
        item.children &&
        item.children.some((child) => child.key === currentPath)
    );
    setOpenKeys(selectedSubmenu ? [selectedSubmenu.key] : []);
  }, [location.pathname]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  // Check if user has permission for a specific route
  const hasPermission = (path) => {
    if (!permissions || permissions.length === 0) return false;
    return permissions.some(permission => permission.url === path);
  };

  // Filter menu items based on permissions
  const filterMenuItems = (items) => {
    return items.filter(item => {
      // Always show parent items (for menu structure)
      if (item.children) {
        // Filter children first
        const filteredChildren = filterMenuItems(item.children);
        // Only keep parent if it has at least one allowed child
        return filteredChildren.length > 0;
      }
      // For leaf nodes, check permission
      return hasPermission(item.key);
    });
  };

  const renderMenuItems = (items) => {
    return items.map((item) => {
      if (item.children) {
        const filteredChildren = filterMenuItems(item.children);
        if (filteredChildren.length === 0) return null;

        return (
          <SubMenu key={item.key} icon={item.icon} title={item.label}>
            {renderMenuItems(filteredChildren)}
          </SubMenu>
        );
      }

      if (!hasPermission(item.key)) return null;

      return (
        <Menu.Item className="" key={item.key} icon={item.icon}>
          <span className="flex items-center gap-2">
            <SiOpenzeppelin
              size={8}
              style={{ color: webSetting?.leftSideBarTextColor || "#fff" }}
            />
            | {item.label}
          </span>
        </Menu.Item>
      );
    });
  };

  // Get filtered menu items based on permissions
  const filteredMenuItems = filterMenuItems(menuItems);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={{
        Height: "100vh",
        background: webSetting?.leftSideBarBackgroundColor || "#0AA699",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Rest of your Sider component remains the same */}
      <div
        style={{
          padding: "10px",
          height: "8vh",
          background: webSetting?.buttonColor || "#001529",
          color: webSetting?.leftSideBarTextColor || "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "flex-end" : "space-between",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <p
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              margin: 0,
              color: webSetting?.leftSideBarTextColor || "#fff",
            }}
          >
            {user?.fullName ? user.fullName : "Zee Lab"}
          </p>
        )}

        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          style={{
            color: webSetting?.iconColor || "#fff",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          height: "92vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <h1
          style={{ fontSize: collapsed ? "1rem" : "1.4rem" }}
          className="text-center bg-white py-2 font-semibold text-gray-800"
        >
          1OS
        </h1>

        <Menu
          theme="dark"
          mode="inline"
          className="flex-1"
          style={{
            borderRight: 0,
          }}
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={onOpenChange}
        >
          {renderMenuItems(filteredMenuItems)}
        </Menu>
      </div>
    </Sider>
  );
};

export default LeftMenu;