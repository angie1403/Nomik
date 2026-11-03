import { CalculatedPayrollItem, DecenalPeriod } from '../types/payroll';

export function generateBancolombiaPAB(items: CalculatedPayrollItem[], period: DecenalPeriod): string {
  const nitCompany = '900842195';
  const companyAccount = '03189234110'; // Cuenta corriente principal Impresos El Día S.A.S.
  const dateFormatted = period.endDate.replace(/-/g, '');

  const lines: string[] = [];

  // Control Header Line
  lines.push(`1${nitCompany.padEnd(16, ' ')}IMPRESOS EL DIA SAS${'220'.padEnd(3, ' ')}PAGO NOMINA DECENAL ${dateFormatted}${companyAccount.padEnd(17, ' ')}D`);

  // Detail Lines
  items.forEach(item => {
    const docNumber = item.employee.documentId.padEnd(15, ' ');
    const fullName = item.employee.fullName.slice(0, 30).padEnd(30, ' ');
    const bankAccount = item.employee.bankAccountNumber.replace(/[^0-9]/g, '').padEnd(17, '0');
    const accountType = item.employee.bankAccountType === 'Ahorros' ? 'S' : 'D';
    const amountInCents = Math.round(item.netoPagar * 100).toString().padStart(12, '0');
    const bankCode = item.employee.bankName.includes('Bancolombia') ? '007' : '051';

    lines.push(`6${docNumber}${fullName}${bankCode}${bankAccount}${accountType}${amountInCents}NOMINA_DECENAL_${period.decenioNumber}`);
  });

  // Footer Line
  const totalNet = items.reduce((acc, it) => acc + it.netoPagar, 0);
  const totalCents = Math.round(totalNet * 100).toString().padStart(18, '0');
  const totalRecords = items.length.toString().padStart(6, '0');
  lines.push(`9${totalRecords}${totalCents}`);

  return lines.join('\r\n');
}

export function downloadBankDispersionFile(items: CalculatedPayrollItem[], period: DecenalPeriod): void {
  const content = generateBancolombiaPAB(items, period);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `DISPERSION_BANCOLOMBIA_NOMINA_${period.id.toUpperCase()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadDispersionCSV(items: CalculatedPayrollItem[], period: DecenalPeriod): void {
  const headers = [
    'Documento',
    'Empleado',
    'Cargo',
    'Departamento',
    'Banco',
    'Tipo Cuenta',
    'Numero Cuenta',
    'Valor Neto Pagado',
    'Concepto',
    'Periodo',
  ];

  const rows = items.map(item => [
    `"${item.employee.documentId}"`,
    `"${item.employee.fullName}"`,
    `"${item.employee.position}"`,
    `"${item.employee.department}"`,
    `"${item.employee.bankName}"`,
    `"${item.employee.bankAccountType}"`,
    `"${item.employee.bankAccountNumber}"`,
    item.netoPagar,
    `"Nómina Decenal D${period.decenioNumber}"`,
    `"${period.description}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Dispersion_Bancaria_${period.id}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
