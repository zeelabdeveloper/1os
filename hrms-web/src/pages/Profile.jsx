import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Avatar,
  Skeleton,
  Tabs,
  Tag,
  Button,
  Statistic,
  Divider,
  List,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EditOutlined,
  CalendarOutlined,
  IdcardOutlined,
  TeamOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { FiSettings, FiActivity } from "react-icons/fi";
import { fetchUser } from "../api/auth";

function Profile() {
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchUser,
  });

  const items = [
    {
      key: "1",
      label: (
        <span className="flex items-center">
          <UserOutlined className="mr-2" />
          Overview
        </span>
      ),
      children: <ProfileOverview profile={profile} loading={isLoading} />,
    },
    {
      key: "2",
      label: (
        <span className="flex items-center">
          <FiActivity className="mr-2" />
          Activity
        </span>
      ),
      children: <ActivityTab loading={isLoading} />,
    },
    {
      key: "3",
      label: (
        <span className="flex items-center">
          <TeamOutlined className="mr-2" />
          Teams
        </span>
      ),
      children: <TeamsTab profile={profile} loading={isLoading} />,
    },
    {
      key: "4",
      label: (
        <span className="flex items-center">
          <FiSettings className="mr-2" />
          Settings
        </span>
      ),
      children: <SettingsTab loading={isLoading} />,
    },
  ];

  if (isError) return <div className="p-4">Error loading profile data</div>;

  return (
    <div className="flex-1 h-[92vh] overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50">
      <Card className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <ProfileSidebar profile={profile} loading={isLoading} />
          </div>

          <div className="flex-1">
            {/* <Tabs
              defaultActiveKey="1"
              items={items}
              tabPosition="top"
              className="profile-tabs"
            /> */}
          </div>
        </div>
      </Card>
    </div>
  );
}

const ProfileSidebar = ({ profile, loading }) => {
 console.log(profile)
  return (
    <div className="flex flex-col items-center">
      <Skeleton loading={loading} active avatar paragraph={{ rows: 4 }} round>
        {profile && (
          <>
            <Avatar
              size={128}
              src={profile.photo}
              icon={<UserOutlined />}
              className="mb-4 border-2 border-blue-100"
            />
            {profile.user.fullName && (
              <h2 className="text-2xl font-bold text-center">
                {profile.user.fullName}
              </h2>
            )}
            <Tag color="blue" className="mt-2">
              {profile.role}
            </Tag>

            <Divider className="my-4" />

            <div className="w-full space-y-3">
              <div className="flex items-center">
                <MailOutlined className="mr-3 text-gray-500" />
                <span>{profile.user.email}</span>
              </div>
              <div className="flex items-center">
                <PhoneOutlined className="mr-3 text-gray-500" />
                <span>{profile.user.contactNumber}</span>
              </div>
              <div className="flex items-center">
                <EnvironmentOutlined className="mr-3 text-gray-500" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center">
                <CalendarOutlined className="mr-3 text-gray-500" />
                <span>Joined {profile.joinDate}</span>
              </div>
            </div>

            <Divider className="my-4" />

            <Button type="primary" icon={<EditOutlined />} className="w-full">
              Edit Profile
            </Button>
          </>
        )}
      </Skeleton>
    </div>
  );
};

const ProfileOverview = ({ profile, loading }) => {
  return (
    <div>
      <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
        {profile && (
          <>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-gray-700 mb-6">{profile.bio}</p>

            <h3 className="text-lg font-semibold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.skills.map((skill) => (
                <Tag key={skill} color="geekblue">
                  {skill}
                </Tag>
              ))}
            </div>

            <h3 className="text-lg font-semibold mb-4">Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Statistic
                title="Projects"
                value={profile.stats.projects}
                prefix={<IdcardOutlined />}
              />
              <Statistic
                title="Tasks"
                value={profile.stats.tasks}
                prefix={<SafetyOutlined />}
              />
              <Statistic
                title="Completed"
                value={profile.stats.completed}
                prefix={<SafetyOutlined />}
              />
              <Statistic
                title="Teams"
                value={profile.stats.teams}
                prefix={<TeamOutlined />}
              />
            </div>
          </>
        )}
      </Skeleton>
    </div>
  );
};

const ActivityTab = ({ loading }) => {
  const activities = [
    { id: 1, action: "Completed project X", date: "2023-05-15" },
    { id: 2, action: "Updated profile", date: "2023-05-10" },
    { id: 3, action: "Joined Team Y", date: "2023-04-28" },
    { id: 4, action: "Completed training", date: "2023-04-15" },
  ];

  return (
    <Skeleton loading={loading} active>
      <List
        itemLayout="horizontal"
        dataSource={activities}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<a>{item.action}</a>}
              description={item.date}
            />
          </List.Item>
        )}
      />
    </Skeleton>
  );
};

const TeamsTab = ({ profile, loading }) => {
  return (
    <Skeleton loading={loading} active>
      {profile && (
        <List
          dataSource={profile.teams}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" size="small">
                  View
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={`Role: ${item.role}`}
              />
            </List.Item>
          )}
        />
      )}
    </Skeleton>
  );
};

const SettingsTab = ({ loading }) => {
  return (
    <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
      <div className="space-y-6">
        <Card title="Account Settings">
          <p>Update your account information here</p>
        </Card>
        <Card title="Security">
          <p>Change password and security settings</p>
        </Card>
        <Card title="Notifications">
          <p>Configure your notification preferences</p>
        </Card>
      </div>
    </Skeleton>
  );
};

export default Profile;
