import React from 'react';
import { CalculatedPayrollItem } from '../types/payroll';
import { formatCOP } from '../utils/calculations';
import { downloadPayslipPDF } from '../utils/pdfGenerator';
import { Printer, Download, X, Building2, CheckCircle2 } from 'lucide-react';

interface PayslipModalProps {
  item: CalculatedPayrollItem | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const emp = item.employee;
  const per = item.period;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl my-6 overflow-hidden print:border-none print:shadow-none print:m-0 print:max-w-full">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Comprobante Oficial de Pago Decenal</span>
            <span className="text-xs text-slate-400">| {emp.fullName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadPayslipPDF(item)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Payslip Voucher */}
        <div className="p-8 text-slate-800 space-y-6 text-xs print:p-4 print:text-black">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-2xl tracking-tighter">
                ID
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  IMPRESOS EL DÍA S.A.S.
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  NIT: 900.842.195-3 • Código C-LOG-02 • Artes Gráficas e Imprenta Industrial
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Medellín, Colombia • Normas ISO 9001 / 14001 / 45001 / 12647
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 block mb-1">
                COMPROBANTE DE PAGO DECENAL
              </span>
              <span className="font-bold text-slate-900 block text-xs">
                {per.description}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Corte: {per.startDate} al {per.endDate}
              </span>
            </div>
          </div>

          {/* Employee Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Trabajador</span>
              <strong className="text-slate-900 font-bold block">{emp.fullName}</strong>
              <span className="text-slate-500 font-mono">{emp.documentType} {emp.documentId}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Cargo & Área</span>
              <strong className="text-slate-900 block">{emp.position}</strong>
              <span className="text-slate-500">{emp.department}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Salario & Días</span>
              <span className="font-mono font-semibold">{formatCOP(emp.baseSalary)} / mes</span>
              <span className="text-slate-500 block font-medium">
                {item.diasLaborados} días liquidados ({per.nominalDays} nom.)
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Dispersión Bancaria</span>
              <strong className="text-slate-900 block">{emp.bankName}</strong>
              <span className="text-slate-500 font-mono text-[10px]">
                {emp.bankAccountType} {emp.bankAccountNumber}
              </span>
            </div>
          </div>

          {/* Dual Tables: Devengados vs Deducciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Devengados Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-800 text-white px-3 py-2 font-bold text-[11px] flex justify-between">
                <span>CONCEPTOS DEVENGADOS</span>
                <span>VALOR COP</span>
              </div>
              <div className="divide-y divide-slate-100 p-2 space-y-1">
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Sueldo Básico Decenal ({item.diasLaborados} días)</span>
                  <span className="font-mono font-semibold">{formatCOP(item.sueldoBasicoDecenal)}</span>
                </div>

                {item.auxilioTransporteDecenal > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Auxilio de Transporte Legal</span>
                    <span className="font-mono font-semibold">{formatCOP(item.auxilioTransporteDecenal)}</span>
                  </div>
                )}

                {item.horasExtras.hedValor > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Horas Extras Diurnas (HED 25%)</span>
                    <span className="font-mono font-semibold">{formatCOP(item.horasExtras.hedValor)}</span>
                  </div>
                )}

                {item.horasExtras.henValor > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Horas Extras Nocturnas (HEN 75%)</span>
                    <span className="font-mono font-semibold">{formatCOP(item.horasExtras.henValor)}</span>
                  </div>
                )}

                {item.horasExtras.heddfValor > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Horas Extras Festivas (HEDDF 100%)</span>
                    <span className="font-mono font-semibold">{formatCOP(item.horasExtras.heddfValor)}</span>
                  </div>
                )}

                {item.horasExtras.hendfValor > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Horas Extras Fest. Noc. (HENDF 150%)</span>
                    <span className="font-mono font-semibold">{formatCOP(item.horasExtras.hendfValor)}</span>
                  </div>
                )}

                {item.horasExtras.rnValor > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Recargo Nocturno Ordinario (RN 35%)</span>
                    <span className="font-mono font-semibold">{formatCOP(item.horasExtras.rnValor)}</span>
                  </div>
                )}

                {item.horasExtras.rdoValor > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Recargo Festivo Ordinario (RDO 75%)</span>
                    <span className="font-mono font-semibold">{formatCOP(item.horasExtras.rdoValor)}</span>
                  </div>
                )}

                {item.bonificaciones > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Bonificación Calidad / Cero Mermas</span>
                    <span className="font-mono font-semibold text-emerald-600">{formatCOP(item.bonificaciones)}</span>
                  </div>
                )}

                {item.pagoIncapacidades > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Incapacidades Médicas (EPS/ARL)</span>
                    <span className="font-mono font-semibold">{formatCOP(item.pagoIncapacidades)}</span>
                  </div>
                )}

                {item.pagoLicencias > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Licencia Remunerada</span>
                    <span className="font-mono font-semibold">{formatCOP(item.pagoLicencias)}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-100 border-t border-slate-200 px-3 py-2 font-bold flex justify-between text-slate-900">
                <span>TOTAL DEVENGADO:</span>
                <span className="font-mono text-sm">{formatCOP(item.totalDevengado)}</span>
              </div>
            </div>

            {/* Deducciones Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-slate-800 text-white px-3 py-2 font-bold text-[11px] flex justify-between">
                  <span>DEDUCCIONES DE LEY Y OTRAS</span>
                  <span>VALOR COP</span>
                </div>
                <div className="divide-y divide-slate-100 p-2 space-y-1">
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Aporte Salud Trabajador (4%)</span>
                    <span className="font-mono font-semibold text-rose-600">{formatCOP(item.deducciones.saludEmpleado)}</span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Aporte Pensión Trabajador (4%)</span>
                    <span className="font-mono font-semibold text-rose-600">{formatCOP(item.deducciones.pensionEmpleado)}</span>
                  </div>

                  {item.deducciones.libranzas > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Deducción Libranza / Cooperativa</span>
                      <span className="font-mono font-semibold text-rose-600">{formatCOP(item.deducciones.libranzas)}</span>
                    </div>
                  )}

                  {item.deducciones.embargos > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Embargo Judicial de Alimentos/Civil</span>
                      <span className="font-mono font-semibold text-rose-600">{formatCOP(item.deducciones.embargos)}</span>
                    </div>
                  )}

                  {item.deducciones.otrasDeducciones > 0 && (
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Otras Deducciones</span>
                      <span className="font-mono font-semibold text-rose-600">{formatCOP(item.deducciones.otrasDeducciones)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-100 border-t border-slate-200 px-3 py-2 font-bold flex justify-between text-slate-900">
                <span>TOTAL DEDUCCIONES:</span>
                <span className="font-mono text-sm text-rose-700">{formatCOP(item.deducciones.totalDeducciones)}</span>
              </div>
            </div>

          </div>

          {/* NET HIGHLIGHT BOX */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-xl flex items-center justify-between shadow-md print:bg-slate-900">
            <div>
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
                VALOR NETO A DISPERSAR EN CUENTA BANCARIA
              </span>
              <p className="text-xs text-slate-300 mt-0.5">
                Abono en {emp.bankName} • Cuenta {emp.bankAccountType} No. {emp.bankAccountNumber}
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black font-mono tracking-tight text-white block">
                {formatCOP(item.netoPagar)}
              </span>
              <span className="text-[10px] text-cyan-400 font-medium">Moneda Legal Colombiana (COP)</span>
            </div>
          </div>

          {/* Footnote on Security & Social Security */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-500">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>EPS: <strong className="text-slate-800">{emp.eps}</strong></span>
              <span>AFP: <strong className="text-slate-800">{emp.pensionFund}</strong></span>
              <span>Cesantías: <strong className="text-slate-800">{emp.severanceFund}</strong></span>
              <span>Caja de Compensación: <strong className="text-slate-800">{emp.compensationBox}</strong></span>
              <span>ARL Riesgo: <strong className="text-slate-800">Clase {emp.arlRiskLevel}</strong></span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-2 gap-12 text-center text-[10px]">
            <div>
              <div className="border-t border-slate-400 pt-2 w-4/5 mx-auto font-bold text-slate-900">
                FIRMA DEL TRABAJADOR
              </div>
              <div className="text-slate-500 font-mono">
                C.C. {emp.documentId}
              </div>
            </div>

            <div>
              <div className="border-t border-slate-400 pt-2 w-4/5 mx-auto font-bold text-slate-900">
                TALENTO HUMANO Y CONTABILIDAD
              </div>
              <div className="text-slate-500">
                IMPRESOS EL DÍA S.A.S.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
