'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User { id: string; name: string; phone: string; role: string; createdAt: string }

const ROLES = ['ALL', 'CUSTOMER', 'VENDOR', 'DELIVERY_BOY', 'ADMIN'];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState('ALL');

  useEffect(() => { api.get<User[]>('/admin/users').then(setUsers).catch(() => {}); }, []);

  const filtered = role === 'ALL' ? users : users.filter((u) => u.role === role);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="flex gap-2 mb-4">
        {ROLES.map((r) => (
          <button key={r} onClick={() => setRole(r)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${role === r ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-200'}`}>
            {r}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>{['Name','Phone','Role','Joined'].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{u.name || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{u.phone}</td>
                <td className="px-4 py-3"><span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{u.role}</span></td>
                <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
