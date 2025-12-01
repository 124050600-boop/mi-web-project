
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Edit3, Save, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentProfile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
      nombre: '', apellido: '', telefono: '', avatarUrl: ''
  });

  // Init form on load
  React.useEffect(() => {
      if (user) {
          const names = user.name.split(' ');
          setForm({
              nombre: names[0] || '',
              apellido: names.slice(1).join(' ') || '',
              telefono: user.telefono || '',
              avatarUrl: user.avatar || ''
          });
      }
  }, [user]);

  if (!user || user.role !== 'student') {
      return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
              <p className="text-slate-500 mb-6">Debes iniciar sesión como estudiante para ver esta página.</p>
              <Link to="/" className="text-indigo-600 font-bold hover:underline">Volver al Inicio</Link>
          </div>
      );
  }

  const handleSave = async () => {
      await updateProfile(form);
      setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Mi Perfil</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Header Bg */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-2 transition-all"
                    >
                        {isEditing ? 'Cancelar Edición' : <><Edit3 size={14} /> Editar Datos</>}
                    </button>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6 text-center md:text-left flex flex-col md:flex-row items-center md:items-end gap-4">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white overflow-hidden relative group">
                            {form.avatarUrl ? (
                                <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <User size={40} />
                                </div>
                            )}
                        </div>
                        <div className="mb-2">
                            <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
                            <p className="text-slate-500 text-sm">Estudiante Registrado</p>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre</label>
                                    <input className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Apellido</label>
                                    <input className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Teléfono</label>
                                <input className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">URL Foto Perfil</label>
                                <input className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={form.avatarUrl} onChange={e => setForm({...form, avatarUrl: e.target.value})} placeholder="https://..." />
                            </div>
                            <div className="pt-4 text-right">
                                <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2 ml-auto">
                                    <Save size={16} /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm"><Mail size={20}/></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Correo</p>
                                    <p className="text-sm font-medium text-slate-700">{user.email}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-green-500 shadow-sm"><Phone size={20}/></div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Teléfono</p>
                                    <p className="text-sm font-medium text-slate-700">{user.telefono || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 text-center">
                <button onClick={logout} className="text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    </div>
  );
};

export default StudentProfile;