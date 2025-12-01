import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, BookOpen, LayoutGrid, ClipboardList, GraduationCap, School, LogIn, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const menu = [
    { path: '/', name: 'Explorar Mapa', icon: Map },
    { path: '/instituciones', name: 'Instituciones', icon: School },
    { path: '/oferta', name: 'Oferta Educativa', icon: BookOpen },
    { path: '/test', name: 'Test Vocacional', icon: ClipboardList },
    { path: '/comparador', name: 'Comparador', icon: LayoutGrid },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-slate-50 overflow-hidden">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Sidebar Desktop (Fixed Left) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col z-30 shadow-xl shrink-0 h-full">
        <div className="flex items-center px-6 h-20 border-b border-slate-100">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg shrink-0">
            <GraduationCap size={20} />
          </div>
          <span className="ml-3 font-bold text-xl text-slate-800 tracking-tight">MapEDU</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                }`}
              >
                <item.icon size={22} className={`transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
              </Link>
            )
          })}
        </nav>
        
        {/* User Session Footer */}
        <div className="p-4 border-t border-slate-100">
            {user ? (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User size={20} />}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                    {user.role === 'student' && (
                        <Link to="/perfil" className="block text-center text-xs font-bold text-indigo-600 hover:underline mb-2">Mi Perfil</Link>
                    )}
                    <button onClick={logout} className="w-full py-1.5 text-xs text-red-500 bg-white border border-slate-200 rounded-lg font-medium hover:bg-red-50 transition-colors">
                        Cerrar Sesión
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsLoginOpen(true)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                >
                    <LogIn size={16} /> Iniciar Sesión
                </button>
            )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full w-full relative min-w-0 bg-slate-100/50">
        {children}
      </main>

      {/* Mobile Bottom Navigation (Fixed Bottom) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 z-50 flex justify-around items-center px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
            >
               <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-indigo-50 -translate-y-1' : ''}`}>
                 <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
               </div>
               <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
        <button 
            onClick={() => user ? (window.location.href = '/perfil') : setIsLoginOpen(true)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${location.pathname === '/perfil' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
            <div className={`p-1.5 rounded-full ${user ? 'bg-indigo-100 text-indigo-700' : ''}`}>
                <User size={20} />
            </div>
            <span className="text-[10px] font-medium">{user ? 'Perfil' : 'Login'}</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;

