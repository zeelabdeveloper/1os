import React from 'react';
import { Layout, Breadcrumb } from 'antd';
 
 
import NewsList from '../../components/News/NewsList';

const { Content } = Layout;

const NewsPage = () => {
  

  return (
    <Layout className='h-[92vh] overflow-y-auto' style={{ padding: '0 24px 24px' }}>
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>News</Breadcrumb.Item>
      </Breadcrumb>
      <Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
          background: '#fff',
        }}
      >
        <NewsList />
      </Content>
    </Layout>
  );
};

export default NewsPage;