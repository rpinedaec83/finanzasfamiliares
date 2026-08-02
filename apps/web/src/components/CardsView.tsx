import { useState } from 'react';
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

export function CardsView({ creditCards, setCreditCards }: CardsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<CreditCard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formLastFour, setFormLastFour] = useState('');
  const [formCurrency, setFormCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [formLimit, setFormLimit] = useState<number | string>(5000);
  const [formAvailable, setFormAvailable] = useState<number | string>(5000);
  const [formClosingDay, setFormClosingDay] = useState<number | string>(20);
  const [formDueDay, setFormDueDay] = useState<number | string>(10);

  const openNew = () => {
    setEditCard(null);
    setFormName('');
    setFormLastFour('');
    setFormCurrency('PEN');
    setFormLimit(5000);
    setFormAvailable(5000);
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
    setFormAvailable(card.availableLimit);
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
      availableLimit: Number(formAvailable),
      closingDay: Number(formClosingDay),
      dueDay: Number(formDueDay),
      familyId: '00000000-0000-0000-0000-000000000000',
      ownerUserId: '00000000-0000-0000-0000-000000000000',
      institutionId: '10000000-0000-0000-0000-000000000001',
    };

    try {
      if (editCard) {
        // UPDATE
        const res = await fetch(`${API_BASE}/${editCard.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const updated = await res.json();
          setCreditCards(creditCards.map(c => c.id === editCard.id ? { ...c, ...normalizeCard(updated) } : c));
        } else {
          // fallback update local
          setCreditCards(creditCards.map(c => c.id === editCard.id ? { ...c, name: formName, lastFourDigits: formLastFour, mainCurrency: formCurrency, creditLimit: Number(formLimit), availableLimit: Number(formAvailable), closingDay: Number(formClosingDay), dueDay: Number(formDueDay) } : c));
        }
      } else {
        // CREATE
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const created = await res.json();
        setCreditCards([...creditCards, normalizeCard(created)]);
      }
    } catch {
      // fallback
      if (!editCard) {
        const tempId = crypto.randomUUID();
        setCreditCards([...creditCards, { id: tempId, name: formName, lastFourDigits: formLastFour, mainCurrency: formCurrency, creditLimit: Number(formLimit), availableLimit: Number(formAvailable), closingDay: Number(formClosingDay), dueDay: Number(formDueDay) }]);
      }
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

  const totalDebt = creditCards.reduce((sum, c) => {
    const limit = c.creditLimit ?? 0;
    const avail = c.availableLimit ?? 0;
    const used = limit - avail;
    return sum + (c.mainCurrency === 'USD' ? used * 3.4 : used);
  }, 0);

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
        <Button leftSection={<IconPlus size={18} />} color="violet" onClick={openNew}>
          + Nueva Tarjeta
        </Button>
      </Group>

      {/* Summary Bar */}
      {creditCards.length > 0 && (
        <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #7c3aed' }}>
          <Group justify="space-between">
            <Group gap="xs">
              <ThemeIcon color="violet" variant="light">
                <IconAlertCircle size={18} />
              </ThemeIcon>
              <Text fw={700} style={{ color: '#f8fafc' }}>Deuda Total Estimada en Soles</Text>
            </Group>
            <Title order={3} style={{ color: '#a78bfa' }}>
              S/ {totalDebt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </Title>
          </Group>
        </Paper>
      )}

      {creditCards.length === 0 ? (
        <Paper p="xl" radius="md" style={{ background: '#1e293b', border: '2px dashed #334155', textAlign: 'center' }}>
          <IconCreditCard size={48} style={{ color: '#475569' }} />
          <Text mt="md" c="dimmed" size="lg">No tienes tarjetas de crédito registradas</Text>
          <Text c="dimmed" size="sm" mb="md">Agrega tu primera tarjeta para controlar tus líneas de crédito y deudas</Text>
          <Button leftSection={<IconPlus size={16} />} color="violet" onClick={openNew}>Agregar Tarjeta</Button>
        </Paper>
      ) : (
        <Grid>
          {creditCards.map((card) => {
            const limit = card.creditLimit ?? 0;
            const avail = card.availableLimit ?? 0;
            const used = limit - avail;
            const usedPct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
            const color = getCardColor(card.name);
            const sym = card.mainCurrency === 'USD' ? '$' : 'S/';

            return (
              <Grid.Col key={card.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card p="md" radius="md" style={{ background: '#1e293b', border: `1px solid #334155`, position: 'relative' }}>
                  {/* Header */}
                  <Group justify="space-between" mb="xs">
                    <Group>
                      <ThemeIcon color={color} variant="gradient" gradient={{ from: color, to: 'grape' }} size="lg">
                        <IconCreditCard size={22} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} style={{ color: '#f8fafc' }}>{card.name}</Text>
                        <Text size="xs" c="dimmed">**** **** **** {card.lastFourDigits}</Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge color={card.mainCurrency === 'USD' ? 'teal' : 'blue'} variant="light" size="sm">
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
                      <Text size="xs" c="dimmed">Consumo utilizado ({usedPct}%)</Text>
                      <Text size="xs" fw={700} c={usedPct > 80 ? 'red' : usedPct > 50 ? 'orange' : 'teal'}>
                        {sym} {used.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </Text>
                    </Group>
                    <Progress
                      value={usedPct}
                      color={usedPct > 80 ? 'red' : usedPct > 50 ? 'orange' : 'teal'}
                      radius="xl"
                      size="md"
                      animated={usedPct > 80}
                    />
                  </Stack>

                  {/* Details */}
                  <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Línea Total:</Text>
                      <Text size="xs" fw={600}>{sym} {(card.creditLimit ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</Text>
                    </Group>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Disponible:</Text>
                      <Text size="xs" fw={600} c="teal">{sym} {(card.availableLimit ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</Text>
                    </Group>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Fecha de Corte:</Text>
                      <Group gap={4}>
                        <IconCalendar size={12} style={{ color: '#94a3b8' }} />
                        <Text size="xs" fw={600}>Día {card.closingDay}</Text>
                      </Group>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Fecha de Pago:</Text>
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
            onChange={(e) => setFormLastFour(e.target.value.replace(/\D/g, ''))}
            required
          />
          <Select
            label="Moneda Principal"
            data={[{ value: 'PEN', label: 'Soles (S/)' }, { value: 'USD', label: 'Dólares ($)' }]}
            value={formCurrency}
            onChange={(v) => setFormCurrency((v as 'PEN' | 'USD') || 'PEN')}
            required
          />
          <NumberInput
            label="Línea de Crédito Total"
            placeholder="0.00"
            value={formLimit}
            onChange={setFormLimit}
            min={0}
            decimalScale={2}
            required
          />
          <NumberInput
            label="Disponible Actual"
            placeholder="0.00"
            value={formAvailable}
            onChange={setFormAvailable}
            min={0}
            decimalScale={2}
            required
          />
          <Group grow>
            <NumberInput
              label="Día de Corte"
              placeholder="20"
              value={formClosingDay}
              onChange={setFormClosingDay}
              min={1}
              max={31}
              required
            />
            <NumberInput
              label="Día de Pago"
              placeholder="10"
              value={formDueDay}
              onChange={setFormDueDay}
              min={1}
              max={31}
              required
            />
          </Group>
          <Button
            color="violet"
            fullWidth
            loading={loading}
            leftSection={<IconCreditCard size={18} />}
            onClick={handleSave}
            disabled={!formName || !formLastFour}
          >
            {editCard ? 'Actualizar Tarjeta' : 'Crear Tarjeta'}
          </Button>
        </Stack>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      <Modal
        opened={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Eliminar Tarjeta de Crédito"
        centered
        size="sm"
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            ¿Estás seguro de que deseas eliminar esta tarjeta? Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button color="red" leftSection={<IconTrash size={16} />} onClick={() => deleteId && handleDelete(deleteId)}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
