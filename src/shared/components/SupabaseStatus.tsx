import { useState, useEffect } from "react";
import { SupabaseConnection } from "../../services/supabase";
import { runDatabaseTests } from "../../services/supabase/database-test";

interface SupabaseStatusProps {
  readonly className?: string;
}

export function SupabaseStatus({ className = "" }: SupabaseStatusProps) {
  const [status, setStatus] = useState<{
    environment: ReturnType<typeof SupabaseConnection.validateEnvironment>;
    connection: Awaited<ReturnType<typeof SupabaseConnection.testConnection>>;
    status: Awaited<ReturnType<typeof SupabaseConnection.getStatus>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const healthCheck = await SupabaseConnection.healthCheck();
        setStatus(healthCheck);
      } catch (error) {
        console.error("Failed to check Supabase status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className={`supabase-status ${className}`}>
        <h4 className="text-md mb-sm font-heading">🗄️ Database Status</h4>
        <p className="text-sm text-secondary">Checking connection...</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className={`supabase-status ${className}`}>
        <h4 className="text-md mb-sm font-heading">🗄️ Database Status</h4>
        <p className="text-sm text-error">Failed to check status</p>
      </div>
    );
  }

  const { environment, connection, status: connectionStatus } = status;

  return (
    <div className={`supabase-status ${className}`}>
      <h4 className="text-md mb-sm font-heading">🗄️ Database Status</h4>

      {/* Environment Validation */}
      <div className="mb-sm">
        <h5 className="text-sm font-semibold mb-xs">Environment Configuration</h5>
        {environment.valid ? (
          <p className="text-xs text-success">✅ Environment variables configured</p>
        ) : (
          <div>
            <p className="text-xs text-error">❌ Missing variables:</p>
            <ul className="text-xs text-error ml-md">
              {environment.missing.map((variable) => (
                <li key={variable}>• {variable}</li>
              ))}
            </ul>
          </div>
        )}

        {environment.warnings.length > 0 && (
          <div className="mt-xs">
            <p className="text-xs text-warning">⚠️ Warnings:</p>
            <ul className="text-xs text-warning ml-md">
              {environment.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="mb-sm">
        <h5 className="text-sm font-semibold mb-xs">Connection</h5>
        {connection.connected ? (
          <p className="text-xs text-success">
            ✅ Connected (latency: {connection.latency}ms)
          </p>
        ) : (
          <div>
            <p className="text-xs text-error">❌ Connection failed</p>
            {connection.error && (
              <p className="text-xs text-error ml-md">Error: {connection.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Project URL */}
      <div className="mb-sm">
        <h5 className="text-sm font-semibold mb-xs">Project URL</h5>
        <p className="text-xs text-secondary break-all">{connectionStatus.url}</p>
        <p className="text-xs text-secondary">Last checked: {new Date(connectionStatus.timestamp).toLocaleTimeString()}</p>
      </div>

      {/* Database Test Button */}
      {connection.connected && (
        <div>
          <button
            className="btn-sm btn-secondary text-xs"
            onClick={() => runDatabaseTests()}
          >
            Test Database
          </button>
          <p className="text-xs text-secondary mt-xs">Check browser console for results</p>
        </div>
      )}
    </div>
  );
}
