import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Building2, AlertCircle, KeyRound, User, LogIn, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
      nombre: '', apellido: '', identifier: '', password: '',
  });
  
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(null);
    setFormData({ nombre: '', apellido: '', identifier: '', password: '' });
    setIsRegister(false);
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      if (isRegister && role === 'student') {
          // Register flow for students
          await register({ ...formData, email: formData.identifier });
          navigate('/perfil');
      } else {
          // Login flow
          // If Role is Institution, identifier maps to 'usuario_admin'
          // If Role is Student, identifier maps to 'email'
          const user = await login(role, formData.identifier, formData.password);
          
          if (user.role === 'institution') {
              navigate(`/instituciones/${user.id}`);
          } else {
              navigate('/perfil');
          }
      }
      onClose();
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-20"><X size={20} /></button>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{isRegister ? 'Crear Cuenta' : 'Acceso'}</h2>
            <p className="text-slate-500 text-sm">MapEDU Querétaro</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button onClick={() => { setRole('student'); setIsRegister(false); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${role === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <GraduationCap size={16} /> Estudiante
            </button>
            <button onClick={() => { setRole('institution'); setIsRegister(false); }} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${role === 'institution' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
              <Building2 size={16} /> Institución
            </button>
          </div>

          {localError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                  <AlertCircle size={16} /> {localError}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && role === 'student' && (
                <div className="grid grid-cols-2 gap-3 animate-slide-up">
                    <input type="text" placeholder="Nombre" required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                    <input type="text" placeholder="Apellido" required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
                </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
                  {role === 'student' ? 'Correo Electrónico' : 'Usuario Administrador'}
              </label>
              <div className="relative">
                  <div className="absolute left-3 top-3.5 text-slate-400">
                      {role === 'student' ? <User size={18}/> : <KeyRound size={18}/>}
                  </div>
                  <input 
                    type={role === 'student' ? "email" : "text"} 
                    required 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" 
                    value={formData.identifier} 
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})} 
                    placeholder={role === 'student' ? 'ejemplo@correo.com' : 'Ej. uaq_admin'}
                  />
              </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        required 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        placeholder="Ingrese su contraseña"
                    />
                </div>
            </div>

            {role === 'institution' && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-center">
                    <p className="text-xs text-yellow-700">
                        Accede con tu usuario administrativo (ej: uaq_admin) y contraseña.
                    </p>
                </div>
            )}

            <button type="submit" disabled={isLoading} className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all ${role === 'student' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {isLoading ? 'Procesando...' : isRegister ? 'Registrarme' : 'Entrar'}
            </button>
          </form>

          {role === 'student' && (
              <div className="mt-4 text-center">
                  <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-sm text-indigo-600 font-bold hover:underline">
                      {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
