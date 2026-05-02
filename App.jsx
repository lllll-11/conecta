import React, { useState, useEffect } from 'react';
import EvidenceDashboard from './EvidenceDashboard';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydO_CTMKNdLWD-ebmY3VikbeGFcIHdKQzWXQwCpxPJN62k2LowGyCxsRSbJYWbdQfsRQ/exec';

function App() {
  const [practitioner, setPractitioner] = useState(localStorage.getItem('practitioner_name'));
  const [school, setSchool] = useState(localStorage.getItem('practitioner_school'));
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
        const isAdmin = result.message === 'Admin' || data.nombre.toLowerCase() === 'andriy';
        const displayName = isAdmin ? `${data.nombre} (Admin)` : data.nombre;

        setSuccess(`¡Bienvenido(a), ${displayName}! Sesión iniciada con éxito.`);
        localStorage.setItem('practitioner_name', displayName);
        localStorage.setItem('practitioner_school', result.school || 'General');
        
        setTimeout(() => {
          setPractitioner(displayName);
          setSchool(result.school || 'General');
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
    localStorage.removeItem('practitioner_school');
    setPractitioner(null);
    setSchool(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] font-sans text-slate-900 selection:bg-[#6ddbf3]/30">
      <header className="bg-white/70 backdrop-blur-lg border-b border-[#6ddbf3]/20 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tighter">
            Conecta<span className="text-[#6ddbf3]">+</span>
          </h1>
          {practitioner && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 hidden sm:block">
                Hola, <span className="text-slate-900 font-bold">{practitioner}</span>
              </span>
              <button 
                onClick={logout}
                className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {!practitioner ? (
          <div className="max-w-md mx-auto pt-8 sm:pt-16">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Acceso Privado</h2>
                <p className="text-slate-500 mt-2 text-sm font-medium">Portal de gestión para practicantes</p>
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
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Nombre Completo</label>
                  <input name="nombre" type="text" required placeholder="Ej. Ana García"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#6ddbf3]/20 focus:border-[#6ddbf3] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Contraseña</label>
                  <input name="password" type="password" required placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#6ddbf3]/20 focus:border-[#6ddbf3] outline-none transition-all" />
                </div>
                <button 
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 hover:bg-[#6ddbf3] disabled:bg-slate-300 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] mt-4"
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
          <EvidenceDashboard practitioner={practitioner} school={school} />
        )}
      </main>
    </div>
  );
}

export default App;