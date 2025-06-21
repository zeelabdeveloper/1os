import { Layout } from "antd";
import LeftMenu from "../Tab/LeftMenu";
import { Outlet } from "react-router-dom";

import TopHeader from "../components/layouts/TopHeader";

const { Content } = Layout;

function Home() {
  return (
    <Layout className="h-screen overflow-hidden">
      <LeftMenu />
      <Layout>
        {/* <Content
          style={{
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <TopHeader />

          <Outlet />
        </Content> */}

        <div className="h-screen backdrop-invert-0 overflow-hidden">
          <TopHeader />

          <Outlet />
        </div>
      </Layout>
    </Layout>
  );
}

export default Home;
