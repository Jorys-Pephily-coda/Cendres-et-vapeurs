import { getLogs } from '../service/Log';
import { useEffect, useState } from 'react';

interface LogEntry {
    id: number;
    user: number;
    user_name: string;
    action_type: string;
    action_type_display: string;
    description: string;
    timestamp: string;
}

interface LogResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: LogEntry[];
}

function Log() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    
    useEffect(() => {
        getLogs().then((data: LogResponse) => setLogs(data.results));
    }, []);

    return (
        <div className="page">
            <h1>Journal</h1>
            <div className="panel">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Utilisateur</th>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{log.id}</td>
                            <td>{log.user_name}</td>
                            <td>{log.action_type_display}</td>
                            <td>{log.description}</td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
    );
}

export default Log;