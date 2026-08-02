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
  ActionIcon,
  Divider,
  Center,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconReceipt2, IconAlertTriangle } from '@tabler/icons-react';

interface BudgetsViewProps {
  budgets: any[];
  setBudgets: (b: any[]) => void;
  transactions: any[];
  dashboardCurrency: 'PEN' | 'USD';
  convertAmount: (amount: number, fromCurrency: string, dateStr: string) => number;
  getRawAmount: (t: any) => number;
  getCurrency: (t: any) => string;
}

const CATEGORIES = [
  'Supermercado',
  'Combustible & Transporte',
  'Restaurantes',
  'Fotografía & Tecnología',
  'Streaming & Servicios',
  'Salud',
  'Educación',
  'Otros',
];

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export function BudgetsView({
  budgets,
  setBudgets,
  transactions,
  dashboardCurrency,
  convertAmount,
  getRawAmount,
  getCurrency,
}: BudgetsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState<string | null>('Supermercado');
  const [formLimit, setFormLimit] = useState<number | string>(1000);
  const [formMonth, setFormMonth] = useState<string>('8');
  const [formYear, setFormYear] = useState<number | string>(2026);

  // Calcular la ejecución dinámica de transacciones de egreso para cada categoría en el mes y año asignado
  const computedBudgets = useMemo(() => {
    return budgets.map((b) => {
      // Filtrar egresos de la categoría para el mes/año del presupuesto
      const executed = transactions
        .filter((t) => {
          const rawAmount = getRawAmount(t);
          if (rawAmount >= 0) return false;

          const isCategoryMatch =
            t.cat === b.categoryName ||
            t.cat?.includes(b.categoryName) ||
            t.category === b.categoryName ||
            t.category?.includes(b.categoryName);

          if (!isCategoryMatch) return false;

          let txMonth = 8;
          let txYear = 2026;
          if (t.date) {
            if (t.date.includes('/')) {
              const parts = t.date.split('/');
              txMonth = parseInt(parts[1], 10);
              txYear = parseInt(parts[2], 10);
            } else {
              const dt = new Date(t.date);
              txMonth = dt.getMonth() + 1;
              txYear = dt.getFullYear();
            }
          }

          return txMonth === b.month && txYear === b.year;
        })
        .reduce((sum, t) => sum + convertAmount(Math.abs(getRawAmount(t)), getCurrency(t), t.date), 0);

      const limit = Number(b.limitAmount || b.limit || 0);
      const pct = limit > 0 ? Math.round((executed / limit) * 100) : 0;

      return {
        ...b,
        limit,
        executed,
        pct,
      };
    });
  }, [budgets, transactions, dashboardCurrency, convertAmount, getRawAmount, getCurrency]);

  const openNew = () => {
    setEditingBudget(null);
    setFormCategory('Supermercado');
    setFormLimit(1000);
    setFormMonth('8');
    setFormYear(2026);
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditingBudget(b);
    setFormCategory(b.categoryName);
    setFormLimit(b.limitAmount);
    setFormMonth(String(b.month));
    setFormYear(b.year);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formCategory || Number(formLimit) <= 0) return;

    const payload = {
      categoryName: formCategory,
      limitAmount: Number(formLimit),
      executedAmount: 0,
      month: Number(formMonth),
      year: Number(formYear),
    };

    try {
      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : '/api/budgets';
      const method = editingBudget ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al guardar presupuesto');
      }

      const savedData = await response.json();

      if (editingBudget) {
        setBudgets(budgets.map((b) => (b.id === editingBudget.id ? savedData : b)));
      } else {
        setBudgets([...budgets, savedData]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar presupuesto');
      }
      setBudgets(budgets.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatAmount = (val: number) => {
    return dashboardCurrency === 'PEN'
      ? `S/ ${(val ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
      : `$ ${(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Presupuestos Mensuales por Categoría
          </Title>
          <Text size="sm" c="dimmed">
            Control de límites de gasto, porcentaje ejecutado y alertas de sobrepresupuesto en tiempo real
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} color="teal" onClick={openNew}>
          Nuevo Presupuesto
        </Button>
      </Group>

      {computedBudgets.length === 0 ? (
        <Card p="xl" radius="md" style={{ background: '#1e293b', border: '1px solid #334155', minHeight: 220 }}>
          <Center style={{ height: '100%' }}>
            <Stack align="center" gap="xs">
              <IconReceipt2 size={48} color="#94a3b8" stroke={1.5} />
              <Text fw={700} style={{ color: '#f8fafc' }} size="lg">No hay presupuestos configurados</Text>
              <Text size="sm" c="dimmed" style={{ maxWidth: 400, textAlign: 'center' }}>
                Crea límites de gastos mensuales para controlar tus finanzas de acuerdo a tus categorías favoritas.
              </Text>
              <Button size="xs" color="teal" onClick={openNew} mt="xs">
                Asignar Primer Presupuesto
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Grid>
          {computedBudgets.map((b) => {
            const isOverBudget = b.pct > 100;
            const progressColor = b.pct >= 100 ? 'red' : b.pct >= 85 ? 'orange' : 'teal';

            return (
              <Grid.Col key={b.id} span={{ base: 12, md: 6 }}>
                <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155', position: 'relative' }}>
                  <Group justify="space-between" mb="xs">
                    <div>
                      <Text fw={700} style={{ color: '#f8fafc' }}>{b.categoryName}</Text>
                      <Text size="xs" c="dimmed">{MONTHS.find(m => m.value === String(b.month))?.label} {b.year}</Text>
                    </div>
                    <Group gap="xs">
                      <Badge color={progressColor} variant="light">
                        {b.pct}% Ejecutado
                      </Badge>
                      <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => openEdit(b)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(b.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Progress value={Math.min(100, b.pct)} color={progressColor} radius="xl" my="md" />

                  <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs" c="dimmed">Gastado Hasta Hoy:</Text>
                      <Text size="xs" fw={700} color={progressColor}>{formatAmount(b.executed)}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Límite Asignado:</Text>
                      <Text size="xs" fw={600}>{formatAmount(b.limit)}</Text>
                    </Group>
                  </Paper>

                  {isOverBudget && (
                    <Group gap={6} mt="xs" style={{ color: '#f87171' }}>
                      <IconAlertTriangle size={14} />
                      <Text size="xs" fw={600}>¡Has superado el presupuesto establecido!</Text>
                    </Group>
                  )}
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'} centered radius="md">
        <Stack gap="md">
          <Select label="Categoría" data={CATEGORIES} value={formCategory} onChange={setFormCategory} required />
          <NumberInput label="Límite Mensual" placeholder="0.00" value={formLimit} onChange={setFormLimit} min={1} required />
          
          <Group grow>
            <Select label="Mes" data={MONTHS} value={formMonth} onChange={(val) => setFormMonth(val || '8')} required />
            <NumberInput label="Año" placeholder="2026" value={formYear} onChange={setFormYear} min={2020} max={2100} required />
          </Group>

          <Divider my="xs" />
          
          <Button color="teal" fullWidth onClick={handleSave}>
            {editingBudget ? 'Guardar Cambios' : 'Crear Presupuesto'}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
