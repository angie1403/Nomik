import React, { useState, useRef } from 'react';
import { 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Clock, 
  FileText,
  FileCheck
} from 'lucide-react';
import { Employee, DecenalPeriod, NovedadRecord, PayrollParameters, UserRole } from '../types/payroll';
import { 
  exportStateAsJSON, 
  parseAndValidateBackupJSON, 
  clearLocalStorageState,
  PayrollAppState
} from '../utils/storageManager';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastSavedAt: string | null;
  currentRole: UserRole;
  selectedPeriodId: string;
  employees: Employee[];
  periods: DecenalPeriod[];
  novedades: NovedadRecord[];
  parameters: PayrollParameters;
  onSaveManual: () => void;
  onRestoreState: (restoredState: PayrollAppState) => void;
  onResetFactoryData: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  lastSavedAt,
  currentRole,
  selectedPeriodId,
  employees,
  periods,
  novedades,
  parameters,
  onSaveManual,
  onRestoreState,
  onResetFactoryData,
}) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<PayrollAppState | null>(null);
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleManualSave = () => {
    onSaveManual();
    setManualSaveSuccess(true);
    setTimeout(() => setManualSaveSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    exportStateAsJSON({
      currentRole,
      selectedPeriodId,
      employees,
      periods,
      novedades,
      parameters,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseAndValidateBackupJSON(text);
        setImportPreview(parsed);
      } catch (err: any) {
        setImportError(err.message || 'Error al procesar el archivo JSON de copia de seguridad.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!importPreview) return;
    onRestoreState(importPreview);
    setImportPreview(null);
    onClose();
  };

  const handleReset = () => {
    if (confirm('¿Está seguro de restablecer todos los datos a la configuración inicial de fábrica de Impresos El Día S.A.S.? Se perderán los cambios locales no exportados.')) {
      onResetFactoryData();
      onClose();
    }
  };

  const formattedLastSave = lastSavedAt 
    ? new Date(lastSavedAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
    : 'No registrado aún';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-6 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Guardar Avances & Copias de Seguridad (Backup)
              </h3>
              <p className="text-xs text-slate-400">
                Respaldo de información local y exportación para Talento Humano y Contabilidad
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-600 max-h-[75vh] overflow-y-auto">
          
          {/* Status Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Autoguardado Local Activo en Navegador
                </span>
                <span className="text-slate-500 text-[11px]">
                  Último guardado: <strong className="text-slate-700">{formattedLastSave}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={handleManualSave}
              className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                manualSaveSuccess
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {manualSaveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>¡Avances Guardados!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Guardar Avances Ahora</span>
                </>
              )}
            </button>
          </div>

          {/* Section 1: Export Backup (JSON) */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Exportar Copia de Seguridad Completa (.JSON)</span>
                </h4>
                <p className="text-slate-600 text-xs mt-1">
                  Descarga un archivo JSON cifrado localmente con toda la nómina actual: <strong>{employees.length} trabajadores</strong>, <strong>{novedades.length} novedades</strong>, periodos decenales y parámetros legales vigentes.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo de Copia de Seguridad (.JSON)</span>
            </button>
          </div>

          {/* Section 2: Import / Restore Backup (JSON) */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Restaurar o Importar Copia de Seguridad</span>
              </h4>
              <p className="text-slate-600 text-xs mt-1">
                Cargue un archivo previamente exportado para recuperar toda la información en otro equipo o reanudar el trabajo sin perder ningún cálculo.
              </p>
            </div>

            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-300 rounded-lg font-bold text-xs flex items-center gap-2 transition shadow-2xs"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Seleccionar Archivo de Respaldo (.JSON)</span>
            </button>

            {/* Error Message */}
            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{importError}</span>
              </div>
            )}

            {/* Preview of Imported Backup */}
            {importPreview && (
              <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Copia de Seguridad Verificada
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Fecha: {new Date(importPreview.savedAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Trabajadores</span>
                    <strong className="text-slate-800 text-sm font-bold">{importPreview.employees.length}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Novedades</span>
                    <strong className="text-slate-800 text-sm font-bold">{importPreview.novedades.length}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Períodos</span>
                    <strong className="text-slate-800 text-sm font-bold">{importPreview.periods.length}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setImportPreview(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmRestore}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Confirmar y Restaurar Ahora
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Reset Factory Defaults */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-700 block text-xs">
                Restablecer Datos de Fábrica
              </span>
              <span className="text-[11px] text-slate-400">
                Restaura la nómina original inicial de Impresos El Día S.A.S.
              </span>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
