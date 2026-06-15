'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setToken, clearToken, getToken } from '@/lib/apiClient';

// ── Contexts ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const DataContext = createContext(null);

const PUBLIC_ROUTES = ['/login'];
const SESSION_KEY = 'qx_session';

// ── Auth Provider ─────────────────────────────────────────────────────────────
function AuthProvider({ children, onUser }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      const token = getToken();
      if (stored && token) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        onUser(parsed);
      }
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user && !PUBLIC_ROUTES.includes(pathname)) router.replace('/login');
  }, [user, loading, pathname]);

  const login = useCallback(async (username, password) => {
    clearToken();
    try {
      const { token, user: u } = await api.login({ username, password });
      setToken(token);
      setUser(u);
      onUser(u);
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      return { success: true, user: u };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    onUser(null);
    clearToken();
    localStorage.removeItem(SESSION_KEY);
    router.push('/login');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Data Provider ─────────────────────────────────────────────────────────────
function DataProvider({ children, currentUser }) {
  const router = useRouter();
  const [casos, setCasos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [admisiones, setAdmisiones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [especialistas, setEspecialistas] = useState([]);
  const [quirofanos, setQuirofanos] = useState([]);
  const [procedimientos, setProcedimientos] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Carga inicial cuando hay usuario autenticado
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;
    let hasRetried = false;

    const load = async () => {
      setDataLoading(true);
      try {
        const [c, pl, adm, u, pac, esp, qx, proc, diag, ins, hor, ps, es] = await Promise.all([
          api.getCasos(),
          api.getPlanes(),
          api.getAdmisiones(),
          api.getUsuarios(),
          api.getPacientes(),
          api.getEspecialistas(),
          api.getQuirofanos(),
          api.getProcedimientos(),
          api.getDiagnosticos(),
          api.getInsumos(),
          api.getHorarios(),
          api.getPisos(),
          api.getEspacios(),
        ]);
        if (!isMounted) return;
        setCasos(c); setPlanes(pl); setAdmisiones(adm); setUsuarios(u);
        setPacientes(pac); setEspecialistas(esp); setQuirofanos(qx);
        setProcedimientos(proc); setDiagnosticos(diag); setInsumos(ins); setHorarios(hor);
        setPisos(ps); setEspacios(es);
      } catch (e) {
        console.error('Error cargando datos:', e.message);
        if (!isMounted) return;
        if ((e.message.includes('Token') || e.message.includes('401') || e.message.includes('expirad')) && !hasRetried) {
          hasRetried = true;
          clearToken();
          localStorage.removeItem('qx_session');
          if (isMounted) router.replace('/login');
        }
      } finally {
        if (isMounted) setDataLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Helper: resuelve referencias de un caso usando datos en contexto
  const resolveCaso = useCallback((caso) => {
    const result = {
      ...caso,
      pacienteObj:       pacientes.find(p => String(p._id) === String(caso.paciente)),
      especialistaObj:   especialistas.find(e => e._id === caso.especialistaPrincipal),
      equipoObjs:        (caso.equipoQuirurgico || []).map(id => especialistas.find(e => e._id === id)).filter(Boolean),
      diagnosticoObj:    diagnosticos.find(d => d._id === caso.diagnostico),
      procedimientoObj:  procedimientos.find(p => p._id === caso.procedimiento),
      planObj:           planes.find(p => p._id === caso.plan),
    };
    if (!result.pacienteObj) {
      console.log('resolveCaso - paciente no encontrado:', { pacienteId: caso.paciente, pacientesIds: pacientes.map(p => String(p._id)) });
    }
    return result;
  }, [pacientes, especialistas, diagnosticos, procedimientos, planes]);

  const getQuirofanoById = useCallback((id) => quirofanos.find(q => q._id === id), [quirofanos]);

  // ── Casos ────────────────────────────────────────────────────────────────
  const crearCaso = useCallback(async (data) => {
    const nuevo = await api.crearCaso(data);
    setCasos(prev => [nuevo, ...prev]);
    return nuevo;
  }, []);

  const actualizarCaso = useCallback(async (id, data) => {
    const actualizado = await api.actualizarCaso(id, data);
    setCasos(prev => prev.map(c => c._id === id ? actualizado : c));
    return actualizado;
  }, []);

  const actualizarEstadoCaso = useCallback((id, estado) => actualizarCaso(id, { estado }), [actualizarCaso]);
  const aprobarCaso  = useCallback((id) => actualizarCaso(id, { estado: 'aprobada' }),  [actualizarCaso]);
  const rechazarCaso = useCallback((id) => actualizarCaso(id, { estado: 'rechazada' }), [actualizarCaso]);
  const cancelarCaso = useCallback((id) => actualizarCaso(id, { estado: 'cancelado' }), [actualizarCaso]);
  const eliminarCaso = useCallback(async (id) => {
    await api.eliminarCaso(id);
    setCasos(prev => prev.filter(c => c._id !== id));
  }, []);

  // ── Planes ───────────────────────────────────────────────────────────────
  const crearPlan = useCallback(async (data) => {
    const { plan, caso } = await api.crearPlan(data);
    setPlanes(prev => [...prev, plan]);
    setCasos(prev => prev.map(c => c._id === caso._id ? caso : c));
    return plan;
  }, []);

  const actualizarPlan = useCallback(async (id, data) => {
    const actualizado = await api.actualizarPlan(id, data);
    setPlanes(prev => prev.map(p => p._id === id ? actualizado : p));
    return actualizado;
  }, []);

  const eliminarPlan = useCallback(async (planId) => {
    await api.eliminarPlan(planId);
    setPlanes(prev => prev.filter(p => p._id !== planId));
    setCasos(prev => prev.map(c => c.plan === planId ? { ...c, estado: 'aprobada', plan: null } : c));
  }, []);

  // ── Admisiones ───────────────────────────────────────────────────────────
  const crearAdmision = useCallback(async (data) => {
    const { admision, caso } = await api.crearAdmision(data);
    setAdmisiones(prev => [...prev, admision]);
    setCasos(prev => prev.map(c => c._id === caso._id ? caso : c));
    return admision;
  }, []);

  const actualizarAdmision = useCallback(async (id, data) => {
    const actualizada = await api.actualizarAdmision(id, data);
    setAdmisiones(prev => prev.map(a => a._id === id ? actualizada : a));
    return actualizada;
  }, []);

  // ── Pacientes ─────────────────────────────────────────────────────────────
  const crearPaciente = useCallback(async (data) => {
    const nuevo = await api.crearPaciente(data);
    console.log('crearPaciente - nuevo paciente:', JSON.stringify(nuevo));
    setPacientes(prev => {
      console.log('setPacientes - prev length:', prev.length, ' adding:', nuevo._id);
      return [...prev, nuevo];
    });
    return nuevo;
  }, []);
  const actualizarPaciente = useCallback(async (id, data) => {
    const actualizado = await api.actualizarPaciente(id, data);
    setPacientes(prev => prev.map(p => p._id === id ? actualizado : p));
    return actualizado;
  }, []);
  const eliminarPaciente = useCallback(async (id) => {
    await api.eliminarPaciente(id);
    setPacientes(prev => prev.filter(p => p._id !== id));
  }, []);

  // ── Especialistas ─────────────────────────────────────────────────────────
  const crearEspecialista = useCallback(async (data) => {
    const nuevo = await api.crearEspecialista(data);
    setEspecialistas(prev => [...prev, nuevo]);
    return nuevo;
  }, []);
  const actualizarEspecialista = useCallback(async (id, data) => {
    const actualizado = await api.actualizarEspecialista(id, data);
    setEspecialistas(prev => prev.map(e => e._id === id ? actualizado : e));
    return actualizado;
  }, []);
  const eliminarEspecialista = useCallback(async (id) => {
    await api.eliminarEspecialista(id);
    setEspecialistas(prev => prev.filter(e => e._id !== id));
  }, []);

  // ── Quirófanos ────────────────────────────────────────────────────────────
  const crearQuirofano = useCallback(async (data) => {
    const nuevo = await api.crearQuirofano(data);
    setQuirofanos(prev => [...prev, nuevo]);
    return nuevo;
  }, []);
  const actualizarQuirofano = useCallback(async (id, data) => {
    const actualizado = await api.actualizarQuirofano(id, data);
    setQuirofanos(prev => prev.map(q => q._id === id ? actualizado : q));
    return actualizado;
  }, []);
  const eliminarQuirofano = useCallback(async (id) => {
    await api.eliminarQuirofano(id);
    setQuirofanos(prev => prev.filter(q => q._id !== id));
  }, []);

  // ── Procedimientos ────────────────────────────────────────────────────────
  const crearProcedimiento = useCallback(async (data) => {
    const nuevo = await api.crearProcedimiento(data);
    setProcedimientos(prev => [...prev, nuevo]);
    return nuevo;
  }, []);
  const actualizarProcedimiento = useCallback(async (id, data) => {
    const actualizado = await api.actualizarProcedimiento(id, data);
    setProcedimientos(prev => prev.map(p => p._id === id ? actualizado : p));
    return actualizado;
  }, []);
  const eliminarProcedimiento = useCallback(async (id) => {
    await api.eliminarProcedimiento(id);
    setProcedimientos(prev => prev.filter(p => p._id !== id));
  }, []);

  // ── Diagnósticos ──────────────────────────────────────────────────────────
  const crearDiagnostico = useCallback(async (data) => {
    const nuevo = await api.crearDiagnostico(data);
    setDiagnosticos(prev => [...prev, nuevo]);
    return nuevo;
  }, []);
  const actualizarDiagnostico = useCallback(async (id, data) => {
    const actualizado = await api.actualizarDiagnostico(id, data);
    setDiagnosticos(prev => prev.map(d => d._id === id ? actualizado : d));
    return actualizado;
  }, []);
  const eliminarDiagnostico = useCallback(async (id) => {
    await api.eliminarDiagnostico(id);
    setDiagnosticos(prev => prev.filter(d => d._id !== id));
  }, []);

  // ── Insumos ───────────────────────────────────────────────────────────────
  const crearInsumo = useCallback(async (data) => {
    const nuevo = await api.crearInsumo(data);
    setInsumos(prev => [...prev, nuevo]);
    return nuevo;
  }, []);
  const actualizarInsumo = useCallback(async (id, data) => {
    const actualizado = await api.actualizarInsumo(id, data);
    setInsumos(prev => prev.map(i => i._id === id ? actualizado : i));
    return actualizado;
  }, []);
  const eliminarInsumo = useCallback(async (id) => {
    await api.eliminarInsumo(id);
    setInsumos(prev => prev.filter(i => i._id !== id));
  }, []);

  // ── Usuarios ─────────────────────────────────────────────────────────────
  const crearUsuario = useCallback(async (data) => {
    const nuevo = await api.crearUsuario(data);
    setUsuarios(prev => [...prev, nuevo]);
    return nuevo;
  }, []);

  const actualizarUsuario = useCallback(async (id, data) => {
    const actualizado = await api.actualizarUsuario(id, data);
    setUsuarios(prev => prev.map(u => u._id === id ? actualizado : u));
    return actualizado;
  }, []);

  const toggleUsuario = useCallback(async (id) => {
    const actualizado = await api.toggleUsuario(id);
    setUsuarios(prev => prev.map(u => u._id === id ? actualizado : u));
  }, []);

  const cambiarPassword = useCallback(async (id, data) => {
    return await api.cambiarPassword(id, data);
  }, []);

  // ── Horarios ───────────────────────────────────────────────────────────
  const crearHorario = useCallback(async (data) => {
    const nuevo = await api.crearHorario(data);
    setHorarios(prev => [...prev, nuevo]);
    return nuevo;
  }, []);

  const actualizarHorario = useCallback(async (id, data) => {
    const actualizado = await api.actualizarHorario(id, data);
    setHorarios(prev => prev.map(h => h._id === id ? actualizado : h));
    return actualizado;
  }, []);

  const eliminarHorario = useCallback(async (id) => {
    await api.eliminarHorario(id);
    setHorarios(prev => prev.filter(h => h._id !== id));
  }, []);

  const refetchHorarios = useCallback(async () => {
    const data = await api.getHorarios();
    setHorarios(data);
    return data;
  }, []);

  // ── Cédula Hospitalaria ────────────────────────────────────────────────
  const crearPiso = useCallback(async (data) => {
    const nuevo = await api.crearPiso(data);
    setPisos(prev => [...prev, nuevo].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
    return nuevo;
  }, []);

  const actualizarPiso = useCallback(async (id, data) => {
    const actualizado = await api.actualizarPiso(id, data);
    setPisos(prev => prev.map(p => p._id === id ? actualizado : p));
    return actualizado;
  }, []);

  const eliminarPiso = useCallback(async (id) => {
    await api.eliminarPiso(id);
    setPisos(prev => prev.filter(p => p._id !== id));
    setEspacios(prev => prev.filter(e => (e.pisoId?._id || e.pisoId) !== id));
  }, []);

  const crearEspacio = useCallback(async (data) => {
    const nuevo = await api.crearEspacio(data);
    setEspacios(prev => [...prev, nuevo]);
    return nuevo;
  }, []);

  const actualizarEspacio = useCallback(async (id, data) => {
    const actualizado = await api.actualizarEspacio(id, data);
    setEspacios(prev => prev.map(e => e._id === id ? actualizado : e));
    return actualizado;
  }, []);

  const eliminarEspacio = useCallback(async (id) => {
    await api.eliminarEspacio(id);
    setEspacios(prev => prev.filter(e => e._id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      casos, planes, admisiones, usuarios,
      pacientes, especialistas, quirofanos, procedimientos, diagnosticos, insumos,
      horarios, pisos, espacios,
      dataLoading,
      resolveCaso, getQuirofanoById,
      crearCaso, actualizarCaso, actualizarEstadoCaso, aprobarCaso, rechazarCaso, cancelarCaso, eliminarCaso,
      crearPlan, actualizarPlan, eliminarPlan,
      crearAdmision, actualizarAdmision,
      crearPaciente, actualizarPaciente, eliminarPaciente,
      crearEspecialista, actualizarEspecialista, eliminarEspecialista,
      crearQuirofano, actualizarQuirofano, eliminarQuirofano,
      crearProcedimiento, actualizarProcedimiento, eliminarProcedimiento,
      crearDiagnostico, actualizarDiagnostico, eliminarDiagnostico,
      crearInsumo, actualizarInsumo, eliminarInsumo,
      crearUsuario, actualizarUsuario, toggleUsuario, cambiarPassword,
      crearHorario, actualizarHorario, eliminarHorario, refetchHorarios,
      crearPiso, actualizarPiso, eliminarPiso,
      crearEspacio, actualizarEspacio, eliminarEspacio,
    }}>
      {children}
    </DataContext.Provider>
  );
}

// ── Root Provider ─────────────────────────────────────────────────────────────
export default function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  return (
    <AuthProvider onUser={setCurrentUser}>
      <DataProvider currentUser={currentUser}>
        {children}
      </DataProvider>
    </AuthProvider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export function useAuth() { return useContext(AuthContext); }
export function useData() { return useContext(DataContext); }
