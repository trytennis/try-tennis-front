import { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../api/audit';
import type { AuditLog } from '../api/audit';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => { fetchAuditLogs().then(setLogs).catch(() => setLogs([])); }, []);
  return <main style={{ padding: 32 }}><h1>변경 이력</h1><table className="user-table"><thead><tr><th>일시</th><th>작업</th><th>대상</th><th>상세</th></tr></thead><tbody>{logs.map(l => <tr key={l.id}><td>{new Date(l.created_at).toLocaleString('ko-KR')}</td><td>{l.action}</td><td>{l.entity_type}</td><td><code>{JSON.stringify(l.details)}</code></td></tr>)}</tbody></table></main>;
}
