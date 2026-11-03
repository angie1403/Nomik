import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  UserRole, 
  Employee, 
  DecenalPeriod, 
  NovedadRecord, 
  PayrollParameters, 
  CalculatedPayrollItem, 
  PeriodStatus 
} from './types/payroll';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_PERIODS, 
  INITIAL_NOVEDADES, 
  INITIAL_PARAMETERS 
} from './data/initialData';
import { calculateWholePeriodPayroll } from './utils/calculations';
import { 
  saveStateToLocalStorage, 
  loadStateFromLocalStorage, 
  clearLocalStorageState, 
  PayrollAppState 
} from './utils/storageManager';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { DesktopTitleBar } from './components/DesktopTitleBar';
import { ProcessPipeline } from './components/ProcessPipeline';
import { EmployeesModule } from './components/EmployeesModule';
import { NovedadesModule } from './components/NovedadesModule';
import { PayrollSettlementModule } from './components/PayrollSettlementModule';
import { AccountingAndReportsModule } from './components/AccountingAndReportsModule';
import { PayslipModal } from './components/PayslipModal';
import { ParametersModal } from './components/ParametersModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { BackupModal } from './components/BackupModal';
import { 
  Users, 
  ClipboardList, 
  Calculator, 
  Landmark, 
  Workflow, 
  Save,
  Database,
  Monitor,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // PWA & Desktop Simulation Hook
  const {
    isInstallable,
    isInstalled,
    isRealPWA,
    isDesktopSimulated,
    isFullscreen,
    install,
    uninstallApp,
    toggleFullscreen,
  } = usePWAInstall();

  // Load initial state from localStorage if available
  const savedInitialState = useMemo(() => {
    return loadStateFromLocalStorage();
  }, []);

  const [currentRole, setCurrentRole] = useState<UserRole>(
    savedInitialState?.currentRole || 'rrhh'
  );
  const [periods, setPeriods] = useState<DecenalPeriod[]>(
    savedInitialState?.periods || INITIAL_PERIODS
  );
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    savedInitialState?.selectedPeriodId || 'per-2026-03-d2'
  );
  const [employees, setEmployees] = useState<Employee[]>(
    savedInitialState?.employees || INITIAL_EMPLOYEES
  );
  const [novedades, setNovedades] = useState<NovedadRecord[]>(
    savedInitialState?.novedades || INITIAL_NOVEDADES
  );
  const [params, setParams] = useState<PayrollParameters>(
    savedInitialState?.parameters || INITIAL_PARAMETERS
  );

  // Active view tab
  const [activeTab, setActiveTab] = useState<'flujo' | 'empleados' | 'novedades' | 'prenomina' | 'contabilidad'>('prenomina');

  // Modals state
  const [selectedItemForPayslip, setSelectedItemForPayslip] = useState<CalculatedPayrollItem | null>(null);
  const [isParamsOpen, setIsParamsOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Last save timestamp & toast state
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    savedInitialState?.savedAt || null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const success = saveStateToLocalStorage({
        currentRole,
        selectedPeriodId,
        employees,
        periods,
        novedades,
        parameters: params,
      });
      if (success) {
        setLastSavedAt(new Date().toISOString());
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [currentRole, selectedPeriodId, employees, periods, novedades, params]);

  // Explicit manual save handler
  const handleSaveManual = () => {
    const success = saveStateToLocalStorage({
      currentRole,
      selectedPeriodId,
      employees,
      periods,
      novedades,
      parameters: params,
    });
    if (success) {
      const nowIso = new Date().toISOString();
      setLastSavedAt(nowIso);
      showToast('¡Avances guardados exitosamente! La información está respaldada localmente.');
    }
  };

  // Restore imported backup state
  const handleRestoreState = (restoredState: PayrollAppState) => {
    setEmployees(restoredState.employees);
    setPeriods(restoredState.periods);
    setNovedades(restoredState.novedades);
    setParams(restoredState.parameters);
    setSelectedPeriodId(restoredState.selectedPeriodId || 'per-2026-03-d2');
    setCurrentRole(restoredState.currentRole || 'rrhh');
    setLastSavedAt(restoredState.savedAt);
    saveStateToLocalStorage(restoredState);
    showToast(`¡Copia de seguridad restaurada! ${restoredState.employees.length} trabajadores y ${restoredState.novedades.length} novedades cargadas.`);
  };

  // Reset to factory data
  const handleResetFactoryData = () => {
    clearLocalStorageState();
    setEmployees(INITIAL_EMPLOYEES);
    setPeriods(INITIAL_PERIODS);
    setNovedades(INITIAL_NOVEDADES);
    setParams(INITIAL_PARAMETERS);
    setSelectedPeriodId('per-2026-03-d2');
    setCurrentRole('rrhh');
    setLastSavedAt(new Date().toISOString());
    showToast('Datos restablecidos a la configuración inicial de Impresos El Día S.A.S.');
  };

  // Get active period
  const currentPeriod = useMemo(() => {
    return periods.find(p => p.id === selectedPeriodId) || periods[0];
  }, [periods, selectedPeriodId]);

  // Calculate full payroll for selected period
  const calculatedItems = useMemo(() => {
    return calculateWholePeriodPayroll(employees, currentPeriod, novedades, params);
  }, [employees, currentPeriod, novedades, params]);

  // Handle advancing period status
  const handleAdvanceStatus = (nextStatus: PeriodStatus) => {
    setPeriods(prev => prev.map(p => {
      if (p.id === currentPeriod.id) {
        return {
          ...p,
          status: nextStatus,
          approvedAt: nextStatus === 'aprobacion_gerencia' || nextStatus === 'cerrado_contabilidad' ? new Date().toISOString() : p.approvedAt,
          approvedBy: currentRole === 'contabilidad' ? 'Contabilidad y Gerencia' : 'Talento Humano',
        };
      }
      return p;
    }));
  };

  // Employee CRUD handlers
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees(prev => [newEmp, ...prev]);
    showToast(`Trabajador ${newEmp.fullName} registrado y guardado.`);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    showToast(`Datos actualizados de ${updatedEmp.fullName}.`);
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, status: 'inactivo' } : e));
    showToast('Trabajador desactivado en nómina.');
  };

  // Novedad Handlers
  const handleAddNovedad = (newNov: NovedadRecord) => {
    setNovedades(prev => [newNov, ...prev]);
    showToast('Novedad registrada y guardada.');
  };

  const handleDeleteNovedad = (novId: string) => {
    setNovedades(prev => prev.filter(n => n.id !== novId));
    showToast('Novedad eliminada.');
  };

  const handleToggleApproval = (novId: string) => {
    setNovedades(prev => prev.map(n => n.id === novId ? { ...n, approvedByAreaHead: !n.approvedByAreaHead } : n));
  };

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 ${
      isDesktopSimulated ? 'border-4 border-slate-900 shadow-2xl rounded-lg overflow-hidden' : ''
    }`}>
      
      {/* Desktop App Frame Title Bar (Active when Desktop Mode is enabled) */}
      <DesktopTitleBar
        isDesktopSimulated={isDesktopSimulated}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onUninstall={uninstallApp}
        onOpenInstallModal={() => setIsPWAInstallOpen(true)}
      />

      {/* Main Corporate Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onPeriodChange={setSelectedPeriodId}
        onOpenParams={() => setIsParamsOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenInstallModal={() => setIsPWAInstallOpen(true)}
        onSaveManual={handleSaveManual}
        lastSavedAt={lastSavedAt}
        isInstalled={isInstalled}
        isDesktopSimulated={isDesktopSimulated}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Quick Toolbar for Persistence & PWA */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-700">
              Control de Datos y Respaldo:
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Autoguardado permanente en navegador
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveManual}
              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Avances</span>
            </button>

            <button
              onClick={() => setIsBackupOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar / Importar Copia (.JSON)</span>
            </button>

            <button
              onClick={() => setIsPWAInstallOpen(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition ${
                isInstalled
                  ? 'text-cyan-700 bg-cyan-50 border-cyan-300 hover:bg-cyan-100'
                  : 'text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{isInstalled ? 'Modo Escritorio: Instalado' : 'Instalar App Escritorio'}</span>
            </button>
          </div>
        </div>

        {/* Process Pipeline Tracker */}
        <ProcessPipeline
          period={currentPeriod}
          currentRole={currentRole}
          onAdvanceStatus={handleAdvanceStatus}
          onNavigateToTab={(tab) => setActiveTab(tab as any)}
        />

        {/* Tab Navigation Menu */}
        <div className="flex items-center space-x-1 border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('flujo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'flujo'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Workflow className="w-4 h-4 text-cyan-400" />
            <span>Diagrama de Flujo del Proceso</span>
          </button>

          <button
            onClick={() => setActiveTab('empleados')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'empleados'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Trabajadores & Estructura ({employees.length})</span>
            {currentRole === 'rrhh' && (
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-bold">
                Edición
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('novedades')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'novedades'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-amber-400" />
            <span>Novedades & Horas Extras ({novedades.filter(n => n.periodId === currentPeriod.id).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prenomina')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'prenomina'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Liquidación Decenal & Desprendibles</span>
          </button>

          <button
            onClick={() => setActiveTab('contabilidad')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'contabilidad'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-400" />
            <span>Contabilidad, PILA & Dispersión</span>
            {currentRole === 'contabilidad' && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                Gestión
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: FLOW DIAGRAM OVERVIEW */}
        {activeTab === 'flujo' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                    DIAGRAMA DE FLUJO CORPORATIVO
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Proceso de Pago de Nómina Decenal (Cada 10 Días) — Impresos El Día S.A.S.
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modelo operativo auditado bajo ISO 9001, ISO 14001, ISO 45001 y control de artes gráficas ISO 12647.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    Cortes: Día 10, Día 20 y Cierre de Mes (30/31)
                  </span>
                </div>
              </div>

              {/* Graphic Flow Representation */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 p-4">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_z9iy6az9iy6az9iy_c531537c.jpg"
                  alt="Diagrama de Flujo Oficial Proceso de Nómina Decenal Impresos El Día S.A.S."
                  className="w-full h-auto rounded-lg shadow-md object-cover max-h-[460px] mx-auto"
                />
              </div>

              {/* Explanation of the 4 Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-tight flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    1. Gestión RRHH
                  </div>
                  <ul className="text-xs text-emerald-950/80 space-y-1">
                    <li>• Recopilación de días laborados.</li>
                    <li>• Horas extras diurnas/nocturnas.</li>
                    <li>• Incapacidades EPS y ARL.</li>
                    <li>• Validación con supervisores de turno.</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
                  <div className="text-xs font-bold text-blue-800 uppercase tracking-tight flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    2. RRHH y Nómina
                  </div>
                  <ul className="text-xs text-blue-950/80 space-y-1">
                    <li>• Cálculo de salarios básicos decenales.</li>
                    <li>• Auxilio de transporte (&le; 2 SMMLV).</li>
                    <li>• Deducciones de ley (4% salud, 4% pensión).</li>
                    <li>• Generación de Prenómina.</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-tight flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    3. Autorización & Tesorería
                  </div>
                  <ul className="text-xs text-amber-950/80 space-y-1">
                    <li>• Aprobación por Gerencia General.</li>
                    <li>• Archivo plano Bancolombia PAB (.txt).</li>
                    <li>• Transferencia electrónica a cuentas.</li>
                    <li>• Validación de saldos disponibles.</li>
                  </ul>
                </div>

                <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200">
                  <div className="text-xs font-bold text-indigo-800 uppercase tracking-tight flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    4. Contabilidad & Reportes
                  </div>
                  <ul className="text-xs text-indigo-950/80 space-y-1">
                    <li>• Asiento contable PUC 5105 / 7205.</li>
                    <li>• Planilla PILA (ARL, EPS, AFP, CCF).</li>
                    <li>• Informe de costos por departamento y turno.</li>
                    <li>• Desprendibles de pago individuales en PDF.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: EMPLOYEES MODULE */}
        {activeTab === 'empleados' && (
          <EmployeesModule
            employees={employees}
            currentRole={currentRole}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            smmlv={params.smmlv}
          />
        )}

        {/* Tab 3: NOVEDADES MODULE */}
        {activeTab === 'novedades' && (
          <NovedadesModule
            employees={employees}
            period={currentPeriod}
            novedades={novedades}
            currentRole={currentRole}
            onAddNovedad={handleAddNovedad}
            onDeleteNovedad={handleDeleteNovedad}
            onToggleApproval={handleToggleApproval}
            params={params}
          />
        )}

        {/* Tab 4: PAYROLL SETTLEMENT & PAYSLIPS */}
        {activeTab === 'prenomina' && (
          <PayrollSettlementModule
            items={calculatedItems}
            period={currentPeriod}
            currentRole={currentRole}
            onSelectEmployeeForPayslip={setSelectedItemForPayslip}
          />
        )}

        {/* Tab 5: ACCOUNTING, PILA & DISPERSION */}
        {activeTab === 'contabilidad' && (
          <AccountingAndReportsModule
            items={calculatedItems}
            period={currentPeriod}
            currentRole={currentRole}
            onAdvancePeriodStatus={handleAdvanceStatus}
          />
        )}

      </main>

      {/* Individual Payslip Modal with Direct PDF Download & Print */}
      <PayslipModal
        item={selectedItemForPayslip}
        onClose={() => setSelectedItemForPayslip(null)}
      />

      {/* Parameters Configuration Modal */}
      <ParametersModal
        isOpen={isParamsOpen}
        onClose={() => setIsParamsOpen(false)}
        parameters={params}
        onSaveParameters={(newP) => {
          setParams(newP);
          showToast('Parámetros de ley actualizados.');
        }}
      />

      {/* PWA & Desktop App Install / Uninstall Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
        isInstalled={isInstalled}
        isRealPWA={isRealPWA}
        isDesktopSimulated={isDesktopSimulated}
        onInstall={async () => {
          const res = await install();
          if (res) {
            showToast('¡Modo Aplicación de Escritorio activado con éxito!');
          }
          return res;
        }}
        onUninstall={() => {
          uninstallApp();
          showToast('Aplicación desinstalada. Retornando a modo navegador web.');
        }}
      />

      {/* Backup and Data Persistence Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        lastSavedAt={lastSavedAt}
        currentRole={currentRole}
        selectedPeriodId={selectedPeriodId}
        employees={employees}
        periods={periods}
        novedades={novedades}
        parameters={params}
        onSaveManual={handleSaveManual}
        onRestoreState={handleRestoreState}
        onResetFactoryData={handleResetFactoryData}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">IMPRESOS EL DÍA S.A.S.</span>
            <span>•</span>
            <span>Sistema Centralizado de Nómina Decenal</span>
            <span>•</span>
            <span className="font-mono text-cyan-400">Versión 01 / C-LOG-02</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-500">
            <span>Legislación CST Colombia</span>
            <span>•</span>
            <span>Acceso Exclusivo: Talento Humano & Contabilidad</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
