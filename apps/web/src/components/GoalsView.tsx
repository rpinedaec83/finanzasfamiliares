import { useState, useMemo } from 'react';
import {
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Card,
  Grid,
  Progress,
  Paper,
  Button,
  Modal,
  Select,
  NumberInput,
  TextInput,
  ActionIcon,
  Divider,
  Center,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconEdit, IconTrash, IconTarget, IconCalendar } from '@tabler/icons-react';

interface GoalsViewProps {
  goals: any[];
  setGoals: (g: any[]) => void;
  transactions: any[];
  dashboardCurrency: 'PEN' | 'USD';
  convertAmount: (amount: number, fromCurrency: string, dateStr: string) => number;
  getRawAmount: (t: any) => number;
  getCurrency: (t: any) => string;
}

export function GoalsView({
  goals,
  setGoals,
  transactions,
  dashboardCurrency,
  convertAmount,
  getRawAmount,
  getCurrency,
}: GoalsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState<number | string>(1000);
  const [formCurrency, setFormCurrency] = useState<string>('PEN');
  const [formDate, setFormDate] = useState<Date | null>(new Date());

  // Calcular el ahorro real sumando todas las transacciones vinculadas a cada meta
  const computedGoals = useMemo(() => {
    return goals.map((g) => {
      // Filtrar transacciones vinculadas a esta meta
      const goalTxs = transactions.filter((t) => {
        return t.savingsGoalId === g.id || t.SavingsGoalId === g.id;
      });

      // Sumar los montos. Las transferencias o gastos destinados al ahorro se suman como valor positivo.
      const saved = goalTxs.reduce((sum, t) => {
        const rawAmt = getRawAmount(t);
        const amt = Math.abs(rawAmt);
        return sum + convertAmount(amt, getCurrency(t), t.date || t.operationDate);
      }, 0);

      const target = Number(g.targetAmount || g.target || 0);
      const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

      return {
        ...g,
        saved,
        target,
        pct,
      };
    });
  }, [goals, transactions, dashboardCurrency, convertAmount, getRawAmount, getCurrency]);

  const openNew = () => {
    setEditingGoal(null);
    setFormName('');
    setFormTarget(1000);
    setFormCurrency(dashboardCurrency);
    setFormDate(new Date());
    setModalOpen(true);
  };

  const openEdit = (g: any) => {
    setEditingGoal(g);
    setFormName(g.name);
    setFormTarget(g.targetAmount);
    setFormCurrency(g.currency === 0 || g.currency === 'PEN' ? 'PEN' : 'USD');
    setFormDate(g.targetDate ? new Date(g.targetDate) : new Date());
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName || Number(formTarget) <= 0 || !formDate) return;

    const payload = {
      name: formName,
      targetAmount: Number(formTarget),
      savedAmount: 0,
      currency: formCurrency === 'PEN' ? 0 : 1, // 0 = PEN, 1 = USD
      targetDate: formDate.toISOString(),
    };

    try {
      const url = editingGoal ? `/api/goals/${editingGoal.id}` : '/api/goals';
      const method = editingGoal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al guardar meta');
      }

      const savedData = await response.json();

      if (editingGoal) {
        setGoals(goals.map((g) => (g.id === editingGoal.id ? savedData : g)));
      } else {
        setGoals([...goals, savedData]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar meta');
      }
      setGoals(goals.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatAmount = (val: number, cur: any) => {
    const isPen = cur === 0 || cur === 'PEN';
    return isPen
      ? `S/ ${(val ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
      : `$ ${(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Metas de Ahorro & Objetivos Financieros
          </Title>
          <Text size="sm" c="dimmed">
            Seguimiento de fondos para proyectos, compras planificadas o fondos de emergencia
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} color="teal" onClick={openNew}>
          Nueva Meta
        </Button>
      </Group>

      {computedGoals.length === 0 ? (
        <Card p="xl" radius="md" style={{ background: '#1e293b', border: '1px solid #334155', minHeight: 220 }}>
          <Center style={{ height: '100%' }}>
            <Stack align="center" gap="xs">
              <IconTarget size={48} color="#94a3b8" stroke={1.5} />
              <Text fw={700} style={{ color: '#f8fafc' }} size="lg">No hay metas financieras</Text>
              <Text size="sm" c="dimmed" style={{ maxWidth: 400, textAlign: 'center' }}>
                Define tus objetivos de ahorro y asocia transacciones para ver tu progreso.
              </Text>
              <Button size="xs" color="teal" onClick={openNew} mt="xs">
                Crear Primera Meta
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Grid>
          {computedGoals.map((g) => {
            const progressColor = g.pct >= 100 ? 'green' : g.pct >= 50 ? 'blue' : 'teal';
            const curStr = g.currency === 0 || g.currency === 'PEN' ? 'PEN' : 'USD';

            return (
              <Grid.Col key={g.id} span={{ base: 12, md: 6 }}>
                <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                  <Group justify="space-between" mb="xs">
                    <div>
                      <Text fw={700} style={{ color: '#f8fafc' }}>{g.name}</Text>
                      <Text size="xs" c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconCalendar size={12} />
                        Meta: {g.targetDate ? new Date(g.targetDate).toLocaleDateString('es-PE') : 'Sin fecha'}
                      </Text>
                    </div>
                    <Group gap="xs">
                      <Badge color={progressColor} variant="light">
                        {g.pct}% Completado
                      </Badge>
                      <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => openEdit(g)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(g.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Progress value={g.pct} color={progressColor} radius="xl" my="md" />

                  <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Acumulado Real (de movimientos vinculados):</Text>
                      <Text size="xs" fw={700} color={progressColor}>{formatAmount(g.saved, curStr)}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Monto Objetivo:</Text>
                      <Text size="xs" fw={600}>{formatAmount(g.target, curStr)}</Text>
                    </Group>
                  </Paper>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editingGoal ? 'Editar Meta de Ahorro' : 'Nueva Meta de Ahorro'} centered radius="md">
        <Stack gap="md">
          <TextInput label="Nombre del Objetivo" placeholder="Ej: Comprar Laptop, Fondo de Emergencia" value={formName} onChange={(e) => setFormName(e.target.value)} required />
          
          <Group grow>
            <NumberInput label="Monto Objetivo" placeholder="0.00" value={formTarget} onChange={setFormTarget} min={1} required />
            <Select label="Moneda" data={['PEN', 'USD']} value={formCurrency} onChange={(val) => setFormCurrency(val || 'PEN')} required />
          </Group>

          <DateInput label="Fecha Límite" placeholder="Selecciona una fecha" value={formDate} onChange={setFormDate} required />

          <Divider my="xs" />
          
          <Button color="teal" fullWidth onClick={handleSave}>
            {editingGoal ? 'Guardar Cambios' : 'Crear Meta'}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
