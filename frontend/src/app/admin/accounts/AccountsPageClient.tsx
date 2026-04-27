"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { isStrongPassword, strongPasswordMessage } from "@/lib/password-strength";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export default function AccountsPageClient() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [createRole, setCreateRole] = useState<"ADMIN" | "INSTRUCTOR">("INSTRUCTOR");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [viewUser, setViewUser] = useState<UserRow | null>(null);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load users");
        setUsers([]);
        return;
      }
      setUsers(data.users ?? []);
    } catch {
      setError("Connection error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateMessage(null);
    if (!isStrongPassword(createPassword)) {
      setCreateMessage({ type: "err", text: strongPasswordMessage() });
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail.trim(),
          password: createPassword,
          name: createName.trim() || undefined,
          role: createRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateMessage({ type: "err", text: data.error ?? "Something went wrong" });
        return;
      }
      setCreateMessage({ type: "ok", text: createRole === "INSTRUCTOR" ? "Teacher account created." : "Admin account created." });
      setCreateEmail("");
      setCreatePassword("");
      setCreateName("");
      fetchUsers();
      router.refresh();
    } catch {
      setCreateMessage({ type: "err", text: "Connection error" });
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setError(null);
    try {
      const body: { name?: string; email?: string; role?: string; password?: string } = {};
      if (editName.trim()) body.name = editName.trim();
      if (editEmail.trim()) body.email = editEmail.trim();
      if (editRole && editRole !== editUser.role) body.role = editRole;
      if (editPassword.length > 0) {
        if (!isStrongPassword(editPassword)) {
          setError(strongPasswordMessage());
          setSaving(false);
          return;
        }
        body.password = editPassword;
      }
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      setEditUser(null);
      setEditPassword("");
      fetchUsers();
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleteId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Delete failed");
        return;
      }
      setViewUser((u) => (u?.id === id ? null : u));
      setEditUser((u) => (u?.id === id ? null : u));
      fetchUsers();
      router.refresh();
    } catch {
      setError("Connection error");
    } finally {
      setDeleteId(null);
    }
  }

  function openEdit(u: UserRow) {
    setEditUser(u);
    setEditName(u.name ?? "");
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditPassword("");
  }

  const roleLabel = (r: string) => (r === "INSTRUCTOR" ? "Teacher" : r === "ADMIN" ? "Admin" : "Student");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Accounts</h1>
        <p className="text-slate-500 mt-1">
          Create teacher or admin accounts. View, edit, or delete users below.
        </p>
      </div>

      {/* Create form */}
      <div className="mb-8 p-6 rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create new account</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as "ADMIN" | "INSTRUCTOR")}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm min-w-[140px]"
            >
              <option value="INSTRUCTOR">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email (Gmail) *</label>
            <input
              type="email"
              required
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="user@gmail.com"
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm w-48"
            />
          </div>
          <div className="min-w-[260px] flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="Strong password"
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
            <PasswordStrengthMeter password={createPassword} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Name (optional)</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Full name"
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm w-40"
            />
          </div>
          <button
            type="submit"
            disabled={createLoading}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 text-sm"
          >
            {createLoading ? "Creating..." : "Create"}
          </button>
        </form>
        {createMessage && (
          <p className={`mt-3 text-sm ${createMessage.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>
            {createMessage.text}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date from</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date to</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Search (name or email)</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center">
          <p className="text-slate-600 font-medium">No users found</p>
          <p className="text-slate-500 text-sm mt-1">Try changing filters or create an account above.</p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gmail</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Create date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{u.name || "—"}</td>
                    <td className="px-6 py-4 text-slate-700">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        u.role === "ADMIN" ? "bg-violet-100 text-violet-700" : u.role === "INSTRUCTOR" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => setViewUser(u)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50">View</button>
                        <button type="button" onClick={() => openEdit(u)} className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-50">Edit</button>
                        <button type="button" onClick={() => handleDelete(u.id)} disabled={!!deleteId} className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50">{deleteId === u.id ? "..." : "Delete"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">User details</h2>
              <button type="button" onClick={() => setViewUser(null)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-3">
              <div><p className="text-xs font-medium text-slate-500">Name</p><p className="text-slate-900 font-medium">{viewUser.name || "—"}</p></div>
              <div><p className="text-xs font-medium text-slate-500">Gmail</p><p className="text-slate-900">{viewUser.email}</p></div>
              <div><p className="text-xs font-medium text-slate-500">Role</p><p className="text-slate-900">{roleLabel(viewUser.role)}</p></div>
              <div><p className="text-xs font-medium text-slate-500">Create date</p><p className="text-slate-900">{new Date(viewUser.createdAt).toLocaleString()}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setEditUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Edit user</h2>
              <button type="button" onClick={() => setEditUser(null)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Gmail) *</label>
                <input type="email" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl">
                  <option value="STUDENT">Student</option>
                  <option value="INSTRUCTOR">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New password (optional)</label>
                <input type="password" minLength={8} value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave blank to keep" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" />
                {editPassword && <PasswordStrengthMeter password={editPassword} />}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
