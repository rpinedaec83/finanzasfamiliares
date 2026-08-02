import { useState, useMemo } from 'react';
import {
  Title, Text, Group, Stack, Badge, Card, Grid, ThemeIcon,
  Progress, Paper, Button, Modal, TextInput, NumberInput,
  Select, ActionIcon, Divider, Tooltip,
} from '@mantine/core';
import {
  IconPlus, IconEdit, IconTrash, IconPigMoney, IconCalendar,
  IconTrendingUp, IconCoin, IconCheck,
} from '@tabler/icons-react';

interface FixedDeposit {
  id: string;
  bank: string;
  name: string;
  currency: 'PEN' | 'USD';
  principal: number;       // Capital depositado
  teaPercent: number;      // Tasa Efectiva Anual (%)
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  status: 'activo' | 'vencido' | 'cancelado';
}

interface InvestmentsViewProps {
  deposits: FixedDeposit[];
  setDeposits: (d: FixedDeposit[]) => void;
}

const BANKS = ['BBVA', 'BCP', 'Interbank', 'Banco Falabella', 'Scotiabank', 'CMAC Arequipa', 'BanBif', 'Pichincha'];
const STATUS_COLOR: Record<string, string> = { activo: 'teal', vencido: 'orange', cancelado: 'red' };
const BANK_COLOR: Record<string, string> = {
  BBVA: 'blue', BCP: 'teal', Interbank: 'orange', 'Banco Falabella': 'violet',
  Scotiabank: 'red', 'CMAC Arequipa': 'cyan', BanBif: 'indigo', Pichincha: 'green',
};

function daysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function calcInterest(principal: number, teaPercent: number, startDate: string, endDate: string): number {
  const days = Math.max(0, (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  return principal * (Math.pow(1 + teaPercent / 100, days / 365) - 1);
}

function calcElapsedInterest(principal: number, teaPercent: number, startDate: string): number {
  const days = Math.max(0, (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  return principal * (Math.pow(1 + teaPercent / 100, days / 365) - 1);
}

export function InvestmentsView({ deposits, setDeposits }: InvestmentsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editDeposit, setEditDeposit] = useState<FixedDeposit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form
  const [formBank, setFormBank] = useState('BBVA');
  const [formName, setFormName] = useState('Depósito a Plazo Fijo');
  const [formCurrency, setFormCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [formPrincipal, setFormPrincipal] = useState<number | string>(10000);
  const [formTEA, setFormTEA] = useState<number | string>(6.5);
  const [formStart, setFormStart] = useState(new Date().toISOString().slice(0, 10));
  const [formEnd, setFormEnd] = useState('');
  const [formStatus, setFormStatus] = useState<'activo' | 'vencido' | 'cancelado'>('activo');

  const totalPEN = useMemo(() => deposits.reduce((sum, d) => {
    const rate = d.currency === 'USD' ? 3.4 : 1;
    return sum + d.principal * rate;
  }, 0), [deposits]);

  const totalInterestPEN = useMemo(() => deposits.filter(d => d.status === 'activo').reduce((sum, d) => {
    const interest = calcInterest(d.principal, d.teaPercent, d.startDate, d.endDate);
    return sum + interest * (d.currency === 'USD' ? 3.4 : 1);
  }, 0), [deposits]);

  const openNew = () => {
    setEditDeposit(null);
    setFormBank('BBVA');
    setFormName('Depósito a Plazo Fijo');
    setFormCurrency('PEN');
    setFormPrincipal(10000);
    setFormTEA(6.5);
    setFormStart(new Date().toISOString().slice(0, 10));
    setFormEnd('');
    setFormStatus('activo');
    setModalOpen(true);
  };

  const openEdit = (d: FixedDeposit) => {
    setEditDeposit(d);
    setFormBank(d.bank);
    setFormName(d.name);
    setFormCurrency(d.currency);
    setFormPrincipal(d.principal);
    setFormTEA(d.teaPercent);
    setFormStart(d.startDate);
    setFormEnd(d.endDate);
    setFormStatus(d.status);
    setModalOpen(true);
  };

  const handleSave = () => {
    const item: FixedDeposit = {
      id: editDeposit?.id || crypto.randomUUID(),
      bank: formBank,
      name: formName,
      currency: formCurrency,
      principal: Number(formPrincipal),
      teaPercent: Number(formTEA),
      startDate: formStart,
      endDate: formEnd,
      status: formStatus,
    };
    if (editDeposit) {
      setDeposits(deposits.map(d => d.id === editDeposit.id ? item : d));
    } else {
      setDeposits([...deposits, item]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDeposits(deposits.filter(d => d.id !== id));
    setDeleteId(null);
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>Inversiones & Plazos Fijos</Title>
          <Text size="sm" c="dimmed">
            Control de depósitos a plazo, tasas TEA, proyección de intereses y fechas de vencimiento
          </Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} color="teal" onClick={openNew}>
          + Nuevo Depósito
        </Button>
      </Group>

      {/* Summary */}
      {deposits.length > 0 && (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #0d9488' }}>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">Capital Total (en S/)</Text>
                <ThemeIcon color="teal" variant="light" size="md"><IconCoin size={16} /></ThemeIcon>
              </Group>
              <Title order={3} style={{ color: '#2dd4bf' }}>
                S/ {(totalPEN ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </Title>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #22c55e' }}>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">Interés Proyectado (S/)</Text>
                <ThemeIcon color="green" variant="light" size="md"><IconTrendingUp size={16} /></ThemeIcon>
              </Group>
              <Title order={3} style={{ color: '#4ade80' }}>
                + S/ {(totalInterestPEN ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </Title>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">Depósitos Activos</Text>
                <ThemeIcon color="blue" variant="light" size="md"><IconPigMoney size={16} /></ThemeIcon>
              </Group>
              <Title order={3} style={{ color: '#60a5fa' }}>
                {deposits.filter(d => d.status === 'activo').length} / {deposits.length}
              </Title>
            </Paper>
          </Grid.Col>
        </Grid>
      )}

      {/* Empty state */}
      {deposits.length === 0 ? (
        <Paper p="xl" radius="md" style={{ background: '#1e293b', border: '2px dashed #334155', textAlign: 'center' }}>
          <IconPigMoney size={52} style={{ color: '#475569' }} />
          <Text mt="md" c="dimmed" size="lg">No tienes depósitos a plazo fijo registrados</Text>
          <Text c="dimmed" size="sm" mb="md">Agrega tu primer depósito para visualizar la proyección de intereses</Text>
          <Button leftSection={<IconPlus size={16} />} color="teal" onClick={openNew}>Agregar Depósito</Button>
        </Paper>
      ) : (
        <Grid>
          {deposits.map((d) => {
            const interest = calcInterest(d.principal, d.teaPercent, d.startDate, d.endDate);
            const elapsed = calcElapsedInterest(d.principal, d.teaPercent, d.startDate);
            const totalReturn = d.principal + interest;
            const remaining = daysRemaining(d.endDate);
            const sym = d.currency === 'USD' ? '$' : 'S/';
            const color = BANK_COLOR[d.bank] || 'gray';
            const termDays = Math.max(1, (new Date(d.endDate).getTime() - new Date(d.startDate).getTime()) / (1000 * 60 * 60 * 24));
            const elapsedDays = Math.max(0, (Date.now() - new Date(d.startDate).getTime()) / (1000 * 60 * 60 * 24));
            const progressPct = d.status !== 'activo' ? 100 : Math.min(100, Math.round((elapsedDays / termDays) * 100));
            const progressColor = remaining <= 7 ? 'red' : remaining <= 30 ? 'orange' : 'teal';

            return (
              <Grid.Col key={d.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                  {/* Card Header */}
                  <Group justify="space-between" mb="xs">
                    <Group>
                      <ThemeIcon color={color} variant="gradient" gradient={{ from: color, to: 'teal' }} size="lg">
                        <IconPigMoney size={22} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} style={{ color: '#f8fafc' }}>{d.name}</Text>
                        <Text size="xs" c="dimmed">{d.bank}</Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge color={STATUS_COLOR[d.status]} variant="light" size="sm">{d.status}</Badge>
                      <ActionIcon variant="light" color="blue" size="sm" onClick={() => openEdit(d)}><IconEdit size={14} /></ActionIcon>
                      <ActionIcon variant="light" color="red" size="sm" onClick={() => setDeleteId(d.id)}><IconTrash size={14} /></ActionIcon>
                    </Group>
                  </Group>

                  {/* Progress bar of time elapsed */}
                  <Stack gap={4} my="sm">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Plazo transcurrido ({progressPct}%)</Text>
                      {d.status === 'activo' && remaining > 0 ? (
                        <Tooltip label={`Vence: ${d.endDate}`}>
                          <Badge color={progressColor} size="xs" variant="light">
                            <Group gap={4}>
                              <IconCalendar size={10} />
                              {remaining}d restantes
                            </Group>
                          </Badge>
                        </Tooltip>
                      ) : (
                        <Badge color="orange" size="xs" variant="light"><IconCheck size={10} /> Vencido</Badge>
                      )}
                    </Group>
                    <Progress value={progressPct} color={progressColor} radius="xl" size="md" animated={d.status === 'activo'} />
                  </Stack>

                  <Divider my="xs" color="#334155" />

                  {/* Financial details */}
                  <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Capital Depositado:</Text>
                      <Text size="xs" fw={700}>{sym} {(d.principal ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</Text>
                    </Group>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">TEA:</Text>
                      <Badge color="green" size="xs" variant="light">{d.teaPercent.toFixed(2)}% anual</Badge>
                    </Group>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Interés ganado (est.):</Text>
                      <Text size="xs" fw={600} c="green">+ {sym} {elapsed.toFixed(2)}</Text>
                    </Group>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Interés total al venc.:</Text>
                      <Text size="xs" fw={600} c="teal">+ {sym} {interest.toFixed(2)}</Text>
                    </Group>
                    <Divider my={4} color="#1e293b" />
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed" fw={700}>Total al vencimiento:</Text>
                      <Text size="sm" fw={800} style={{ color: '#2dd4bf' }}>{sym} {(totalReturn ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</Text>
                    </Group>
                    <Group justify="space-between" mt={4}>
                      <Text size="xs" c="dimmed">Periodo:</Text>
                      <Text size="xs">{d.startDate} → {d.endDate}</Text>
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
        title={editDeposit ? 'Editar Depósito a Plazo' : 'Nuevo Depósito a Plazo Fijo'}
        centered radius="md" size="md"
      >
        <Stack gap="md">
          <Select
            label="Banco / Entidad"
            data={BANKS}
            value={formBank}
            onChange={(v) => setFormBank(v || 'BBVA')}
            required
          />
          <TextInput
            label="Nombre / Descripción"
            placeholder="ej. Depósito a Plazo 6 meses BCP"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Select
            label="Moneda"
            data={[{ value: 'PEN', label: 'Soles (S/)' }, { value: 'USD', label: 'Dólares ($)' }]}
            value={formCurrency}
            onChange={(v) => setFormCurrency((v as 'PEN' | 'USD') || 'PEN')}
          />
          <NumberInput
            label="Capital Depositado"
            placeholder="0.00"
            value={formPrincipal}
            onChange={setFormPrincipal}
            min={0}
            decimalScale={2}
            required
          />
          <NumberInput
            label="Tasa Efectiva Anual - TEA (%)"
            placeholder="ej. 6.5"
            value={formTEA}
            onChange={setFormTEA}
            min={0}
            max={100}
            decimalScale={4}
            required
          />
          <Group grow>
            <TextInput
              label="Fecha de Inicio"
              type="date"
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
              required
            />
            <TextInput
              label="Fecha de Vencimiento"
              type="date"
              value={formEnd}
              onChange={(e) => setFormEnd(e.target.value)}
              required
            />
          </Group>
          <Select
            label="Estado"
            data={[
              { value: 'activo', label: 'Activo' },
              { value: 'vencido', label: 'Vencido' },
              { value: 'cancelado', label: 'Cancelado' },
            ]}
            value={formStatus}
            onChange={(v) => setFormStatus((v as any) || 'activo')}
          />

          {/* Live preview */}
          {Number(formPrincipal) > 0 && Number(formTEA) > 0 && formEnd && (
            <Paper p="sm" radius="md" style={{ background: '#0f172a', border: '1px solid #0d9488' }}>
              <Text size="xs" c="dimmed" mb={4}>Proyección de Intereses:</Text>
              <Group justify="space-between">
                <Text size="xs">Interés estimado:</Text>
                <Text size="xs" fw={700} c="teal">
                  {formCurrency === 'USD' ? '$' : 'S/'} {calcInterest(Number(formPrincipal), Number(formTEA), formStart, formEnd).toFixed(2)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="xs">Total al vencimiento:</Text>
                <Text size="sm" fw={800} c="green">
                  {formCurrency === 'USD' ? '$' : 'S/'} {((Number(formPrincipal) || 0) + calcInterest(Number(formPrincipal) || 0, Number(formTEA) || 0, formStart, formEnd)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </Text>
              </Group>
            </Paper>
          )}

          <Button
            color="teal"
            fullWidth
            leftSection={<IconPigMoney size={18} />}
            onClick={handleSave}
            disabled={!formName || !formEnd || !Number(formPrincipal)}
          >
            {editDeposit ? 'Actualizar Depósito' : 'Crear Depósito a Plazo'}
          </Button>
        </Stack>
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal
        opened={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Eliminar Depósito"
        centered size="sm" radius="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">¿Seguro que deseas eliminar este depósito? Esta acción no se puede deshacer.</Text>
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
