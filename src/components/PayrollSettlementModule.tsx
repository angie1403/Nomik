import React, { useState } from 'react';
import { CalculatedPayrollItem, DecenalPeriod, UserRole } from '../types/payroll';
import { formatCOP } from '../utils/calculations';
import { downloadPayslipPDF, downloadConsolidatedReportPDF } from '../utils/pdfGenerator';
import { 
  Calculator, 
  FileText, 
  Download, 
  Search, 
  Eye, 
  CheckCircle, 
  Building2, 
  Coins, 
  ShieldCheck, 
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PayrollSettlementModuleProps {
  items: CalculatedPayrollItem[];
  period: DecenalPeriod;
  currentRole: UserRole;
  onSelectEmployeeForPayslip: (item: CalculatedPayrollItem) => void;
}

export const PayrollSettlementModule: React.FC<PayrollSettlementModuleProps> = ({
  items,
  period,
  currentRole,
  onSelectEmployeeForPayslip,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee.documentId.includes(searchTerm) ||
      item.employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || item.employee.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Totals calculations
  const totalDevengado = items.reduce((acc, it) => acc + it.totalDevengado, 0);
  const totalDeducciones = items.reduce((acc, it) => acc + it.deducciones.totalDeducciones, 0);
  const totalNeto = items.reduce((acc, it) => acc + it.netoPagar, 0);
  const totalPatronal = items.reduce((acc, it) => acc + it.aportesPatronales.totalAportesPatronales, 0);
  const totalProvisiones = items.reduce((acc, it) => acc + it.provisiones.totalProvisiones, 0);
  const totalCostoEmpresa = items.reduce((acc, it) => acc + it.costoTotalEmpresa, 0);

  const toggleRow = (empId: string) => {
    setExpandedRowId(expandedRowId === empId ? null : empId);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Cards */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Liquidación Decenal de Nómina & Prenómina
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Corte: <strong className="text-slate-800">{period.description}</strong> ({period.nominalDays} días nominales). Motor de cálculo bajo Código Sustantivo del Trabajo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadConsolidatedReportPDF(filteredItems, period)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition border border-slate-300"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Descargar Informe Consolidado PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            Total Devengado Bruto
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatCOP(totalDevengado)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Sueldos decenales + extras + auxilio
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            Deducciones de Ley (4% + 4%)
          </div>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {formatCOP(totalDeducciones)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Salud, Pensión, Libranzas y Embargos
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">
            Neto a Dispersar a Bancos
          </div>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatCOP(totalNeto)}
          </div>
          <div className="text-[10px] text-emerald-700 mt-1">
            Valor líquido a abonar en cuentas
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
            Costo Nómina Total Empresa
          </div>
          <div className="text-xl font-bold text-indigo-900 mt-1">
            {formatCOP(totalCostoEmpresa)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Incluye Aportes Patronales + Provisiones
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por empleado, cédula o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="all">Todos los Departamentos</option>
            <option value="Gerencia y Administración">Gerencia y Administración</option>
            <option value="Comercial y Logística">Comercial y Logística</option>
            <option value="Pre-prensa">Pre-prensa</option>
            <option value="Prensa (Impresión)">Prensa (Impresión)</option>
            <option value="Acabados y Troquelado">Acabados y Troquelado</option>
            <option value="Mantenimiento y SST">Mantenimiento y SST</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Listando <strong className="text-slate-800">{filteredItems.length}</strong> liquidaciones individuales
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase font-bold text-slate-200">
              <tr>
                <th className="py-3 px-3"></th>
                <th className="py-3 px-3">Empleado & Cargo</th>
                <th className="py-3 px-2 text-center">Días</th>
                <th className="py-3 px-3 text-right">Básico Dec.</th>
                <th className="py-3 px-3 text-right">Aux. Transp.</th>
                <th className="py-3 px-3 text-right">Extras & Rec.</th>
                <th className="py-3 px-3 text-right">Devengado</th>
                <th className="py-3 px-3 text-right">Salud (4%)</th>
                <th className="py-3 px-3 text-right">Pensión (4%)</th>
                <th className="py-3 px-3 text-right font-black text-emerald-400">Neto a Pagar</th>
                <th className="py-3 px-3 text-center">Desprendible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredItems.map((it) => {
                const isExpanded = expandedRowId === it.employee.id;

                return (
                  <React.Fragment key={it.employee.id}>
                    <tr className={`hover:bg-slate-50/80 transition ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => toggleRow(it.employee.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition"
                          title="Ver aportes patronales y provisiones"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-slate-900">{it.employee.fullName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>{it.employee.position}</span>
                          <span>•</span>
                          <span className="font-mono">CC {it.employee.documentId}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                        {it.diasLaborados}
                        {it.diasIncapacidadEPS > 0 && (
                          <span className="text-[9px] text-rose-600 block">
                            (-{it.diasIncapacidadEPS}d EPS)
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-800">
                        {formatCOP(it.sueldoBasicoDecenal)}
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {formatCOP(it.auxilioTransporteDecenal)}
                      </td>

                      <td className="py-2.5 px-3 text-right text-amber-700 font-semibold">
                        {it.horasExtras.totalExtrasYRecargos > 0 ? formatCOP(it.horasExtras.totalExtrasYRecargos) : '—'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatCOP(it.totalDevengado)}
                      </td>

                      <td className="py-2.5 px-3 text-right text-rose-600">
                        {formatCOP(it.deducciones.saludEmpleado)}
                      </td>

                      <td className="py-2.5 px-3 text-right text-rose-600">
                        {formatCOP(it.deducciones.pensionEmpleado)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 bg-emerald-50/40 text-xs">
                        {formatCOP(it.netoPagar)}
                      </td>

                      <td className="py-2.5 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectEmployeeForPayslip(it)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1 transition"
                            title="Ver e imprimir desprendible individual"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver</span>
                          </button>

                          <button
                            onClick={() => downloadPayslipPDF(it)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                            title="Descargar PDF inmediato"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row with Patronal Details & CST Provisions */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 text-[10px] font-sans border-t border-slate-200">
                        <td colSpan={11} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Box 1: Surcharges breakdown */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1 text-[10px]">
                                Desglose Horas Extras y Recargos (Art. 168 CST)
                              </span>
                              <div className="space-y-1 text-slate-600">
                                <div className="flex justify-between">
                                  <span>HED Diurna (1.25):</span>
                                  <strong className="font-mono">{formatCOP(it.horasExtras.hedValor)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>HEN Nocturna (1.75):</span>
                                  <strong className="font-mono">{formatCOP(it.horasExtras.henValor)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>HEDDF Festiva (2.00):</span>
                                  <strong className="font-mono">{formatCOP(it.horasExtras.heddfValor)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>HENDF Festiva Noc. (2.50):</span>
                                  <strong className="font-mono">{formatCOP(it.horasExtras.hendfValor)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Recargo Nocturno (35%):</span>
                                  <strong className="font-mono">{formatCOP(it.horasExtras.rnValor)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Recargo Festivo Ord. (75%):</span>
                                  <strong className="font-mono">{formatCOP(it.horasExtras.rdoValor)}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Box 2: Deductions & Retentions */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1 text-[10px]">
                                Otras Deducciones del Empleado
                              </span>
                              <div className="space-y-1 text-slate-600">
                                <div className="flex justify-between">
                                  <span>IBC Base Cotización:</span>
                                  <strong className="font-mono text-slate-900">{formatCOP(it.ibc)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Salud (4%):</span>
                                  <strong className="font-mono text-rose-600">{formatCOP(it.deducciones.saludEmpleado)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pensión (4%):</span>
                                  <strong className="font-mono text-rose-600">{formatCOP(it.deducciones.pensionEmpleado)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Embargos Judiciales:</span>
                                  <strong className="font-mono text-rose-600">{formatCOP(it.deducciones.embargos)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Libranzas / Cooperativa:</span>
                                  <strong className="font-mono text-rose-600">{formatCOP(it.deducciones.libranzas)}</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-slate-900">
                                  <span>Total Deducido:</span>
                                  <span className="font-mono text-rose-700">{formatCOP(it.deducciones.totalDeducciones)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Box 3: Patronal Social Security & Provisions */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1 text-[10px]">
                                Aportes Patronales & Provisiones (Costo Empresa)
                              </span>
                              <div className="space-y-1 text-slate-600">
                                <div className="flex justify-between">
                                  <span>ARL Imprenta (Clase {it.employee.arlRiskLevel}):</span>
                                  <strong className="font-mono">{formatCOP(it.aportesPatronales.arlPatronal)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pensión Patronal (12%):</span>
                                  <strong className="font-mono">{formatCOP(it.aportesPatronales.pensionPatronal)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Caja Compensación (4%):</span>
                                  <strong className="font-mono">{formatCOP(it.aportesPatronales.cajaCompensacion)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Cesantías (8.33%):</span>
                                  <strong className="font-mono">{formatCOP(it.provisiones.cesantias)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Intereses Cesantías (1%):</span>
                                  <strong className="font-mono">{formatCOP(it.provisiones.interesesCesantias)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Prima Legal (8.33%):</span>
                                  <strong className="font-mono">{formatCOP(it.provisiones.primaServicios)}</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Vacaciones (4.17%):</span>
                                  <strong className="font-mono">{formatCOP(it.provisiones.vacaciones)}</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-1 font-bold text-indigo-900">
                                  <span>Costo Total Trabajador:</span>
                                  <span className="font-mono">{formatCOP(it.costoTotalEmpresa)}</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
