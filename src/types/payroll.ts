export type UserRole = 'rrhh' | 'contabilidad';

export type ContractType = 'termino_fijo' | 'indefinido' | 'obra_labor' | 'aprendizaje';

export type Department = 
  | 'Gerencia y Administración'
  | 'Comercial y Logística'
  | 'Pre-prensa'
  | 'Prensa (Impresión)'
  | 'Acabados y Troquelado'
  | 'Mantenimiento y SST';

export type ShiftType = 
  | 'Turno 1 - Mañana (06:00 - 14:00)'
  | 'Turno 2 - Tarde (14:00 - 22:00)'
  | 'Turno 3 - Noche (22:00 - 06:00)'
  | 'Administrativo / General (08:00 - 17:00)'
  | 'Rotativo';

export type ARLRiskLevel = 1 | 2 | 3 | 4 | 5;

export interface Employee {
  id: string;
  documentId: string;
  documentType: 'CC' | 'CE' | 'PEP';
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: Department;
  contractType: ContractType;
  startDate: string;
  baseSalary: number; // monthly
  hasTransportAllowance: boolean; // automatic if <= 2 SMMLV or manual override
  arlRiskLevel: ARLRiskLevel;
  shift: ShiftType;
  bankName: string;
  bankAccountType: 'Ahorros' | 'Corriente';
  bankAccountNumber: string;
  eps: string;
  pensionFund: string;
  severanceFund: string;
  compensationBox: string;
  status: 'activo' | 'inactivo' | 'vacaciones' | 'incapacitado';
}

export type NovedadType = 
  | 'horas_extras'
  | 'incapacidad_eps'
  | 'incapacidad_arl'
  | 'licencia_remunerada'
  | 'licencia_no_remunerada'
  | 'bonificacion'
  | 'deduccion_embargo'
  | 'deduccion_libranza'
  | 'ajuste_dias';

export interface OvertimeDetail {
  hedHours: number;    // Hora Extra Diurna (1.25)
  henHours: number;    // Hora Extra Nocturna (1.75)
  heddfHours: number;  // Hora Extra Diurna Festiva/Dominical (2.00)
  hendfHours: number;  // Hora Extra Nocturna Festiva/Dominical (2.50)
  rnHours: number;     // Recargo Nocturno (0.35)
  rdoHours: number;    // Recargo Dominical Ordinario (0.75)
}

export interface NovedadRecord {
  id: string;
  employeeId: string;
  periodId: string;
  date: string;
  type: NovedadType;
  description: string;
  daysAffected?: number;
  amount?: number;
  overtime?: OvertimeDetail;
  approvedByAreaHead: boolean;
  notes?: string;
}

export type PeriodStatus = 
  | 'recopilacion_novedades'    // Paso 1: RRHH capturando
  | 'validacion_jefaturas'       // Paso 2: Jefes de turno/área validando
  | 'calculo_prenomina'          // Paso 3: Prenómina calculada
  | 'aprobacion_gerencia'        // Paso 4: Gerencia autoriza
  | 'dispersion_y_pago'          // Paso 5: Archivo de pago bancario generado
  | 'cerrado_contabilidad';      // Paso 6: Contabilizado y finalizado

export interface DecenalPeriod {
  id: string;
  year: number;
  month: number; // 1-12
  decenioNumber: 1 | 2 | 3; // 1: 1-10, 2: 11-20, 3: 21-cierre
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  nominalDays: number; // usually 10
  description: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface CalculatedPayrollItem {
  employee: Employee;
  period: DecenalPeriod;
  
  // Días
  diasLaborados: number;
  diasIncapacidadEPS: number;
  diasIncapacidadARL: number;
  diasLicenciaNoRemunerada: number;
  diasLicenciaRemunerada: number;

  // Devengados
  sueldoBasicoDecenal: number;
  auxilioTransporteDecenal: number;
  
  // Horas extras y recargos
  horasExtras: {
    hedValor: number;
    henValor: number;
    heddfValor: number;
    hendfValor: number;
    rnValor: number;
    rdoValor: number;
    totalExtrasYRecargos: number;
  };
  
  bonificaciones: number;
  pagoIncapacidades: number;
  pagoLicencias: number;
  totalDevengado: number;

  // IBC (Ingreso Base de Cotización)
  ibc: number;

  // Deducciones Empleado
  deducciones: {
    saludEmpleado: number;    // 4%
    pensionEmpleado: number;  // 4%
    embargos: number;
    libranzas: number;
    otrasDeducciones: number;
    totalDeducciones: number;
  };

  // Neto a Dispersar
  netoPagar: number;

  // Aportes Patronales (Seguridad Social y Parafiscales)
  aportesPatronales: {
    saludPatronal: number;   // 8.5% (o 0 si exonerado Ley 1607/114-1 E.T.)
    pensionPatronal: number; // 12%
    arlPatronal: number;     // según riesgo imprenta (I: 0.522%, III: 2.436%, IV: 4.35%)
    cajaCompensacion: number;// 4%
    sena: number;            // 2% (o 0 si exonerado)
    icbf: number;            // 3% (o 0 si exonerado)
    totalAportesPatronales: number;
  };

  // Provisiones Prestaciones Sociales (Costo Decenal Empresa)
  provisiones: {
    cesantias: number;          // 8.33% de (IBC + Auxilio)
    interesesCesantias: number; // 1.0% mensual (12% anual sobre cesantías acumuladas)
    primaServicios: number;     // 8.33% de (IBC + Auxilio)
    vacaciones: number;         // 4.17% de IBC
    totalProvisiones: number;
  };

  // Costo Total Empresa Decenal
  costoTotalEmpresa: number;
}

export interface PayrollParameters {
  year: number;
  smmlv: number;              // Salario Mínimo Mensual Legal Vigente
  auxilioTransporte: number;   // Auxilio de Transporte Mensual
  limiteSMMLVAuxilio: number;  // 2 SMMLV
  horasMesLaboral: number;     // 240 horas
  saludEmpleadoPct: number;    // 0.04
  pensionEmpleadoPct: number;  // 0.04
  saludPatronalPct: number;    // 0.085
  pensionPatronalPct: number;  // 0.12
  ccfPct: number;              // 0.04
  senaPct: number;             // 0.02
  icbfPct: number;             // 0.03
  cesantiasPct: number;        // 0.0833
  interesesCesantiasPct: number; // 0.12 annual / 0.01 monthly
  primaServiciosPct: number;   // 0.0833
  vacacionesPct: number;       // 0.0417
  exoneradoLey1607: boolean;   // Exoneración Salud patronal, SENA e ICBF para < 10 SMMLV
  arlRates: {
    1: number; // 0.00522
    2: number; // 0.01044
    3: number; // 0.02436
    4: number; // 0.04350
    5: number; // 0.06960
  };
}

export interface AccountingEntry {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  costCenter: string;
}
