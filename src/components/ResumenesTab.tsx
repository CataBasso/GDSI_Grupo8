import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Receipt, Calendar, PieChart as PieChartIcon, CreditCard } from "lucide-react";
import type { Gasto, Participante } from "@/pages/Index";
import type { Pago } from "@/lib/apiService";

interface ResumenesTabProps {
  gastos: Gasto[];
  pagos: Pago[];
  participantes: Participante[];
  usuarioActual: {
    id: string;
    nombre: string;
    email: string;
    unidad: string;
  };
  onSaldarGasto?: (deudorId: string, acreedorId: string, monto: number, comprobante: string) => void;
}


interface SaldarMisDeudasDialogProps {
  usuarioActual: {
    id: string;
    nombre: string;
    email: string;
    unidad: string;
  };
  balanceParticipantes: Array<{
    id: string;
    nombre: string;
    unidad: string;
    montoBalance: number;
    debeRecibir: boolean;
  }>;
  onSaldar: (deudorId: string, acreedorId: string, monto: number, comprobante: string) => void;
}

export const getCategoriaColorHex = (categoria: string) => {
  const hexColors: Record<string, string> = {
    Mantenimiento: "#3b82f6",
    Limpieza: "#84cc16",
    Seguridad: "#ef4444",
    Jardineria: "#b664ecff",
    Mejoras: "#8b5cf6",
    Administracion: "#f97316",
    Servicios: "#06b6d4",
    Otros: "#f59e0b"
  };
  return hexColors[categoria] || hexColors.otros;
}


const SaldarMisDeudasDialog = ({ usuarioActual, balanceParticipantes, onSaldar }: SaldarMisDeudasDialogProps) => {
  const [open, setOpen] = useState(false);
  const [deudasSeleccionadas, setDeudasSeleccionadas] = useState<Record<string, { 
    seleccionada: boolean; 
    comprobante: File | null 
  }>>({});

  // Calcular las deudas específicas del usuario actual
  const misDeudas = useMemo(() => {
    const usuarioBalance = balanceParticipantes.find(p => p.id === usuarioActual.id);
    if (!usuarioBalance || usuarioBalance.debeRecibir || usuarioBalance.montoBalance <= 0) {
      return [];
    }

    // Crear deudas específicas basadas en los gastos donde el usuario debe dinero
    const deudas: Array<{
      acreedorId: string;
      acreedorNombre: string;
      monto: number;
      descripcion: string;
    }> = [];

    // Por ahora, crear una deuda general con el balance total
    // En una implementación más avanzada, se podrían calcular deudas específicas por gasto
    const acreedores = balanceParticipantes.filter(p => p.debeRecibir && p.montoBalance > 0);
    
    if (acreedores.length > 0) {
      // Distribuir la deuda proporcionalmente entre los acreedores
      const totalAcreedores = acreedores.reduce((sum, a) => sum + a.montoBalance, 0);
      acreedores.forEach(acreedor => {
        const montoProporcional = (acreedor.montoBalance / totalAcreedores) * usuarioBalance.montoBalance;
        if (montoProporcional > 0.01) { // Solo incluir si es mayor a 1 centavo
          deudas.push({
            acreedorId: acreedor.id,
            acreedorNombre: acreedor.nombre,
            monto: Math.round(montoProporcional * 100) / 100, // Redondear a 2 decimales
            descripcion: `Debe $${Math.round(montoProporcional * 100) / 100} a ${acreedor.nombre}`
          });
        }
      });
    }

    return deudas;
  }, [usuarioActual.id, balanceParticipantes]);

  const handleSaldar = () => {
    Object.entries(deudasSeleccionadas).forEach(([acreedorId, { comprobante }]) => {
      const deuda = misDeudas.find(d => d.acreedorId === acreedorId);
      if (deuda && comprobante) {
        onSaldar(usuarioActual.id, acreedorId, deuda.monto, comprobante.name);
      }
    });
    setOpen(false);
    setDeudasSeleccionadas({});
  };

  const actualizarComprobante = (acreedorId: string, archivo: File | null) => {
    setDeudasSeleccionadas(prev => ({
      ...prev,
      [acreedorId]: { 
        ...prev[acreedorId], 
        comprobante: archivo 
      }
    }));
  };

  const toggleDeuda = (acreedorId: string) => {
    setDeudasSeleccionadas(prev => ({
      ...prev,
      [acreedorId]: { 
        seleccionada: !prev[acreedorId]?.seleccionada,
        comprobante: prev[acreedorId]?.comprobante || null
      }
    }));
  };

  if (misDeudas.length === 0) {
    return null; // No mostrar el botón si no hay deudas
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-2">
          <CreditCard className="w-4 h-4" />
          Liquidar Mis Deudas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Liquidar Mis Deudas</DialogTitle>
          <DialogDescription>
            Selecciona las deudas que quieres liquidar y sube el comprobante de liquidación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          
          {misDeudas.map((deuda) => {
            const deudaSeleccionada = deudasSeleccionadas[deuda.acreedorId] || { seleccionada: false, comprobante: null };
            const isSelected = deudaSeleccionada.seleccionada;
            
            return (
              <div key={deuda.acreedorId} className={`p-4 border rounded-lg transition-colors ${
                isSelected ? 'bg-primary/5 border-primary' : 'bg-card'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`checkbox-${deuda.acreedorId}`}
                      checked={isSelected}
                      onChange={() => toggleDeuda(deuda.acreedorId)}
                      className="w-4 h-4 text-primary"
                    />
                    <div>
                      <h4 className="font-semibold">{deuda.descripcion}</h4>
                      <p className="text-sm text-muted-foreground">Unidad {balanceParticipantes.find(p => p.id === deuda.acreedorId)?.unidad}</p>
                    </div>
                  </div>
                  <Badge variant={isSelected ? "default" : "outline"}>
                    {isSelected ? "Seleccionada" : "Pendiente"}
                  </Badge>
                </div>
                
                {isSelected && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`comprobante-${deuda.acreedorId}`}>Comprobante de liquidación (foto)</Label>
                      <Input
                        id={`comprobante-${deuda.acreedorId}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          actualizarComprobante(deuda.acreedorId, file);
                        }}
                        className="cursor-pointer"
                      />
                      {deudaSeleccionada.comprobante && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Archivo seleccionado: {deudaSeleccionada.comprobante.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSaldar} 
              className="flex-1" 
              disabled={Object.values(deudasSeleccionadas).every(d => !d.seleccionada || d.comprobante === null)}
            >
              Liquidar Deudas Seleccionadas ({Object.values(deudasSeleccionadas).filter(d => d.seleccionada && d.comprobante !== null).length})
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ResumenesTab = ({ gastos, pagos, participantes, usuarioActual, onSaldarGasto }: ResumenesTabProps) => {
    const resumenData = useMemo(() => {
    // Filtrar solo gastos comunitarios (excluir liquidaciones)
    const gastosComunitarios = gastos.filter(g => g.categoria !== 'Liquidación');
    const totalGastos = gastosComunitarios.reduce((sum, gasto) => sum + gasto.monto, 0);

    const gastosPorParticipante = participantes.map(participante => {
      // Solo contar gastos comunitarios para el cálculo de balances
      const gastosDelParticipante = gastosComunitarios.filter(g => g.participante === participante.nombre);
      const totalGastado = gastosDelParticipante.reduce((sum, g) => sum + g.monto, 0);
      const cantidadGastos = gastosDelParticipante.length;

      return {
        ...participante,
        totalGastado,
        cantidadGastos,
        porcentajeDelTotal: totalGastos > 0 ? (totalGastado / totalGastos) * 100 : 0
      };
    });

    const gastosPorCategoria = gastosComunitarios.reduce((acc, gasto) => {
      acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
      return acc;
    }, {} as Record<string, number>);

    const dataPieChart = Object.entries(gastosPorCategoria).map(([categoria, monto]) => ({
      name: categoria.charAt(0).toUpperCase() + categoria.slice(1),
      value: monto,
      porcentaje: totalGastos > 0 ? ((monto / totalGastos) * 100).toFixed(1) : 0
    }));

    const dataBarChart = gastosPorParticipante.map(p => ({
      nombre: p.nombre.split(' ')[0],
      monto: p.totalGastado,
      gastos: p.cantidadGastos
    }));

    // Calcular cuánto debe aportar cada uno (división equitativa)
    const aportePromedioPorParticipante = totalGastos / participantes.length;

    // Calcular pagos: pagos realizados y recibidos por participante
    const pagosPorParticipante = participantes.map(participante => {
      // Pagos que este participante PAGÓ (reduce su deuda)
      const pagosRealizados = pagos.filter(p => 
        p.deudor_id === participante.id
      );
      const totalPagado = pagosRealizados.reduce((sum, p) => sum + p.monto, 0);

      // Pagos que este participante RECIBIÓ (reduce su balance positivo)
      const pagosRecibidos = pagos.filter(p => 
        p.acreedor_id === participante.id
      );
      const totalRecibido = pagosRecibidos.reduce((sum, p) => sum + p.monto, 0);

      return {
        id: participante.id,
        totalPagado,
        totalRecibido
      };
    });

    const balanceParticipantes = gastosPorParticipante.map(p => {
      const pagosParticipante = pagosPorParticipante.find(l => l.id === p.id);
      const totalPagado = pagosParticipante?.totalPagado || 0;
      const totalRecibido = pagosParticipante?.totalRecibido || 0;

      // ✅ Cálculo corregido
      // Balance inicial: lo que gastó menos lo que debía aportar
      // Ajuste por pagos: 
      // - Si pagó (deudor), su deuda baja → aumenta su balance
      // - Si recibió (acreedor), su crédito baja → disminuye su balance
      const balanceInicial = p.totalGastado - aportePromedioPorParticipante;
      const balance = balanceInicial - totalRecibido + totalPagado;

      return {
        ...p,
        aporteCorresponde: aportePromedioPorParticipante,
        balance,
        debeRecibir: balance > 0,
        debeAportar: balance < 0,
        montoBalance: Math.abs(balance)
      };
    });

    return {
      totalGastos,
      promedioGasto: gastos.length > 0 ? totalGastos / gastos.length : 0,
      gastosPorParticipante,
      gastosPorCategoria,
      dataPieChart,
      dataBarChart,
      balanceParticipantes,
      aportePromedioPorParticipante
    };
  }, [gastos, participantes, pagos]);

  const gastosMesActual = gastos.filter(g => {
    const fechaGasto = new Date(g.fecha);
    const fechaActual = new Date();
    return fechaGasto.getMonth() === fechaActual.getMonth() && 
           fechaGasto.getFullYear() === fechaActual.getFullYear();
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Resúmenes y Balances</h2>
        <p className="text-muted-foreground">Análisis financiero del consorcio</p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Acumulado</p>
                <p className="text-2xl font-bold text-foreground">
                  ${resumenData.totalGastos.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gastos del Mes</p>
                <p className="text-2xl font-bold text-foreground">{gastosMesActual.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aporte por Unidad</p>
                <p className="text-2xl font-bold text-foreground">
                  ${resumenData.aportePromedioPorParticipante.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio por Gasto</p>
                <p className="text-2xl font-bold text-foreground">
                  ${resumenData.promedioGasto.toLocaleString('es-AR')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Gastos por Participante
            </CardTitle>
            <CardDescription>Comparación de gastos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {resumenData.dataBarChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={resumenData.dataBarChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, 'Monto gastado']}
                    labelFormatter={(label) => `Participante: ${label}`}
                  />
                  <Bar dataKey="monto" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Gastos por Categoría
            </CardTitle>
            <CardDescription>Distribución de gastos por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            {resumenData.dataPieChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={resumenData.dataPieChart}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ porcentaje }) => `${porcentaje}%`}
                  >
                    {resumenData.dataPieChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoriaColorHex(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, 'Total gastado']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos para mostrar
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {resumenData.dataPieChart.map(categoria => (
              <div key={categoria.name} className="flex items-center gap-2 bg-muted/40 rounded px-2 py-1 mb-1">
                <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getCategoriaColorHex(categoria.name) }}
                />
                <span className="text-sm whitespace-nowrap">{categoria.name}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                ${categoria.value.toLocaleString('es-AR')}
                </span>
              </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance por participante */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Balance por Participante
          </CardTitle>
          <CardDescription>
            Liquidación mensual - Aportes y compensaciones
          </CardDescription>
            </div>
            <SaldarMisDeudasDialog
              usuarioActual={usuarioActual}
              balanceParticipantes={resumenData.balanceParticipantes}
              onSaldar={onSaldarGasto || (() => {})}
            />
          </div>
        </CardHeader>
        <CardContent>
          {resumenData.balanceParticipantes.length > 0 ? (
            <div className="space-y-4">
              {resumenData.balanceParticipantes.map((participante) => (
                <div key={participante.id} className="p-4 rounded-lg border bg-gradient-to-r from-background to-accent/5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{participante.nombre}</h4>
                      <p className="text-sm text-muted-foreground">Unidad {participante.unidad}</p>
                    </div>
                    {(participante.debeRecibir || participante.debeAportar) && (
                      <Badge
                        variant={
                          participante.debeRecibir
                            ? "default"
                            : participante.debeAportar
                            ? "default"
                            : "destructive"
                        }
                      >
                        {participante.debeRecibir
                          ? "Debe recibir"
                          : participante.debeAportar
                          ? "Debe aportar"
                          : ""}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Gastó</p>
                      <p className="font-semibold">${participante.totalGastado.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Debe aportar</p>
                      <p className="font-semibold">${participante.aporteCorresponde.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Balance</p>
                      <p className={`font-semibold ${
                          participante.debeRecibir
                            ? 'text-success'
                            : participante.debeAportar
                            ? 'text-destructive'
                            : 'text-default'
                        }`}
                      >
                        {participante.debeRecibir
                          ? `+${participante.montoBalance.toLocaleString('es-AR')}`
                          : participante.debeAportar
                          ? `-${participante.montoBalance.toLocaleString('es-AR')}`
                          : '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Participación</p>
                      <div className="flex items-center gap-2">
                        <Progress value={participante.porcentajeDelTotal} className="flex-1" />
                        <span className="text-xs">{participante.porcentajeDelTotal.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay datos para el balance</h3>
              <p className="text-muted-foreground">Agrega gastos y participantes para ver el balance</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};