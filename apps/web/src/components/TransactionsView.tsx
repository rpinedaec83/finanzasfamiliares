import { useState } from 'react';
import {
  Title,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Table,
  Card,
  TextInput,
  Select,
} from '@mantine/core';
import { IconSearch, IconFilter, IconPlus } from '@tabler/icons-react';

interface TransactionItem {
  id: number;
  date: string;
  desc: string;
  cat: string;
  account: string;
  type: string;
  amount: string;
  color: string;
}

interface TransactionsViewProps {
  transactions: TransactionItem[];
  onNewExpense: () => void;
}

export function TransactionsView({ transactions, onNewExpense }: TransactionsViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = transactions.filter((tx) => {
    const matchesSearch = tx.desc.toLowerCase().includes(search.toLowerCase()) || tx.account.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryFilter || tx.cat === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Historial de Movimientos & Transacciones
          </Title>
          <Text size="sm" c="dimmed">
            Registro consolidado de ingresos, gastos, transferencias y cambios de divisas
          </Text>
        </div>
        <Button color="red" leftSection={<IconPlus size={16} />} onClick={onNewExpense}>
          Registrar Gasto
        </Button>
      </Group>

      <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <Group mb="md" justify="space-between">
          <Group style={{ flexGrow: 1 }}>
            <TextInput
              placeholder="Buscar por descripción o cuenta..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flexGrow: 1 }}
            />
            <Select
              placeholder="Filtrar por categoría"
              leftSection={<IconFilter size={16} />}
              data={['Supermercado', 'Combustible', 'Tecnología', 'Streaming', 'Transferencia', 'Cambio Moneda']}
              value={categoryFilter}
              onChange={setCategoryFilter}
              clearable
            />
          </Group>
        </Group>

        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr style={{ borderColor: '#334155' }}>
              <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Descripción</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Categoría</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Cuenta / Origen</Table.Th>
              <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Monto</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((tx) => (
              <Table.Tr key={tx.id} style={{ borderColor: '#334155' }}>
                <Table.Td>{tx.date}</Table.Td>
                <Table.Td>
                  <Text fw={600} size="sm">{tx.desc}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color="gray" variant="light">{tx.cat}</Badge>
                </Table.Td>
                <Table.Td style={{ color: '#94a3b8' }}>{tx.account}</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text fw={700} color={tx.color === 'red' ? 'red' : tx.color === 'teal' ? 'teal' : tx.color === 'blue' ? 'blue' : 'violet'}>
                    {tx.amount}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
