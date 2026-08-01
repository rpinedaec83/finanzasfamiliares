import {
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
import { IconBuildingBank, IconArrowsExchange } from '@tabler/icons-react';

interface AccountsViewProps {
  onTransfer: () => void;
  onExchange: () => void;
}

export function AccountsView({ onTransfer, onExchange }: AccountsViewProps) {
  const accounts = [
    { id: 1, bank: 'BCP', name: 'BCP Cuenta Sueldo Soles', cci: '002-191-002849182012-52', balance: 'S/ 4,520.50', currency: 'PEN', color: 'blue' },
    { id: 2, bank: 'BBVA', name: 'BBVA Ahorro Dólares', cci: '011-182-000182948192-88', balance: '$ 12,450.00', currency: 'USD', color: 'teal' },
    { id: 3, bank: 'Banco Falabella', name: 'Falabella Ahorro Soles', cci: '089-012-000918273645-12', balance: 'S/ 1,890.00', currency: 'PEN', color: 'green' },
    { id: 4, bank: 'Efectivo', name: 'Billetera Efectivo Soles', cci: 'N/A', balance: 'S/ 350.00', currency: 'PEN', color: 'orange' },
  ];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Cuentas Bancarias & Saldos
          </Title>
          <Text size="sm" c="dimmed">
            Cuentas de débito, ahorro y efectivo registradas en Perú (Soles y Dólares)
          </Text>
        </div>
        <Group gap="xs">
          <Button variant="light" color="teal" leftSection={<IconArrowsExchange size={16} />} onClick={onExchange}>
            Cambio de Moneda
          </Button>
          <Button variant="light" color="blue" leftSection={<IconArrowsExchange size={16} />} onClick={onTransfer}>
            Transferir
          </Button>
        </Group>
      </Group>

      <Grid>
        {accounts.map((acc) => (
          <Grid.Col key={acc.id} span={{ base: 12, md: 6 }}>
            <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Group justify="space-between" mb="xs">
                <Group>
                  <ThemeIcon color={acc.color} variant="light" size="lg">
                    <IconBuildingBank size={22} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} style={{ color: '#f8fafc' }}>{acc.name}</Text>
                    <Text size="xs" c="dimmed">CCI: {acc.cci}</Text>
                  </div>
                </Group>
                <Badge color={acc.currency === 'PEN' ? 'blue' : 'teal'}>{acc.currency}</Badge>
              </Group>

              <Group justify="space-between" mt="md">
                <Text size="xs" c="dimmed">Saldo Disponible:</Text>
                <Title order={3} style={{ color: acc.currency === 'PEN' ? '#38bdf8' : '#2dd4bf' }}>
                  {acc.balance}
                </Title>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
