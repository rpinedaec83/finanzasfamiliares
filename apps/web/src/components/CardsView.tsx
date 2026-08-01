import {
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Card,
  Grid,
  ThemeIcon,
  Progress,
  Paper,
} from '@mantine/core';
import { IconCreditCard } from '@tabler/icons-react';

export function CardsView() {
  const cards = [
    {
      id: 1,
      name: 'BCP Visa Signature',
      num: '**** **** **** 4819',
      limit: 'S/ 15,000.00',
      available: 'S/ 11,200.00',
      used: 'S/ 3,800.00',
      usedPct: 25,
      cutoff: '20 de cada mes',
      duedate: '10 de Agosto',
      color: 'blue',
    },
    {
      id: 2,
      name: 'Interbank Black USD',
      num: '**** **** **** 9012',
      limit: '$ 5,000.00',
      available: '$ 4,250.00',
      used: '$ 750.00',
      usedPct: 15,
      cutoff: '15 de cada mes',
      duedate: '05 de Agosto',
      color: 'violet',
    },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Tarjetas de Crédito & Pasivos
          </Title>
          <Text size="sm" c="dimmed">
            Control de líneas de crédito, consumo acumulado, fechas de corte y límites de pago
          </Text>
        </div>
      </Group>

      <Grid>
        {cards.map((card) => (
          <Grid.Col key={card.id} span={{ base: 12, md: 6 }}>
            <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Group justify="space-between" mb="xs">
                <Group>
                  <ThemeIcon color={card.color} variant="light" size="lg">
                    <IconCreditCard size={22} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} style={{ color: '#f8fafc' }}>{card.name}</Text>
                    <Text size="xs" c="dimmed">{card.num}</Text>
                  </div>
                </Group>
                <Badge color={card.color} variant="light">Activa</Badge>
              </Group>

              <Stack gap="xs" my="md">
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Consumo Utilizado ({card.usedPct}%):</Text>
                  <Text size="xs" fw={700} color="orange">{card.used}</Text>
                </Group>
                <Progress value={card.usedPct} color="orange" radius="xl" />
              </Stack>

              <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">Línea Total:</Text>
                  <Text size="xs" fw={600}>{card.limit}</Text>
                </Group>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">Disponible:</Text>
                  <Text size="xs" fw={600} color="teal">{card.available}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Fecha de Pago:</Text>
                  <Badge color="red" size="xs" variant="light">{card.duedate}</Badge>
                </Group>
              </Paper>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
