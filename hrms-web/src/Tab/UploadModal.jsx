 
import {   Modal, Spin } from "antd";
 

// UploadModal Component
const UploadModal = ({ isPending }) => (
  <Modal
    open={isPending}
    footer={null}
    closable={false}
    centered
    bodyStyle={{ textAlign: "center", padding: 20 }}
  >
    <Spin size="large" />
    <div style={{ marginTop: 16  , fontSize: 20, color: "gray"}}>Calculating...</div>
  </Modal>
);

 
export default UploadModal