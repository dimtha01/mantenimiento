import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

/* ─── helpers ─────────────────────────────────────────────────── */
const ROL_CFG = {
  ADMIN: { pill: 'bg-purple-100 text-purple-700', border: 'border-l-purple-500' },
  TECNICO: { pill: 'bg-blue-100 text-[#1e40af]', border: 'border-l-[#1e40af]' },
  USER: { pill: 'bg-emerald-100 text-emerald-700', border: 'border-l-emerald-500' },
};
const rolCfg = (nombre) => ROL_CFG[nombre] ?? ROL_CFG.USER;

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const initials = (nombre, email) => {
  if (nombre) return nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (email ?? '??').slice(0, 2).toUpperCase();
};

const AVATAR_BG = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-sky-500',
];
const avatarBg = (id) => AVATAR_BG[id % AVATAR_BG.length];

const inputCls = 'w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white';

/* ─────────────────────────────────────────────────────────────── */
/*  Modal crear/editar  (centrado, estilo original del proyecto)  */
/* ─────────────────────────────────────────────────────────────── */
const UsuarioModal = ({ usuario, roles, onClose, onSaved }) => {
  const isNew = !usuario?.id;
  const [form, setForm] = useState({
    nombre: usuario?.nombre ?? '',
    email: usuario?.email ?? '',
    rolId: usuario?.rolId ?? usuario?.rol?.id ?? '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetPwd, setResetPwd] = useState('');
  const [resetMsg, setResetMsg] = useState(null);

  const handleSave = async () => {
    setErr(null);
    if (!form.email || !form.rolId) { setErr('Email y Rol son requeridos'); return; }
    if (isNew && (!form.newPassword || form.newPassword.length < 6)) {
      setErr('La contraseña debe tener al menos 6 caracteres'); return;
    }
    setSaving(true);
    try {
      const url = isNew ? '/api/usuarios' : `/api/usuarios/${usuario.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const body = isNew
        ? { nombre: form.nombre || null, email: form.email, rolId: Number(form.rolId), password: form.newPassword }
        : { nombre: form.nombre || null, email: form.email, rolId: Number(form.rolId) };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      onSaved(json.data, isNew);
      onClose();
    } catch (e) {
      setErr(e.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!resetPwd || resetPwd.length < 6) { setResetMsg({ ok: false, text: 'Mínimo 6 caracteres' }); return; }
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}/password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPwd }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      setResetMsg({ ok: true, text: '✓ Contraseña actualizada' });
      setResetPwd('');
      setTimeout(() => { setResetMode(false); setResetMsg(null); }, 1500);
    } catch (e) {
      setResetMsg({ ok: false, text: e.message });
    }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              {isNew ? '+ Nuevo Usuario' : 'Editar Usuario'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {err && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{err}</p>}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre</label>
              <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre completo" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="correo@empresa.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Rol *</label>
              <select value={form.rolId} onChange={e => setForm(p => ({ ...p, rolId: e.target.value }))} className={inputCls}>
                <option value="">Seleccionar rol…</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>

            {/* Contraseña — solo crear */}
            {isNew && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Contraseña *</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.newPassword}
                    onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Mínimo 6 caracteres" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPwd
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Cambio de contraseña — solo editar */}
            {!isNew && (
              <div className="pt-2 border-t border-slate-100">
                {!resetMode ? (
                  <button onClick={() => setResetMode(true)}
                    className="text-xs font-bold text-blue-600 hover:underline">
                    Cambiar contraseña
                  </button>
                ) : (
                  <div className="space-y-2">
                    {resetMsg && <p className={`text-xs ${resetMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>{resetMsg.text}</p>}
                    <div className="flex gap-2">
                      <input type="password" value={resetPwd} onChange={e => setResetPwd(e.target.value)}
                        placeholder="Nueva contraseña" className={`${inputCls} py-2 text-xs`} />
                      <button onClick={handleReset}
                        className="px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 whitespace-nowrap">
                        Guardar
                      </button>
                      <button onClick={() => { setResetMode(false); setResetPwd(''); setResetMsg(null); }}
                        className="px-3 py-2 border border-slate-200 text-slate-400 text-xs rounded-xl hover:bg-slate-50">
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center gap-2">
              {saving && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
              {saving ? 'Guardando…' : isNew ? 'Crear Usuario' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/*  Página principal — diseño original con sidebar derecho        */
/* ─────────────────────────────────────────────────────────────── */
export const GestionUsuarioPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('todos');
  const [selectedUser, setSelectedUser] = useState(null);

  /* modal crear/editar */
  const [modalUser, setModalUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* eliminar */
  const [delLoading, setDelLoading] = useState(false);
  const [delError, setDelError] = useState(null);

  /* ── fetch roles ── */
  useEffect(() => {
    fetch('/api/usuarios/roles').then(r => r.json()).then(j => { if (j.ok) setRoles(j.data); });
  }, []);

  /* ── fetch usuarios ── */
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, take: '100' });
      const res = await fetch(`/api/usuarios?${params}`);
      const json = await res.json();
      if (json.ok) { setUsuarios(json.data); setTotal(json.total); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  /* ── filtrado local ── */
  const filtered = usuarios.filter(u => {
    const matchSearch = !search ||
      (u.nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRol = rolFilter === 'todos' || u.rol?.nombre === rolFilter;
    return matchSearch && matchRol;
  });

  /* ── guardar callback ── */
  const handleSaved = (saved, isNew) => {
    if (isNew) {
      setUsuarios(p => [saved, ...p]);
      setTotal(p => p + 1);
    } else {
      setUsuarios(p => p.map(u => u.id === saved.id ? saved : u));
      if (selectedUser?.id === saved.id) setSelectedUser(saved);
    }
  };

  /* ── eliminar desde sidebar ── */
  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar a ${user.nombre ?? user.email}?`)) return;
    setDelLoading(true);
    setDelError(null);
    try {
      const res = await fetch(`/api/usuarios/${user.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      setUsuarios(p => p.filter(u => u.id !== user.id));
      setTotal(p => p - 1);
      setSelectedUser(null);
    } catch (e) {
      setDelError(e.message);
    } finally {
      setDelLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA] relative">
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Directorio de Usuarios"
          subtitle={`Gestiona el personal del sistema · ${total} usuario${total !== 1 ? 's' : ''}`}
          showSearch
          searchValue={search}
          onSearchChange={e => setSearch(e.target.value)}
          actionButton={
            <button
              onClick={() => { setModalUser({}); setShowModal(true); }}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Usuario
            </button>
          }
        />

        {/* Filters & Grid */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-slate-200 pb-0">
            {[
              { id: 'todos', label: 'Todos' },
              ...roles.map(r => ({ id: r.nombre, label: r.nombre.charAt(0) + r.nombre.slice(1).toLowerCase() })),
            ].map(tab => (
              <button key={tab.id} onClick={() => setRolFilter(tab.id)}
                className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${rolFilter === tab.id
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200" />
                    <div className="h-5 w-16 bg-slate-100 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-24">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-slate-400 font-medium">No hay usuarios</p>
            </div>
          )}

          {/* User Cards Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(user => {
                const cfg = rolCfg(user.rol?.nombre);
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group cursor-pointer border-l-4 ${cfg.border}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      {/* Avatar con iniciales */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${avatarBg(user.id)} shadow-sm`}>
                        {initials(user.nombre, user.email)}
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${cfg.pill}`}>
                        {user.rol?.nombre ?? '—'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {user.nombre ?? <span className="text-slate-400 italic font-normal">Sin nombre</span>}
                    </h3>
                    <p className="text-xs text-slate-500 mb-1 truncate">{user.email}</p>
                    <p className="text-[10px] text-slate-300">Desde {fmtDate(user.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* BACKDROP sidebar detalle */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setSelectedUser(null)} />
      )}

      {/* RIGHT SIDEBAR — DETALLES */}
      {selectedUser && (
        <aside className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-50 animate-slide-in">
          <div className="p-8 border-b border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <button onClick={() => setSelectedUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => { setModalUser(selectedUser); setShowModal(true); }}
                className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Editar Perfil
              </button>
            </div>

            <div className="text-center">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-3xl ${avatarBg(selectedUser.id)} shadow-sm`}>
                {initials(selectedUser.nombre, selectedUser.email)}
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {selectedUser.nombre ?? <span className="text-slate-400 font-normal italic">Sin nombre</span>}
              </h3>
              <p className="text-sm text-slate-500 mb-2">{selectedUser.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${rolCfg(selectedUser.rol?.nombre).pill}`}>
                {selectedUser.rol?.nombre ?? '—'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {/* Info */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Información</h4>
              <div className="space-y-3">
                {[
                  { label: 'ID Sistema', value: `#${selectedUser.id}` },
                  { label: 'Email', value: selectedUser.email },
                  { label: 'Rol', value: selectedUser.rol?.nombre ?? '—' },
                  { label: 'Miembro desde', value: fmtDate(selectedUser.createdAt) },
                  { label: 'Última actualización', value: fmtDate(selectedUser.updatedAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-xs text-slate-400 shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-slate-700 text-right truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Error eliminar */}
            {delError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-600">
                {delError}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => { setModalUser(selectedUser); setShowModal(true); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Usuario
              </button>
              <button
                onClick={() => handleDelete(selectedUser)}
                disabled={delLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {delLoading ? 'Eliminando…' : 'Eliminar Usuario'}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MODAL crear / editar */}
      {showModal && (
        <UsuarioModal
          usuario={modalUser}
          roles={roles}
          onClose={() => { setShowModal(false); setModalUser(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};
