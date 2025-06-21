import {
  Row,
  Col,
  Card,
  Button,
  Statistic,
  Space,
  Table,
  Modal,
  Spin,
} from "antd";

import { FaRupeeSign } from "react-icons/fa";

const StatsCards = ({ totalGST, totalTaxable, totalSales }) => (
  <Row gutter={16} style={{ marginTop: 20 }}>
    <Col span={8}>
      <Card>
        <Statistic
          title="Total GST"
          value={totalGST}
          prefix={<FaRupeeSign />}
        />
      </Card>
    </Col>
    <Col span={8}>
      <Card>
        <Statistic
          title="Total Taxable"
          value={totalTaxable}
          prefix={<FaRupeeSign />}
        />
      </Card>
    </Col>
    <Col span={8}>
      <Card>
        <Statistic
          title="Total Sales"
          value={totalSales}
          prefix={<FaRupeeSign />}
        />
      </Card>
    </Col>
  </Row>
);

export default StatsCards;
