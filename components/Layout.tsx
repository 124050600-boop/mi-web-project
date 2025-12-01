import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, LayoutGrid, BookOpen, ClipboardList, Menu, X, School, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Mapa Interactivo', path: '/', icon: Map },
    { name: 'Instituciones', path: '/instituciones', icon: School },
    { name: 'Oferta Educativa', path: '/oferta', icon: BookOpen },
    { name: 'Test Vocacional', path: '/test', icon: ClipboardList },
    { name: 'Comparador', path: '/comparador', icon: LayoutGrid },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:shadow-none border-r border-slate-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              U
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">UniMap</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                `}
              >
                <item.icon size={20} className={isActive(item.path) ? 'text-indigo-600' : 'text-slate-400'} />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* USER SECTION */}
          <div className="p-4 border-t border-slate-100">
            {user ? (
               <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                 <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={user.avatar || "https://ui-avatars.com/api/?name=User"} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full border border-white shadow-sm"
                    />
                    <div className="overflow-hidden">
                       <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                       <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                 </div>
                 <button 
                   onClick={logout}
                   className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-red-500 transition-colors"
                 >
                   <LogOut size={14} /> Cerrar Sesión
                 </button>
               </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl p-4 text-white">
                <p className="text-sm font-medium mb-1">Acceso Usuarios</p>
                <p className="text-xs text-slate-400 mb-3">Estudiantes e Instituciones.</p>
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-colors"
                >
                  <LogIn size={14} /> Ingresar / Registrar
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
            <span className="font-bold text-lg">UniMap</span>
          </div>
          <div className="flex items-center gap-2">
             {!user && (
               <button 
                 onClick={() => setIsLoginOpen(true)}
                 className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
               >
                 <LogIn size={24} />
               </button>
             )}
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 scroll-smooth">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;