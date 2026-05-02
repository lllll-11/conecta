import React, { useState, useEffect } from 'react';
import EvidenceDashboard from './EvidenceDashboard';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwXaL9rnCGJdqaLbCPgiiD2YzQkRhQ4pseXVN0fZagQfl1_3UL9C6KfxrMSkoENEH_/exec';

function App() {
  const [practitioner, setPractitioner] = useState(localStorage.getItem('practitioner_name'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        // Eliminamos headers para que sea una "petición simple" y evitar problemas de CORS
        body: JSON.stringify({ action: 'login', data })
      });

      // Nota: Google Apps Script requiere manejar redirecciones. 
      // Si el script devuelve JSON correctamente con ContentService:
      const result = await response.json();

      // IMPORTANTE: Verifica que tu script de Google devuelva { "result": "success" }
      // y que en tu Google Sheet los nombres coincidan exactamente (Ana != ana)
      if (result && result.result === 'success') {
        setSuccess(`¡Bienvenido(a), ${data.nombre}! Sesión iniciada con éxito.`);
        localStorage.setItem('practitioner_name', data.nombre);
        
        setTimeout(() => {
          setPractitioner(data.nombre);
          setSuccess('');
        }, 1500);
      } else {
        setError('Credenciales inválidas. Por favor, revisa tus datos.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet o el estado del servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('practitioner_name');
    setPractitioner(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#6ddbf3]/30">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#6ddbf3] italic tracking-tighter">
            Conecta<span className="text-slate-800">+</span>
          </h1>
          {practitioner && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 hidden sm:block">
                Hola, <span className="text-slate-900 font-bold">{practitioner}</span>
              </span>
              <button 
                onClick={logout}
                className="text-sm font-semibold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {!practitioner ? (
          <div className="max-w-md mx-auto pt-12">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800">Acceso Privado</h2>
                <p className="text-slate-500 mt-2">Portal de gestión para practicantes</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-pulse">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl text-center font-medium">
                    {success}
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1 tracking-widest">Nombre Completo</label>
                  <input name="nombre" type="text" required placeholder="Ej. Ana García"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#6ddbf3] outline-none transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1 tracking-widest">Contraseña</label>
                  <input name="password" type="password" required placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#6ddbf3] outline-none transition" />
                </div>
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-[#6ddbf3] hover:opacity-90 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verificando...
                    </span>
                  ) : 'Ingresar al Portal'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <EvidenceDashboard practitioner={practitioner} />
        )}
      </main>
    </div>
  );
}

export default App;