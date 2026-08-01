import { useState } from 'react';
import { ImportView } from './components/ImportView';
import { AlertsView } from './components/AlertsView';
import { IntegrationsView } from './components/IntegrationsView';
import { AiAssistantView } from './components/AiAssistantView';
import { AuditView } from './components/AuditView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView } from './components/AccountsView';
import { CardsView } from './components/CardsView';
import { TransfersView } from './components/TransfersView';
import { ExchangesView } from './components/ExchangesView';
import { BudgetsView } from './components/BudgetsView';
import { GoalsView } from './components/GoalsView';
import {
  MantineProvider,
  AppShell,
  Group,
  Text,
  UnstyledButton,
  Stack,
  Title,
  Grid,
  Card,
  Badge,
  Progress,
  Table,
  ActionIcon,
  Button,
  ThemeIcon,
  Container,
  Paper,
  Modal,
  TextInput,
  NumberInput,
  Select,
  SegmentedControl,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconReceipt2,
  IconBuildingBank,
  IconCreditCard,
  IconArrowsExchange,
  IconCurrencyDollar,
  IconChartPie,
  IconTarget,
  IconFileSpreadsheet,
  IconCloud,
  IconRobot,
  IconBell,
  IconShieldCheck,
  IconPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconSend,
} from '@tabler/icons-react';

export function App() {
  const [activeTab, setActiveTab] = useState('Inicio');

  // Interactive State
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleClearTransactions = () => {
    setTransactions([]);
  };

  const handleImportItems = (newItems: any[]) => {
    setTransactions((prev) => [...newItems, ...prev]);
    setActiveTab('Movimientos');
  };

  const [budgets] = useState([
    { id: 1, cat: 'Supermercado', limit: 1500, executed: 1200, color: 'orange' },
    { id: 2, cat: 'Combustible & Transporte', limit: 600, executed: 270, color: 'teal' },
    { id: 3, cat: 'Fotografía & Tecnología', limit: 800, executed: 350, color: 'blue' },
  ]);

  const [goals] = useState([
    { id: 1, name: 'Lente Fotográfico Sony', target: 7000, saved: 4300, currency: 'PEN' },
    { id: 2, name: 'Fondo de Emergencia USD', target: 10000, saved: 8500, currency: 'USD' },
  ]);

  // Modals state
  const [modalType, setModalType] = useState<string | null>(null);

  // Form Fields
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | string>(0);
  const [expenseCat, setExpenseCat] = useState<string | null>('Supermercado');

  const [transferAmount, setTransferAmount] = useState<number | string>(0);
  const [transferFee, setTransferFee] = useState<number | string>(0);

  const [exchangeType, setExchangeType] = useState('Venta');
  const [deliveredUSD, setDeliveredUSD] = useState<number | string>(1000);
  const [receivedPEN, setReceivedPEN] = useState<number | string>(3755);

  const calculatedRate = Number(deliveredUSD) > 0 ? (Number(receivedPEN) / Number(deliveredUSD)).toFixed(4) : '0.0000';

  const navItems = [
    { label: 'Inicio', icon: IconLayoutDashboard },
    { label: 'Movimientos', icon: IconReceipt2 },
    { label: 'Cuentas Bancarias', icon: IconBuildingBank },
    { label: 'Tarjetas de Crédito', icon: IconCreditCard },
    { label: 'Transferencias', icon: IconArrowsExchange },
    { label: 'Cambio de Moneda', icon: IconCurrencyDollar },
    { label: 'Presupuestos', icon: IconChartPie },
    { label: 'Metas de Ahorro', icon: IconTarget },
    { label: 'Importación & OCR', icon: IconFileSpreadsheet },
    { label: 'Integraciones', icon: IconCloud },
    { label: 'Alertas', icon: IconBell },
    { label: 'Asistente IA', icon: IconRobot },
    { label: 'Auditoría', icon: IconShieldCheck },
  ];

  const handleAddExpense = () => {
    if (!expenseDesc || Number(expenseAmount) <= 0) return;
    const newTx = {
      id: Date.now(),
      date: '01/08/2026',
      desc: expenseDesc,
      cat: expenseCat || 'Otros',
      account: 'BCP Sueldo PEN',
      type: 'Gasto',
      amount: `- S/ ${Number(expenseAmount).toFixed(2)}`,
      color: 'red',
    };
    setTransactions([newTx, ...transactions]);
    setExpenseDesc('');
    setExpenseAmount(0);
    setModalType(null);
  };

  const handleAddTransfer = () => {
    if (Number(transferAmount) <= 0) return;
    const newTx = {
      id: Date.now(),
      date: '01/08/2026',
      desc: `Transferencia Interna (Comisión S/ ${Number(transferFee).toFixed(2)})`,
      cat: 'Transferencia',
      account: 'BCP Sueldo ➔ Interbank Ahorro',
      type: 'Transferencia',
      amount: `S/ ${Number(transferAmount).toFixed(2)}`,
      color: 'gray',
    };
    setTransactions([newTx, ...transactions]);
    setTransferAmount(0);
    setTransferFee(0);
    setModalType(null);
  };

  const handleAddExchange = () => {
    if (Number(deliveredUSD) <= 0 || Number(receivedPEN) <= 0) return;
    const newTx = {
      id: Date.now(),
      date: '01/08/2026',
      desc: `${exchangeType} $${deliveredUSD} USD @ ${calculatedRate}`,
      cat: 'Cambio USD',
      account: 'BBVA USD ➔ BCP PEN',
      type: 'Cambio USD',
      amount: `+ S/ ${Number(receivedPEN).toFixed(2)}`,
      color: 'blue',
    };
    setTransactions([newTx, ...transactions]);
    setModalType(null);
  };

  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell
        header={{ height: 70 }}
        navbar={{ width: 280, breakpoint: 'sm' }}
        padding="md"
      >
        <AppShell.Header style={{ background: '#1e293b', borderColor: '#334155' }}>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <ThemeIcon size="xl" radius="md" variant="gradient" gradient={{ from: 'teal', to: 'lime' }}>
                <IconWallet size={26} />
              </ThemeIcon>
              <div>
                <Title order={3} style={{ color: '#f8fafc', fontWeight: 800 }}>
                  Kipu Finanzas
                </Title>
                <Text size="xs" c="dimmed">
                  Plataforma de Finanzas Familiares
                </Text>
              </div>
            </Group>

            <Group gap="sm">
              <Badge variant="light" color="teal" size="lg" radius="sm">
                Familia: Pineda López
              </Badge>
              <ActionIcon variant="light" color="blue" size="lg" radius="md">
                <IconBell size={20} />
              </ActionIcon>
              <Button leftSection={<IconPlus size={18} />} color="teal" radius="md" onClick={() => setModalType('expense')}>
                Nuevo Gasto
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" style={{ background: '#0f172a', borderColor: '#334155' }}>
          <Stack gap="xs">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm">
              Menú Principal
            </Text>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label;
              return (
                <UnstyledButton
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isActive ? '#1e293b' : 'transparent',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={20} />
                  <Text size="sm">{item.label}</Text>
                </UnstyledButton>
              );
            })}
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main style={{ background: '#090d16', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid p="md">
            {activeTab === 'Movimientos' ? (
              <TransactionsView transactions={transactions} onNewExpense={() => setModalType('expense')} onClearAll={handleClearTransactions} onImportItems={handleImportItems} />
            ) : activeTab === 'Cuentas Bancarias' ? (
              <AccountsView onTransfer={() => setModalType('transfer')} onExchange={() => setModalType('exchange')} />
            ) : activeTab === 'Tarjetas de Crédito' ? (
              <CardsView />
            ) : activeTab === 'Transferencias' ? (
              <TransfersView onTransfer={() => setModalType('transfer')} />
            ) : activeTab === 'Cambio de Moneda' ? (
              <ExchangesView onExchange={() => setModalType('exchange')} />
            ) : activeTab === 'Presupuestos' ? (
              <BudgetsView />
            ) : activeTab === 'Metas de Ahorro' ? (
              <GoalsView />
            ) : activeTab === 'Importación & OCR' ? (
              <ImportView onImportItems={handleImportItems} />
            ) : activeTab === 'Alertas' ? (
              <AlertsView />
            ) : activeTab === 'Integraciones' ? (
              <IntegrationsView />
            ) : activeTab === 'Asistente IA' ? (
              <AiAssistantView />
            ) : activeTab === 'Auditoría' ? (
              <AuditView />
            ) : (
              <Stack gap="lg">
              {/* Header section & Quick Action Buttons */}
              <Group justify="space-between" align="center">
                <div>
                  <Title order={2} style={{ color: '#f8fafc' }}>
                    Dashboard Financiero Familiar
                  </Title>
                </div>
                <Group gap="xs">
                  <Button variant="light" color="gray" leftSection={<IconArrowsExchange size={16} />} onClick={() => setModalType('transfer')}>
                    Transferir
                  </Button>
                  <Button variant="light" color="blue" leftSection={<IconCurrencyDollar size={16} />} onClick={() => setModalType('exchange')}>
                    Cambiar Dólares
                  </Button>
                </Group>
              </Group>

              {/* Financial Metrics Cards */}
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Patrimonio Soles (PEN)
                      </Text>
                      <ThemeIcon color="teal" variant="light" size="md">
                        <IconTrendingUp size={18} />
                      </ThemeIcon>
                    </Group>
                    <Title order={2} style={{ color: '#2dd4bf' }}>
                      S/ 84,520.00
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Sin duplicidad por transferencias
                    </Text>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Patrimonio Dólares (USD)
                      </Text>
                      <ThemeIcon color="blue" variant="light" size="md">
                        <IconCurrencyDollar size={18} />
                      </ThemeIcon>
                    </Group>
                    <Title order={2} style={{ color: '#38bdf8' }}>
                      $ 12,450.00
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Cuentas y Efectivo USD
                    </Text>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Ingresos del Mes
                      </Text>
                      <ThemeIcon color="green" variant="light" size="md">
                        <IconTrendingUp size={18} />
                      </ThemeIcon>
                    </Group>
                    <Title order={2} style={{ color: '#4ade80' }}>
                      S/ 14,200.00
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Sueldos y Honorarios
                    </Text>
                  </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Paper p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                    <Group justify="space-between" mb="xs">
                      <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Gastos del Mes
                      </Text>
                      <ThemeIcon color="red" variant="light" size="md">
                        <IconTrendingDown size={18} />
                      </ThemeIcon>
                    </Group>
                    <Title order={2} style={{ color: '#f87171' }}>
                      S/ 6,840.00
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Ejecución de presupuesto: 57%
                    </Text>
                  </Paper>
                </Grid.Col>
              </Grid>

              {/* Main Dashboard Grid */}
              <Grid>
                {/* Left Side: Recent Transactions */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={700} size="lg" style={{ color: '#f8fafc' }}>
                          Movimientos Recientes
                        </Text>
                        <Text size="xs" c="dimmed">
                          Sin duplicar gastos de tarjetas ni transferencias propias
                        </Text>
                      </div>
                      <Badge color="teal" variant="light">
                        {transactions.length} Registros
                      </Badge>
                    </Group>

                    <Table highlightOnHover verticalSpacing="sm">
                      <Table.Thead>
                        <Table.Tr style={{ borderColor: '#334155' }}>
                          <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                          <Table.Th style={{ color: '#94a3b8' }}>Descripción</Table.Th>
                          <Table.Th style={{ color: '#94a3b8' }}>Cuenta / Banco</Table.Th>
                          <Table.Th style={{ color: '#94a3b8' }}>Tipo</Table.Th>
                          <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Monto</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {transactions.map((tx) => (
                          <Table.Tr key={tx.id} style={{ borderColor: '#334155' }}>
                            <Table.Td>{tx.date}</Table.Td>
                            <Table.Td>
                              <Text fw={600} size="sm">{tx.desc}</Text>
                              <Text size="xs" c="dimmed">{tx.cat}</Text>
                            </Table.Td>
                            <Table.Td>{tx.account}</Table.Td>
                            <Table.Td><Badge color={tx.color} variant="light">{tx.type}</Badge></Table.Td>
                            <Table.Td style={{ textAlign: 'right', fontWeight: 700 }}>{tx.amount}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Card>
                </Grid.Col>

                {/* Right Side: Budget execution & Goal Progress */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack gap="md">
                    {/* Budgets Progress */}
                    <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                      <Group justify="space-between" mb="xs">
                        <Text fw={700} style={{ color: '#f8fafc' }}>
                          Presupuesto de Agosto
                        </Text>
                        <Text size="xs" c="teal" fw={700}>
                          S/ 6,840 / S/ 12,000
                        </Text>
                      </Group>
                      <Progress value={57} color="teal" size="lg" radius="xl" animated mb="md" />

                      <Stack gap="xs">
                        {budgets.map((b) => {
                          const pct = Math.round((b.executed / b.limit) * 100);
                          return (
                            <div key={b.id}>
                              <Group justify="space-between">
                                <Text size="xs">{b.cat} ({pct}%)</Text>
                                <Text size="xs" fw={700} c={b.color}>S/ {b.executed} / S/ {b.limit}</Text>
                              </Group>
                              <Progress value={pct} color={b.color} size="sm" radius="xl" mt={4} />
                            </div>
                          );
                        })}
                      </Stack>
                    </Card>

                    {/* Savings Goal */}
                    <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                      <Group justify="space-between" mb="xs">
                        <Text fw={700} style={{ color: '#f8fafc' }}>
                          Metas de Ahorro
                        </Text>
                        <Badge color="teal">En progreso</Badge>
                      </Group>
                      {goals.map((g) => {
                        const pct = Math.round((g.saved / g.target) * 100);
                        return (
                          <div key={g.id} style={{ marginBottom: 12 }}>
                            <Text size="sm" fw={600} color="teal">{g.name}</Text>
                            <Group justify="space-between" mb={4}>
                              <Text size="xs">Ahorrado: {g.currency === 'PEN' ? 'S/' : '$'} {g.saved.toLocaleString()}</Text>
                              <Text size="xs" fw={700}>{pct}%</Text>
                            </Group>
                            <Progress value={pct} color="blue" size="md" radius="xl" />
                          </div>
                        );
                      })}
                    </Card>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
            )}
          </Container>
        </AppShell.Main>

        {/* MODAL 1: REGISTRAR GASTO */}
        <Modal opened={modalType === 'expense'} onClose={() => setModalType(null)} title="Registrar Nuevo Gasto" centered radius="md">
          <Stack gap="md">
            <TextInput label="Comercio / Descripción" placeholder="ej. Wong, Primax, Netflix" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} required />
            <Select label="Categoría" data={['Supermercado', 'Combustible & Transporte', 'Restaurantes', 'Fotografía & Tecnología', 'Streaming', 'Salud', 'Educación']} value={expenseCat} onChange={setExpenseCat} required />
            <NumberInput label="Monto en Soles (S/)" placeholder="0.00" value={expenseAmount} onChange={setExpenseAmount} min={0} decimalScale={2} required />
            <Select label="Cuenta o Tarjeta de Origen" data={['BCP Cuenta Sueldo PEN', 'Interbank Visa Signature', 'BBVA Ahorro Soles', 'Efectivo Soles']} defaultValue="BCP Cuenta Sueldo PEN" />
            <Button color="teal" fullWidth onClick={handleAddExpense} leftSection={<IconSend size={18} />}>
              Guardar Gasto
            </Button>
          </Stack>
        </Modal>

        {/* MODAL 2: TRANSFERENCIA PROPIA */}
        <Modal opened={modalType === 'transfer'} onClose={() => setModalType(null)} title="Transferir entre Cuentas Propias" centered radius="md">
          <Stack gap="md">
            <Select label="Cuenta Origen" data={['BCP Cuenta Sueldo PEN', 'BBVA Cuenta Ahorro USD', 'Efectivo Soles']} defaultValue="BCP Cuenta Sueldo PEN" />
            <Select label="Cuenta Destino" data={['Interbank Cuenta Ahorro PEN', 'BCP Cuenta Ahorro USD', 'Efectivo Soles']} defaultValue="Interbank Cuenta Ahorro PEN" />
            <NumberInput label="Monto a Transferir" placeholder="0.00" value={transferAmount} onChange={setTransferAmount} min={0} decimalScale={2} required />
            <NumberInput label="Comisión Bancaria (Registrado como único Gasto)" placeholder="0.00" value={transferFee} onChange={setTransferFee} min={0} decimalScale={2} />
            <Text size="xs" c="dimmed">
              * Nota: El capital transferido NO afecta el presupuesto ni duplica el gasto patrimonial.
            </Text>
            <Button color="gray" fullWidth onClick={handleAddTransfer}>
              Ejecutar Transferencia
            </Button>
          </Stack>
        </Modal>

        {/* MODAL 3: CAMBIO DE DÓLARES */}
        <Modal opened={modalType === 'exchange'} onClose={() => setModalType(null)} title="Compra / Venta de Dólares" centered radius="md">
          <Stack gap="md">
            <SegmentedControl value={exchangeType} onChange={setExchangeType} data={[{ label: 'Vender Dólares (USD ➔ PEN)', value: 'Venta' }, { label: 'Comprar Dólares (PEN ➔ USD)', value: 'Compra' }]} fullWidth />
            <NumberInput label={exchangeType === 'Venta' ? 'Monto Dólares Entregados ($)' : 'Monto Soles Entregados (S/)'} value={deliveredUSD} onChange={setDeliveredUSD} min={0} decimalScale={2} />
            <NumberInput label={exchangeType === 'Venta' ? 'Monto Soles Recibidos (S/)' : 'Monto Dólares Recibidos ($)'} value={receivedPEN} onChange={setReceivedPEN} min={0} decimalScale={2} />

            <Paper p="xs" radius="sm" style={{ background: '#0f172a', border: '1px solid #334155' }}>
              <Text size="xs" c="dimmed">Tipo de Cambio Efectivo Real Calculado:</Text>
              <Text fw={700} color="teal" size="lg">S/ {calculatedRate} por $ 1.00 USD</Text>
              <Text size="xs" c="dimmed">TC SUNAT Referencia: S/ 3.754</Text>
            </Paper>

            <Button color="blue" fullWidth onClick={handleAddExchange}>
              Registrar Operación Cambiaria
            </Button>
          </Stack>
        </Modal>

      </AppShell>
    </MantineProvider>
  );
}
