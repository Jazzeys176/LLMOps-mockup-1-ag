import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tracing from './pages/Tracing';
import TraceDetail from './pages/TraceDetail';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Evaluators from './pages/Evaluators';
import AnnotationQueues from './pages/AnnotationQueues';
import AnnotationQueueDetail from './pages/AnnotationQueueDetail';
import Prompts from './pages/Prompts';
import Datasets from './pages/Datasets';
import Alerts from './pages/Alerts';
import AuditLogs from './pages/AuditLogs';
import NewPrompt from './pages/NewPrompt';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tracing" element={<Tracing />} />
          <Route path="tracing/:id" element={<TraceDetail />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="sessions/:id" element={<SessionDetail />} />
          <Route path="evaluators" element={<Evaluators />} />
          <Route path="annotation_queue" element={<AnnotationQueues />} />
          <Route path="annotation_queue/:id" element={<AnnotationQueueDetail />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="prompts/new" element={<NewPrompt />} />
          <Route path="datasets" element={<Datasets />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
