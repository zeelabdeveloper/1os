import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../axiosConfig";
import {
  BellOutlined,
  FileTextOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  List,
  Badge,
  Skeleton,
  Space,
  Typography,
  Button,
  Popover,
  Tag,
  Divider,
  Avatar,
  Image,
} from "antd";
import useAuthStore from "../stores/authStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const fetchNotifications = async (roleId) => {
  const { data } = await axios.get(`/api/v1/news/notifications?role=${roleId}`);
  return data;
};

const markAsRead = async (notificationId) => {
  await axios.patch(`/api/v1/news/notifications/${notificationId}/read`);
};

function Notification() {
  const { user } = useAuthStore();
  const roleId = user?.Organization?.role?._id;
  const [visible, setVisible] = useState(false);
  const [localReadNotifications, setLocalReadNotifications] = useState(() => {
    // Load read notifications from localStorage on initial render
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("readNotifications");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const {
    data: notifications,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", roleId],
    queryFn: () => fetchNotifications(roleId),
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
 
  // Update localStorage when localReadNotifications changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "readNotifications",
        JSON.stringify(localReadNotifications)
      );
    }
  }, [localReadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Optimistically update local state
      setLocalReadNotifications((prev) => [...prev, notificationId]);

      // Then make the API call
      await markAsRead(notificationId);

      // Refetch to ensure sync with server
      refetch();
    } catch (error) {
      // If API call fails, remove from local read notifications
      setLocalReadNotifications((prev) =>
        prev.filter((id) => id !== notificationId)
      );
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!notifications?.data) return;

    try {
      const unreadNotifications = notifications.data
        .filter((n) => !n.read && !localReadNotifications.includes(n._id))
        .map((n) => n._id);

      // Optimistically update local state
      setLocalReadNotifications((prev) => [...prev, ...unreadNotifications]);

      // Then make the API call
      await axios.patch("/api/notifications/mark-all-read");

      // Refetch to ensure sync with server
      refetch();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };
 
  // Combine server-side read status with local read status
  const getReadStatus = (notification) => {
    return (
      notification.read || localReadNotifications.includes(notification._id)
    );
  };

  const unreadCount =
    (Array.isArray(notifications?.data) &&
      notifications?.data.filter((n) => !getReadStatus(n)).length) ||
    0;

  const content = (
    <div style={{ width: 350 }}   >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px",
          marginBottom: 8,
        }}
      >
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>
      <Divider style={{ margin: "8px 0" }} />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : isError ? (
        <Text type="danger">Failed to load notifications</Text>
      ) : notifications?.data?.length === 0 ? (
        <div style={{ textAlign: "center", padding: 16 }}>
          <FileTextOutlined style={{ fontSize: 24, color: "#bfbfbf" }} />
          <p style={{ marginTop: 8 }}>No notifications yet</p>
        </div>
      ) : (
        <List
        className="h-[30vh] overflow-y-auto " 
          itemLayout="horizontal"
          dataSource={
            (Array.isArray(notifications?.data) && notifications?.data) || []
          }
          renderItem={(notification) => {
            const isRead = getReadStatus(notification);
            return (
              <List.Item
                style={{
                  padding: "12px 16px",
                  backgroundColor: isRead ? "#fff" : "#f6ffed",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (!isRead) {
                    handleMarkAsRead(notification._id);
                  }
                }}
                actions={[
                  !isRead && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                    />
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Image
                      width={100}
                      height={100}
                      src={notification.image}
                      style={{
                         
                        backgroundColor: isRead ? "#d9d9d9" : "#52c41a",
                        objectFit: "cover",
                      }}
                      preview={true}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{notification.title}</Text>
                      {!isRead && <Badge color="green" />}
                    </Space>
                  }
                  description={
                    <>
                      <Text ellipsis>{notification?.summary}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(notification.createdAt).fromNow()}
                        </Text>
                      </div>
                    </>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
      className="mx-4"
      overlayStyle={{ zIndex: 1050 }}
    >
      <Badge count={unreadCount} overflowCount={9}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ width: 30, height: 30 }}
          loading={isLoading}
        />
      </Badge>
    </Popover>
  );
}

export default Notification;
