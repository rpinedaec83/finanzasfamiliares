import { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Card,
  Grid,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconBuildingBank,
  IconChartPie,
} from '@tabler/icons-react';

export function AlertsView() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'Presupuesto al 80%: Supermercado',
      message: 'Has consumido S/ 1,200.00 de S/ 1,500.00 asignados para la categoría Supermercado en Agosto.',
      severity: 'warning',
      cat: 'Presupuesto',
      date: 'Hace 2 horas',
      read: false,
    },
    {
      id: 2,
      title: 'Próximo Vencimiento: Tarjeta BCP Signature',
      message: 'El pago total de tu tarjeta BCP vence en 5 días (10 de Agosto). Pago sugerido: S/ 1,840.00.',
      severity: 'info',
      cat: 'Tarjeta',
      date: 'Hace 5 horas',
      read: false,
    },
    {
      id: 3,
      title: 'Alerta de Depósito a Plazo Fijo',
      message: 'Tu depósito a plazo fijo de S/ 20,000.00 en BCP vence el 15 de Agosto. Recuerda registrar manualmente los intereses recibidos.',
      severity: 'info',
      cat: 'Depósito a Plazo',
      date: 'Ayer',
      read: true,
    },
  ]);

  const handleDismiss = (id: number) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Centro de Alertas & Recordatorios Financieros
          </Title>
          <Text size="sm" c="dimmed">
            Notificaciones automáticas de presupuestos, tarjetas, ingresos esperados y vencimientos
          </Text>
        </div>
        <Badge color="red" size="lg" variant="filled">
          {alerts.filter((a) => !a.read).length} Notificaciones Pendientes
        </Badge>
      </Group>

      <Grid>
        {/* Left Side: Active Alerts */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {alerts.map((alert) => (
              <Paper
                key={alert.id}
                p="md"
                radius="md"
                style={{
                  background: alert.read ? '#1e293b' : '#0f172a',
                  border: alert.read ? '1px solid #334155' : '1px solid #f59e0b',
                  opacity: alert.read ? 0.75 : 1,
                }}
              >
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Group gap="sm">
                    <ThemeIcon
                      color={alert.severity === 'warning' ? 'orange' : alert.severity === 'critical' ? 'red' : 'blue'}
                      variant="light"
                      size="lg"
                    >
                      {alert.severity === 'warning' ? <IconAlertTriangle size={20} /> : <IconInfoCircle size={20} />}
                    </ThemeIcon>
                    <div>
                      <Text fw={700} style={{ color: '#f8fafc' }}>
                        {alert.title}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {alert.cat} • {alert.date}
                      </Text>
                    </div>
                  </Group>
                  {!alert.read && (
                    <Button variant="subtle" color="gray" size="xs" onClick={() => handleDismiss(alert.id)}>
                      Marcar Leída
                    </Button>
                  )}
                </Group>
                <Text size="sm" c="dimmed">
                  {alert.message}
                </Text>
              </Paper>
            ))}
          </Stack>
        </Grid.Col>

        {/* Right Side: Threshold Summary */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Group mb="sm">
                <IconChartPie size={20} color="#38bdf8" />
                <Text fw={700} style={{ color: '#f8fafc' }}>
                  Reglas de Alertas Activas
                </Text>
              </Group>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Presupuesto al 80%:</Text>
                  <Badge color="orange" variant="light">Activo</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Tarjeta al 70% de Línea:</Text>
                  <Badge color="yellow" variant="light">Activo</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Aviso de Pago (5 días antes):</Text>
                  <Badge color="blue" variant="light">Activo</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Ingreso Esperado Faltante:</Text>
                  <Badge color="red" variant="light">Activo (+3 días)</Badge>
                </Group>
              </Stack>
            </Card>

            <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Group mb="sm">
                <IconBuildingBank size={20} color="#2dd4bf" />
                <Text fw={700} style={{ color: '#f8fafc' }}>
                  Depósitos a Plazo Fijo
                </Text>
              </Group>
              <Text size="xs" c="dimmed" mb="xs">
                Regla: El interés devengado se registra de forma estrictamente manual.
              </Text>
              <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                <Group justify="space-between">
                  <Text size="xs" fw={600}>BCP Soles 6.50%</Text>
                  <Text size="xs" color="teal" fw={700}>S/ 20,000</Text>
                </Group>
                <Text size="xs" c="dimmed">Vence: 15/08/2026 (Int. Esperado: S/ 650.00)</Text>
              </Paper>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
