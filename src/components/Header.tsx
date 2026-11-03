import React from 'react';
import { UserRole, DecenalPeriod } from '../types/payroll';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Calculator, 
  Calendar, 
  SlidersHorizontal,
  Save,
  Database,
  Monitor,
  Download,
  Trash2
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  periods: DecenalPeriod[];
  selectedPeriodId: string;
  onPeriodChange: (periodId: string) => void;
  onOpenParams: () => void;
  onOpenBackup: () => void;
  onOpenInstallModal: () => void;
  onSaveManual: () => void;
  lastSavedAt: string | null;
  isInstalled: boolean;
  isDesktopSimulated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  periods,
  selectedPeriodId,
  onPeriodChange,
  onOpenParams,
  onOpenBackup,
  onOpenInstallModal,
  onSaveManual,
  lastSavedAt,
  isInstalled,
  isDesktopSimulated,
}) => {
  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);

  const formatShortTime = (isoString: string | null) => {
    if (!isoString) return 'Activo';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Activo';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Corporate Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <span className="font-black text-xl tracking-tighter text-white">ID</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  IMPRESOS EL DÍA <span className="text-cyan-400 text-sm font-semibold">S.A.S.</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Artes Gráficas
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Nómina Automatizada Decenal</span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-400">NIT 900.842.195-3</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-emerald-400">ISO 9001 / 14001 / 45001 / 12647</span>
              </p>
            </div>
          </div>

          {/* Center Actions: Period, Save, Backup, Install */}
          <div className="hidden lg:flex items-center space-x-2">
            
            {/* Period Selector */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Ciclo Decenal</span>
                <select
                  value={selectedPeriodId}
                  onChange={(e) => onPeriodChange(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                >
                  {periods.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      Decenio {p.decenioNumber} ({p.startDate.slice(5)} al {p.endDate.slice(5)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guardar Avances Button */}
            <button
              onClick={onSaveManual}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/50 hover:bg-emerald-900/70 rounded-lg border border-emerald-800/70 transition shadow-2xs"
              title="Guardar avances actuales en almacenamiento local"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardar Avances</span>
            </button>

            {/* Copia de Seguridad Button */}
            <button
              onClick={onOpenBackup}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition"
              title="Exportar copia de seguridad JSON o restaurar respaldo"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Backup</span>
            </button>

            {/* PWA / Desktop App Install or Uninstall Button */}
            <button
              onClick={onOpenInstallModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isInstalled
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800 hover:bg-cyan-900/70'
                  : 'bg-blue-600/90 text-white border-blue-500 hover:bg-blue-600 shadow-sm'
              }`}
              title={isInstalled ? 'Gestionar o Desinstalar App de Escritorio' : 'Instalar como App de Escritorio o PWA'}
            >
              {isInstalled ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>App Instalada</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar App</span>
                </>
              )}
            </button>

            {/* Parámetros de Ley Button */}
            <button
              onClick={onOpenParams}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Configurar Parámetros de Nómina (SMMLV, ARL, Recargos)"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Role Switcher (Restricted to RRHH & Contabilidad) */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => onRoleChange('rrhh')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentRole === 'rrhh'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Talento Humano</span>
              </button>

              <button
                onClick={() => onRoleChange('contabilidad')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  currentRole === 'contabilidad'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Contabilidad</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-bar showing active status and quick save info */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 px-4 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Sesión: <strong className="text-white">{currentRole === 'rrhh' ? 'Talento Humano' : 'Contabilidad y Tesorería'}</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">Uso restringido interno</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Save indicator */}
            <div 
              onClick={onOpenBackup} 
              className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition"
              title="Haga clic para ver copias de seguridad"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Guardado local: <span className="text-slate-300 font-mono">{formatShortTime(lastSavedAt)}</span></span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-300">
                Estado: <span className="text-emerald-400 font-medium capitalize">{selectedPeriod?.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
