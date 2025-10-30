import React from 'react';
import { useAuth } from '../hooks/useAuth';

const UserDebugInfo: React.FC = () => {
  const { user, isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-900 text-white p-4 rounded-lg text-xs max-w-sm">
        <h4 className="font-bold mb-2">Debug: Not Authenticated</h4>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-sm max-h-64 overflow-y-auto">
      <h4 className="font-bold mb-2">Debug: User Info</h4>
      <div className="space-y-1">
        <div><strong>Name:</strong> {user?.name || 'N/A'}</div>
        <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
        <div><strong>Role:</strong> {user?.role || 'N/A'}</div>
        <div><strong>Is Admin:</strong> {hasRole('admin') ? 'Yes' : 'No'}</div>
        <div><strong>Raw User Data:</strong></div>
        <pre className="text-xs bg-black p-2 rounded mt-1 overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default UserDebugInfo;