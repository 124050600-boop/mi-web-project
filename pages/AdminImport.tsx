import React, { useState } from 'react';
import { Upload, Database, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { importSQL, clearDatabase } from '../services/dataService';

const AdminImport: React.FC = () => {
  const [sqlContent, setSqlContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setSqlContent(evt.target.result as string);
      }
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
        // Reload after 2s
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    } catch (e: any) {
        setStatus('error');
        setMessage('Error al procesar SQL: ' + e.message);
    }
  };

  const handleClear = () => {
      if(window.confirm('¿Estás seguro? Esto borrará todos los datos cargados y reseteará la app.')) {
          clearDatabase();
      }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-slate-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Cargar Base de Datos</h1>
        <p className="text-slate-500 mt-2">
            Sube tu archivo <code className="bg-slate-100 px-1 rounded text-slate-700 font-bold">.sql</code> para actualizar el contenido de la plataforma.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          
          <div className="mb-6">
              <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                  <input type="file" accept=".sql,.txt" onChange={handleFileUpload} className="hidden" />
                  <Upload className="mx-auto text-slate-400 group-hover:text-indigo-600 mb-3" size={40} />
                  <p className="font-medium text-slate-700">Haz clic para seleccionar tu archivo SQL</p>
                  <p className="text-xs text-slate-400 mt-1">Soporta INSERT INTO estándar</p>
              </label>
          </div>

          {sqlContent && (
              <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Vista previa del contenido:</h3>
                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono h-40 overflow-y-auto custom-scrollbar">
                      {sqlContent.substring(0, 1000)}...
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right">{sqlContent.length} caracteres</p>
              </div>
          )}

          <div className="flex gap-4">
              <button 
                onClick={handleProcess}
                disabled={!sqlContent || status === 'processing'}
                className={`flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                    status === 'success' ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                  {status === 'processing' ? 'Procesando...' : status === 'success' ? '¡Hecho!' : 'Procesar SQL'}
                  {status === 'success' && <CheckCircle size={18} />}
              </button>
          </div>

          {message && (
              <div className={`mt-4 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                  {status === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                  {message}
              </div>
          )}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Zona de Peligro</h3>
          <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100">
              <div className="text-red-800 text-sm">
                  <span className="font-bold">Restablecer valores de fábrica.</span> Borra todos los datos importados.
              </div>
              <button onClick={handleClear} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors">
                  <Trash2 size={20} />
              </button>
          </div>
      </div>
    </div>
  );
};

export default AdminImport;