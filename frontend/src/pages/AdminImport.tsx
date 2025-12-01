
import React, { useState } from 'react';
import { Upload, Database, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { importSQL, clearDatabase } from '../api';

const AdminImport: React.FC = () => {
  const [sqlContent, setSqlContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) setSqlContent(evt.target.result as string);
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!sqlContent) return;
    setStatus('processing');
    try {
        const result = await importSQL(sqlContent);
        setStatus('success');
        setMessage(result.message || 'Importación completada');
        setTimeout(() => window.location.href = '/', 2000);
    } catch (e: any) {
        setStatus('error');
        setMessage('Error al procesar SQL: ' + e.message);
    }
  };

  const handleClear = () => {
      if(window.confirm('¿Borrar base de datos?')) clearDatabase();
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Cargar Base de Datos</h1>
        <p className="text-slate-500 mt-2">Sube tu archivo .sql para poblar la plataforma.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 cursor-pointer mb-6">
              <input type="file" accept=".sql,.txt" onChange={handleFileUpload} className="hidden" />
              <Upload className="mx-auto text-slate-400 mb-3" size={40} />
              <p className="font-medium text-slate-700">Seleccionar archivo SQL</p>
          </label>

          <button onClick={handleProcess} disabled={!sqlContent || status === 'processing'} className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${status === 'success' ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}>
              {status === 'processing' ? 'Procesando...' : status === 'success' ? '¡Hecho!' : 'Procesar SQL'}
          </button>

          {message && (
              <div className={`mt-4 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                  {status === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />} {message}
              </div>
          )}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <button onClick={handleClear} className="text-red-600 hover:text-red-800 text-sm flex items-center justify-center gap-2 mx-auto">
              <Trash2 size={16} /> Borrar todo (Reset)
          </button>
      </div>
    </div>
  );
};

export default AdminImport;
