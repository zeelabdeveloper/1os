import { useState } from "react";
import { Layout } from "antd";
import InterviewSessionDetail from "../../components/InterviewSession/InterviewSessionDetail";
import InterviewSessionList from "../../components/InterviewSession/InterviewSessionList";

const { Header, Content } = Layout;

function App() {
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow">
        <div className="flex items-center h-full">
          <h1 className="text-xl text-white font-bold">Interview Management System</h1>
        </div>
      </Header>
      <Content className="p-6">
        {/* Pass setSelectedSession as prop if you want to handle session selection from list */}
        <InterviewSessionList onSelectSession={setSelectedSession} />
        
        {selectedSession && (
          <InterviewSessionDetail
            sessionId={selectedSession._id}
            onEdit={() => setSelectedSession(null)}
          />
        )}
      </Content>
    </Layout>
  );
}

export default App;
