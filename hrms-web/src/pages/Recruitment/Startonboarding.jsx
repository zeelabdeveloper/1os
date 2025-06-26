import { useState } from "react";
import { Layout } from "antd";
import InterviewSessionDetail from "../../components/InterviewSession/InterviewSessionDetail";
import InterviewSessionList from "../../components/InterviewSession/InterviewSessionList";
import DocumentVerification from "../../components/onboarding/DocsVerify";
import AssetManagement from "../../components/onboarding/AssetManagement";
import TrainingManagement from "../../components/onboarding/TrainingManagement";
import LetterManagement from "../../components/onboarding/LetterManagement";

const { Header, Content } = Layout;

function App() {
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <Layout className="h-[92vh] overflow-y-auto ">
      <Header className="bg-white shadow">
        <div className="flex items-center h-full">
          <h1 className="text-xl text-white font-bold">
            Interview Management System
          </h1>
        </div>
      </Header>
      <Content className="p-6">
        <InterviewSessionList onSelectSession={setSelectedSession} />

        {selectedSession && (
          <InterviewSessionDetail
            sessionId={selectedSession._id}
            onEdit={() => setSelectedSession(null)}
          />
        )}

        <DocumentVerification />
        <AssetManagement />
        <TrainingManagement />
        <LetterManagement />
      </Content>
    </Layout>
  );
}

export default App;
