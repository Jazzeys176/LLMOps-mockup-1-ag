const Page = ({ title }: { title: string }) => (
    <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600">
            Content for {title} will be implemented here.
        </p>
    </div>
);

export const Dashboard = () => <Page title="Dashboard" />;
export const Tracing = () => <Page title="Tracing" />;
export const Sessions = () => <Page title="Sessions" />;
export const Evaluators = () => <Page title="Evaluators" />;
export const AnnotationQueues = () => <Page title="Annotation Queues" />;
export const Prompts = () => <Page title="Prompts" />;
export const Datasets = () => <Page title="Datasets" />;
export const Alerts = () => <Page title="Alerts" />;
export const AuditLogs = () => <Page title="Audit Logs" />;
