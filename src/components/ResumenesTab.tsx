import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Receipt, Calendar, PieChart as PieChartIcon } from "lucide-react";
import type { Gasto, Participante } from "@/pages/Index";

interface ResumenesTabProps {
  gastos: Gasto[];
  participantes: Participante[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export const ResumenesTab = ({ gastos, participantes }: ResumenesTabProps) => {
  const resumenData = useMemo(() => {
    const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    const gastosPorParticipante = participantes.map(participante => {
      const gastosDelParticipante = gastos.filter(g => g.participante === participante.nombre);
      const totalGastado = gastosDelParticipante.reduce((sum, g) => sum + g.monto, 0);
      const cantidadGastos = gastosDelParticipante.length;
      
      return {
        ...participante,
        totalGastado,
        cantidadGastos,
        porcentajeDelTotal: totalGastos > 0 ? (totalGastado / totalGastos) * 100 : 0
      };
    });

    const gastosPorCategoria = gastos.reduce((acc, gasto) => {
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
    const balanceParticipantes = gastosPorParticipante.map(p => ({
      ...p,
      aporteCorresponde: aportePromedioPorParticipante,
      balance: p.totalGastado - aportePromedioPorParticipante,
      debeRecibir: p.totalGastado > aportePromedioPorParticipante,
      montoBalance: Math.abs(p.totalGastado - aportePromedioPorParticipante)
    }));

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
  }, [gastos, participantes]);

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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          </CardContent>
        </Card>
      </div>

      {/* Balance por participante */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Balance por Participante
          </CardTitle>
          <CardDescription>
            Liquidación mensual - Aportes y compensaciones
          </CardDescription>
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
                    <Badge variant={participante.debeRecibir ? "default" : "destructive"}>
                      {participante.debeRecibir ? "Debe recibir" : "Debe aportar"}
                    </Badge>
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
                      <p className={`font-semibold ${participante.debeRecibir ? 'text-success' : 'text-destructive'}`}>
                        {participante.debeRecibir ? '+' : '-'}${participante.montoBalance.toLocaleString('es-AR')}
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

      {/* Leyenda para el gráfico de categorías */}
      {resumenData.dataPieChart.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Leyenda de Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {resumenData.dataPieChart.map((categoria, index) => (
                <div key={categoria.name} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{categoria.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ${categoria.value.toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};