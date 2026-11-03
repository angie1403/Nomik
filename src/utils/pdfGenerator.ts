import { jsPDF } from 'jspdf';
import { CalculatedPayrollItem, DecenalPeriod } from '../types/payroll';
import { formatCOP } from './calculations';

export function generatePayslipPDF(item: CalculatedPayrollItem): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });

  const emp = item.employee;
  const per = item.period;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 216, 26, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('IMPRESOS EL DÍA S.A.S.', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('NIT: 900.842.195-3 | Artes Gráficas e Imprenta Industrial | Código C-LOG-02', 14, 18);
  doc.text(`Período Decenal: ${per.description}`, 14, 23);

  doc.setTextColor(56, 189, 248); // sky-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('VOLANTE OFICIAL DE PAGO', 202, 14, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Corte Decenal: ${per.startDate} al ${per.endDate}`, 202, 20, { align: 'right' });

  // Employee details section
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(14, 30, 188, 30, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 30, 188, 30, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);

  // Line 1
  doc.text('EMPLEADO:', 18, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(`${emp.fullName.toUpperCase()}`, 44, 36);

  doc.setFont('helvetica', 'bold');
  doc.text('IDENTIFICACIÓN:', 125, 36);
  doc.setFont('helvetica', 'normal');
  doc.text(`${emp.documentType} ${emp.documentId}`, 155, 36);

  // Line 2
  doc.setFont('helvetica', 'bold');
  doc.text('CARGO:', 18, 43);
  doc.setFont('helvetica', 'normal');
  doc.text(`${emp.position}`, 44, 43);

  doc.setFont('helvetica', 'bold');
  doc.text('DEPARTAMENTO:', 125, 43);
  doc.setFont('helvetica', 'normal');
  doc.text(`${emp.department}`, 155, 43);

  // Line 3
  doc.setFont('helvetica', 'bold');
  doc.text('SALARIO MENSUAL:', 18, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatCOP(emp.baseSalary)}`, 48, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('DÍAS LIQUIDADOS:', 95, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`${item.diasLaborados} días (${per.nominalDays} nom.)`, 128, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('RIESGO ARL:', 160, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Clase ${emp.arlRiskLevel}`, 182, 50);

  // Line 4
  doc.setFont('helvetica', 'bold');
  doc.text('TURNO ASIGNADO:', 18, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(`${emp.shift}`, 48, 56);

  doc.setFont('helvetica', 'bold');
  doc.text('BANCO / CUENTA:', 125, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(`${emp.bankName} (${emp.bankAccountType} ${emp.bankAccountNumber})`, 155, 56);

  // Tables Title
  let y = 67;

  // DEVENGADOS TABLE (Left)
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 92, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CONCEPTO DEVENGADO', 18, y + 5);
  doc.text('VALOR COP', 102, y + 5, { align: 'right' });

  // DEDUCCIONES TABLE (Right)
  doc.setFillColor(30, 41, 59);
  doc.rect(110, y, 92, 7, 'F');
  doc.text('CONCEPTO DEDUCCIÓN', 114, y + 5);
  doc.text('VALOR COP', 198, y + 5, { align: 'right' });

  y += 7;
  const startYTables = y;

  // Rows Devengados
  const devengadosRows: [string, number][] = [
    [`Sueldo Básico (${item.diasLaborados} días decenales)`, item.sueldoBasicoDecenal],
    ...(item.auxilioTransporteDecenal > 0 ? [['Auxilio de Transporte Legal', item.auxilioTransporteDecenal] as [string, number]] : []),
    ...(item.horasExtras.hedValor > 0 ? [['H. Extras Diurnas (HED 25%)', item.horasExtras.hedValor] as [string, number]] : []),
    ...(item.horasExtras.henValor > 0 ? [['H. Extras Nocturnas (HEN 75%)', item.horasExtras.henValor] as [string, number]] : []),
    ...(item.horasExtras.heddfValor > 0 ? [['H. Extras Festivas (HEDDF 100%)', item.horasExtras.heddfValor] as [string, number]] : []),
    ...(item.horasExtras.hendfValor > 0 ? [['H. Extras Fest. Noc. (HENDF 150%)', item.horasExtras.hendfValor] as [string, number]] : []),
    ...(item.horasExtras.rnValor > 0 ? [['Recargos Nocturnos Ordinarios (35%)', item.horasExtras.rnValor] as [string, number]] : []),
    ...(item.horasExtras.rdoValor > 0 ? [['Recargo Festivo / Dominical (75%)', item.horasExtras.rdoValor] as [string, number]] : []),
    ...(item.bonificaciones > 0 ? [['Bonificación / Rendimiento', item.bonificaciones] as [string, number]] : []),
    ...(item.pagoIncapacidades > 0 ? [['Incapacidades (EPS/ARL)', item.pagoIncapacidades] as [string, number]] : []),
    ...(item.pagoLicencias > 0 ? [['Licencia Remunerada', item.pagoLicencias] as [string, number]] : []),
  ];

  // Rows Deducciones
  const deduccionesRows: [string, number][] = [
    ['Aporte Salud Trabajador (4%)', item.deducciones.saludEmpleado],
    ['Aporte Pensión Trabajador (4%)', item.deducciones.pensionEmpleado],
    ...(item.deducciones.libranzas > 0 ? [['Libranza / Cooperativa', item.deducciones.libranzas] as [string, number]] : []),
    ...(item.deducciones.embargos > 0 ? [['Embargo Judicial', item.deducciones.embargos] as [string, number]] : []),
    ...(item.deducciones.otrasDeducciones > 0 ? [['Otras Retenciones', item.deducciones.otrasDeducciones] as [string, number]] : []),
  ];

  // Draw Devengados lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  let curYDev = startYTables + 5;
  devengadosRows.forEach(([conc, val], i) => {
    if (i % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, curYDev - 3.8, 92, 5.5, 'F');
    }
    doc.text(conc, 18, curYDev);
    doc.text(formatCOP(val), 102, curYDev, { align: 'right' });
    curYDev += 6;
  });

  // Draw Deducciones lines
  let curYDeduc = startYTables + 5;
  deduccionesRows.forEach(([conc, val], i) => {
    if (i % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(110, curYDeduc - 3.8, 92, 5.5, 'F');
    }
    doc.text(conc, 114, curYDeduc);
    doc.text(formatCOP(val), 198, curYDeduc, { align: 'right' });
    curYDeduc += 6;
  });

  const maxRowsY = Math.max(curYDev, curYDeduc, startYTables + 48);

  // Subtotals
  doc.setFillColor(226, 232, 240);
  doc.rect(14, maxRowsY, 92, 6.5, 'F');
  doc.rect(110, maxRowsY, 92, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL DEVENGADO:', 18, maxRowsY + 4.5);
  doc.text(formatCOP(item.totalDevengado), 102, maxRowsY + 4.5, { align: 'right' });

  doc.text('TOTAL DEDUCCIONES:', 114, maxRowsY + 4.5);
  doc.text(formatCOP(item.deducciones.totalDeducciones), 198, maxRowsY + 4.5, { align: 'right' });

  // Big NET HIGHLIGHT BOX
  const netY = maxRowsY + 11;
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.rect(14, netY, 188, 14, 'F');
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.rect(14, netY, 188, 14, 'S');

  doc.setTextColor(30, 27, 75);
  doc.setFontSize(10);
  doc.text('NETO A DISPERSAR EN CUENTA BANCARIA:', 20, netY + 9);

  doc.setFontSize(14);
  doc.setTextColor(67, 56, 202);
  doc.text(formatCOP(item.netoPagar), 196, netY + 9.5, { align: 'right' });

  // Legal and social security summary (Patronal footnote)
  const footY = netY + 20;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, footY, 188, 20, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, footY, 188, 20, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('INFORMACIÓN DE SEGURIDAD SOCIAL Y PRESTACIONES:', 18, footY + 5);
  doc.text(`EPS: ${emp.eps} | AFP: ${emp.pensionFund} | Cesantías: ${emp.severanceFund} | CCF: ${emp.compensationBox}`, 18, footY + 10);
  doc.text(`IBC Decenal Calculado: ${formatCOP(item.ibc)} | Aportes Patronales ARL/Pensión/CCF contabilizados por la empresa.`, 18, footY + 15);

  // Legal Acceptance & Signature box
  const signY = footY + 25;
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Certifico haber recibido a entera satisfacción de IMPRESOS EL DÍA S.A.S. la suma neta indicada en el presente desprendible, correspondiente al decenio laborado.',
    14,
    signY
  );

  const signLineY = signY + 20;
  doc.setDrawColor(148, 163, 184);
  doc.line(20, signLineY, 90, signLineY);
  doc.line(125, signLineY, 195, signLineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('FIRMA DEL TRABAJADOR', 55, signLineY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`C.C. ${emp.documentId}`, 55, signLineY + 9, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text('TALENTO HUMANO Y CONTABILIDAD', 160, signLineY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('IMPRESOS EL DÍA S.A.S. - Sistema Nómina', 160, signLineY + 9, { align: 'center' });

  return doc;
}

export function downloadPayslipPDF(item: CalculatedPayrollItem): void {
  const doc = generatePayslipPDF(item);
  const cleanName = item.employee.fullName.replace(/\s+/g, '_').toLowerCase();
  doc.save(`Desprendible_${item.period.id}_${cleanName}.pdf`);
}

export function downloadConsolidatedReportPDF(
  items: CalculatedPayrollItem[],
  period: DecenalPeriod
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter',
  });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 279, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('IMPRESOS EL DÍA S.A.S. - INFORME CONSOLIDADO DE NÓMINA DECENAL', 14, 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Período: ${period.description} | Generado para Contabilidad y Gerencia de Operaciones`, 14, 16);

  // Totals Summary Box
  const totalDev = items.reduce((acc, it) => acc + it.totalDevengado, 0);
  const totalDed = items.reduce((acc, it) => acc + it.deducciones.totalDeducciones, 0);
  const totalNeto = items.reduce((acc, it) => acc + it.netoPagar, 0);
  const totalPatronal = items.reduce((acc, it) => acc + it.aportesPatronales.totalAportesPatronales, 0);
  const totalProv = items.reduce((acc, it) => acc + it.provisiones.totalProvisiones, 0);
  const totalCosto = items.reduce((acc, it) => acc + it.costoTotalEmpresa, 0);

  doc.setFillColor(248, 250, 252);
  doc.rect(14, 26, 251, 16, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 26, 251, 16, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DEVENGADO:', 20, 32);
  doc.text('DEDUCCIONES EMPLEADOS:', 65, 32);
  doc.text('NETO A DISPERSAR:', 115, 32);
  doc.text('SEGURIDAD SOCIAL PATRONAL:', 160, 32);
  doc.text('PROVISIONES PRESTACIONES:', 210, 32);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCOP(totalDev), 20, 38);
  doc.text(formatCOP(totalDed), 65, 38);
  doc.setTextColor(16, 185, 129); // green
  doc.text(formatCOP(totalNeto), 115, 38);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCOP(totalPatronal), 160, 38);
  doc.text(formatCOP(totalProv), 210, 38);

  // Table header
  let y = 48;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 251, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('EMPLEADO', 16, y + 5);
  doc.text('CARGO / DPTO', 68, y + 5);
  doc.text('DÍAS', 120, y + 5);
  doc.text('BÁSICO DEC.', 132, y + 5);
  doc.text('EXTRAS/REC.', 155, y + 5);
  doc.text('TOTAL DEV.', 178, y + 5);
  doc.text('DEDUCCIONES', 202, y + 5);
  doc.text('NETO PAGAR', 228, y + 5);
  doc.text('COSTO TOTAL', 250, y + 5);

  y += 7;
  items.slice(0, 24).forEach((it, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 251, 5.5, 'F');
    }
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(it.employee.fullName.slice(0, 28), 16, y + 4);
    doc.text(`${it.employee.position.slice(0, 24)} (${it.employee.department.slice(0, 8)})`, 68, y + 4);
    doc.text(it.diasLaborados.toString(), 122, y + 4);
    doc.text(formatCOP(it.sueldoBasicoDecenal), 132, y + 4);
    doc.text(formatCOP(it.horasExtras.totalExtrasYRecargos), 155, y + 4);
    doc.text(formatCOP(it.totalDevengado), 178, y + 4);
    doc.text(formatCOP(it.deducciones.totalDeducciones), 202, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCOP(it.netoPagar), 228, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCOP(it.costoTotalEmpresa), 250, y + 4);
    y += 5.5;
  });

  // Footer Note
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`* Total Nómina Consolidada Empresa: ${formatCOP(totalCosto)} (Incluye aportes a seguridad social, ARL y provisiones de ley)`, 14, 200);

  doc.save(`Informe_Consolidado_Nomina_${period.id}.pdf`);
}
