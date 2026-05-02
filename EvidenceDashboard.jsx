import React, { useState, useEffect } from 'react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydO_CTMKNdLWD-ebmY3VikbeGFcIHdKQzWXQwCpxPJN62k2LowGyCxsRSbJYWbdQfsRQ/exec';

const EvidenceDashboard = ({ practitioner, school }) => {
  const [view, setView] = useState('list'); // 'list', 'create', 'folder', 'admin_manage'
  const [cases, setCases] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [schools, setSchools] = useState([]); 
  const [selectedCase, setSelectedCase] = useState(null);
  const [adminSelection, setAdminSelection] = useState({ school: null, practitioner: null });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const isAdmin = practitioner.toLowerCase().includes('admin') || practitioner.toLowerCase().includes('andriy');

  const [newCaseData, setNewCaseData] = useState({
    case_title: '',
    grado: '1',
    grupo: ''
  });

  const [formData, setFormData] = useState({
    tipo_intervencion: 'Individual',
    semaforo: 'Verde',
    notas: '',
    consentimiento: false
  });

  useEffect(() => {
    loadData();
    // if (isAdmin) loadAdminData(); // Schools are now loaded by loadData for admin
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Usamos get_practitioner_data para ambos para asegurar que traemos 'cases' y 'evidences'
      const payload = { 
        action: isAdmin ? 'get_admin_dashboard_data' : 'get_practitioner_data', 
        school: school // Para practicantes, se envía su escuela. Para admin, se ignora en el backend.
      };

      const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
      const result = await response.json();
      if (result.result === 'success') {
        setCases(result.cases || []);
        setEvidences(result.evidences || []); // Admin dashboard data will have 'evidences' key
        if (isAdmin) setSchools(result.schools || []); // Admin dashboard also gets schools
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Generar ID correlativo
    let nextId = "001";
    if (cases.length > 0) {
      const ids = cases.map(c => parseInt(c.case_id)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        nextId = String(Math.max(...ids) + 1).padStart(3, '0');
      }
    }

    const payload = {
      action: 'create_case',
      data: {
        ...newCaseData,
        case_id: nextId,
        practitioner_creator: practitioner,
        school: school
      }
    };

    try {
      const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
      const result = await response.json();
      if (result.result === 'success') {
        setStatus({ type: 'success', message: '¡Caso creado con éxito!' });
        setNewCaseData({ case_title: '', grado: '1', grupo: '' });
        await loadData();
        setTimeout(() => {
          setView('list');
          setStatus({ type: '', message: '' });
        }, 1500);
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error al crear el caso.' });
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

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    const schoolName = e.target.school_name.value;
    setLoading(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'create_school', data: { name: schoolName } })
      });
      const result = await response.json();
      if (result.result === 'success') {
        setStatus({ type: 'success', message: 'Escuela creada correctamente.' });
        e.target.reset();
        loadAdminData();
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'Error al crear escuela.' });
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
      {isAdmin && view === 'list' && (
        <div className="flex gap-2 mb-4">
          <button onClick={() => setView('list')} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest">Evidencias</button>
          <button onClick={() => setView('admin_manage')} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-50">Gestión</button>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {isAdmin ? (
                  adminSelection.practitioner ? `Casos de ${adminSelection.practitioner}` :
                  adminSelection.school ? `Practicantes en ${adminSelection.school}` :
                  'Panel Global: Escuelas'
                ) : 'Directorio de Casos'}
              </h2>
              <p className="text-xs text-[#6ddbf3] font-bold uppercase tracking-widest">
                {isAdmin ? (
                  adminSelection.school ? `Sede: ${adminSelection.school}` : 'Administrador'
                ) : `Sede: ${school}`}
              </p>
            </div>
            {!isAdmin && (
              <button onClick={() => setView('create')} className="w-full sm:w-auto bg-[#6ddbf3] text-white px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-[#6ddbf3]/30 hover:scale-105 transition-all">Nuevo Caso</button>
            )}
          </div>

          {isAdmin && (adminSelection.school || adminSelection.practitioner) && (
            <button 
              onClick={() => {
                if (adminSelection.practitioner) setAdminSelection({ ...adminSelection, practitioner: null });
                else setAdminSelection({ school: null, practitioner: null });
              }}
              className="text-[#6ddbf3] font-black uppercase text-[10px] tracking-widest flex items-center gap-2 mb-2 hover:gap-3 transition-all"
            >
              <i className="fas fa-arrow-left"></i> Volver
            </button>
          )}

          <div className="grid gap-4">
            {isAdmin ? (
              !adminSelection.school ? (
                // NIVEL 1: Lista de Escuelas
                schools.map(s => {
                  const schoolCases = cases.filter(c => c.school === s);
                  return (
                    <div key={s} onClick={() => setAdminSelection({ ...adminSelection, school: s })} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-[#6ddbf3] hover:shadow-xl hover:shadow-slate-200/50 transition-all flex justify-between items-center group">
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 group-hover:text-[#6ddbf3] transition-colors uppercase tracking-tight">{s}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {schoolCases.length} casos registrados
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-[#6ddbf3]/10 transition-colors">
                        <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6ddbf3]"></i>
                      </div>
                    </div>
                  );
                })
              ) : !adminSelection.practitioner ? (
                // NIVEL 2: Lista de Practicantes en la escuela seleccionada
                [...new Set(cases.filter(c => c.school === adminSelection.school).map(c => c.practitioner_creator))].map(name => {
                  const pCases = cases.filter(c => c.practitioner_creator === name && c.school === adminSelection.school);
                  return (
                    <div key={name} onClick={() => setAdminSelection({ ...adminSelection, practitioner: name })} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-[#6ddbf3] hover:shadow-xl hover:shadow-slate-200/50 transition-all flex justify-between items-center group">
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 group-hover:text-[#6ddbf3] transition-colors uppercase tracking-tight">{name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pCases.length} casos activos</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-[#6ddbf3]/10 transition-colors">
                        <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6ddbf3]"></i>
                      </div>
                    </div>
                  );
                })
              ) : (
                // NIVEL 3: Lista de Casos del practicante en esa escuela
                cases
                  .filter(c => c.practitioner_creator === adminSelection.practitioner && c.school === adminSelection.school)
                  .map(c => (
                    <div key={c.case_id} onClick={() => { setSelectedCase(c); setView('folder'); }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-[#6ddbf3] hover:shadow-xl hover:shadow-slate-200/50 transition-all flex justify-between items-center group">
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 group-hover:text-[#6ddbf3] transition-colors uppercase tracking-tight">Caso: {c.case_id}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.grado ? `${c.grado}º${c.grupo} • ` : ''}{c.case_title || "Sin etiqueta"}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-[#6ddbf3]/10 transition-colors">
                        <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6ddbf3]"></i>
                      </div>
                    </div>
                  ))
              )
            ) : (
              // VISTA NO-ADMIN: Lista normal de casos de su escuela
              cases.map(c => (
                <div key={c.case_id} onClick={() => { setSelectedCase(c); setView('folder'); }} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:border-[#6ddbf3] hover:shadow-xl hover:shadow-slate-200/50 transition-all flex justify-between items-center group">
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 group-hover:text-[#6ddbf3] transition-colors uppercase tracking-tight">Caso: {c.case_id}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.grado ? `${c.grado}º${c.grupo} • ` : ''}{c.case_title || "Sin etiqueta"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-[#6ddbf3]/10 transition-colors">
                    <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6ddbf3]"></i>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {view === 'create' && (
        <div className="max-w-md mx-auto bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <button onClick={() => setView('list')} className="mb-6 text-[#6ddbf3] font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
            <i className="fas fa-arrow-left"></i> Volver al Directorio
          </button>
          <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Nuevo Caso</h2>
          <form onSubmit={handleCreateCase} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Etiqueta de Referencia (NO NOMBRES)</label>
              <input 
                type="text" 
                value={newCaseData.case_title}
                onChange={e => setNewCaseData({...newCaseData, case_title: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#6ddbf3] transition-all" 
                placeholder="Ej. Caso A (Baja participación)" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Grado</label>
                <select 
                  value={newCaseData.grado}
                  onChange={e => setNewCaseData({...newCaseData, grado: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#6ddbf3] transition-all appearance-none"
                >
                  <option value="1">1º Grado</option>
                  <option value="2">2º Grado</option>
                  <option value="3">3º Grado</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-2 tracking-widest">Grupo</label>
                <input 
                  type="text" 
                  required 
                  value={newCaseData.grupo}
                  onChange={e => setNewCaseData({...newCaseData, grupo: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#6ddbf3] transition-all" 
                  placeholder="Ej. A" 
                />
              </div>
            </div>
            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-5 bg-slate-900 hover:bg-[#6ddbf3] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4"
            >
              {loading ? 'Procesando...' : 'Crear Caso'}
            </button>
          </form>
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
              <p className="text-[9px] text-center text-slate-400 italic tracking-tight">El programa se desarrolla dentro del entorno escolar bajo autorización institucional y con enfoque de acompañamiento general, respetando la confidencialidad de los estudiantes.</p>
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

      {view === 'admin_manage' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setView('list')} className="text-[#6ddbf3] font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
            <i className="fas fa-arrow-left"></i> Volver al Panel
          </button>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Crear Escuela */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Nueva Escuela</h3>
              <form onSubmit={handleCreateSchool} className="space-y-4">
                <input name="school_name" required placeholder="Nombre de la Institución" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white outline-none" />
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Registrar Escuela</button>
              </form>
            </div>

            {/* Lista de Escuelas */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Escuelas Activas</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {schools.map((s, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 flex justify-between items-center">
                    {s} <i className="fas fa-school text-[#6ddbf3]"></i>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceDashboard;