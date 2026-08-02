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
  Center,
} from '@mantine/core';
import { IconArrowsExchange, IconInfoCircle, IconExchange } from '@tabler/icons-react';

interface TransfersViewProps {
  transfers: any[];
  accounts: any[];
  onTransfer: () => void;
}

export function TransfersView({ transfers, accounts, onTransfer }: TransfersViewProps) {
  const getAccountName = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc) return 'Cuenta Desconocida';
    return `${acc.bankName} - ${acc.name}`;
  };

  const formatAmount = (amount: number, currency: number | string) => {
    const curStr = (currency === 0 || currency === 'PEN') ? 'S/' : '$';
    return `${curStr} ${(amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Transferencias entre Cuentas Propias
          </Title>
          <Text size="sm" c="dimmed">
            Movimientos detectados automáticamente u ordenados entre cuentas de la misma familia
          </Text>
        </div>
        <Button color="blue" leftSection={<IconArrowsExchange size={16} />} onClick={onTransfer}>
          Nueva Transferencia
        </Button>
      </Group>

      <Alert color="blue" icon={<IconInfoCircle size={18} />} title="Regla Financiera del Sistema">
        Las transferencias entre cuentas de la misma familia <b>NO</b> se contabilizan como gastos ni como ingresos. Simplemente reasignan el saldo entre tus instrumentos.
      </Alert>

      {transfers.length === 0 ? (
        <Card p="xl" radius="md" style={{ background: '#1e293b', border: '1px solid #334155', minHeight: 200 }}>
          <Center style={{ height: '100%' }}>
            <Stack align="center" gap="xs">
              <IconExchange size={48} color="#94a3b8" stroke={1.5} />
              <Text fw={700} style={{ color: '#f8fafc' }} size="lg">No hay transferencias registradas</Text>
              <Text size="sm" c="dimmed" style={{ maxWidth: 400, textAlign: 'center' }}>
                No se detectaron transferencias entre tus cuentas en el historial de transacciones. 
                Puedes registrar una manualmente o importar extractos bancarios que las contengan.
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : (
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
                  <Table.Td>{new Date(t.sendDate).toLocaleDateString('es-PE')}</Table.Td>
                  <Table.Td><Text size="sm" fw={600} style={{ color: '#f8fafc' }}>{getAccountName(t.originAccountId)}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={600} style={{ color: '#f8fafc' }}>{getAccountName(t.destinationAccountId)}</Text></Table.Td>
                  <Table.Td><Text fw={700} color="blue">{formatAmount(t.sentAmount, t.sentCurrency)}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={t.status === 'Conciliated' ? 'green' : 'blue'} variant="light">
                      {t.status === 'Conciliated' ? 'Conciliada' : t.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}
