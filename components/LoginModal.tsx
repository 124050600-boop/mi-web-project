import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Building2, User, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors when modal opens or role changes
  useEffect(() => {
    setLocalError(null);
    setAccessCode('');
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      const loggedUser = await login(role, email, role === 'institution' ? accessCode : undefined);
      
      onClose();
      
      // REDIRECT LOGIC
      if (role === 'institution' && loggedUser) {
          // Assuming user.id corresponds to institution.id in our mock logic
          navigate(`/instituciones/${loggedUser.id}`);
      }
      
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${role === 'student' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
               {role === 'student' ? <User size={32} /> : <Building2 size={32} />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido</h2>
            <p className="text-slate-500 text-sm">
                {role === 'student' ? 'Encuentra tu futuro profesional' : 'Gestiona tu perfil institucional'}
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                role === 'student' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap size={16} /> Estudiante
            </button>
            <button
              onClick={() => setRole('institution')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                role === 'institution' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 size={16} /> Institución
            </button>
          </div>

          {localError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                  <AlertCircle size={16} />
                  {localError}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50"
                placeholder={role === 'student' ? 'estudiante@email.com' : 'admin@universidad.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {role === 'institution' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 flex justify-between">
                    <span>Código Único de Acceso</span>
                    <span className="text-slate-300 font-normal">Proporcionado por UniMap</span>
                  </label>
                  <div className="relative">
                      <KeyRound className="absolute left-3 top-3.5 text-slate-400" size={18} />
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50"
                        placeholder="Ingrese su clave institucional"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                      />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">
                      * Prueba: <code className="bg-slate-100 px-1 rounded">UTSJR-ADMIN</code> o <code className="bg-slate-100 px-1 rounded">UAQ-ADMIN</code>
                  </p>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                  role === 'student' 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {isLoading ? 'Verificando...' : role === 'student' ? 'Ingresar' : 'Verificar Acceso'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;