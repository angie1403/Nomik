import { Employee, DecenalPeriod, NovedadRecord, PayrollParameters, UserRole } from '../types/payroll';

export const STORAGE_KEY = 'impresos_el_dia_payroll_state_v1';

export interface PayrollAppState {
  version: number;
  savedAt: string;
  companyName: string;
  nit: string;
  currentRole: UserRole;
  selectedPeriodId: string;
  employees: Employee[];
  periods: DecenalPeriod[];
  novedades: NovedadRecord[];
  parameters: PayrollParameters;
}

export function saveStateToLocalStorage(state: {
  currentRole: UserRole;
  selectedPeriodId: string;
  employees: Employee[];
  periods: DecenalPeriod[];
  novedades: NovedadRecord[];
  parameters: PayrollParameters;
}): boolean {
  try {
    const payload: PayrollAppState = {
      version: 1,
      savedAt: new Date().toISOString(),
      companyName: 'IMPRESOS EL DÍA S.A.S.',
      nit: '900.842.195-3',
      currentRole: state.currentRole,
      selectedPeriodId: state.selectedPeriodId,
      employees: state.employees,
      periods: state.periods,
      novedades: state.novedades,
      parameters: state.parameters,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
    return false;
  }
}

export function loadStateFromLocalStorage(): PayrollAppState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && parsed.version && Array.isArray(parsed.employees)) {
      return parsed as PayrollAppState;
    }
    return null;
  } catch (err) {
    console.error('Error reading state from localStorage:', err);
    return null;
  }
}

export function exportStateAsJSON(state: {
  currentRole: UserRole;
  selectedPeriodId: string;
  employees: Employee[];
  periods: DecenalPeriod[];
  novedades: NovedadRecord[];
  parameters: PayrollParameters;
}): void {
  const payload: PayrollAppState = {
    version: 1,
    savedAt: new Date().toISOString(),
    companyName: 'IMPRESOS EL DÍA S.A.S.',
    nit: '900.842.195-3',
    currentRole: state.currentRole,
    selectedPeriodId: state.selectedPeriodId,
    employees: state.employees,
    periods: state.periods,
    novedades: state.novedades,
    parameters: state.parameters,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateFormatted = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const link = document.createElement('a');
  link.href = url;
  link.download = `Copia_Seguridad_Nomina_ImpresosElDia_${dateFormatted}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseAndValidateBackupJSON(jsonString: string): PayrollAppState {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('El archivo no contiene un objeto JSON válido.');
  }

  if (!Array.isArray(parsed.employees)) {
    throw new Error('El archivo no contiene una lista válida de empleados.');
  }

  if (!Array.isArray(parsed.periods)) {
    throw new Error('El archivo no contiene los periodos decenales de la empresa.');
  }

  if (!Array.isArray(parsed.novedades)) {
    throw new Error('El archivo no contiene el registro de novedades.');
  }

  return parsed as PayrollAppState;
}

export function clearLocalStorageState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
}
