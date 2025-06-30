import React, { useState } from "react";
import { Card } from "antd";
import StoreList from "../../components/Store/StoreList";
import StoreForm from "../../components/Store/StoreForm";

function Store() {
  const [visible, setVisible] = useState(false);
  const [editStoreId, setEditStoreId] = useState(null);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setEditStoreId(null);
  };

  return (
    <Card title="Store Management" bordered={false}>
      <StoreList setEditStoreId={setEditStoreId} showDrawer={showDrawer} />
      <StoreForm
        visible={visible}
        onClose={onClose}
        editStoreId={editStoreId}
      />
    </Card>
  );
}

export default Store;
