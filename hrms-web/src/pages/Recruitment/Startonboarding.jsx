import { useState } from "react";
import { Layout } from "antd";
import InterviewSessionDetail from "../../components/InterviewSession/InterviewSessionDetail";
import InterviewSessionList from "../../components/InterviewSession/InterviewSessionList";
import DocumentVerification from "../../components/onboarding/OnboardingChecklist";

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
      {/* <Content className="p-6">
        
        <InterviewSessionList onSelectSession={setSelectedSession} />

        {selectedSession && (
          <InterviewSessionDetail
            sessionId={selectedSession._id}
            onEdit={() => setSelectedSession(null)}
          />
        )}
      </Content> */}
      <DocumentVerification />
    </Layout>
  );
}

export default App;
