import { useState, useMemo } from 'react';
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
  Button,
  Modal,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Divider,
} from '@mantine/core';
import {
  IconCreditCard,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconAlertCircle,
} from '@tabler/icons-react';

interface CreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  mainCurrency: 'PEN' | 'USD';
  creditLimit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
}

interface CardsViewProps {
  creditCards: CreditCard[];
  setCreditCards: (cards: CreditCard[]) => void;
  transactions: any[];
  getRawAmount: (t: any) => number;
  dashboardCurrency: 'PEN' | 'USD';
  convertAmount: (amount: number, fromCurrency: string, dateStr: string) => number;
}

const COLORS: Record<string, string> = {
  BBVA: 'blue', BCP: 'teal', Interbank: 'orange', 'Banco Falabella': 'violet',
  Scotiabank: 'red', default: 'gray',
};

function getCardColor(name: string): string {
  for (const k of Object.keys(COLORS)) {
    if (name.toLowerCase().includes(k.toLowerCase())) return COLORS[k];
  }
  return COLORS.default;
}

const API_BASE = '/api/creditcards';

export function CardsView({
  creditCards,
  setCreditCards,
  transactions,
  getRawAmount,
  dashboardCurrency,
  convertAmount,
}: CardsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<CreditCard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formLastFour, setFormLastFour] = useState('');
  const [formCurrency, setFormCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [formLimit, setFormLimit] = useState<number | string>(5000);
  const [formClosingDay, setFormClosingDay] = useState<number | string>(20);
  const [formDueDay, setFormDueDay] = useState<number | string>(10);

  // Calcular deudas y saldos dinámicamente según transacciones
  const computedCards = useMemo(() => {
    return creditCards.map((card) => {
      const cardTxs = transactions.filter((t) => t.creditCardId === card.id || t.CreditCardId === card.id);

      // En nuestro sistema, los gastos son montos negativos (ej. -25.90) 
      // y los pagos o transferencias recibidas son positivos (ej. 50.00).
      // Por ende, sumando -t.amount acumulamos la deuda real.
      const usedRaw = cardTxs.reduce((sum, t) => {
        const amt = getRawAmount(t);
        return sum - amt;
      }, 0);

      const limit = Number(card.creditLimit || 0);
      const currentDebt = usedRaw > 0 ? usedRaw : 0;
      const saldoAFavor = usedRaw < 0 ? Math.abs(usedRaw) : 0;
      const availableLimit = limit - currentDebt + saldoAFavor;
      const usedPct = limit > 0 ? Math.min(100, Math.round((currentDebt / limit) * 100)) : 0;

      return {
        ...card,
        currentDebt,
        saldoAFavor,
        availableLimit,
        usedPct,
        transactionsCount: cardTxs.length,
      };
    });
  }, [creditCards, transactions, getRawAmount]);

  // Deuda total consolidada en la divisa del dashboard
  const totalDebtConsolidated = useMemo(() => {
    return computedCards.reduce((sum, c) => {
      const cur = c.mainCurrency;
      // Convertir deuda de la tarjeta a la moneda del dashboard
      const converted = convertAmount(c.currentDebt, cur, new Date().toISOString());
      return sum + converted;
    }, 0);
  }, [computedCards, convertAmount, dashboardCurrency]);

  const openNew = () => {
    setEditCard(null);
    setFormName('');
    setFormLastFour('');
    setFormCurrency('PEN');
    setFormLimit(5000);
    setFormClosingDay(20);
    setFormDueDay(10);
    setModalOpen(true);
  };

  const openEdit = (card: CreditCard) => {
    setEditCard(card);
    setFormName(card.name);
    setFormLastFour(card.lastFourDigits);
    setFormCurrency(card.mainCurrency);
    setFormLimit(card.creditLimit);
    setFormClosingDay(card.closingDay);
    setFormDueDay(card.dueDay);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    const body = {
      name: formName,
      lastFourDigits: formLastFour,
      mainCurrency: formCurrency === 'PEN' ? 0 : 1,
      creditLimit: Number(formLimit),
      availableLimit: Number(formLimit), // Por defecto disponible es igual al límite al crear
      closingDay: Number(formClosingDay),
      dueDay: Number(formDueDay),
      familyId: '00000000-0000-0000-0000-000000000000',
      ownerUserId: '00000000-0000-0000-0000-000000000000',
      institutionId: '10000000-0000-0000-0000-000000000001',
    };

    try {
      if (editCard) {
        const res = await fetch(`${API_BASE}/${editCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const updated = await res.json();
          setCreditCards(creditCards.map(c => c.id === editCard.id ? { ...c, ...normalizeCard(updated) } : c));
        }
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const created = await res.json();
        setCreditCards([...creditCards, normalizeCard(created)]);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    } catch { }
    setCreditCards(creditCards.filter(c => c.id !== id));
    setDeleteId(null);
  };

  function normalizeCard(raw: any): CreditCard {
    return {
      id: raw.id || raw.Id,
      name: raw.name || raw.Name,
      lastFourDigits: raw.lastFourDigits || raw.LastFourDigits || '****',
      mainCurrency: (raw.mainCurrency === 1 || raw.MainCurrency === 1 || raw.mainCurrency === 'USD') ? 'USD' : 'PEN',
      creditLimit: raw.creditLimit ?? raw.CreditLimit ?? 0,
      availableLimit: raw.availableLimit ?? raw.AvailableLimit ?? 0,
      closingDay: raw.closingDay ?? raw.ClosingDay ?? 20,
      dueDay: raw.dueDay ?? raw.DueDay ?? 10,
    };
  }

  const formatValue = (val: number, cur: 'PEN' | 'USD') => {
    return cur === 'PEN'
      ? `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
      : `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDashboardCurrency = (val: number) => {
    return dashboardCurrency === 'PEN'
      ? `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
      : `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Tarjetas de Crédito & Pasivos (Deuda)
          </Title>
          <Text size="sm" c="dimmed">
            Las compras registran deudas en las tarjetas y afectan el presupuesto. Los pagos son transferencias y reducen la deuda sin duplicar gastos.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} color="violet" onClick={openNew}>
          Nueva Tarjeta
        </Button>
      </Group>

      {/* Summary Bar */}
      {computedCards.length > 0 && (
        <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #7c3aed' }}>
          <Group justify="space-between">
            <Group gap="xs">
              <ThemeIcon color="violet" variant="light">
                <IconAlertCircle size={18} />
              </ThemeIcon>
              <Text fw={700} style={{ color: '#f8fafc' }}>Deuda Consolidada Total ({dashboardCurrency})</Text>
            </Group>
            <Title order={3} style={{ color: '#a78bfa' }}>
              {formatDashboardCurrency(totalDebtConsolidated)}
            </Title>
          </Group>
        </Paper>
      )}

      {computedCards.length === 0 ? (
        <Paper p="xl" radius="md" style={{ background: '#1e293b', border: '2px dashed #334155', textAlign: 'center' }}>
          <IconCreditCard size={48} style={{ color: '#475569' }} />
          <Text mt="md" c="dimmed" size="lg">No tienes tarjetas de crédito registradas</Text>
          <Text c="dimmed" size="sm" mb="md">Agrega tu primera tarjeta para controlar tus deudas y presupuestos.</Text>
          <Button leftSection={<IconPlus size={16} />} color="violet" onClick={openNew}>Agregar Tarjeta</Button>
        </Paper>
      ) : (
        <Grid>
          {computedCards.map((card) => {
            const color = getCardColor(card.name);
            const isPen = card.mainCurrency === 'PEN';

            return (
              <Grid.Col key={card.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card p="md" radius="md" style={{ background: '#1e293b', border: `1px solid #334155`, position: 'relative' }}>
                  {/* Header */}
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <ThemeIcon color={color} variant="gradient" gradient={{ from: color, to: 'grape' }} size="lg">
                        <IconCreditCard size={22} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} style={{ color: '#f8fafc' }}>{card.name}</Text>
                        <Text size="xs" c="dimmed">**** **** **** {card.lastFourDigits}</Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge color={isPen ? 'blue' : 'teal'} variant="light" size="sm">
                        {card.mainCurrency}
                      </Badge>
                      <ActionIcon variant="light" color="blue" size="sm" onClick={() => openEdit(card)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon variant="light" color="red" size="sm" onClick={() => setDeleteId(card.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  {/* Usage bar */}
                  <Stack gap="xs" my="sm">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Uso de Línea ({card.usedPct}%)</Text>
                      <Text size="xs" fw={700} c={card.usedPct > 80 ? 'red' : card.usedPct > 50 ? 'orange' : 'teal'}>
                        {formatValue(card.currentDebt, card.mainCurrency)}
                      </Text>
                    </Group>
                    <Progress
                      value={card.usedPct}
                      color={card.usedPct > 80 ? 'red' : card.usedPct > 50 ? 'orange' : 'teal'}
                      radius="xl"
                      size="md"
                      animated={card.usedPct > 80}
                    />
                  </Stack>

                  {/* Details */}
                  <Paper p="xs" radius="sm" style={{ background: '#0f172a' }} mb="xs">
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Línea de Crédito:</Text>
                      <Text size="xs" fw={600}>{formatValue(card.creditLimit, card.mainCurrency)}</Text>
                    </Group>
                    
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Deuda Facturada/Pendiente:</Text>
                      <Text size="xs" fw={700} c={card.currentDebt > 0 ? 'red' : 'dimmed'}>
                        {formatValue(card.currentDebt, card.mainCurrency)}
                      </Text>
                    </Group>

                    {card.saldoAFavor > 0 && (
                      <Group justify="space-between" mb={4}>
                        <Text size="xs" c="dimmed">Saldo a Favor:</Text>
                        <Text size="xs" fw={700} c="green">
                          + {formatValue(card.saldoAFavor, card.mainCurrency)}
                        </Text>
                      </Group>
                    )}

                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Disponible Real:</Text>
                      <Text size="xs" fw={700} c="teal">
                        {formatValue(card.availableLimit, card.mainCurrency)}
                      </Text>
                    </Group>
                  </Paper>

                  <Divider my="xs" label="Parámetros de Facturación" labelPosition="center" />

                  <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Día de Corte:</Text>
                      <Group gap={4}>
                        <IconCalendar size={12} style={{ color: '#94a3b8' }} />
                        <Text size="xs" fw={600}>Día {card.closingDay}</Text>
                      </Group>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Vence el Día:</Text>
                      <Badge color="red" size="xs" variant="light">Día {card.dueDay}</Badge>
                    </Group>
                  </Paper>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCard ? 'Editar Tarjeta de Crédito' : 'Nueva Tarjeta de Crédito'}
        centered
        radius="md"
      >
        <Stack gap="md">
          <TextInput
            label="Nombre de la Tarjeta"
            placeholder="ej. BBVA Mastercard Soles"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <TextInput
            label="Últimos 4 Dígitos"
            placeholder="ej. 5437"
            maxLength={4}
            value={formLastFour}
            onChange={(e) => setFormLastFour(e.target.value)}
            required
          />
          <Select
            label="Moneda Principal"
            data={['PEN', 'USD']}
            value={formCurrency}
            onChange={(v) => setFormCurrency(v as 'PEN' | 'USD')}
            required
          />
          <NumberInput
            label="Línea de Crédito"
            placeholder="0.00"
            value={formLimit}
            onChange={setFormLimit}
            min={0}
            required
          />
          <Group grow>
            <NumberInput
              label="Día de Corte"
              value={formClosingDay}
              onChange={setFormClosingDay}
              min={1}
              max={31}
              required
            />
            <NumberInput
              label="Día de Pago (Vencimiento)"
              value={formDueDay}
              onChange={setFormDueDay}
              min={1}
              max={31}
              required
            />
          </Group>
          <Button color="violet" onClick={handleSave} loading={loading}>
            {editCard ? 'Guardar Cambios' : 'Crear Tarjeta'}
          </Button>
        </Stack>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Confirmar eliminación"
        centered
        size="sm"
      >
        <Text size="sm" mb="md">
          ¿Estás seguro de que deseas eliminar esta tarjeta de crédito? Esta acción no se puede deshacer.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button color="red" onClick={() => deleteId && handleDelete(deleteId)}>Eliminar</Button>
        </Group>
      </Modal>
    </Stack>
  );
}
