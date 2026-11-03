import React from 'react';
import { Minus, Square, X, Monitor, ShieldCheck, Download, Trash2, Maximize2, Minimize2 } from 'lucide-react';

interface DesktopTitleBarProps {
  isDesktopSimulated: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onUninstall: () => void;
  onOpenInstallModal: () => void;
}

export const DesktopTitleBar: React.FC<DesktopTitleBarProps> = ({
  isDesktopSimulated,
  isFullscreen,
  onToggleFullscreen,
  onUninstall,
  onOpenInstallModal,
}) => {
  if (!isDesktopSimulated) return null;

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-slate-300 px-3 py-1.5 flex items-center justify-between text-xs select-none sticky top-0 z-50">
      {/* Left: Window identity */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 mr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 hover:opacity-80 cursor-pointer" title="Cerrar / Desinstalar Modo Escritorio" onClick={onUninstall} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 hover:opacity-80 cursor-pointer" title="Minimizar ventana" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 hover:opacity-80 cursor-pointer" title="Pantalla completa" onClick={onToggleFullscreen} />
        </div>

        <div className="w-4 h-4 rounded bg-cyan-500 flex items-center justify-center font-black text-[9px] text-white">
          ID
        </div>
        <span className="font-semibold text-slate-200">
          IMPRESOS EL DÍA S.A.S. — Sistema de Nómina Decenal (App de Escritorio)
        </span>
        <span className="bg-cyan-950 text-cyan-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-cyan-800">
          Modo Standalone / PWA
        </span>
      </div>

      {/* Right: Controls & Uninstall shortcut */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenInstallModal}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 transition"
        >
          <Monitor className="w-3 h-3 text-cyan-400" />
          <span>Opciones de Instalación</span>
        </button>

        <button
          onClick={onUninstall}
          className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition"
          title="Desinstalar app de escritorio y volver a modo navegador web"
        >
          <Trash2 className="w-3 h-3" />
          <span>Desinstalar App</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        <button
          onClick={onToggleFullscreen}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
          title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onUninstall}
          className="p-1 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 rounded"
          title="Cerrar ventana / Salir de App"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
