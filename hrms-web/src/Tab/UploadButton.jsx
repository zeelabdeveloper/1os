 
import { Row, Button,   Space  } from "antd";
import { UploadOutlined, RollbackOutlined } from "@ant-design/icons";
 
 
const UploadButtons = ({ isPending, handleGSTClick, currentPlatform }) => (
  <Row justify="end" style={{ marginBottom: 16 }}>
    <Space>
      <Button
        type="primary"
        icon={<UploadOutlined />}
        loading={isPending && currentPlatform === "MeeshoSales"}
        onClick={() => handleGSTClick("MeeshoSales")}
      >
        Sales Upload
      </Button>
      <Button
        type="primary"
        icon={<RollbackOutlined />}
        loading={isPending && currentPlatform === "MeeshoReturns"}
        onClick={() => handleGSTClick("MeeshoReturns")}
      >
        Sales Return Upload
      </Button>
    </Space>
  </Row>
);
 
export default UploadButtons;