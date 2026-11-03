import React, { useState } from 'react';
import { CalculatedPayrollItem, DecenalPeriod, UserRole, AccountingEntry } from '../types/payroll';
import { formatCOP, generatePUCAccountingEntries } from '../utils/calculations';
import { downloadBankDispersionFile, downloadDispersionCSV } from '../utils/bankFileGenerator';
import { downloadConsolidatedReportPDF } from '../utils/pdfGenerator';
import { 
  Building2, 
  FileSpreadsheet, 
  Landmark, 
  Download, 
  CheckCircle2, 
  Layers, 
  PieChart, 
  ArrowDownUp, 
  Printer, 
  ShieldCheck,
  FileCheck2,
  Table
} from 'lucide-react';

interface AccountingAndReportsModuleProps {
  items: CalculatedPayrollItem[];
  period: DecenalPeriod;
  currentRole: UserRole;
  onAdvancePeriodStatus: (status: any) => void;
}

export const AccountingAndReportsModule: React.FC<AccountingAndReportsModuleProps> = ({
  items,
  period,
  currentRole,
  onAdvancePeriodStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'asiento' | 'departamentos' | 'turnos' | 'pila' | 'dispersion'>('dispersion');

  const accountingEntries = generatePUCAccountingEntries(items);
  const totalDebits = accountingEntries.reduce((acc, e) => acc + e.debit, 0);
  const totalCredits = accountingEntries.reduce((acc, e) => acc + e.credit, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 5;

  // Breakdown by Department
  const deptMap: { [key: string]: { devengado: number; patronal: number; provisiones: number; total: number; count: number } } = {};
  items.forEach(it => {
    const dept = it.employee.department;
    if (!deptMap[dept]) {
      deptMap[dept] = { devengado: 0, patronal: 0, provisiones: 0, total: 0, count: 0 };
    }
    deptMap[dept].devengado += it.totalDevengado;
    deptMap[dept].patronal += it.aportesPatronales.totalAportesPatronales;
    deptMap[dept].provisiones += it.provisiones.totalProvisiones;
    deptMap[dept].total += it.costoTotalEmpresa;
    deptMap[dept].count += 1;
  });

  // Breakdown by Shift
  const shiftMap: { [key: string]: { devengado: number; extras: number; neto: number; total: number; count: number } } = {};
  items.forEach(it => {
    const shift = it.employee.shift;
    if (!shiftMap[shift]) {
      shiftMap[shift] = { devengado: 0, extras: 0, neto: 0, total: 0, count: 0 };
    }
    shiftMap[shift].devengado += it.totalDevengado;
    shiftMap[shift].extras += it.horasExtras.totalExtrasYRecargos;
    shiftMap[shift].neto += it.netoPagar;
    shiftMap[shift].total += it.costoTotalEmpresa;
    shiftMap[shift].count += 1;
  });

  // PILA Breakdown
  const totalSaludTrabajador = items.reduce((acc, it) => acc + it.deducciones.saludEmpleado, 0);
  const totalSaludPatronal = items.reduce((acc, it) => acc + it.aportesPatronales.saludPatronal, 0);
  const totalPensionTrabajador = items.reduce((acc, it) => acc + it.deducciones.pensionEmpleado, 0);
  const totalPensionPatronal = items.reduce((acc, it) => acc + it.aportesPatronales.pensionPatronal, 0);
  const totalARL = items.reduce((acc, it) => acc + it.aportesPatronales.arlPatronal, 0);
  const totalCCF = items.reduce((acc, it) => acc + it.aportesPatronales.cajaCompensacion, 0);
  const totalSENA = items.reduce((acc, it) => acc + it.aportesPatronales.sena, 0);
  const totalICBF = items.reduce((acc, it) => acc + it.aportesPatronales.icbf, 0);

  const totalPILA = totalSaludTrabajador + totalSaludPatronal + totalPensionTrabajador + totalPensionPatronal + totalARL + totalCCF + totalSENA + totalICBF;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Contabilidad, Dispersión Bancaria y Seguridad Social (PILA)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Período: <strong className="text-slate-800">{period.description}</strong>. Generación de archivos para Bancolombia, asiento PUC e informes de costos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadBankDispersionFile(items, period)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Archivo Bancolombia PAB (.txt)</span>
          </button>

          <button
            onClick={() => downloadDispersionCSV(items, period)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition border border-slate-300"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar CSV Tesorería</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 bg-white p-1 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('dispersion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'dispersion' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Dispersión Bancaria (Bancolombia / ACH)</span>
        </button>

        <button
          onClick={() => setActiveTab('asiento')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'asiento' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Comprobante Contable PUC (5105 / 7205)</span>
        </button>

        <button
          onClick={() => setActiveTab('departamentos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'departamentos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Costos por Departamento</span>
        </button>

        <button
          onClick={() => setActiveTab('turnos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'turnos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Costos por Turno Rotativo</span>
        </button>

        <button
          onClick={() => setActiveTab('pila')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'pila' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Planilla PILA (Seguridad Social)</span>
        </button>
      </div>

      {/* TAB CONTENT: DISPERSIÓN BANCARIA */}
      {activeTab === 'dispersion' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">
                Dispersión Automática de Fondos a Cuentas de Empleados
              </span>
              <h4 className="text-base font-bold text-emerald-950 mt-0.5">
                Total a Transferir: {formatCOP(items.reduce((acc, it) => acc + it.netoPagar, 0))}
              </h4>
              <p className="text-xs text-emerald-800/80 mt-1">
                Cuenta de Origen: <strong>031-892341-10 (Bancolombia Corriente Impresos El Día S.A.S.)</strong> • Registros: {items.length} beneficiarios.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadBankDispersionFile(items, period)}
                className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Generar Archivo Plano PAB</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Listado de Dispersión por Trabajador
              </span>
              <span className="text-xs text-slate-500">
                Verificado con datos bancarios registrados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Beneficiario</th>
                    <th className="py-2.5 px-3">Documento</th>
                    <th className="py-2.5 px-3">Entidad Bancaria</th>
                    <th className="py-2.5 px-3">Tipo Cuenta</th>
                    <th className="py-2.5 px-3">Número de Cuenta</th>
                    <th className="py-2.5 px-3 text-right">Valor Neto Transferir</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {items.map(it => (
                    <tr key={it.employee.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                        {it.employee.fullName}
                      </td>
                      <td className="py-2.5 px-3">
                        {it.employee.documentType} {it.employee.documentId}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-800">
                        {it.employee.bankName}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {it.employee.bankAccountType}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        {it.employee.bankAccountNumber}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 text-xs">
                        {formatCOP(it.netoPagar)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Listo para transferir
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ASIENTO CONTABLE PUC */}
      {activeTab === 'asiento' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-tight">
                Plan Único de Cuentas (PUC) - Legislación Comercial y Tributaria Colombiana
              </span>
              <h4 className="text-base font-bold mt-0.5">
                Comprobante de Diario: Nómina y Prestaciones Decenales
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Separación obligatoria de Mano de Obra Directa / Costos de Producción (Cuenta 7205) y Gastos Administrativos (Cuenta 5105).
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isBalanced ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'
              }`}>
                {isBalanced ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Asiento Cuadrado (Débito = Crédito)
                  </>
                ) : (
                  'Descuadre Contable'
                )}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Código Cuenta</th>
                    <th className="py-3 px-3">Denominación de la Cuenta</th>
                    <th className="py-3 px-3">Centro de Costo</th>
                    <th className="py-3 px-3 text-right">Débito (COP)</th>
                    <th className="py-3 px-3 text-right">Crédito (COP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {accountingEntries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-4 font-bold text-slate-900">
                        {entry.accountCode}
                      </td>
                      <td className="py-2 px-3 font-sans font-medium text-slate-800">
                        {entry.accountName}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-500">
                        {entry.costCenter}
                      </td>
                      <td className="py-2 px-3 text-right text-blue-700 font-semibold">
                        {entry.debit > 0 ? formatCOP(entry.debit) : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-purple-700 font-semibold">
                        {entry.credit > 0 ? formatCOP(entry.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-mono font-bold text-xs text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-sans text-right uppercase">
                      Sumas Iguales:
                    </td>
                    <td className="py-3 px-3 text-right text-blue-900">
                      {formatCOP(totalDebits)}
                    </td>
                    <td className="py-3 px-3 text-right text-purple-900">
                      {formatCOP(totalCredits)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COSTOS POR DEPARTAMENTO */}
      {activeTab === 'departamentos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Consolidado de Costos de Nómina por Departamento
              </h4>
              <p className="text-xs text-slate-500">
                Desglose para análisis financiero y contable en centros de costos de Impresos El Día S.A.S.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Departamento / Centro de Costos</th>
                  <th className="py-3 px-3 text-center">No. Personas</th>
                  <th className="py-3 px-3 text-right">Total Devengado</th>
                  <th className="py-3 px-3 text-right">Aportes Patronales</th>
                  <th className="py-3 px-3 text-right">Provisiones de Ley</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-900">Costo Total Nómina</th>
                  <th className="py-3 px-3 text-right">% del Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {Object.entries(deptMap).map(([dept, data]) => {
                  const totalCompany = items.reduce((acc, it) => acc + it.costoTotalEmpresa, 0);
                  const pct = ((data.total / totalCompany) * 100).toFixed(1);

                  return (
                    <tr key={dept} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">
                        {dept}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                          {data.count}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {formatCOP(data.devengado)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {formatCOP(data.patronal)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {formatCOP(data.provisiones)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 text-xs">
                        {formatCOP(data.total)}
                      </td>
                      <td className="py-3 px-3 text-right font-sans font-semibold text-blue-600">
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COSTOS POR TURNO ROTATIVO */}
      {activeTab === 'turnos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">
              Análisis de Costos por Turno de Trabajo (Planta Industrial & Administrativo)
            </h4>
            <p className="text-xs text-slate-500">
              Control de horas extras y recargos nocturnos derivados de los 3 turnos rotativos de producción.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Turno</th>
                  <th className="py-3 px-3 text-center">Personal</th>
                  <th className="py-3 px-3 text-right">Devengado Ordinario</th>
                  <th className="py-3 px-3 text-right">Extras & Recargos Turno</th>
                  <th className="py-3 px-3 text-right">Neto Pagado</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-900">Costo Empresa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {Object.entries(shiftMap).map(([shift, data]) => (
                  <tr key={shift} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {shift}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                        {data.count}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatCOP(data.devengado - data.extras)}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-700 font-bold">
                      {formatCOP(data.extras)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-700">
                      {formatCOP(data.neto)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 text-xs">
                      {formatCOP(data.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PLANILLA PILA */}
      {activeTab === 'pila' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Resumen de Liquidación Aportes a Seguridad Social y Parafiscales (PILA)
              </h4>
              <p className="text-xs text-slate-500">
                Aportes correspondientes al decenio para consolidar con la planilla mensual PILA (Aportes en Línea / SOI / Simple).
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase font-bold block">Total PILA Decenal</span>
              <span className="text-lg font-black text-blue-700">{formatCOP(totalPILA)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Box 1: Salud */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
                Aportes a Salud (EPS)
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Aporte Trabajadores (4%):</span>
                  <span className="font-mono font-semibold">{formatCOP(totalSaludTrabajador)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Aporte Patronal (Exonerado Art. 114-1 E.T.):</span>
                  <span className="font-mono font-semibold text-emerald-700">{formatCOP(totalSaludPatronal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span>Subtotal Salud:</span>
                  <span className="font-mono">{formatCOP(totalSaludTrabajador + totalSaludPatronal)}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Pensión */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
                Aportes a Pensión (AFP & Colpensiones)
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Aporte Trabajadores (4%):</span>
                  <span className="font-mono font-semibold">{formatCOP(totalPensionTrabajador)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Aporte Patronal (12%):</span>
                  <span className="font-mono font-semibold">{formatCOP(totalPensionPatronal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span>Subtotal Pensión (16%):</span>
                  <span className="font-mono">{formatCOP(totalPensionTrabajador + totalPensionPatronal)}</span>
                </div>
              </div>
            </div>

            {/* Box 3: ARL & Parafiscales */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
                ARL & Parafiscales (100% Patronal)
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">ARL Riesgo Imprenta (I, III, IV):</span>
                  <span className="font-mono font-semibold">{formatCOP(totalARL)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Caja de Compensación (4% CCF):</span>
                  <span className="font-mono font-semibold">{formatCOP(totalCCF)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">SENA (2%) & ICBF (3%):</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    {formatCOP(totalSENA + totalICBF)} (Exonerado)
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                  <span>Subtotal ARL & Parafiscales:</span>
                  <span className="font-mono">{formatCOP(totalARL + totalCCF + totalSENA + totalICBF)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
