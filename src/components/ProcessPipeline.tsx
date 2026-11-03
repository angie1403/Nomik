import React from 'react';
import { DecenalPeriod, PeriodStatus, UserRole } from '../types/payroll';
import { 
  ClipboardList, 
  CheckCircle2, 
  Calculator, 
  Landmark, 
  FileSpreadsheet, 
  ArrowRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

interface ProcessPipelineProps {
  period: DecenalPeriod;
  currentRole: UserRole;
  onAdvanceStatus: (nextStatus: PeriodStatus) => void;
  onNavigateToTab: (tabId: string) => void;
}

export const ProcessPipeline: React.FC<ProcessPipelineProps> = ({
  period,
  currentRole,
  onAdvanceStatus,
  onNavigateToTab,
}) => {
  const steps: {
    status: PeriodStatus;
    phase: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
    responsible: 'RRHH' | 'Jefaturas' | 'RRHH & Contabilidad' | 'Gerencia & Tesorería' | 'Contabilidad';
    tabTarget: string;
  }[] = [
    {
      status: 'recopilacion_novedades',
      phase: 'FASE 1: TALENTO HUMANO',
      title: 'Recopilación de Novedades',
      desc: 'Registro de días trabajados, horas extras (HED/HEN/RN), ausencias e incapacidades.',
      icon: <ClipboardList className="w-5 h-5" />,
      responsible: 'RRHH',
      tabTarget: 'novedades',
    },
    {
      status: 'validacion_jefaturas',
      phase: 'FASE 2: OPERACIONES',
      title: 'Validación Jefes de Área',
      desc: 'Revisión por Supervisores de Prensa, Pre-prensa, Acabados y Logística.',
      icon: <CheckCircle2 className="w-5 h-5" />,
      responsible: 'Jefaturas',
      tabTarget: 'novedades',
    },
    {
      status: 'calculo_prenomina',
      phase: 'FASE 3: CÁLCULO LEGAL',
      title: 'Prenómina Automatizada',
      desc: 'Liquidación de devengos, deducciones de ley (4% salud/pensión) y retenciones.',
      icon: <Calculator className="w-5 h-5" />,
      responsible: 'RRHH & Contabilidad',
      tabTarget: 'prenomina',
    },
    {
      status: 'aprobacion_gerencia',
      phase: 'FASE 4: AUTORIZACIÓN',
      title: 'Aprobación y Dispersión',
      desc: 'Visto bueno de Gerencia y Dirección de Operaciones para transferencias.',
      icon: <Landmark className="w-5 h-5" />,
      responsible: 'Gerencia & Tesorería',
      tabTarget: 'contabilidad',
    },
    {
      status: 'cerrado_contabilidad',
      phase: 'FASE 5: CONTABILIZACIÓN',
      title: 'Contabilidad, PILA & Volantes',
      desc: 'Asiento contable PUC, planilla PILA y emisión de desprendibles en PDF.',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      responsible: 'Contabilidad',
      tabTarget: 'contabilidad',
    },
  ];

  const statusOrder: PeriodStatus[] = [
    'recopilacion_novedades',
    'validacion_jefaturas',
    'calculo_prenomina',
    'aprobacion_gerencia',
    'dispersion_y_pago',
    'cerrado_contabilidad',
  ];

  const currentIdx = statusOrder.indexOf(period.status);

  const getStepState = (stepStatus: PeriodStatus) => {
    const stepIdx = statusOrder.indexOf(stepStatus);
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            Flujo Operativo de Nómina Decenal (Cada 10 Días)
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Ciclo de Pagos Decenales: {period.description}
          </h2>
        </div>

        {/* Quick action button based on current stage */}
        <div className="flex items-center gap-2">
          {period.status === 'recopilacion_novedades' && (
            <button
              onClick={() => onAdvanceStatus('validacion_jefaturas')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <span>Enviar a Validación de Jefaturas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {period.status === 'validacion_jefaturas' && (
            <button
              onClick={() => onAdvanceStatus('calculo_prenomina')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <span>Aprobar Novedades y Generar Prenómina</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {period.status === 'calculo_prenomina' && (
            <button
              onClick={() => onAdvanceStatus('aprobacion_gerencia')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <span>Presentar Prenómina para Autorización</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {period.status === 'aprobacion_gerencia' && (
            <button
              onClick={() => onAdvanceStatus('cerrado_contabilidad')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <span>Autorizar Dispersión y Contabilizar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {period.status === 'cerrado_contabilidad' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Período Decenal Cerrado y Dispersado
            </span>
          )}
        </div>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((st, i) => {
          const state = getStepState(st.status);
          const isCurrent = state === 'current';
          const isCompleted = state === 'completed';

          return (
            <div
              key={st.status}
              onClick={() => onNavigateToTab(st.tabTarget)}
              className={`group cursor-pointer rounded-xl p-3 border transition relative ${
                isCurrent
                  ? 'bg-gradient-to-b from-blue-50/90 to-cyan-50/50 border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
                  : isCompleted
                  ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                  : 'bg-white border-slate-100 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                  PASO {i + 1}
                </span>
                <span
                  className={`p-1.5 rounded-lg ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {st.icon}
                </span>
              </div>

              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                {st.responsible}
              </div>
              <h4
                className={`text-xs font-bold mt-0.5 leading-tight ${
                  isCurrent ? 'text-blue-950' : 'text-slate-800'
                }`}
              >
                {st.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {st.desc}
              </p>

              {/* Status pill bottom */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] font-semibold">
                  {isCompleted && (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completado
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-blue-600 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span> En Curso
                    </span>
                  )}
                  {!isCompleted && !isCurrent && (
                    <span className="text-slate-400">Pendiente</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-600 transition">
                  Ver detalle →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
