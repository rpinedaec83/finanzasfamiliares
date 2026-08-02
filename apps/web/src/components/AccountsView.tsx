import { useState } from 'react';
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
  Modal,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
} from '@mantine/core';
import { IconBuildingBank, IconArrowsExchange, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

export interface AccountItem {
  id: any;
  bank: string;
  name: string;
  cci: string;
  rawBalance: number;
  currency: 'PEN' | 'USD';
  color: string;
}

export function normalizeAccount(raw: any): AccountItem {
  let bankColor = 'blue';
  const bank = raw.bankName || raw.BankName || 'Efectivo';
  if (bank === 'BBVA') bankColor = 'teal';
  if (bank === 'Banco Falabella' || bank === 'Interbank' || bank === 'Falabella') bankColor = 'green';
  if (bank === 'Efectivo') bankColor = 'orange';

  return {
    id: raw.id || raw.Id,
    bank: bank,
    name: raw.name || raw.Name || '',
    cci: raw.cciNumber || raw.CciNumber || 'N/A',
    rawBalance: raw.balanceAvailable !== undefined ? raw.balanceAvailable : (raw.BalanceAvailable !== undefined ? raw.BalanceAvailable : 0),
    currency: raw.currency === 0 || raw.currency === 'PEN' || raw.Currency === 0 || raw.Currency === 'PEN' ? 'PEN' : 'USD',
    color: bankColor
  };
}

interface AccountsViewProps {
  accounts: AccountItem[];
  setAccounts: (accounts: AccountItem[]) => void;
  onTransfer: () => void;
  onExchange: () => void;
}

export function AccountsView({ accounts, setAccounts, onTransfer, onExchange }: AccountsViewProps) {

  // Modal State
  const [modalOpened, setModalOpened] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);

  // Form Fields
  const [bank, setBank] = useState<string>('BCP');
  const [name, setName] = useState('');
  const [cci, setCci] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');

  const handleOpenCreate = () => {
    setEditingId(null);
    setBank('BCP');
    setName('');
    setCci('');
    setBalance(0);
    setCurrency('PEN');
    setModalOpened(true);
  };

  const handleOpenEdit = (acc: AccountItem) => {
    setEditingId(acc.id);
    setBank(acc.bank);
    setName(acc.name);
    setCci(acc.cci);
    setBalance(acc.rawBalance);
    setCurrency(acc.currency);
    setModalOpened(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const body = {
      bankName: bank,
      name,
      cciNumber: cci || 'N/A',
      balanceAvailable: Number(balance),
      balanceBook: Number(balance),
      currency: currency === 'PEN' ? 0 : 1,
      type: bank === 'Efectivo' ? 5 : 1, // 5 = CashPEN, 1 = Savings
      lastFourDigits: cci.trim().slice(-4) || '0000',
      isIncludedInNetWorth: true
    };

    try {
      if (editingId !== null) {
        // UPDATE
        const res = await fetch(`/api/accounts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, id: editingId }),
        });
        if (res.ok) {
          const updated = await res.json();
          setAccounts(accounts.map(a => a.id === editingId ? normalizeAccount(updated) : a));
        } else {
          // fallback
          let bankColor = 'blue';
          if (bank === 'BBVA') bankColor = 'teal';
          if (bank === 'Banco Falabella' || bank === 'Interbank' || bank === 'Falabella') bankColor = 'green';
          if (bank === 'Efectivo') bankColor = 'orange';
          setAccounts(accounts.map(a => a.id === editingId ? { ...a, bank, name, cci: cci || 'N/A', rawBalance: Number(balance), currency, color: bankColor } : a));
        }
      } else {
        // CREATE
        const res = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const created = await res.json();
          setAccounts([...accounts, normalizeAccount(created)]);
        }
      }
    } catch (e) {
      console.error("Error saving account:", e);
      // fallback
      if (editingId === null) {
        let bankColor = 'blue';
        if (bank === 'BBVA') bankColor = 'teal';
        if (bank === 'Banco Falabella' || bank === 'Interbank' || bank === 'Falabella') bankColor = 'green';
        if (bank === 'Efectivo') bankColor = 'orange';
        setAccounts([...accounts, { id: crypto.randomUUID() as any, bank, name, cci: cci || 'N/A', rawBalance: Number(balance), currency, color: bankColor }]);
      }
    }

    setModalOpened(false);
  };

  const handleDelete = async (id: any) => {
    if (confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) {
      try {
        await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error("Error deleting account:", e);
      }
      setAccounts(accounts.filter((a) => a.id !== id));
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Cuentas Bancarias & Saldos
          </Title>
          <Text size="sm" c="dimmed">
            Gestión completa (CRUD) de cuentas de débito, ahorro y efectivo (Soles y Dólares)
          </Text>
        </div>
        <Group gap="xs">
          <Button variant="light" color="teal" leftSection={<IconArrowsExchange size={16} />} onClick={onExchange}>
            Cambio de Moneda
          </Button>
          <Button variant="light" color="blue" leftSection={<IconArrowsExchange size={16} />} onClick={onTransfer}>
            Transferir
          </Button>
          <Button color="blue" leftSection={<IconPlus size={16} />} onClick={handleOpenCreate}>
            + Nueva Cuenta
          </Button>
        </Group>
      </Group>

      <Grid>
        {accounts.map((acc) => {
          const formattedVal = acc.currency === 'PEN'
            ? `S/ ${(acc.rawBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            : `$ ${(acc.rawBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

          return (
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
                  <Group gap="xs">
                    <Badge color={acc.currency === 'PEN' ? 'blue' : 'teal'}>{acc.currency}</Badge>
                    <ActionIcon variant="subtle" color="gray" onClick={() => handleOpenEdit(acc)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(acc.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Group justify="space-between" mt="md">
                  <Text size="xs" c="dimmed">Saldo Disponible:</Text>
                  <Title order={3} style={{ color: acc.currency === 'PEN' ? '#38bdf8' : '#2dd4bf' }}>
                    {formattedVal}
                  </Title>
                </Group>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>

      {/* MODAL CREAR / EDITAR CUENTA */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingId ? 'Editar Cuenta Bancaria' : 'Crear Nueva Cuenta Bancaria'}
        centered
        radius="md"
      >
        <Stack gap="md">
          <Select
            label="Banco / Entidad Financiera"
            data={['BCP', 'BBVA', 'Interbank', 'Banco Falabella', 'Scotiabank', 'BanBif', 'Pichincha', 'Efectivo']}
            value={bank}
            onChange={(v) => setBank(v || 'BCP')}
          />
          <TextInput
            label="Nombre de la Cuenta"
            placeholder="ej. BCP Cuenta Sueldo Soles"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextInput
            label="Número de Cuenta / CCI"
            placeholder="ej. 002-191-002849182012-52"
            value={cci}
            onChange={(e) => setCci(e.target.value)}
          />
          <Group grow>
            <Select
              label="Moneda"
              data={[
                { value: 'PEN', label: 'Soles (PEN)' },
                { value: 'USD', label: 'Dólares (USD)' },
              ]}
              value={currency}
              onChange={(v) => setCurrency((v as 'PEN' | 'USD') || 'PEN')}
            />
            <NumberInput
              label="Saldo Inicial / Disponible"
              value={balance}
              onChange={(v) => setBalance(Number(v) || 0)}
              prefix={currency === 'PEN' ? 'S/ ' : '$ '}
              decimalScale={2}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setModalOpened(false)}>
              Cancelar
            </Button>
            <Button color="blue" onClick={handleSave}>
              {editingId ? 'Guardar Cambios' : 'Crear Cuenta'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
