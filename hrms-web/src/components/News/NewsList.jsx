// import React, { useState } from "react";
// import {
//   List,
//   Button,
//   Modal,
//   Empty,
//   Card,
//   Tag,
//   Typography,
//   Space,
//   Image,
// } from "antd";
// import {
//   EditOutlined,
//   DeleteOutlined,
//   PlusOutlined,
//   EyeOutlined,
// } from "@ant-design/icons";
// import NewsEditor from "./NewsEditor";
// import NewsSkeleton from "./NewsSkeleton";
// import { useDeleteNews, useNews } from "../../hooks/useNews";

// const { Text } = Typography;

// const NewsList = () => {
//   const [editorVisible, setEditorVisible] = useState(false);
//   const [viewVisible, setViewVisible] = useState(false);
//   const [selectedNews, setSelectedNews] = useState(null);
//   const { data: news, isLoading } = useNews();
//   const { mutate: deleteNews } = useDeleteNews();

//   const handleEdit = (newsItem) => {
//     setSelectedNews(newsItem);
//     setEditorVisible(true);
//   };

//   const handleView = (newsItem) => {
//     setSelectedNews(newsItem);
//     setViewVisible(true);
//   };

//   const handleDelete = (id, e) => {
//     e.stopPropagation();  
//     Modal.confirm({
//       title: "Confirm Delete",
//       icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
//       content:
//         "Are you sure you want to delete this news item? This action cannot be undone.",
//       okText: "Delete",
//       okType: "danger",
//       cancelText: "Cancel",
//       centered: true,
//       onOk: () => deleteNews(id),
//     });
//   };

//   if (isLoading) return <NewsSkeleton count={3} />;

//   return (
//     <div style={{ padding: "16px" }}>
//       <div style={{ marginBottom: 16 }}>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={() => {
//             setSelectedNews(null);
//             setEditorVisible(true);
//           }}
//         >
//           Add News
//         </Button>
//       </div>

//       {news?.data?.length === 0 ? (
//         <Empty description="No news available" />
//       ) : (
//         <List
//           grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
//           dataSource={Array.isArray(news?.data) ? news.data : []}
//           renderItem={(item) => (
//             <List.Item>
//               <Card
//                 hoverable
//                 cover={
//                   item.image && (
//                     <Image
//                       alt={item.title}
//                       src={item.image}
//                       height={160}
//                       style={{ objectFit: "cover" }}
//                       preview={false}
//                     />
//                   )
//                 }
//                 actions={[
//                   <EyeOutlined key="view" onClick={() => handleView(item)} />,
//                   <EditOutlined key="edit" onClick={() => handleEdit(item)} />,
//                   <DeleteOutlined
//                     key="delete"
//                    onClick={(e) => handleDelete(item._id, e)}
//                   />,
//                 ]}
//               >
//                 <Card.Meta
//                   title={item.title}
//                   description={
//                     <Space
//                       direction="vertical"
//                       size="small"
//                       style={{ width: "100%" }}
//                     >
//                       <Text ellipsis>{item.summary}</Text>
//                       <div>
//                         {item.targetRoles?.map((role) => (
//                           <Tag key={role._id} color="blue">
//                             {role.name}
//                           </Tag>
//                         ))}
//                       </div>
//                     </Space>
//                   }
//                 />
//               </Card>
//             </List.Item>
//           )}
//         />
//       )}

//       {/* Edit/Create Modal */}
//       <Modal
//         title={selectedNews ? "Edit News" : "Create News"}
//         open={editorVisible}
//         onCancel={() => setEditorVisible(false)}
//         footer={null}
//         width="80%"
//         destroyOnClose
//       >
//         <NewsEditor
//           newsData={selectedNews}
//           onCancel={() => setEditorVisible(false)}
//           onSuccess={() => setEditorVisible(false)}
//         />
//       </Modal>

//       {/* View Modal */}
//       <Modal
//         title={selectedNews?.title}
//         open={viewVisible}
//         onCancel={() => setViewVisible(false)}
//         footer={null}
//         width="60%"
//       >
//         {selectedNews && (
//           <div>
//             {selectedNews.image && (
//               <Image
//                 src={selectedNews.image}
//                 alt={selectedNews.title}
//                 style={{ width: "100%", marginBottom: 16 }}
//               />
//             )}
//             <div style={{ marginBottom: 16 }}>
//               <Text strong>Summary: </Text>
//               <Text>{selectedNews.summary}</Text>
//             </div>
//             <div style={{ marginBottom: 16 }}>
//               <Text strong>Target Roles: </Text>
//               <Space size="small">
//                 {selectedNews.targetRoles?.map((role) => (
//                   <Tag key={role._id} color="blue">
//                     {role.name}
//                   </Tag>
//                 ))}
//               </Space>
//             </div>
//             <div>
//               <Text strong>Content: </Text>
//               <div
//                 dangerouslySetInnerHTML={{ __html: selectedNews.content }}
//                 style={{
//                   border: "1px solid #f0f0f0",
//                   padding: 16,
//                   borderRadius: 4,
//                   marginTop: 8,
//                 }}
//               />
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default NewsList;
 


import React, { useState } from "react";
import {
  List,
  Button,
  Modal,
  Empty,
  Card,
  Tag,
  Typography,
  Space,
  Image,
  message
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import NewsEditor from "./NewsEditor";
import NewsSkeleton from "./NewsSkeleton";
import { useDeleteNews, useNews } from "../../hooks/useNews";

const { Text } = Typography;

const NewsList = () => {
  const [editorVisible, setEditorVisible] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const { data: news, isLoading } = useNews();
  const { mutate: deleteNews } = useDeleteNews();

  const handleEdit = (newsItem) => {
    setSelectedNews(newsItem);
    setEditorVisible(true);
  };

  const handleView = (newsItem) => {
    setSelectedNews(newsItem);
    setViewVisible(true);
  };

  const showDeleteModal = (id) => {
    setNewsToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    console.log("Deleting news with ID:", newsToDelete);

    deleteNews(newsToDelete, {
      onSuccess: () => {
        message.success('News deleted successfully');
        setDeleteModalVisible(false);
      },
      onError: () => {
        message.error('Failed to delete news');
      }
    });
  };

  if (isLoading) return <NewsSkeleton count={3} />;

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedNews(null);
            setEditorVisible(true);
          }}
        >
          Add News
        </Button>
      </div>

      {news?.data?.length === 0 ? (
        <Empty description="No news available" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
          dataSource={Array.isArray(news?.data) ? news.data : []}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                cover={
                  item.image && (
                    <Image
                      alt={item.title}
                      src={item.image}
                      height={160}
                      style={{ objectFit: "cover" }}
                      preview={false}
                    />
                  )
                }
                actions={[
                  <EyeOutlined key="view" onClick={() => handleView(item)} />,
                  <EditOutlined key="edit" onClick={() => handleEdit(item)} />,
                  <DeleteOutlined
                    key="delete"
                    onClick={() => showDeleteModal(item._id)}
                  />,
                ]}
              >
                <Card.Meta
                  title={item.title}
                  description={
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <Text ellipsis>{item.summary}</Text>
                      <div>
                        {item.targetRoles?.map((role) => (
                          <Tag key={role._id} color="blue">
                            {role.name}
                          </Tag>
                        ))}
                      </div>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* Edit/Create Modal */}
      <Modal
        title={selectedNews ? "Edit News" : "Create News"}
        open={editorVisible}
        onCancel={() => setEditorVisible(false)}
        footer={null}
        width="80%"
        destroyOnClose
      >
        <NewsEditor
          newsData={selectedNews}
          onCancel={() => setEditorVisible(false)}
          onSuccess={() => setEditorVisible(false)}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        title={selectedNews?.title}
        open={viewVisible}
        onCancel={() => setViewVisible(false)}
        footer={null}
        width="60%"
      >
        {selectedNews && (
          <div>
            {selectedNews.image && (
              <Image
                src={selectedNews.image}
                alt={selectedNews.title}
                style={{ width: "100%", marginBottom: 16 }}
              />
            )}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Summary: </Text>
              <Text>{selectedNews.summary}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Target Roles: </Text>
              <Space size="small">
                {selectedNews.targetRoles?.map((role) => (
                  <Tag key={role._id} color="blue">
                    {role.name}
                  </Tag>
                ))}
              </Space>
            </div>
            <div>
              <Text strong>Content: </Text>
              <div
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
                style={{
                  border: "1px solid #f0f0f0",
                  padding: 16,
                  borderRadius: 4,
                  marginTop: 8,
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        centered
      >
        <p>Are you sure you want to delete this news item? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default NewsList;