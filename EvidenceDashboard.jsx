import React, { useState, useEffect } from 'react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwy2ENxpDpHmB2YRxL9vN8Szh0IL7RLwcTAN9TzU6s04oODLqqCi5vcF_ZmnUaxBlRyGw/exec';

const EvidenceDashboard = ({ practitioner }) => {
  const [view, setView] = useState('list'); // 'list', 'create', 'folder'
  const [cases, setCases] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    tipo_intervencion: 'Individual',
    semaforo: 'Verde',
    notas: '',
    consentimiento: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'get_practitioner_data' })
      });
      const result = await response.json();
      if (result.result === 'success') {
        setCases(result.cases || []);
        setEvidences(result.evidences || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    if (formData.notas.length < 200) {
      setStatus({ type: 'error', message: 'La nota debe tener al menos 200 caracteres.' });
      return;
    }

    setLoading(true);
    const payload = {
      action: 'evidence',
      data: {
        ...formData,
        case_id: selectedCase.case_id,
        practicante: practitioner,
        fecha: new Date().toLocaleDateString('en-CA')
      }
    };

    try {
      const response = await fetch(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      });
      setStatus({ type: 'success', message: '¡Sesión guardada correctamente!' });
      setFormData({ tipo_intervencion: 'Individual', semaforo: 'Verde', notas: '', consentimiento: false });
      loadData();
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Error de conexión.' });
    } finally {
      setLoading(false);
    }
  };

  const semaforos = [
    { label: 'Estable', value: 'Verde', color: 'bg-emerald-500' },
    { label: 'Riesgo', value: 'Amarillo', color: 'bg-amber-400' },
    { label: 'Urgente', value: 'Rojo', color: 'bg-red-500' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Directorio de Casos</h2>
            <button onClick={() => setView('create')} className="w-full sm:w-auto bg-[#6ddbf3] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-[#6ddbf3]/30 hover:scale-105 transition-all">Nuevo Caso</button>
          </div>
          <div className="grid gap-4">
            {cases.map(c => (
              <div key={c.case_id} onClick={() => { setSelectedCase(c); setView('folder'); }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-[#6ddbf3] hover:shadow-xl hover:shadow-slate-200/50 transition-all flex justify-between items-center group">
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 group-hover:text-[#6ddbf3] transition-colors uppercase tracking-tight">Caso: {c.case_id}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.case_title || "Sin etiqueta"}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-[#6ddbf3]/10 transition-colors">
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6ddbf3]"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'folder' && selectedCase && (
        <div className="space-y-6">
          <button onClick={() => setView('list')} className="text-[#6ddbf3] font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
            <i className="fas fa-arrow-left"></i> Volver al Directorio
          </button>
          
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            <div className="bg-[#6ddbf3] p-6 text-white">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Nueva Sesión: {selectedCase.case_id}</h2>
            </div>

            <form onSubmit={handleSubmitEvidence} className="p-6 space-y-6">
              {status.message && (
                <div className={`p-4 rounded-xl text-center text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {status.message}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Tipo de Intervención</label>
                  <select 
                    value={formData.tipo_intervencion}
                    onChange={e => setFormData({...formData, tipo_intervencion: e.target.value})}
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-[#6ddbf3] focus:bg-white transition-all">
                    <option>Individual</option>
                    <option>Grupal</option>
                    <option>Canalización</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Prioridad (Semáforo)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {semaforos.map(s => (
                      <button 
                        key={s.value}
                        type="button"
                        onClick={() => setFormData({...formData, semaforo: s.value})}
                        className={`py-2 rounded-lg text-[10px] font-bold transition ${formData.semaforo === s.value ? `${s.color} text-white shadow-lg` : 'bg-slate-100 text-slate-400'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Notas del Avance</label>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${formData.notas.length < 200 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {formData.notas.length} / 200 MÍN.
                  </span>
                </div>
                <textarea 
                  required
                  rows="5"
                  value={formData.notas}
                  onChange={e => setFormData({...formData, notas: e.target.value})}
                  className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none border border-transparent focus:border-[#6ddbf3] focus:bg-white text-sm leading-relaxed transition-all"
                  placeholder="Describe los avances de la sesión..."
                />
              </div>
              <div className="flex gap-4 items-start bg-[#f8f7f4] p-5 rounded-2xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="consent-check"
                  checked={formData.consentimiento}
                  onChange={e => setFormData({...formData, consentimiento: e.target.checked})}
                  className="mt-1 w-5 h-5 accent-[#6ddbf3]"
                />
                <label htmlFor="consent-check" className="text-[10px] text-slate-500 leading-tight">
                  Confirmo que el <strong>expediente físico</strong> cuenta con el Consentimiento Informado firmado por los tutores.
                </label>
              </div>
              <button 
                disabled={loading || !formData.consentimiento || formData.notas.length < 200}
                className="w-full py-5 bg-slate-900 hover:bg-[#6ddbf3] disabled:bg-slate-200 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-95">
                {loading ? 'Guardando...' : 'Finalizar Sesión'}
              </button>
              <p className="text-[9px] text-center text-slate-400 italic tracking-tight">La información registrada respeta la confidencialidad absoluta de los casos escolares.</p>
            </form>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 italic tracking-tight ml-2">Historial de Intervenciones</h3>
            {evidences.filter(e => String(e.case_id) === String(selectedCase.case_id)).length === 0 ? (
              <p className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed">No hay sesiones previas.</p>
            ) : (
              evidences
                .filter(e => String(e.case_id) === String(selectedCase.case_id))
                .sort((a,b) => new Date(b.fecha) - new Date(a.fecha))
                .map((ev, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex gap-5">
                    <div className={`w-1.5 rounded-full flex-shrink-0 ${ev.semaforo === 'Verde' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : ev.semaforo === 'Amarillo' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.15em]">
                        <span className="bg-slate-50 px-2 py-0.5 rounded">{ev.fecha} • {ev.tipo_intervencion}</span>
                        <span className="text-slate-800">{ev.practicante}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium break-words whitespace-pre-wrap">"{ev.notes || ev.notas}"</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceDashboard;