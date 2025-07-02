import React from 'react';
import { Card, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NewsCard = ({ news, actions }) => {
  return (
    <Card
      hoverable
      cover={
        news.imageUrl && (
          <img
            alt={news.title}
            src={news.imageUrl}
            style={{ height: 160, objectFit: 'cover' }}
          />
        )
      }
      actions={actions}
    >
      <Card.Meta
        title={news.title}
        description={
          <>
            <div style={{ marginBottom: 8 }}>{news.summary}</div>
            <Space size={[0, 8]} wrap>
              {news.targetRoles.map((role) => (
                <Tag key={role.id} color="blue">
                  {role.name}
                </Tag>
              ))}
            </Space>
            <div style={{ marginTop: 8, color: 'rgba(0, 0, 0, 0.45)' }}>
              {dayjs(news.createdAt).fromNow()}
            </div>
          </>
        }
      />
    </Card>
  );
};

export default NewsCard;