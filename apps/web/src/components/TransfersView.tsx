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
import { IconArrowsExchange, IconInfoCircle } from '@tabler/icons-react';

interface TransfersViewProps {
  onTransfer: () => void;
}

export function TransfersView({ onTransfer }: TransfersViewProps) {
  const transfers = [
    { id: 1, date: '01/08/2026', from: 'BCP Sueldo Soles', to: 'Falabella Ahorro Soles', amount: 'S/ 500.00', status: 'Completado' },
    { id: 2, date: '28/07/2026', from: 'BCP Sueldo Soles', to: 'Billetera Efectivo Soles', amount: 'S/ 200.00', status: 'Completado' },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Transferencias entre Cuentas Propias
          </Title>
          <Text size="sm" c="dimmed">
            Movimientos entre cuentas bancarias y efectivo de la familia
          </Text>
        </div>
        <Button color="blue" leftSection={<IconArrowsExchange size={16} />} onClick={onTransfer}>
          Nueva Transferencia
        </Button>
      </Group>

      <Alert color="blue" icon={<IconInfoCircle size={18} />} title="Regla Financiera del Sistema">
        Las transferencias entre cuentas de la misma familia <b>NO</b> se contabilizan como gastos ni como ingresos. Simplemente reasignan el saldo entre tus instrumentos.
      </Alert>

      <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr style={{ borderColor: '#334155' }}>
              <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Cuenta Origen</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Cuenta Destino</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Monto</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Estado</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {transfers.map((t) => (
              <Table.Tr key={t.id} style={{ borderColor: '#334155' }}>
                <Table.Td>{t.date}</Table.Td>
                <Table.Td><Text size="sm" fw={600}>{t.from}</Text></Table.Td>
                <Table.Td><Text size="sm" fw={600}>{t.to}</Text></Table.Td>
                <Table.Td><Text fw={700} color="blue">{t.amount}</Text></Table.Td>
                <Table.Td><Badge color="green" variant="light">{t.status}</Badge></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
