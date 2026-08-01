import {
  Title,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Table,
  Card,
  Alert,
} from '@mantine/core';
import { IconCurrencyDollar, IconInfoCircle } from '@tabler/icons-react';

interface ExchangesViewProps {
  onExchange: () => void;
}

export function ExchangesView({ onExchange }: ExchangesViewProps) {
  const exchanges = [
    { id: 1, date: '01/08/2026', type: 'Venta USD', usd: '$ 1,000.00', pen: 'S/ 3,755.00', rate: '3.7550', sunat: '3.7520', entity: 'Rextie' },
    { id: 2, date: '15/07/2026', type: 'Compra USD', usd: '$ 500.00', pen: 'S/ 1,885.00', rate: '3.7700', sunat: '3.7650', entity: 'TKambyo' },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Cambio de Moneda & Tipo de Cambio Efectivo
          </Title>
          <Text size="sm" c="dimmed">
            Operaciones de compra y venta PEN / USD con registro del Tipo de Cambio Real (PEN / USD)
          </Text>
        </div>
        <Button color="teal" leftSection={<IconCurrencyDollar size={16} />} onClick={onExchange}>
          Nuevo Cambio de Moneda
        </Button>
      </Group>

      <Alert color="teal" icon={<IconInfoCircle size={18} />} title="Regla del Tipo de Cambio Efectivo">
        Cada transacción de cambio utiliza el Tipo de Cambio Efectivo Real de la operación (Monto PEN / Monto USD), guardando el TC oficial SUNAT como referencia analítica.
      </Alert>

      <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr style={{ borderColor: '#334155' }}>
              <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Operación</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Casa / Banco</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>USD Entregado/Recibido</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>PEN Equivalente</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>TC Efectivo</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>TC SUNAT Ref.</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {exchanges.map((e) => (
              <Table.Tr key={e.id} style={{ borderColor: '#334155' }}>
                <Table.Td>{e.date}</Table.Td>
                <Table.Td><Badge color="violet">{e.type}</Badge></Table.Td>
                <Table.Td><Text size="sm" fw={600}>{e.entity}</Text></Table.Td>
                <Table.Td><Text fw={700} color="teal">{e.usd}</Text></Table.Td>
                <Table.Td><Text fw={700} color="blue">{e.pen}</Text></Table.Td>
                <Table.Td><Badge color="teal" variant="light">{e.rate}</Badge></Table.Td>
                <Table.Td style={{ color: '#94a3b8' }}>{e.sunat}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
