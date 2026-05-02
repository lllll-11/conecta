import React, { useState } from 'react';

const RegistrationForm = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    universidad: '',
    turno: 'Matutino'
  });

  const GAS_URL = 'https://script.google.com/macros/s/AKfycbxwXaL9rnCGJdqaLbCPgiiD2YzQkRhQ4pseXVN0fZagQfl1_3UL9C6KfxrMSkoENEH_/exec';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', data: formData })
      });
      alert('Registro exitoso. Ya puedes iniciar sesión.');
      onBack();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md mx-auto">
      <button onClick={onBack} className="mb-6 text-teal-600 text-sm font-bold flex items-center gap-2">
        ← Volver
      </button>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Registro de Practicante</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Nombre Completo</label>
          <input 
            required
            type="text" 
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition"
            placeholder="Ej. Ana García"
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Correo Institucional</label>
          <input 
            required
            type="email" 
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition"
            placeholder="ana@universidad.edu"
            onChange={(e) => setFormData({...formData, correo: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Contraseña</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Turno</label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition"
              onChange={(e) => setFormData({...formData, turno: e.target.value})}
            >
              <option>Matutino</option>
              <option>Vespertino</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Universidad</label>
          <input 
            required
            type="text" 
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition"
            placeholder="Nombre de la institución"
            onChange={(e) => setFormData({...formData, universidad: e.target.value})}
          />
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${
            loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-teal-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Procesando...
            </span>
          ) : 'Finalizar Registro'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;