import React, { useState } from 'react';
import { Employee, DecenalPeriod, NovedadRecord, NovedadType, UserRole, PayrollParameters } from '../types/payroll';
import { formatCOP } from '../utils/calculations';
import { 
  ClipboardCheck, 
  PlusCircle, 
  Clock, 
  HeartPulse, 
  Calendar, 
  DollarSign, 
  ShieldAlert, 
  Trash2, 
  Check, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';

interface NovedadesModuleProps {
  employees: Employee[];
  period: DecenalPeriod;
  novedades: NovedadRecord[];
  currentRole: UserRole;
  onAddNovedad: (nov: NovedadRecord) => void;
  onDeleteNovedad: (novId: string) => void;
  onToggleApproval: (novId: string) => void;
  params: PayrollParameters;
}

export const NovedadesModule: React.FC<NovedadesModuleProps> = ({
  employees,
  period,
  novedades,
  currentRole,
  onAddNovedad,
  onDeleteNovedad,
  onToggleApproval,
  params,
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New novelty form state
  const [empId, setEmpId] = useState(employees[0]?.id || '');
  const [type, setType] = useState<NovedadType>('horas_extras');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [daysAffected, setDaysAffected] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);

  // Overtime buckets
  const [hed, setHed] = useState<number>(0);
  const [hen, setHen] = useState<number>(0);
  const [heddf, setHeddf] = useState<number>(0);
  const [hendf, setHendf] = useState<number>(0);
  const [rn, setRn] = useState<number>(0);
  const [rdo, setRdo] = useState<number>(0);

  const selectedEmp = employees.find(e => e.id === empId);

  // Calculate live preview of overtime value
  const hourlyRate = selectedEmp ? (selectedEmp.baseSalary / params.horasMesLaboral) : 0;
  const previewHed = Math.round(hourlyRate * 1.25 * hed);
  const previewHen = Math.round(hourlyRate * 1.75 * hen);
  const previewHeddf = Math.round(hourlyRate * 2.00 * heddf);
  const previewHendf = Math.round(hourlyRate * 2.50 * hendf);
  const previewRn = Math.round(hourlyRate * 0.35 * rn);
  const previewRdo = Math.round(hourlyRate * 0.75 * rdo);
  const totalPreviewExtras = previewHed + previewHen + previewHeddf + previewHendf + previewRn + previewRdo;

  const currentPeriodNovs = novedades.filter(n => n.periodId === period.id);
  const filteredNovs = currentPeriodNovs.filter(n => {
    if (selectedTypeFilter === 'all') return true;
    return n.type === selectedTypeFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId || !description) return;

    const newNov: NovedadRecord = {
      id: `nov-${Date.now()}`,
      employeeId: empId,
      periodId: period.id,
      date: new Date().toISOString().split('T')[0],
      type,
      description,
      notes: notes || `Registrado por Talento Humano`,
      approvedByAreaHead: true,
      daysAffected: ['incapacidad_eps', 'incapacidad_arl', 'licencia_remunerada', 'licencia_no_remunerada'].includes(type) ? daysAffected : undefined,
      amount: ['bonificacion', 'deduccion_embargo', 'deduccion_libranza'].includes(type) ? amount : undefined,
      overtime: type === 'horas_extras' ? {
        hedHours: Number(hed) || 0,
        henHours: Number(hen) || 0,
        heddfHours: Number(heddf) || 0,
        hendfHours: Number(hendf) || 0,
        rnHours: Number(rn) || 0,
        rdoHours: Number(rdo) || 0,
      } : undefined,
    };

    onAddNovedad(newNov);
    setIsModalOpen(false);

    // Reset fields
    setDescription('');
    setNotes('');
    setHed(0);
    setHen(0);
    setHeddf(0);
    setHendf(0);
    setRn(0);
    setRdo(0);
    setAmount(0);
    setDaysAffected(1);
  };

  const getTypeName = (t: NovedadType) => {
    switch (t) {
      case 'horas_extras': return 'Horas Extras & Recargos';
      case 'incapacidad_eps': return 'Incapacidad EPS (General)';
      case 'incapacidad_arl': return 'Incapacidad ARL (Laboral)';
      case 'licencia_remunerada': return 'Licencia Remunerada';
      case 'licencia_no_remunerada': return 'Licencia No Remunerada';
      case 'bonificacion': return 'Bonificación Operativa';
      case 'deduccion_embargo': return 'Embargo Judicial';
      case 'deduccion_libranza': return 'Libranza / Cooperativa';
      default: return t;
    }
  };

  const getTypeBadgeClass = (t: NovedadType) => {
    switch (t) {
      case 'horas_extras': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'incapacidad_eps': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'incapacidad_arl': return 'bg-red-50 text-red-800 border-red-200';
      case 'bonificacion': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'deduccion_embargo': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'deduccion_libranza': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Módulo de Captura de Novedades Decenales
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Período: <strong className="text-slate-800">{period.description}</strong>. Registre horas suplementarias, turnos rotativos, incapacidades EPS/ARL y deducciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentRole === 'rrhh' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Novedad</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Modo Contabilidad: Visualización y Aprobación
            </span>
          )}
        </div>
      </div>

      {/* Filter and stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Filtrar por Concepto:</span>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Todas las novedades ({currentPeriodNovs.length})</option>
            <option value="horas_extras">Horas Extras y Recargos</option>
            <option value="incapacidad_eps">Incapacidades EPS</option>
            <option value="incapacidad_arl">Incapacidades ARL</option>
            <option value="bonificacion">Bonificaciones</option>
            <option value="deduccion_embargo">Embargos</option>
            <option value="deduccion_libranza">Libranzas</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Total Novedades: <strong className="text-slate-800">{currentPeriodNovs.length}</strong></span>
          <span>•</span>
          <span>Aprobadas por Jefaturas: <strong className="text-emerald-600">{currentPeriodNovs.filter(n => n.approvedByAreaHead).length}</strong></span>
        </div>
      </div>

      {/* Novedades Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Fecha & Empleado</th>
                <th className="py-3.5 px-3">Cargo & Turno</th>
                <th className="py-3.5 px-3">Tipo de Novedad</th>
                <th className="py-3.5 px-3">Detalle / Horas / Días</th>
                <th className="py-3.5 px-3">Impacto / Valor Aprox.</th>
                <th className="py-3.5 px-3">Validación Jefatura</th>
                <th className="py-3.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNovs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay novedades registradas para este filtro en el decenio actual.
                  </td>
                </tr>
              ) : (
                filteredNovs.map((nov) => {
                  const emp = employees.find(e => e.id === nov.employeeId);
                  if (!emp) return null;

                  const vho = emp.baseSalary / params.horasMesLaboral;
                  let detailText = '';
                  let impactValue = 0;

                  if (nov.type === 'horas_extras' && nov.overtime) {
                    const parts: string[] = [];
                    if (nov.overtime.hedHours) parts.push(`HED (25%): ${nov.overtime.hedHours}h`);
                    if (nov.overtime.henHours) parts.push(`HEN (75%): ${nov.overtime.henHours}h`);
                    if (nov.overtime.heddfHours) parts.push(`HEDDF (100%): ${nov.overtime.heddfHours}h`);
                    if (nov.overtime.hendfHours) parts.push(`HENDF (150%): ${nov.overtime.hendfHours}h`);
                    if (nov.overtime.rnHours) parts.push(`Rec. Nocturno: ${nov.overtime.rnHours}h`);
                    if (nov.overtime.rdoHours) parts.push(`Rec. Festivo: ${nov.overtime.rdoHours}h`);
                    detailText = parts.join(' | ');

                    impactValue = Math.round(
                      (nov.overtime.hedHours * 1.25 * vho) +
                      (nov.overtime.henHours * 1.75 * vho) +
                      (nov.overtime.heddfHours * 2.00 * vho) +
                      (nov.overtime.hendfHours * 2.50 * vho) +
                      (nov.overtime.rnHours * 0.35 * vho) +
                      (nov.overtime.rdoHours * 0.75 * vho)
                    );
                  } else if (['incapacidad_eps', 'incapacidad_arl', 'licencia_no_remunerada', 'licencia_remunerada'].includes(nov.type)) {
                    detailText = `${nov.daysAffected || 0} día(s) en decenio`;
                    impactValue = Math.round(((emp.baseSalary / 30) * (nov.daysAffected || 0)));
                  } else {
                    detailText = nov.description;
                    impactValue = nov.amount || 0;
                  }

                  return (
                    <tr key={nov.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{emp.fullName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="font-mono">{emp.documentType} {emp.documentId}</span>
                          <span>•</span>
                          <span>{nov.date}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{emp.position}</div>
                        <div className="text-[10px] text-slate-400">{emp.shift.split('(')[0]}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTypeBadgeClass(nov.type)}`}>
                          {getTypeName(nov.type)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{detailText}</div>
                        {nov.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">{nov.notes}</div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className={`font-semibold ${
                          ['bonificacion', 'horas_extras'].includes(nov.type)
                            ? 'text-emerald-600'
                            : ['deduccion_embargo', 'deduccion_libranza'].includes(nov.type)
                            ? 'text-rose-600'
                            : 'text-slate-800'
                        }`}>
                          {['deduccion_embargo', 'deduccion_libranza'].includes(nov.type) ? '-' : '+'}
                          {formatCOP(impactValue)}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => onToggleApproval(nov.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition border ${
                            nov.approvedByAreaHead
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Haga clic para alternar aprobación de supervisión de área"
                        >
                          {nov.approvedByAreaHead ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Validado Jefatura</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Pendiente Validación</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {currentRole === 'rrhh' ? (
                          <button
                            onClick={() => {
                              if (confirm('¿Eliminar este registro de novedad?')) {
                                onDeleteNovedad(nov.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Eliminar novedad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Novedad Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Registrar Novedad Decenal</h3>
                <p className="text-xs text-slate-400">
                  Período: {period.description}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Employee Selection */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Seleccionar Trabajador
                </label>
                <select
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} — {e.position} ({e.department}) - Salario: {formatCOP(e.baseSalary)}
                    </option>
                  ))}
                </select>
                {selectedEmp && (
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span>Turno: <strong>{selectedEmp.shift}</strong></span>
                    <span>•</span>
                    <span>Valor Hora Ordinaria: <strong>{formatCOP(Math.round(hourlyRate))}</strong></span>
                  </div>
                )}
              </div>

              {/* Novedad Type */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tipo de Novedad
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NovedadType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                >
                  <option value="horas_extras">Horas Extras y Recargos Turnos (HED, HEN, RN, RDO)</option>
                  <option value="incapacidad_eps">Incapacidad Médica EPS (Enfermedad General - 66.67%)</option>
                  <option value="incapacidad_arl">Incapacidad Laboral ARL (Accidente de Trabajo - 100%)</option>
                  <option value="licencia_remunerada">Licencia Remunerada (Luto, Paternidad, Permiso)</option>
                  <option value="licencia_no_remunerada">Licencia No Remunerada (Descuento de Días)</option>
                  <option value="bonificacion">Bonificación Extraordinaria de Calidad / Cero Mermas</option>
                  <option value="deduccion_embargo">Embargo Judicial (Alimentos o Juzgado Civil)</option>
                  <option value="deduccion_libranza">Deducción de Libranza / Cooperativa / Fondo</option>
                </select>
              </div>

              {/* Overtime Fields if type === 'horas_extras' */}
              {type === 'horas_extras' && (
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-xs">
                      Distribución de Horas Extras y Recargos (Art. 168 CST)
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      Impacto estimado: +{formatCOP(totalPreviewExtras)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        HED (Diurna 25%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={hed}
                        onChange={(e) => setHed(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-500">Val: {formatCOP(previewHed)}</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        HEN (Nocturna 75%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={hen}
                        onChange={(e) => setHen(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-500">Val: {formatCOP(previewHen)}</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        HEDDF (Festiva Diurna 100%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={heddf}
                        onChange={(e) => setHeddf(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-500">Val: {formatCOP(previewHeddf)}</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        HENDF (Festiva Noc. 150%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={hendf}
                        onChange={(e) => setHendf(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-500">Val: {formatCOP(previewHendf)}</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Rec. Nocturno RN (35%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={rn}
                        onChange={(e) => setRn(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-500">Val: {formatCOP(previewRn)}</span>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        Rec. Dominical RDO (75%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={rdo}
                        onChange={(e) => setRdo(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                      />
                      <span className="text-[10px] text-slate-500">Val: {formatCOP(previewRdo)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Incapacity / Leave days */}
              {['incapacidad_eps', 'incapacidad_arl', 'licencia_remunerada', 'licencia_no_remunerada'].includes(type) && (
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Días Afectados dentro del Decenio (Máx 10 días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={daysAffected}
                    onChange={(e) => setDaysAffected(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {type === 'incapacidad_eps' && 'La incapacidad EPS se liquidará al 66.67% garantizando que no sea inferior al salario mínimo diario legal.'}
                    {type === 'incapacidad_arl' && 'La incapacidad de origen laboral ARL se liquidará al 100% de la remuneración habitual.'}
                    {type === 'licencia_no_remunerada' && 'Los días no laborados serán descontados del salario básico decenal y del auxilio de transporte.'}
                  </p>
                </div>
              )}

              {/* Monies amount for bonuses / garnishments / deductions */}
              {['bonificacion', 'deduccion_embargo', 'deduccion_libranza'].includes(type) && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Valor en Pesos (COP)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold"
                    placeholder="Ej. 150000"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Motivo / Descripción de la Novedad
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  placeholder="Ej. Tiraje urgente de empaques farmacéuticos en máquina Heidelberg XL 106"
                />
              </div>

              {/* Notes & Authorization */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Soporte / Autorización de Jefatura de Área
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  placeholder="Ej. Autorizado por Supervisor de Prensa / Certificado EPS #SUR-89210"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  Guardar Novedad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
