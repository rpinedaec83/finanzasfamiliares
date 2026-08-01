import { useState } from 'react';
import {
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Table,
  Card,
} from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';

export function AuditView() {
  const [logs] = useState([
    {
      id: 1,
      user: 'rpineda@x-codec.net',
      action: 'BANK_IMPORT',
      entity: 'DocumentImport',
      details: 'Importación de PDF BCP Soles con cuadre de saldos 100%.',
      time: 'Hace 10 min',
      badge: 'green',
    },
    {
      id: 2,
      user: 'rpineda@x-codec.net',
      action: 'CURRENCY_EXCHANGE',
      entity: 'CurrencyExchangeOperation',
      details: 'Venta de $1,000 USD a TC efectivo S/ 3.755 (Rextie).',
      time: 'Hace 30 min',
      badge: 'blue',
    },
    {
      id: 3,
      user: 'rpineda@x-codec.net',
      action: 'LOGIN',
      entity: 'User',
      details: 'Inicio de sesión exitoso con JWT.',
      time: 'Hace 45 min',
      badge: 'teal',
    },
  ]);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Registro de Auditoría & Trazabilidad
          </Title>
          <Text size="sm" c="dimmed">
            Bitácora inmutable de inicios de sesión, cambios de configuración, transacciones e importaciones
          </Text>
        </div>
        <Badge color="teal" size="lg" variant="light" leftSection={<IconShieldCheck size={16} />}>
          Seguridad & Auditoría Inmutable
        </Badge>
      </Group>

      <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr style={{ borderColor: '#334155' }}>
              <Table.Th style={{ color: '#94a3b8' }}>Hora</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Usuario</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Acción Registrada</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Entidad</Table.Th>
              <Table.Th style={{ color: '#94a3b8' }}>Detalles / Cambios</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.map((log) => (
              <Table.Tr key={log.id} style={{ borderColor: '#334155' }}>
                <Table.Td>{log.time}</Table.Td>
                <Table.Td>
                  <Text fw={600} size="sm">{log.user}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={log.badge} variant="light">{log.action}</Badge>
                </Table.Td>
                <Table.Td>{log.entity}</Table.Td>
                <Table.Td style={{ color: '#cbd5e1' }}>{log.details}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}
