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

  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwy2ENxpDpHmB2YRxL9vN8Szh0IL7RLwcTAN9TzU6s04oODLqqCi5vcF_ZmnUaxBlRyGw/exec';

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
    <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-md mx-auto">
      <button onClick={onBack} className="mb-6 text-[#6ddbf3] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
        ← Volver al Portal
      </button>
      <h2 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">Registro</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Nombre Completo</label>
          <input 
            required
            type="text" 
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-[#6ddbf3]/20 focus:border-[#6ddbf3] outline-none transition-all"
            placeholder="Ej. Ana García"
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Correo Institucional</label>
          <input 
            required
            type="email" 
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-[#6ddbf3]/20 focus:border-[#6ddbf3] outline-none transition-all"
            placeholder="ana@universidad.edu"
            onChange={(e) => setFormData({...formData, correo: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Contraseña</label>
            <input 
              required
              type="password" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-[#6ddbf3]/20 focus:border-[#6ddbf3] outline-none transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Turno</label>
            <select 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-[#6ddbf3]/20 focus:border-[#6ddbf3] outline-none transition-all"
              onChange={(e) => setFormData({...formData, turno: e.target.value})}
            >
              <option>Matutino</option>
              <option>Vespertino</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Universidad</label>
          <input 
            required
            type="text" 
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-[#6ddbf3]/20 focus:border-[#6ddbf3] outline-none transition-all"
            placeholder="Nombre de la institución"
            onChange={(e) => setFormData({...formData, universidad: e.target.value})}
          />
        </div>
        <button 
          disabled={loading}
          type="submit" 
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs text-white transition-all shadow-xl active:scale-95 ${
            loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-[#6ddbf3] shadow-slate-200'
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