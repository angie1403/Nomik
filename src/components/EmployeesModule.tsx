import React, { useState } from 'react';
import { Employee, Department, ShiftType, ContractType, ARLRiskLevel, UserRole } from '../types/payroll';
import { formatCOP } from '../utils/calculations';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Building, 
  Clock, 
  Shield, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

interface EmployeesModuleProps {
  employees: Employee[];
  currentRole: UserRole;
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  smmlv: number;
}

const DEPARTMENTS: Department[] = [
  'Gerencia y Administración',
  'Comercial y Logística',
  'Pre-prensa',
  'Prensa (Impresión)',
  'Acabados y Troquelado',
  'Mantenimiento y SST',
];

const SHIFTS: ShiftType[] = [
  'Turno 1 - Mañana (06:00 - 14:00)',
  'Turno 2 - Tarde (14:00 - 22:00)',
  'Turno 3 - Noche (22:00 - 06:00)',
  'Administrativo / General (08:00 - 17:00)',
  'Rotativo',
];

export const EmployeesModule: React.FC<EmployeesModuleProps> = ({
  employees,
  currentRole,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  smmlv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Employee>>({
    documentType: 'CC',
    documentId: '',
    fullName: '',
    email: '',
    phone: '',
    position: '',
    department: 'Prensa (Impresión)',
    contractType: 'indefinido',
    startDate: new Date().toISOString().split('T')[0],
    baseSalary: 2600000,
    hasTransportAllowance: true,
    arlRiskLevel: 3,
    shift: 'Turno 1 - Mañana (06:00 - 14:00)',
    bankName: 'Bancolombia',
    bankAccountType: 'Ahorros',
    bankAccountNumber: '',
    eps: 'Sura EPS',
    pensionFund: 'Protección',
    severanceFund: 'Protección',
    compensationBox: 'Comfama',
    status: 'activo',
  });

  const canEdit = currentRole === 'rrhh';

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.documentId.includes(searchTerm) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    const matchesShift = selectedShift === 'all' || emp.shift === selectedShift;
    return matchesSearch && matchesDept && matchesShift;
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      documentType: 'CC',
      documentId: '',
      fullName: '',
      email: '',
      phone: '',
      position: '',
      department: 'Prensa (Impresión)',
      contractType: 'indefinido',
      startDate: new Date().toISOString().split('T')[0],
      baseSalary: 2600000,
      hasTransportAllowance: true,
      arlRiskLevel: 3,
      shift: 'Turno 1 - Mañana (06:00 - 14:00)',
      bankName: 'Bancolombia',
      bankAccountType: 'Ahorros',
      bankAccountNumber: '',
      eps: 'Sura EPS',
      pensionFund: 'Protección',
      severanceFund: 'Protección',
      compensationBox: 'Comfama',
      status: 'activo',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.documentId || !formData.position) return;

    const salary = Number(formData.baseSalary) || 1423500;
    // Auto transport check if <= 2 SMMLV
    const hasTransport = formData.hasTransportAllowance !== undefined 
      ? formData.hasTransportAllowance 
      : salary <= 2 * smmlv;

    if (editingEmp) {
      onUpdateEmployee({
        ...(formData as Employee),
        id: editingEmp.id,
        baseSalary: salary,
        hasTransportAllowance: hasTransport,
      });
    } else {
      const newEmp: Employee = {
        ...(formData as Employee),
        id: `emp-${Date.now()}`,
        baseSalary: salary,
        hasTransportAllowance: hasTransport,
      };
      onAddEmployee(newEmp);
    }
    setIsModalOpen(false);
  };

  const exportEmployeesCSV = () => {
    const headers = ['Documento', 'Nombre', 'Cargo', 'Departamento', 'Salario Base Mensual', 'Turno', 'ARL', 'Contrato', 'Banco', 'Cuenta', 'Estado'];
    const rows = filteredEmployees.map(e => [
      `"${e.documentType} ${e.documentId}"`,
      `"${e.fullName}"`,
      `"${e.position}"`,
      `"${e.department}"`,
      e.baseSalary,
      `"${e.shift}"`,
      `"Riesgo ${e.arlRiskLevel}"`,
      `"${e.contractType}"`,
      `"${e.bankName}"`,
      `"${e.bankAccountNumber}"`,
      `"${e.status}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nomina_Empleados_ImpresosElDia_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Metrics
  const activeCount = employees.filter(e => e.status === 'activo').length;
  const plantCount = employees.filter(e => e.department === 'Prensa (Impresión)' || e.department === 'Pre-prensa' || e.department === 'Acabados y Troquelado').length;
  const avgSalary = Math.round(employees.reduce((acc, e) => acc + e.baseSalary, 0) / (employees.length || 1));
  const transportCount = employees.filter(e => e.hasTransportAllowance).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Trabajadores</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{employees.length}</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeCount} Activos en Planta y Oficinas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Personal de Producción</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Building className="w-4 h-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{plantCount}</div>
          <div className="mt-1 text-xs text-slate-500">
            Prensa, Pre-prensa y Acabados
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Promedio Salarial</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CreditCard className="w-4 h-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatCOP(avgSalary)}</div>
          <div className="mt-1 text-xs text-slate-500">
            Salario base mensual
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Con Aux. Transporte</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Shield className="w-4 h-4" /></span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{transportCount}</div>
          <div className="mt-1 text-xs text-slate-500">
            Devengan ≤ 2 SMMLV ({formatCOP(2 * smmlv)})
          </div>
        </div>
      </div>

      {/* Control bar: search, filters & actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Todos los Departamentos</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hidden lg:block"
          >
            <option value="all">Todos los Turnos</option>
            {SHIFTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportEmployeesCSV}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {canEdit ? (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nuevo Trabajador</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 italic px-2">
              (Modo lectura - Cambie a Talento Humano para editar)
            </div>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Trabajador & Cédula</th>
                <th className="py-3.5 px-3">Cargo & Área</th>
                <th className="py-3.5 px-3">Turno Asignado</th>
                <th className="py-3.5 px-3">Salario Base</th>
                <th className="py-3.5 px-3">Aux. Transp.</th>
                <th className="py-3.5 px-3">Riesgo ARL</th>
                <th className="py-3.5 px-3">Seguridad Social</th>
                <th className="py-3.5 px-3">Cuenta Dispersión</th>
                <th className="py-3.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron trabajadores con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{emp.documentType} {emp.documentId}</span>
                        <span>•</span>
                        <span className="capitalize">{emp.contractType.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{emp.position}</div>
                      <div className="text-[11px] text-cyan-700 bg-cyan-50/60 inline-block px-1.5 py-0.5 rounded mt-0.5">
                        {emp.department}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{emp.shift.split('(')[0]}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{formatCOP(emp.baseSalary)}</div>
                      <div className="text-[10px] text-slate-400">
                        Decenio: {formatCOP(Math.round((emp.baseSalary / 30) * 10))}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {emp.hasTransportAllowance ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Aplica Ley
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Exento (&gt;2 SMMLV)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        emp.arlRiskLevel === 1 
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : emp.arlRiskLevel === 3
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : emp.arlRiskLevel >= 4
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        Clase {emp.arlRiskLevel} ({
                          emp.arlRiskLevel === 1 ? '0.522%' : emp.arlRiskLevel === 3 ? '2.436%' : '4.35%'
                        })
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      <div className="text-slate-800">{emp.eps}</div>
                      <div className="text-[10px] text-slate-400">{emp.pensionFund}</div>
                    </td>

                    <td className="py-3 px-3 text-[11px]">
                      <div className="font-medium text-slate-800">{emp.bankName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{emp.bankAccountNumber}</div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {canEdit ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Editar contrato y salario"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Desactivar al trabajador ${emp.fullName}?`)) {
                                onDeleteEmployee(emp.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Desactivar trabajador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingEmp ? 'Editar Datos del Trabajador' : 'Registrar Nuevo Trabajador'}
                </h3>
                <p className="text-xs text-slate-400">
                  Estructura Organizacional y Nómina de Impresos El Día S.A.S.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Row 1: Identification & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo Doc.</label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PEP">Permiso Especial (PEP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. Documento</label>
                  <input
                    type="text"
                    required
                    value={formData.documentId}
                    onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="Ej. 1017892341"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="Ej. 3127894561"
                  />
                </div>
              </div>

              {/* Row 2: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="Nombre y Apellidos"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="empleado@impresoseldia.com"
                  />
                </div>
              </div>

              {/* Row 3: Position, Department & Contract */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cargo en la Empresa</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="Ej. Operadores de Prensa Heidelberg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Departamento</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo de Contrato</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as ContractType })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="indefinido">Término Indefinido</option>
                    <option value="termino_fijo">Término Fijo</option>
                    <option value="obra_labor">Obra o Labor</option>
                    <option value="aprendizaje">Contrato de Aprendizaje</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Shift & Risk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Turno de Trabajo (Planta / Oficinas)</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value as ShiftType })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    {SHIFTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nivel de Riesgo ARL (Imprenta)</label>
                  <select
                    value={formData.arlRiskLevel}
                    onChange={(e) => setFormData({ ...formData, arlRiskLevel: Number(e.target.value) as ARLRiskLevel })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value={1}>Clase I (0.522%) - Administrativo / Ventas</option>
                    <option value={2}>Clase II (1.044%) - Bodega / Mensajería</option>
                    <option value={3}>Clase III (2.436%) - Prensa Litográfica / CTP / Pre-prensa</option>
                    <option value={4}>Clase IV (4.350%) - Guillotina y Troquelado Industrial</option>
                    <option value={5}>Clase V (6.960%) - Alto Riesgo</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Base Salary & Transport Allowance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Salario Base Mensual (COP)</label>
                  <input
                    type="number"
                    required
                    min={smmlv}
                    step={1000}
                    value={formData.baseSalary}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        baseSalary: val,
                        hasTransportAllowance: val <= 2 * smmlv 
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Salario decenal base: {formatCOP(Math.round(((formData.baseSalary || 0) / 30) * 10))}
                  </span>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={formData.hasTransportAllowance}
                      onChange={(e) => setFormData({ ...formData, hasTransportAllowance: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Incluir Auxilio de Transporte Legal
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Automático si el salario es ≤ 2 SMMLV ({formatCOP(2 * smmlv)}).
                  </span>
                </div>
              </div>

              {/* Row 6: Bank Disbursement Data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Banco Dispersión</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="Bancolombia, Davivienda..."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tipo de Cuenta</label>
                  <select
                    value={formData.bankAccountType}
                    onChange={(e) => setFormData({ ...formData, bankAccountType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Ahorros">Cuenta de Ahorros</option>
                    <option value="Corriente">Cuenta Corriente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Número de Cuenta</label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                    placeholder="000-000000-00"
                  />
                </div>
              </div>

              {/* Row 7: Social Security Entitites */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">EPS</label>
                  <input
                    type="text"
                    value={formData.eps}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Fondo Pensión</label>
                  <input
                    type="text"
                    value={formData.pensionFund}
                    onChange={(e) => setFormData({ ...formData, pensionFund: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Cesantías</label>
                  <input
                    type="text"
                    value={formData.severanceFund}
                    onChange={(e) => setFormData({ ...formData, severanceFund: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Caja Comp.</label>
                  <input
                    type="text"
                    value={formData.compensationBox}
                    onChange={(e) => setFormData({ ...formData, compensationBox: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  {editingEmp ? 'Guardar Cambios' : 'Registrar Trabajador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
