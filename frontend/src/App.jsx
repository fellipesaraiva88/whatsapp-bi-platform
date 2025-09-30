import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Messages from './pages/Messages';
import AIAssistant from './pages/AIAssistant';
import Pipeline from './pages/Pipeline';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contacts/:jid" element={<ContactDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/pipeline" element={<Pipeline />} />
      </Routes>
    </Layout>
  );
}

export default App;