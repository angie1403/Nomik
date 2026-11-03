import React from 'react';
import { 
  Monitor, 
  Download, 
  Trash2, 
  CheckCircle2, 
  X, 
  Chrome, 
  Apple, 
  Smartphone, 
  Info,
  Maximize2,
  ExternalLink
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstalled: boolean;
  isRealPWA: boolean;
  isDesktopSimulated: boolean;
  onInstall: () => Promise<boolean>;
  onUninstall: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstalled,
  isRealPWA,
  isDesktopSimulated,
  onInstall,
  onUninstall,
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    await onInstall();
    onClose();
  };

  const handleUninstallClick = () => {
    if (confirm('¿Desea desinstalar la aplicación de escritorio y regresar al modo navegador web estándar?')) {
      onUninstall();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl my-6 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Instalación & Modo App de Escritorio (PWA)
              </h3>
              <p className="text-xs text-slate-400">
                IMPRESOS EL DÍA S.A.S. — Sistema de Nómina Decenal
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600">
          
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isInstalled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`p-2.5 rounded-full ${isInstalled ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                {isInstalled ? <CheckCircle2 className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  Estado de Instalación
                </span>
                <strong className="text-sm font-bold block">
                  {isInstalled 
                    ? 'Aplicación Instalada (Modo App de Escritorio Activo)' 
                    : 'Ejecutando en Modo Navegador Web Estándar'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isInstalled 
                    ? 'La plataforma se encuentra en ventana dedicada sin barras de navegador, con soporte offline y acceso directo.'
                    : 'Puede instalarla en Windows, macOS o Chrome/Edge para abrirla como una aplicación de escritorio nativa.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Install / Uninstall */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            {!isInstalled ? (
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Instalar como App de Escritorio / PWA</span>
              </button>
            ) : (
              <button
                onClick={handleUninstallClick}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-300 shadow-xs transition"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Desinstalar / Volver a Modo Web</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cerrar
            </button>
          </div>

          {/* Platform Instructions */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight block">
              Instrucciones por Sistema Operativo & Navegador:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Chrome className="w-4 h-4 text-blue-500" />
                  <span>Chrome / Edge</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Haga clic en el icono de <strong>Instalar</strong> en la barra de direcciones (al lado de la estrella de favoritos) o use el botón superior.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Apple className="w-4 h-4 text-slate-700" />
                  <span>macOS / Safari</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  En Safari: Menú <strong>Archivo &gt; Agregar al Dock</strong> para crear el acceso directo nativo en macOS Sonoma o superior.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Móvil / Tablet</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  En iOS Safari toque <strong>Compartir &gt; Agregar a Inicio</strong>. En Android Chrome seleccione <strong>Instalar Aplicación</strong>.
                </p>
              </div>
            </div>

            {isInstalled && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <strong className="block font-bold">¿Cómo desinstalar completamente del sistema operativo?</strong>
                <p className="mt-0.5 text-amber-800">
                  En Chrome/Edge puede escribir <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">chrome://apps</code>, hacer clic derecho sobre <strong>Nómina ID</strong> y seleccionar <strong>Desinstalar de Chrome</strong>.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
