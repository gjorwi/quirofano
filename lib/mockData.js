// NOTE: Todos los datos ahora vienen de la API (apiquirofano).
// Solo se mantienen aquí los configs estáticos de UI.

// ─── PACIENTES ───────────────────────────────────────────────────────────────
export const pacientes = [
  { _id: 'p1', nombre: 'María López García', identificacion: '0101-1985-12345', fechaNacimiento: '1985-03-15', sexo: 'Femenino', contacto: '9999-1234', historiaClinica: 'HC-001' },
  { _id: 'p2', nombre: 'Carlos Mendoza Rivera', identificacion: '0201-1978-54321', fechaNacimiento: '1978-07-22', sexo: 'Masculino', contacto: '9888-5678', historiaClinica: 'HC-002' },
  { _id: 'p3', nombre: 'Ana Sofía Ramos', identificacion: '0301-1992-11111', fechaNacimiento: '1992-11-08', sexo: 'Femenino', contacto: '9777-9012', historiaClinica: 'HC-003' },
  { _id: 'p4', nombre: 'José Antonio Herrera', identificacion: '0401-1965-22222', fechaNacimiento: '1965-04-30', sexo: 'Masculino', contacto: '9666-3456', historiaClinica: 'HC-004' },
  { _id: 'p5', nombre: 'Lucía Fernández Blanco', identificacion: '0501-1990-33333', fechaNacimiento: '1990-09-18', sexo: 'Femenino', contacto: '9555-7890', historiaClinica: 'HC-005' },
  { _id: 'p6', nombre: 'Roberto Castillo Mora', identificacion: '0601-1973-44444', fechaNacimiento: '1973-01-25', sexo: 'Masculino', contacto: '9444-2345', historiaClinica: 'HC-006' },
  { _id: 'p7', nombre: 'Patricia Villanueva Cruz', identificacion: '0701-1988-55555', fechaNacimiento: '1988-06-12', sexo: 'Femenino', contacto: '9333-6789', historiaClinica: 'HC-007' },
  { _id: 'p8', nombre: 'Miguel Ángel Torres', identificacion: '0801-1995-66666', fechaNacimiento: '1995-12-03', sexo: 'Masculino', contacto: '9222-0123', historiaClinica: 'HC-008' },
];

// ─── ESPECIALISTAS ────────────────────────────────────────────────────────────
export const especialistas = [
  { _id: 'e1', nombre: 'Dr. Andrés Montoya', especialidad: 'Cirugía General', codigoColegiado: 'CG-0045', disponibilidad: [{ dia: 'Lunes', horaInicio: '07:00', horaFin: '15:00' }, { dia: 'Miércoles', horaInicio: '07:00', horaFin: '15:00' }] },
  { _id: 'e2', nombre: 'Dra. Carmen Solís', especialidad: 'Cirugía Cardiovascular', codigoColegiado: 'CC-0032', disponibilidad: [{ dia: 'Martes', horaInicio: '08:00', horaFin: '16:00' }, { dia: 'Jueves', horaInicio: '08:00', horaFin: '16:00' }] },
  { _id: 'e3', nombre: 'Dr. Felipe Rojas', especialidad: 'Neurocirugía', codigoColegiado: 'NC-0018', disponibilidad: [{ dia: 'Lunes', horaInicio: '06:00', horaFin: '14:00' }, { dia: 'Viernes', horaInicio: '06:00', horaFin: '14:00' }] },
  { _id: 'e4', nombre: 'Dra. Valentina Cruz', especialidad: 'Ortopedia', codigoColegiado: 'OR-0067', disponibilidad: [{ dia: 'Martes', horaInicio: '07:00', horaFin: '15:00' }, { dia: 'Jueves', horaInicio: '07:00', horaFin: '15:00' }] },
  { _id: 'e5', nombre: 'Dr. Hernán Palacios', especialidad: 'Urología', codigoColegiado: 'UR-0029', disponibilidad: [{ dia: 'Miércoles', horaInicio: '08:00', horaFin: '16:00' }, { dia: 'Viernes', horaInicio: '08:00', horaFin: '16:00' }] },
  { _id: 'e6', nombre: 'Dra. Isabel Vargas', especialidad: 'Ginecología', codigoColegiado: 'GN-0053', disponibilidad: [{ dia: 'Lunes', horaInicio: '07:00', horaFin: '15:00' }, { dia: 'Miércoles', horaInicio: '07:00', horaFin: '15:00' }] },
];

// ─── QUIRÓFANOS ───────────────────────────────────────────────────────────────
export const quirofanos = [
  { _id: 'q1', numero: 'Q-01', ubicacion: 'Planta 2 – Ala Norte', tipo: 'general', equipamiento: ['Mesa quirúrgica', 'Lámpara LED', 'Monitor multiparamétrico', 'Electrocauterio'], habilitado: true },
  { _id: 'q2', numero: 'Q-02', ubicacion: 'Planta 2 – Ala Norte', tipo: 'especializado', equipamiento: ['Sistema de fluoroscopía', 'Mesa ortopédica', 'Lámpara LED', 'Monitor multiparamétrico'], habilitado: true },
  { _id: 'q3', numero: 'Q-03', ubicacion: 'Planta 2 – Ala Sur', tipo: 'general', equipamiento: ['Mesa quirúrgica', 'Lámpara LED', 'Monitor multiparamétrico'], habilitado: true },
  { _id: 'q4', numero: 'Q-04', ubicacion: 'Planta 1 – Urgencias', tipo: 'emergencia', equipamiento: ['Mesa quirúrgica', 'Desfibrilador', 'Ventilador', 'Monitor multiparamétrico', 'Ecógrafo portátil'], habilitado: true },
];

// ─── PROCEDIMIENTOS ───────────────────────────────────────────────────────────
export const procedimientos = [
  { _id: 'pr1', nombre: 'Apendicectomía laparoscópica', descripcion: 'Extirpación del apéndice por vía laparoscópica', duracionPromedioMin: 60 },
  { _id: 'pr2', nombre: 'Colecistectomía laparoscópica', descripcion: 'Extirpación de la vesícula biliar por laparoscopía', duracionPromedioMin: 75 },
  { _id: 'pr3', nombre: 'Hernioplastia inguinal', descripcion: 'Reparación de hernia inguinal con malla', duracionPromedioMin: 90 },
  { _id: 'pr4', nombre: 'Artroplastia de rodilla', descripcion: 'Reemplazo total de articulación de rodilla', duracionPromedioMin: 120 },
  { _id: 'pr5', nombre: 'Bypass coronario', descripcion: 'Revascularización miocárdica quirúrgica', duracionPromedioMin: 240 },
  { _id: 'pr6', nombre: 'Craneotomía', descripcion: 'Apertura del cráneo para acceso a estructuras intracraneales', duracionPromedioMin: 180 },
  { _id: 'pr7', nombre: 'Nefrectomía laparoscópica', descripcion: 'Extirpación de riñón por vía laparoscópica', duracionPromedioMin: 150 },
  { _id: 'pr8', nombre: 'Histerectomía abdominal', descripcion: 'Extirpación del útero por vía abdominal', duracionPromedioMin: 100 },
  { _id: 'pr9', nombre: 'Tiroidectomía total', descripcion: 'Extirpación total de la glándula tiroides', duracionPromedioMin: 90 },
  { _id: 'pr10', nombre: 'Amputación de miembro inferior', descripcion: 'Amputación infracondílea o supracondílea', duracionPromedioMin: 120 },
];

// ─── DIAGNÓSTICOS ─────────────────────────────────────────────────────────────
export const diagnosticos = [
  { _id: 'd1', codigo: 'K35.2', nombre: 'Apendicitis aguda con peritonitis', descripcion: 'Inflamación aguda del apéndice con peritonitis generalizada' },
  { _id: 'd2', codigo: 'K80.0', nombre: 'Colelitiasis con colecistitis aguda', descripcion: 'Cálculos en la vesícula biliar con inflamación aguda' },
  { _id: 'd3', codigo: 'K40.9', nombre: 'Hernia inguinal unilateral', descripcion: 'Hernia inguinal unilateral o no especificada sin obstrucción' },
  { _id: 'd4', codigo: 'M17.1', nombre: 'Gonartrosis primaria bilateral', descripcion: 'Artrosis primaria de rodilla, bilateral' },
  { _id: 'd5', codigo: 'I25.1', nombre: 'Enfermedad aterosclerótica del corazón', descripcion: 'Enfermedad coronaria aterosclerótica del corazón' },
  { _id: 'd6', codigo: 'C71.9', nombre: 'Tumor maligno del encéfalo', descripcion: 'Neoplasia maligna de encéfalo, no especificada' },
  { _id: 'd7', codigo: 'C64', nombre: 'Tumor maligno del riñón', descripcion: 'Neoplasia maligna del riñón excepto de la pelvis renal' },
  { _id: 'd8', codigo: 'D25', nombre: 'Leiomioma del útero', descripcion: 'Tumor benigno muscular del útero' },
  { _id: 'd9', codigo: 'E04.0', nombre: 'Bocio no tóxico difuso', descripcion: 'Bocio simple eutiroideo difuso' },
  { _id: 'd10', codigo: 'E11.5', nombre: 'Diabetes tipo 2 con complicaciones circulatorias', descripcion: 'Diabetes mellitus tipo 2 con complicaciones de la circulación periférica' },
];

// ─── INSUMOS ──────────────────────────────────────────────────────────────────
export const insumos = [
  { _id: 'i1', nombre: 'Guantes quirúrgicos estériles (par)', descripcion: 'Guantes de látex estériles talla 7.5' },
  { _id: 'i2', nombre: 'Bisturí desechable Nro. 10', descripcion: 'Bisturí de hoja de acero inoxidable' },
  { _id: 'i3', nombre: 'Gasa estéril 10x10 cm', descripcion: 'Gasa tejida de algodón, estéril' },
  { _id: 'i4', nombre: 'Sutura Vicryl 3-0', descripcion: 'Sutura absorbible trenzada poliglactina 910' },
  { _id: 'i5', nombre: 'Sutura Nylon 2-0', descripcion: 'Sutura no absorbible monofilamento' },
  { _id: 'i6', nombre: 'Malla de polipropileno', descripcion: 'Malla sintética para reparación de hernias' },
  { _id: 'i7', nombre: 'Drenaje Jackson-Pratt', descripcion: 'Sistema de drenaje activo de silicona' },
  { _id: 'i8', nombre: 'Catéter urinario 16 Fr', descripcion: 'Sonda Foley de látex siliconado' },
  { _id: 'i9', nombre: 'Electrobisturí monopolar', descripcion: 'Electrodo desechable para electrocauterio' },
  { _id: 'i10', nombre: 'Compresas abdominales', descripcion: 'Compresas quirúrgicas con marcador radiopaco' },
];

// ─── CASOS QUIRÚRGICOS ────────────────────────────────────────────────────────
export const casos = [
  {
    _id: 'c1', tipo: 'electivo', prioridad: 'alta', estado: 'pendiente',
    paciente: 'p1', especialistaPrincipal: 'e1', equipoQuirurgico: ['e6'],
    diagnostico: 'd2', procedimiento: 'pr2', duracionEstimadaMin: 80,
    observaciones: 'Paciente con historial de diabetes, requiere evaluación preoperatoria completa.',
    plan: null, createdAt: '2026-05-10T08:30:00Z',
  },
  {
    _id: 'c2', tipo: 'electivo', prioridad: 'media', estado: 'pendiente',
    paciente: 'p3', especialistaPrincipal: 'e4', equipoQuirurgico: [],
    diagnostico: 'd3', procedimiento: 'pr3', duracionEstimadaMin: 90,
    observaciones: 'Primera cirugía programada de hernia.',
    plan: null, createdAt: '2026-05-11T10:00:00Z',
  },
  {
    _id: 'c3', tipo: 'electivo', prioridad: 'baja', estado: 'aprobada',
    paciente: 'p5', especialistaPrincipal: 'e6', equipoQuirurgico: ['e1'],
    diagnostico: 'd8', procedimiento: 'pr8', duracionEstimadaMin: 110,
    observaciones: '',
    plan: null, createdAt: '2026-05-08T14:20:00Z',
  },
  {
    _id: 'c4', tipo: 'electivo', prioridad: 'alta', estado: 'programada',
    paciente: 'p2', especialistaPrincipal: 'e2', equipoQuirurgico: ['e1', 'e5'],
    diagnostico: 'd5', procedimiento: 'pr5', duracionEstimadaMin: 240,
    observaciones: 'Requiere UCI postoperatoria reservada.',
    plan: 'pl1', createdAt: '2026-05-05T09:00:00Z',
  },
  {
    _id: 'c5', tipo: 'electivo', prioridad: 'media', estado: 'programada',
    paciente: 'p7', especialistaPrincipal: 'e4', equipoQuirurgico: [],
    diagnostico: 'd4', procedimiento: 'pr4', duracionEstimadaMin: 120,
    observaciones: 'Paciente con prótesis dental, notificar a anestesiología.',
    plan: 'pl2', createdAt: '2026-05-07T11:15:00Z',
  },
  {
    _id: 'c6', tipo: 'electivo', prioridad: 'alta', estado: 'en_admision',
    paciente: 'p6', especialistaPrincipal: 'e3', equipoQuirurgico: ['e1'],
    diagnostico: 'd6', procedimiento: 'pr6', duracionEstimadaMin: 200,
    observaciones: 'Paciente con hipertensión controlada.',
    plan: 'pl3', createdAt: '2026-05-01T07:30:00Z',
  },
  {
    _id: 'c7', tipo: 'electivo', prioridad: 'media', estado: 'en_curso',
    paciente: 'p4', especialistaPrincipal: 'e5', equipoQuirurgico: [],
    diagnostico: 'd7', procedimiento: 'pr7', duracionEstimadaMin: 150,
    observaciones: '',
    plan: 'pl4', createdAt: '2026-05-03T08:00:00Z',
  },
  {
    _id: 'c8', tipo: 'electivo', prioridad: 'baja', estado: 'finalizado',
    paciente: 'p8', especialistaPrincipal: 'e1', equipoQuirurgico: [],
    diagnostico: 'd3', procedimiento: 'pr3', duracionEstimadaMin: 90,
    observaciones: 'Sin complicaciones.',
    plan: 'pl5', createdAt: '2026-04-28T09:00:00Z',
  },
  {
    _id: 'c9', tipo: 'electivo', prioridad: 'baja', estado: 'rechazada',
    paciente: 'p1', especialistaPrincipal: 'e6', equipoQuirurgico: [],
    diagnostico: 'd9', procedimiento: 'pr9', duracionEstimadaMin: 90,
    observaciones: 'Rechazada por falta de documentación.',
    plan: null, createdAt: '2026-05-09T12:00:00Z',
  },
  {
    _id: 'c10', tipo: 'electivo', prioridad: 'media', estado: 'cancelado',
    paciente: 'p2', especialistaPrincipal: 'e1', equipoQuirurgico: [],
    diagnostico: 'd1', procedimiento: 'pr1', duracionEstimadaMin: 60,
    observaciones: 'Cancelado por solicitud del paciente.',
    plan: null, createdAt: '2026-05-06T10:00:00Z',
  },
  {
    _id: 'c11', tipo: 'emergencia', prioridad: 'alta', estado: 'en_admision',
    paciente: 'p3', especialistaPrincipal: 'e1', equipoQuirurgico: ['e5'],
    diagnostico: 'd1', procedimiento: 'pr1', duracionEstimadaMin: 60,
    observaciones: 'Ingresó con dolor abdominal agudo en FID, cuadro compatible con apendicitis perforada.',
    fechaIngresoEmergencia: '2026-05-21T03:15:00Z', motivoEmergencia: 'Apendicitis perforada',
    plan: 'pl6', createdAt: '2026-05-21T03:30:00Z',
  },
  {
    _id: 'c12', tipo: 'emergencia', prioridad: 'alta', estado: 'en_curso',
    paciente: 'p6', especialistaPrincipal: 'e2', equipoQuirurgico: ['e3'],
    diagnostico: 'd5', procedimiento: 'pr5', duracionEstimadaMin: 240,
    observaciones: 'IAM con compromiso hemodinámico. Requiere revascularización urgente.',
    fechaIngresoEmergencia: '2026-05-21T05:40:00Z', motivoEmergencia: 'Infarto agudo de miocardio',
    plan: 'pl7', createdAt: '2026-05-21T05:50:00Z',
  },
  {
    _id: 'c13', tipo: 'emergencia', prioridad: 'alta', estado: 'finalizado',
    paciente: 'p8', especialistaPrincipal: 'e3', equipoQuirurgico: [],
    diagnostico: 'd6', procedimiento: 'pr6', duracionEstimadaMin: 180,
    observaciones: 'TCE severo, hematoma epidural.',
    fechaIngresoEmergencia: '2026-05-18T22:10:00Z', motivoEmergencia: 'Traumatismo craneoencefálico',
    plan: 'pl8', createdAt: '2026-05-18T22:20:00Z',
  },
];

// ─── PLANES QUIRÚRGICOS ───────────────────────────────────────────────────────
export const planes = [
  { _id: 'pl1', fecha: '2026-05-22', horaInicio: '07:00', horaFinEstimada: '11:00', quirofano: 'q1', caso: 'c4' },
  { _id: 'pl2', fecha: '2026-05-22', horaInicio: '08:00', horaFinEstimada: '10:00', quirofano: 'q2', caso: 'c5' },
  { _id: 'pl3', fecha: '2026-05-21', horaInicio: '08:00', horaFinEstimada: '11:30', quirofano: 'q3', caso: 'c6' },
  { _id: 'pl4', fecha: '2026-05-21', horaInicio: '07:30', horaFinEstimada: '10:00', quirofano: 'q2', caso: 'c7' },
  { _id: 'pl5', fecha: '2026-05-15', horaInicio: '09:00', horaFinEstimada: '10:30', quirofano: 'q1', caso: 'c8' },
  { _id: 'pl6', fecha: '2026-05-21', horaInicio: '04:00', horaFinEstimada: '05:00', quirofano: 'q4', caso: 'c11' },
  { _id: 'pl7', fecha: '2026-05-21', horaInicio: '06:30', horaFinEstimada: '10:30', quirofano: 'q4', caso: 'c12' },
  { _id: 'pl8', fecha: '2026-05-18', horaInicio: '23:00', horaFinEstimada: '02:00', quirofano: 'q4', caso: 'c13' },
];

// ─── ADMISIONES ───────────────────────────────────────────────────────────────
export const admisiones = [
  {
    _id: 'a1', caso: 'c6',
    fechaHoraIngreso: '2026-05-21T07:00:00Z', responsable: 'Enf. Rosa Jiménez',
    verificacionDocumentos: { identificacion: true, consentimientoFirmado: true, ordenMedica: true },
    signosVitales: { presionArterial: '130/85', frecuenciaCardiaca: 78, temperatura: 36.5, saturacionOxigeno: 97 },
    checklist: [
      { item: 'Ayuno de 8 horas', cumplido: true },
      { item: 'Área quirúrgica preparada', cumplido: true },
      { item: 'Medicación preoperatoria administrada', cumplido: false },
    ],
    insumosUtilizados: [{ insumo: 'i1', cantidad: 2 }, { insumo: 'i3', cantidad: 5 }],
    observaciones: 'Paciente ansioso, se solicitó valoración de anestesiología.',
  },
  {
    _id: 'a2', caso: 'c11',
    fechaHoraIngreso: '2026-05-21T03:30:00Z', responsable: 'Enf. Pedro Acosta',
    verificacionDocumentos: { identificacion: true, consentimientoFirmado: false, ordenMedica: true },
    signosVitales: { presionArterial: '100/65', frecuenciaCardiaca: 112, temperatura: 38.2, saturacionOxigeno: 95 },
    checklist: [
      { item: 'Vía periférica colocada', cumplido: true },
      { item: 'Exámenes de laboratorio', cumplido: true },
      { item: 'Consentimiento informado', cumplido: false },
    ],
    insumosUtilizados: [{ insumo: 'i1', cantidad: 2 }, { insumo: 'i9', cantidad: 1 }],
    observaciones: 'Emergencia. Familiar firmará consentimiento.',
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function getPacienteById(id) { return pacientes.find(p => p._id === id); }
export function getEspecialistaById(id) { return especialistas.find(e => e._id === id); }
export function getQuirofanoById(id) { return quirofanos.find(q => q._id === id); }
export function getProcedimientoById(id) { return procedimientos.find(p => p._id === id); }
export function getDiagnosticoById(id) { return diagnosticos.find(d => d._id === id); }
export function getInsumoById(id) { return insumos.find(i => i._id === id); }
export function getPlanById(id) { return planes.find(p => p._id === id); }
export function getAdmisionByCaso(casoId) { return admisiones.find(a => a.caso === casoId); }

export function getCasoResuelto(caso) {
  return {
    ...caso,
    pacienteObj: getPacienteById(caso.paciente),
    especialistaObj: getEspecialistaById(caso.especialistaPrincipal),
    equipoObjs: (caso.equipoQuirurgico || []).map(getEspecialistaById).filter(Boolean),
    diagnosticoObj: getDiagnosticoById(caso.diagnostico),
    procedimientoObj: getProcedimientoById(caso.procedimiento),
    planObj: getPlanById(caso.plan),
  };
}

export const estadoConfig = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  aprobada:    { label: 'Aprobada',    color: 'bg-blue-100 text-blue-800 border-blue-200' },
  rechazada:   { label: 'Rechazada',   color: 'bg-red-100 text-red-800 border-red-200' },
  programada:  { label: 'Programada',  color: 'bg-purple-100 text-purple-800 border-purple-200' },
  en_admision: { label: 'En Admisión', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  en_curso:    { label: 'En Curso',    color: 'bg-green-100 text-green-800 border-green-200' },
  finalizado:  { label: 'Finalizado',  color: 'bg-gray-100 text-gray-700 border-gray-200' },
  cancelado:   { label: 'Cancelado',   color: 'bg-red-50 text-red-600 border-red-100' },
};

export const prioridadConfig = {
  alta:  { label: 'Alta',  color: 'bg-red-100 text-red-700' },
  media: { label: 'Media', color: 'bg-yellow-100 text-yellow-700' },
  baja:  { label: 'Baja',  color: 'bg-green-100 text-green-700' },
};
