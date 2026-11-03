import React, { useState } from 'react';
import { PayrollParameters } from '../types/payroll';
import { formatCOP } from '../utils/calculations';
import { SlidersHorizontal, X, Save, RotateCcw } from 'lucide-react';

interface ParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: PayrollParameters;
  onSaveParameters: (newParams: PayrollParameters) => void;
}

export const ParametersModal: React.FC<ParametersModalProps> = ({
  isOpen,
  onClose,
  parameters,
  onSaveParameters,
}) => {
  const [formData, setFormData] = useState<PayrollParameters>({ ...parameters });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveParameters(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
        
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold">Parámetros de Nómina y Legislación Colombiana</h3>
              <p className="text-xs text-slate-400">
                Código Sustantivo del Trabajo (CST), Ley 100 y Decretos Salarios Vigentes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Base Salarial & Auxilio */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-tight block">
              Valores Oficiales del Año {formData.year}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Salario Mínimo Mensual Legal Vigente (SMMLV)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formData.smmlv}
                  onChange={(e) => setFormData({ ...formData, smmlv: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">{formatCOP(formData.smmlv)}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Auxilio de Transporte Mensual Legal
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formData.auxilioTransporte}
                  onChange={(e) => setFormData({ ...formData, auxilioTransporte: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">{formatCOP(formData.auxilioTransporte)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Tope para Auxilio de Transporte (en SMMLV)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.limiteSMMLVAuxilio}
                  onChange={(e) => setFormData({ ...formData, limiteSMMLVAuxilio: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
                <span className="text-[10px] text-slate-400">Hasta {formatCOP(formData.smmlv * formData.limiteSMMLVAuxilio)}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Horas Mes Laboral (Base cálculo hora)
                </label>
                <input
                  type="number"
                  value={formData.horasMesLaboral}
                  onChange={(e) => setFormData({ ...formData, horasMesLaboral: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
                <span className="text-[10px] text-slate-400">Estándar 240 horas / mes</span>
              </div>
            </div>
          </div>

          {/* Porcentajes Trabajador */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-tight block mb-2">
              Deducciones Obligatorias Trabajador
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Salud Empleado</label>
                <input
                  type="number"
                  step="0.005"
                  value={formData.saludEmpleadoPct}
                  onChange={(e) => setFormData({ ...formData, saludEmpleadoPct: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono"
                />
                <span className="text-[10px] text-slate-500">{(formData.saludEmpleadoPct * 100).toFixed(1)}%</span>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Pensión Empleado</label>
                <input
                  type="number"
                  step="0.005"
                  value={formData.pensionEmpleadoPct}
                  onChange={(e) => setFormData({ ...formData, pensionEmpleadoPct: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-mono"
                />
                <span className="text-[10px] text-slate-500">{(formData.pensionEmpleadoPct * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Tarifas ARL Imprenta */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-tight block mb-2">
              Tarifas ARL según Actividad Económica (Decreto 1295 de 1994)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-slate-600 text-[10px] mb-1">Clase I (Admin)</label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.arlRates[1]}
                  onChange={(e) => setFormData({
                    ...formData,
                    arlRates: { ...formData.arlRates, 1: Number(e.target.value) }
                  })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
                <span className="text-[9px] text-slate-500">{(formData.arlRates[1] * 100).toFixed(3)}%</span>
              </div>

              <div>
                <label className="block text-slate-600 text-[10px] mb-1">Clase II (Bodega)</label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.arlRates[2]}
                  onChange={(e) => setFormData({
                    ...formData,
                    arlRates: { ...formData.arlRates, 2: Number(e.target.value) }
                  })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
                <span className="text-[9px] text-slate-500">{(formData.arlRates[2] * 100).toFixed(3)}%</span>
              </div>

              <div>
                <label className="block text-slate-600 text-[10px] mb-1">Clase III (Prensa CTP)</label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.arlRates[3]}
                  onChange={(e) => setFormData({
                    ...formData,
                    arlRates: { ...formData.arlRates, 3: Number(e.target.value) }
                  })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
                <span className="text-[9px] text-slate-500">{(formData.arlRates[3] * 100).toFixed(3)}%</span>
              </div>

              <div>
                <label className="block text-slate-600 text-[10px] mb-1">Clase IV (Guillotinas)</label>
                <input
                  type="number"
                  step="0.00001"
                  value={formData.arlRates[4]}
                  onChange={(e) => setFormData({
                    ...formData,
                    arlRates: { ...formData.arlRates, 4: Number(e.target.value) }
                  })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
                <span className="text-[9px] text-slate-500">{(formData.arlRates[4] * 100).toFixed(3)}%</span>
              </div>
            </div>
          </div>

          {/* Exoneración Ley 1607 Toggle */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <input
              type="checkbox"
              id="exoneradoLey1607"
              checked={formData.exoneradoLey1607}
              onChange={(e) => setFormData({ ...formData, exoneradoLey1607: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="exoneradoLey1607" className="text-xs font-medium text-blue-900 cursor-pointer">
              Exoneración de Aportes Patronales a Salud (8.5%), SENA (2%) e ICBF (3%) bajo Art. 114-1 del E.T. (Ley 1607/1819) para trabajadores que devengan menos de 10 SMMLV.
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Parámetros</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
