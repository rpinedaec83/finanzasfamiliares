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

export function GoalsView() {
  const goals = [
    { id: 1, name: 'Lente Fotográfico Sony 24-70mm f/2.8', saved: 'S/ 4,300.00', target: 'S/ 7,000.00', pct: 61, currency: 'PEN', color: 'blue' },
    { id: 2, name: 'Fondo de Emergencia Familiar USD', saved: '$ 8,500.00', target: '$ 10,000.00', pct: 85, currency: 'USD', color: 'teal' },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Metas de Ahorro & Objetivos Financieros
          </Title>
          <Text size="sm" c="dimmed">
            Seguimiento de acumulación de fondos para proyectos y compras planificadas
          </Text>
        </div>
      </Group>

      <Grid>
        {goals.map((g) => (
          <Grid.Col key={g.id} span={{ base: 12, md: 6 }}>
            <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Group justify="space-between" mb="xs">
                <Text fw={700} style={{ color: '#f8fafc' }}>{g.name}</Text>
                <Badge color={g.color} variant="light">{g.pct}% Alcanzado</Badge>
              </Group>

              <Progress value={g.pct} color={g.color} radius="xl" my="md" />

              <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">Acumulado Actual:</Text>
                  <Text size="xs" fw={700} color={g.currency === 'PEN' ? 'blue' : 'teal'}>{g.saved}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Objetivo Meta:</Text>
                  <Text size="xs" fw={600}>{g.target}</Text>
                </Group>
              </Paper>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
