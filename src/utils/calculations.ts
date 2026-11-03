import { Employee, DecenalPeriod, PayrollParameters, NovedadRecord, CalculatedPayrollItem, AccountingEntry } from '../types/payroll';

export function calculateDecenalPayrollItem(
  employee: Employee,
  period: DecenalPeriod,
  novedades: NovedadRecord[],
  params: PayrollParameters
): CalculatedPayrollItem {
  const nominalDays = period.nominalDays;
  
  // Filter employee novedades for this period
  const empNovs = novedades.filter(n => n.employeeId === employee.id && n.periodId === period.id);

  // Analyze days affected by medical incapacities and leaves
  let diasIncapacidadEPS = 0;
  let diasIncapacidadARL = 0;
  let diasLicenciaNoRemunerada = 0;
  let diasLicenciaRemunerada = 0;
  let embargos = 0;
  let libranzas = 0;
  let otrasDeducciones = 0;
  let bonificaciones = 0;

  // Overtime buckets
  let hedHours = 0;
  let henHours = 0;
  let heddfHours = 0;
  let hendfHours = 0;
  let rnHours = 0;
  let rdoHours = 0;

  empNovs.forEach(nov => {
    switch (nov.type) {
      case 'incapacidad_eps':
        diasIncapacidadEPS += nov.daysAffected || 0;
        break;
      case 'incapacidad_arl':
        diasIncapacidadARL += nov.daysAffected || 0;
        break;
      case 'licencia_no_remunerada':
        diasLicenciaNoRemunerada += nov.daysAffected || 0;
        break;
      case 'licencia_remunerada':
        diasLicenciaRemunerada += nov.daysAffected || 0;
        break;
      case 'deduccion_embargo':
        embargos += nov.amount || 0;
        break;
      case 'deduccion_libranza':
        libranzas += nov.amount || 0;
        break;
      case 'bonificacion':
        bonificaciones += nov.amount || 0;
        break;
      case 'horas_extras':
        if (nov.overtime) {
          hedHours += nov.overtime.hedHours || 0;
          henHours += nov.overtime.henHours || 0;
          heddfHours += nov.overtime.heddfHours || 0;
          hendfHours += nov.overtime.hendfHours || 0;
          rnHours += nov.overtime.rnHours || 0;
          rdoHours += nov.overtime.rdoHours || 0;
        }
        break;
      case 'ajuste_dias':
        // manual override
        break;
    }
  });

  // Effective days worked
  const nonWorkedDays = diasIncapacidadEPS + diasIncapacidadARL + diasLicenciaNoRemunerada;
  const diasLaborados = Math.max(0, nominalDays - nonWorkedDays);

  // Valor día ordinario y valor hora ordinaria
  const valorDiaOrdinario = employee.baseSalary / 30;
  const valorHoraOrdinaria = employee.baseSalary / params.horasMesLaboral;

  // 1. Sueldo Básico Decenal
  const sueldoBasicoDecenal = Math.round(valorDiaOrdinario * diasLaborados);

  // 2. Auxilio de Transporte
  const qualifiesForTransport = employee.hasTransportAllowance && (employee.baseSalary <= (params.limiteSMMLVAuxilio * params.smmlv));
  const auxilioDia = params.auxilioTransporte / 30;
  const auxilioTransporteDecenal = qualifiesForTransport ? Math.round(auxilioDia * diasLaborados) : 0;

  // 3. Horas Extras y Recargos (Art. 168 y subsiguientes del CST)
  const hedValor = Math.round(valorHoraOrdinaria * 1.25 * hedHours);
  const henValor = Math.round(valorHoraOrdinaria * 1.75 * henHours);
  const heddfValor = Math.round(valorHoraOrdinaria * 2.00 * heddfHours);
  const hendfValor = Math.round(valorHoraOrdinaria * 2.50 * hendfHours);
  const rnValor = Math.round(valorHoraOrdinaria * 0.35 * rnHours);
  const rdoValor = Math.round(valorHoraOrdinaria * 0.75 * rdoHours);
  const totalExtrasYRecargos = hedValor + henValor + heddfValor + hendfValor + rnValor + rdoValor;

  // 4. Incapacidades y Licencias
  // EPS: 66.67% of salary, no less than minimum daily wage
  const valorDiaMinimo = params.smmlv / 30;
  const valorDiaIncapacidadEPS = Math.max(valorDiaMinimo, valorDiaOrdinario * (2 / 3));
  const pagoIncapacidadEPS = Math.round(valorDiaIncapacidadEPS * diasIncapacidadEPS);
  
  // ARL: 100% paid by ARL
  const pagoIncapacidadARL = Math.round(valorDiaOrdinario * diasIncapacidadARL);
  const pagoIncapacidades = pagoIncapacidadEPS + pagoIncapacidadARL;

  // Licencias remuneradas
  const pagoLicencias = Math.round(valorDiaOrdinario * diasLicenciaRemunerada);

  // Total Devengado
  const totalDevengado = sueldoBasicoDecenal + 
    auxilioTransporteDecenal + 
    totalExtrasYRecargos + 
    bonificaciones + 
    pagoIncapacidades + 
    pagoLicencias;

  // 5. IBC (Ingreso Base de Cotización)
  // Auxilio de transporte no es factor de IBC
  const ibcCalculado = sueldoBasicoDecenal + totalExtrasYRecargos + bonificaciones + pagoLicencias + pagoIncapacidadARL;
  const ibcMinimoDecenal = Math.round((params.smmlv / 30) * Math.max(1, diasLaborados + diasLicenciaRemunerada));
  const ibc = Math.max(ibcMinimoDecenal, ibcCalculado);

  // 6. Deducciones Trabajador
  const saludEmpleado = Math.round(ibc * params.saludEmpleadoPct);
  const pensionEmpleado = Math.round(ibc * params.pensionEmpleadoPct);
  const totalDeducciones = saludEmpleado + pensionEmpleado + embargos + libranzas + otrasDeducciones;

  // 7. Neto a Pagar
  const netoPagar = Math.max(0, totalDevengado - totalDeducciones);

  // 8. Aportes Patronales (Seguridad Social Empresa & Parafiscales)
  // Ley 1607/1819 art. 114-1: Exonerado de salud patronal (8.5%), SENA (2%) e ICBF (3%) si gana menos de 10 SMMLV
  const isExonerated = params.exoneradoLey1607 && (employee.baseSalary < (10 * params.smmlv));
  const saludPatronal = isExonerated ? 0 : Math.round(ibc * params.saludPatronalPct);
  const pensionPatronal = Math.round(ibc * params.pensionPatronalPct);
  
  // ARL rate according to graphic arts printing risks
  const arlRate = params.arlRates[employee.arlRiskLevel] || 0.02436;
  const arlPatronal = Math.round(ibc * arlRate);
  
  const cajaCompensacion = Math.round(ibc * params.ccfPct);
  const sena = isExonerated ? 0 : Math.round(ibc * params.senaPct);
  const icbf = isExonerated ? 0 : Math.round(ibc * params.icbfPct);
  const totalAportesPatronales = saludPatronal + pensionPatronal + arlPatronal + cajaCompensacion + sena + icbf;

  // 9. Provisiones de Prestaciones Sociales (CST)
  // Cesantías y prima incluyen auxilio de transporte en su base salarial
  const basePrestaciones = ibc + auxilioTransporteDecenal;
  const cesantias = Math.round(basePrestaciones * params.cesantiasPct);
  // Intereses a cesantías: 12% anual -> 1% mensual / decenal proporcional a cesantías
  const interesesCesantias = Math.round(cesantias * (params.interesesCesantiasPct / 12));
  const primaServicios = Math.round(basePrestaciones * params.primaServiciosPct);
  // Vacaciones no incluyen auxilio de transporte
  const vacaciones = Math.round(ibc * params.vacacionesPct);
  const totalProvisiones = cesantias + interesesCesantias + primaServicios + vacaciones;

  // Costo Total Empresa
  const costoTotalEmpresa = totalDevengado + totalAportesPatronales + totalProvisiones;

  return {
    employee,
    period,
    diasLaborados,
    diasIncapacidadEPS,
    diasIncapacidadARL,
    diasLicenciaNoRemunerada,
    diasLicenciaRemunerada,
    sueldoBasicoDecenal,
    auxilioTransporteDecenal,
    horasExtras: {
      hedValor,
      henValor,
      heddfValor,
      hendfValor,
      rnValor,
      rdoValor,
      totalExtrasYRecargos,
    },
    bonificaciones,
    pagoIncapacidades,
    pagoLicencias,
    totalDevengado,
    ibc,
    deducciones: {
      saludEmpleado,
      pensionEmpleado,
      embargos,
      libranzas,
      otrasDeducciones,
      totalDeducciones,
    },
    netoPagar,
    aportesPatronales: {
      saludPatronal,
      pensionPatronal,
      arlPatronal,
      cajaCompensacion,
      sena,
      icbf,
      totalAportesPatronales,
    },
    provisiones: {
      cesantias,
      interesesCesantias,
      primaServicios,
      vacaciones,
      totalProvisiones,
    },
    costoTotalEmpresa,
  };
}

export function calculateWholePeriodPayroll(
  employees: Employee[],
  period: DecenalPeriod,
  novedades: NovedadRecord[],
  params: PayrollParameters
): CalculatedPayrollItem[] {
  return employees
    .filter(emp => emp.status !== 'inactivo')
    .map(emp => calculateDecenalPayrollItem(emp, period, novedades, params));
}

export function generatePUCAccountingEntries(items: CalculatedPayrollItem[]): AccountingEntry[] {
  let totalSueldosAdmin = 0;
  let totalSueldosProd = 0;
  let totalAuxTransporteAdmin = 0;
  let totalAuxTransporteProd = 0;
  let totalHorasExtrasProd = 0;
  let totalBonos = 0;
  let totalSaludEmpleado = 0;
  let totalPensionEmpleado = 0;
  let totalEmbargosLibranzas = 0;
  let totalNetoPagar = 0;
  let totalPensionPatronal = 0;
  let totalARL = 0;
  let totalCCF = 0;
  let totalCesantias = 0;
  let totalInteresesCesantias = 0;
  let totalPrima = 0;
  let totalVacaciones = 0;

  items.forEach(item => {
    const isProduction = item.employee.department === 'Prensa (Impresión)' || 
                         item.employee.department === 'Pre-prensa' || 
                         item.employee.department === 'Acabados y Troquelado' ||
                         item.employee.department === 'Comercial y Logística';

    if (isProduction) {
      totalSueldosProd += item.sueldoBasicoDecenal;
      totalAuxTransporteProd += item.auxilioTransporteDecenal;
      totalHorasExtrasProd += item.horasExtras.totalExtrasYRecargos;
    } else {
      totalSueldosAdmin += item.sueldoBasicoDecenal;
      totalAuxTransporteAdmin += item.auxilioTransporteDecenal;
    }

    totalBonos += item.bonificaciones;
    totalSaludEmpleado += item.deducciones.saludEmpleado;
    totalPensionEmpleado += item.deducciones.pensionEmpleado;
    totalEmbargosLibranzas += item.deducciones.embargos + item.deducciones.libranzas;
    totalNetoPagar += item.netoPagar;
    totalPensionPatronal += item.aportesPatronales.pensionPatronal;
    totalARL += item.aportesPatronales.arlPatronal;
    totalCCF += item.aportesPatronales.cajaCompensacion;
    totalCesantias += item.provisiones.cesantias;
    totalInteresesCesantias += item.provisiones.interesesCesantias;
    totalPrima += item.provisiones.primaServicios;
    totalVacaciones += item.provisiones.vacaciones;
  });

  const entries: AccountingEntry[] = [
    // Débitos Gasto Admin
    {
      accountCode: '510506',
      accountName: 'Gastos de Personal - Sueldos Administrativos',
      debit: totalSueldosAdmin,
      credit: 0,
      costCenter: 'Administración y Finanzas',
    },
    {
      accountCode: '510527',
      accountName: 'Gastos de Personal - Auxilio de Transporte Admin',
      debit: totalAuxTransporteAdmin,
      credit: 0,
      costCenter: 'Administración y Finanzas',
    },
    // Débitos Costo Producción / Mano de Obra Imprenta
    {
      accountCode: '720506',
      accountName: 'Costos de Producción - Mano de Obra Directa (Imprenta)',
      debit: totalSueldosProd,
      credit: 0,
      costCenter: 'Planta Industrial y Talleres',
    },
    {
      accountCode: '720515',
      accountName: 'Costos de Producción - Horas Extras y Recargos Turnos',
      debit: totalHorasExtrasProd,
      credit: 0,
      costCenter: 'Planta Impresión Heidelberg / Roland',
    },
    {
      accountCode: '720527',
      accountName: 'Costos de Producción - Auxilio de Transporte Operativo',
      debit: totalAuxTransporteProd,
      credit: 0,
      costCenter: 'Planta Industrial y Talleres',
    },
    {
      accountCode: '510548',
      accountName: 'Bonificaciones e Incentivos de Calidad y Cero Mermas',
      debit: totalBonos,
      credit: 0,
      costCenter: 'Operaciones',
    },
    // Aportes Patronales Débitos (Gasto / Costo)
    {
      accountCode: '510569',
      accountName: 'Aportes EPS, Pensión y ARL Imprenta (Patronal)',
      debit: totalPensionPatronal + totalARL,
      credit: 0,
      costCenter: 'Corporativo',
    },
    {
      accountCode: '510572',
      accountName: 'Aportes Caja de Compensación Familiar (4%)',
      debit: totalCCF,
      credit: 0,
      costCenter: 'Corporativo',
    },
    // Provisiones Prestaciones Débitos
    {
      accountCode: '510530',
      accountName: 'Provisión Cesantías e Intereses (Decenal)',
      debit: totalCesantias + totalInteresesCesantias,
      credit: 0,
      costCenter: 'Corporativo',
    },
    {
      accountCode: '510536',
      accountName: 'Provisión Prima Legal y Vacaciones (Decenal)',
      debit: totalPrima + totalVacaciones,
      credit: 0,
      costCenter: 'Corporativo',
    },

    // --- CRÉDITOS PASIVOS ---
    {
      accountCode: '250505',
      accountName: 'Salarios por Pagar a Trabajadores (Dispersión Bancolombia)',
      debit: 0,
      credit: totalNetoPagar,
      costCenter: 'Tesorería',
    },
    {
      accountCode: '237005',
      accountName: 'Aportes a Entidades Promotoras de Salud (EPS)',
      debit: 0,
      credit: totalSaludEmpleado,
      costCenter: 'Nómina',
    },
    {
      accountCode: '238030',
      accountName: 'Fondos de Pensiones y Cesantías (Retención Empleado + Patronal)',
      debit: 0,
      credit: totalPensionEmpleado + totalPensionPatronal,
      costCenter: 'Nómina',
    },
    {
      accountCode: '237006',
      accountName: 'Aportes a Riesgos Laborales (ARL Sura Riesgo Gráfico)',
      debit: 0,
      credit: totalARL,
      costCenter: 'Nómina',
    },
    {
      accountCode: '237010',
      accountName: 'Aportes a Cajas de Compensación Familiar (Comfama)',
      debit: 0,
      credit: totalCCF,
      costCenter: 'Nómina',
    },
    {
      accountCode: '237025',
      accountName: 'Embargos Judiciales y Libranzas por Pagar',
      debit: 0,
      credit: totalEmbargosLibranzas,
      costCenter: 'Retenciones',
    },
    {
      accountCode: '261005',
      accountName: 'Provisión para Cesantías',
      debit: 0,
      credit: totalCesantias,
      costCenter: 'Pasivos Laborales',
    },
    {
      accountCode: '261010',
      accountName: 'Provisión para Intereses sobre Cesantías',
      debit: 0,
      credit: totalInteresesCesantias,
      costCenter: 'Pasivos Laborales',
    },
    {
      accountCode: '261020',
      accountName: 'Provisión para Prima de Servicios',
      debit: 0,
      credit: totalPrima,
      costCenter: 'Pasivos Laborales',
    },
    {
      accountCode: '261015',
      accountName: 'Provisión para Vacaciones',
      debit: 0,
      credit: totalVacaciones,
      costCenter: 'Pasivos Laborales',
    },
  ];

  return entries;
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
