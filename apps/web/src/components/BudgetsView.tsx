import {
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Card,
  Grid,
  Progress,
  Paper,
} from '@mantine/core';

export function BudgetsView() {
  const budgets = [
    { id: 1, category: 'Supermercado', executed: 'S/ 1,200.00', limit: 'S/ 1,500.00', pct: 80, color: 'orange' },
    { id: 2, category: 'Combustible & Transporte', executed: 'S/ 270.00', limit: 'S/ 600.00', pct: 45, color: 'teal' },
    { id: 3, category: 'Fotografía & Tecnología', executed: 'S/ 350.00', limit: 'S/ 800.00', pct: 43, color: 'blue' },
    { id: 4, category: 'Streaming & Servicios', executed: 'S/ 89.80', limit: 'S/ 200.00', pct: 44, color: 'violet' },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Presupuestos Mensuales por Categoría
          </Title>
          <Text size="sm" c="dimmed">
            Control de límites de gasto, porcentaje ejecutado y alertas de sobrepresupuesto
          </Text>
        </div>
      </Group>

      <Grid>
        {budgets.map((b) => (
          <Grid.Col key={b.id} span={{ base: 12, md: 6 }}>
            <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Group justify="space-between" mb="xs">
                <Text fw={700} style={{ color: '#f8fafc' }}>{b.category}</Text>
                <Badge color={b.pct >= 80 ? 'orange' : 'teal'} variant="light">
                  {b.pct}% Ejecutado
                </Badge>
              </Group>

              <Progress value={b.pct} color={b.pct >= 80 ? 'orange' : 'teal'} radius="xl" my="md" />

              <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">Gastado Hasta Hoy:</Text>
                  <Text size="xs" fw={700} color={b.pct >= 80 ? 'orange' : 'teal'}>{b.executed}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Límite Asignado:</Text>
                  <Text size="xs" fw={600}>{b.limit}</Text>
                </Group>
              </Paper>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
