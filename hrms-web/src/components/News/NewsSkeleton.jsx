 
import { Skeleton, Card } from 'antd';

const NewsSkeleton = ({ count = 1 }) => {
  return Array(count)
    .fill(0)
    .map((_, index) => (
      <Card key={index} style={{ marginBottom: 16 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    ));
};

export default NewsSkeleton;