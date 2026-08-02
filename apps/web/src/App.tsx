import { useState, useEffect } from 'react';
import { ImportView } from './components/ImportView';
import { AlertsView } from './components/AlertsView';
import { IntegrationsView } from './components/IntegrationsView';
import { AiAssistantView } from './components/AiAssistantView';
import { AuditView } from './components/AuditView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView, normalizeAccount } from './components/AccountsView';
import { CardsView } from './components/CardsView';
import { TransfersView } from './components/TransfersView';
import { ExchangesView } from './components/ExchangesView';
import { BudgetsView } from './components/BudgetsView';
import { GoalsView } from './components/GoalsView';
import { CatalogsView } from './components/CatalogsView';
import { InvestmentsView, normalizeDeposit } from './components/InvestmentsView';
import { LoginView } from './components/LoginView';
import { OnboardingView } from './components/OnboardingView';

// Interceptar fetch para inyectar token JWT automáticamente en todas las peticiones
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const rawToken = localStorage.getItem('kipu_token');
  const token = rawToken && rawToken !== 'undefined' && rawToken !== 'null' ? rawToken.trim() : null;
  
  const newInit = { ...init };
  if (token) {
    let headers: HeadersInit = {};
    if (newInit.headers) {
      if (newInit.headers instanceof Headers) {
        headers = new Headers(newInit.headers);
        headers.set('Authorization', `Bearer ${token}`);
      } else if (Array.isArray(newInit.headers)) {
        headers = [...newInit.headers, ['Authorization', `Bearer ${token}`]];
      } else {
        headers = { ...newInit.headers, 'Authorization': `Bearer ${token}` };
      }
    } else {
      headers = { 'Authorization': `Bearer ${token}` };
    }
    newInit.headers = headers;
  }
  
  const response = await originalFetch(input, newInit);
  
  if (response.status === 401) {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : (input as Request).url);
    const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/register');
    
    if (!isAuthEndpoint && token) {
      localStorage.removeItem('kipu_token');
      localStorage.removeItem('kipu_user');
      localStorage.removeItem('kipu_family');
      window.location.href = '/';
    }
  }
  
  return response;
};
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
  Tooltip,
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
  IconCategory,
  IconEdit,
  IconPigMoney,
} from '@tabler/icons-react';

export function App() {
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('kipu_token');
    return saved && saved !== 'undefined' && saved !== 'null' ? saved.trim() : null;
  });
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('kipu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [family, setFamily] = useState<any>(() => {
    const saved = localStorage.getItem('kipu_family');
    return saved ? JSON.parse(saved) : null;
  });

  const handleAuthSuccess = (newToken: string, newUser: any, newFamily: any) => {
    localStorage.setItem('kipu_token', newToken);
    localStorage.setItem('kipu_user', JSON.stringify(newUser));
    localStorage.setItem('kipu_family', JSON.stringify(newFamily));
    setToken(newToken);
    setUser(newUser);
    setFamily(newFamily);
  };

  const handleLogout = () => {
    localStorage.removeItem('kipu_token');
    localStorage.removeItem('kipu_user');
    localStorage.removeItem('kipu_family');
    setToken(null);
    setUser(null);
    setFamily(null);
  };

  const [activeTab, setActiveTab] = useState('Inicio');
  const [dashboardCurrency, setDashboardCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);



  useEffect(() => {
    fetch('/api/catalogs/exchange-rates')
      .then(res => res.json())
      .then(data => setExchangeRates(data))
      .catch(e => console.error(e));
  }, []);
  const [loadingData, setLoadingData] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);

  const loadUserData = () => {
    if (!token) return;
    setLoadingData(true);
    
    Promise.all([
      fetch('/api/accounts').then(r => r.json()).catch(() => []),
      fetch('/api/creditcards').then(r => r.json()).catch(() => []),
      fetch('/api/transactions').then(r => r.json()).catch(() => []),
      fetch('/api/budgets').then(r => r.json()).catch(() => []),
      fetch('/api/goals').then(r => r.json()).catch(() => []),
      fetch('/api/deposits').then(r => r.json()).catch(() => []),
      fetch('/api/transfers').then(r => r.json()).catch(() => []),
    ]).then(([accountsData, cardsData, txsData, budgetsData, goalsData, depositsData, transfersData]) => {
      setAccounts((accountsData || []).map(normalizeAccount));
      setCreditCards(cardsData || []);
      setTransactions(txsData || []);
      setBudgets(budgetsData || []);
      setGoals(goalsData || []);
      setDeposits((depositsData || []).map(normalizeDeposit));
      setTransfers(transfersData || []);
      setLoadingData(false);
    }).catch(() => {
      setLoadingData(false);
    });
  };;

  useEffect(() => {
    loadUserData();
  }, [token]);

  const [dbStatus, setDbStatus] = useState<{ connected: boolean; status: string; message: string } | null>(null);

  useEffect(() => {
    const checkDb = () => {
      fetch('/api/health/db')
        .then(res => res.json())
        .then(data => setDbStatus(data))
        .catch(() => setDbStatus({ connected: false, status: 'Error', message: 'API no disponible' }));
    };
    checkDb();
    const interval = setInterval(checkDb, 30000); // revisa cada 30s
    return () => clearInterval(interval);
  }, []);

  const handleClearTransactions = () => {
    setTransactions([]);
  };

  const handleImportItems = (newItems: any[]) => {
    setTransactions((prev) => [...newItems, ...prev]);
    setActiveTab('Movimientos');
  };

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

  const accountNames = accounts.map((a: any) => a.name);

  const [editTxId, setEditTxId] = useState<number | null>(null);
  const [editTxType, setEditTxType] = useState<string>('Gasto');
  const [editTxCat, setEditTxCat] = useState<string>('Otros');
  const [editTxOrigin, setEditTxOrigin] = useState<string>('BCP Cuenta Sueldo PEN');
  const [editTxDest, setEditTxDest] = useState<string>('Interbank Cuenta Ahorro PEN');

  const openEditTx = (tx: any) => {
    setEditTxId(tx.id);
    setEditTxType(tx.type?.toUpperCase() || 'GASTO');
    setEditTxCat(tx.cat || 'Varios / Otros');
    if (tx.account?.includes(' ➔ ')) {
       const [orig, dest] = tx.account.split(' ➔ ');
       setEditTxOrigin(orig.trim());
       setEditTxDest(dest.trim());
    } else {
       setEditTxOrigin(tx.account || 'BCP Cuenta Sueldo PEN');
       setEditTxDest('Interbank Cuenta Ahorro PEN');
    }
    setModalType('editTx');
  };

  const handleUpdateTx = () => {
    setTransactions(transactions.map(t => {
      if (t.id === editTxId) {
        const isTransfer = editTxType.includes('TRANSFERENCIA');
        return { 
           ...t, 
           type: editTxType, 
           cat: isTransfer ? 'Transferencia' : editTxCat,
           account: isTransfer ? `${editTxOrigin} ➔ ${editTxDest}` : t.account,
           color: editTxType.includes('GASTO') ? 'red' : editTxType.includes('INGRESO') ? 'green' : editTxType.includes('TRANSFERENCIA') ? 'gray' : 'blue'
        };
      }
      return t;
    }));
    setModalType(null);
  };

  const navItems = [
    { label: 'Inicio', icon: IconLayoutDashboard },
    { label: 'Movimientos', icon: IconReceipt2 },
    { label: 'Cuentas Bancarias', icon: IconBuildingBank },
    { label: 'Tarjetas de Crédito', icon: IconCreditCard },
    { label: 'Inversiones & Plazos', icon: IconPigMoney },
    { label: 'Transferencias', icon: IconArrowsExchange },
    { label: 'Cambio de Moneda', icon: IconCurrencyDollar },
    { label: 'Presupuestos', icon: IconChartPie },
    { label: 'Metas de Ahorro', icon: IconTarget },
    { label: 'Importación & OCR', icon: IconFileSpreadsheet },
    { label: 'Catálogos & Maestras', icon: IconCategory },
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

  // Migration fallback helpers for existing localStorage records without rawAmount/currency
  const getRawAmount = (t: any): number => {
    if (t.rawAmount !== undefined) return t.rawAmount;
    if (!t.amount) return 0;
    const val = parseFloat(t.amount.replace(/[^\d.-]/g, ''));
    return isNaN(val) ? 0 : val;
  };
  
  const getCurrency = (t: any): string => {
    if (t.currency) return t.currency;
    if (!t.amount) return 'PEN';
    if (t.amount.includes('$') || t.amount.includes('USD')) return 'USD';
    return 'PEN';
  };

  const getLatestRate = () => exchangeRates.length > 0 ? exchangeRates[exchangeRates.length - 1] : { buyRate: 3.75, sellRate: 3.80 };
  
  const convertAmount = (amount: number, fromCurrency: string, dateStr: string): number => {
    if (fromCurrency === dashboardCurrency) return amount;
    let rate = getLatestRate();
    if (exchangeRates.length > 0 && dateStr) {
       let matchDate = new Date();
       if (dateStr.includes('/')) {
          const [d, m, y] = dateStr.split('/');
          matchDate = new Date(`${y}-${m}-${d}T00:00:00Z`);
       } else {
          matchDate = new Date(dateStr);
       }
       const found = exchangeRates.find(r => {
          const rd = new Date(r.date);
          return rd.getFullYear() === matchDate.getFullYear() && rd.getMonth() === matchDate.getMonth() && rd.getDate() === matchDate.getDate();
       });
       if (found) rate = found;
    }

    if (fromCurrency === 'USD' && dashboardCurrency === 'PEN') return amount * rate.buyRate;
    if (fromCurrency === 'PEN' && dashboardCurrency === 'USD') return amount / rate.sellRate;
    return amount;
  };

  const convertCurrentBalance = (amount: number, fromCurrency: string): number => {
     if (fromCurrency === dashboardCurrency) return amount;
     const rate = getLatestRate();
     if (fromCurrency === 'USD' && dashboardCurrency === 'PEN') return amount * rate.buyRate;
     if (fromCurrency === 'PEN' && dashboardCurrency === 'USD') return amount / rate.sellRate;
     return amount;
  };

  // Dashboard dynamic calculations (Consolidated)
  const ingresosTotales = transactions
    .filter((t) => getRawAmount(t) > 0)
    .reduce((sum, t) => sum + convertAmount(getRawAmount(t), getCurrency(t), t.date), 0);

  const gastosTotales = transactions
    .filter((t) => getRawAmount(t) < 0)
    .reduce((sum, t) => sum + convertAmount(Math.abs(getRawAmount(t)), getCurrency(t), t.date), 0);

  const patrimonioCuentas = accounts
    .reduce((sum, a) => sum + convertCurrentBalance((a.rawBalance || 0), a.currency), 0);
  
  const patrimonioTransacciones = transactions
    .reduce((sum, t) => sum + convertAmount(getRawAmount(t), getCurrency(t), t.date), 0);

  const patrimonioDeposits = deposits
    .filter((d) => d.status === 'activo' || d.status === 'vencido')
    .reduce((sum, d) => {
      return sum + convertCurrentBalance(d.principal || 0, d.currency);
    }, 0);

  const patrimonioTotal = patrimonioCuentas + patrimonioTransacciones + patrimonioDeposits;

  const totalBudgetLimitOriginal = 12000;
  const totalBudgetLimit = dashboardCurrency === 'PEN' ? totalBudgetLimitOriginal : totalBudgetLimitOriginal / getLatestRate().sellRate;
  const totalBudgetExecutedPct = Math.min(100, Math.round((gastosTotales / totalBudgetLimit) * 100));
  
  const dynamicBudgets = budgets.map((b) => {
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
    const limitConverted = dashboardCurrency === 'PEN' ? limit : limit / getLatestRate().sellRate;
    const pct = limitConverted > 0 ? Math.round((executed / limitConverted) * 100) : 0;
    
    return {
      ...b,
      category: b.categoryName,
      limit: limitConverted,
      executed,
      pct,
      color: pct >= 100 ? 'red' : pct >= 85 ? 'orange' : 'teal'
    };
  });

  const formatCurrency = (val: number) => {
    return dashboardCurrency === 'PEN' 
      ? `S/ ${(val ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
      : `$ ${(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  if (!token) {
    return (
      <MantineProvider defaultColorScheme="dark">
        <LoginView onAuthSuccess={handleAuthSuccess} />
      </MantineProvider>
    );
  }

  if (!loadingData && accounts.length === 0) {
    return (
      <MantineProvider defaultColorScheme="dark">
        <OnboardingView onComplete={loadUserData} />
      </MantineProvider>
    );
  }

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
              {/* DB Status Indicator (Semáforo discreto) */}
              {dbStatus && (
                <Tooltip label={dbStatus.message} position="bottom" withArrow>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: dbStatus.connected ? '#10b981' : '#ef4444',
                      boxShadow: dbStatus.connected 
                        ? '0 0 8px rgba(16, 185, 129, 0.6)' 
                        : '0 0 8px rgba(239, 68, 68, 0.6)',
                      cursor: 'help',
                    }}
                  />
                </Tooltip>
              )}
              <Badge variant="light" color="teal" size="lg" radius="sm">
                Familia: {family?.name || 'Cargando...'}
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
          <Stack justify="space-between" h="100%" gap="xs">
            <Stack gap="xs" style={{ overflowY: 'auto', flex: 1 }}>
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

            {/* Bottom Profile and Logout Section */}
            <Stack gap="xs" style={{ borderTop: '1px solid #334155', paddingTop: '15px' }}>
              <Group gap="xs" px="xs" wrap="nowrap">
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0
                }}>
                  {user?.fullName?.substring(0, 1).toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600} style={{ color: '#f8fafc' }} truncate>{user?.fullName || 'Usuario'}</Text>
                  <Text size="xs" c="dimmed" truncate>{user?.email || ''}</Text>
                </div>
              </Group>
              <Button color="red" variant="subtle" size="xs" onClick={handleLogout} fullWidth>
                Cerrar Sesión
              </Button>
            </Stack>
          </Stack>
        </AppShell.Navbar>

        <AppShell.Main style={{ background: '#090d16', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid p="md">
            {activeTab === 'Movimientos' ? (
              <TransactionsView transactions={transactions} accounts={accounts} creditCards={creditCards} onNewExpense={() => setModalType('expense')} onClearAll={handleClearTransactions} onImportItems={handleImportItems} onEditTx={openEditTx} />
            ) : activeTab === 'Cuentas Bancarias' ? (
              <AccountsView accounts={accounts} setAccounts={setAccounts} onTransfer={() => setModalType('transfer')} onExchange={() => setModalType('exchange')} />
            ) : activeTab === 'Tarjetas de Crédito' ? (
              <CardsView creditCards={creditCards} setCreditCards={setCreditCards} />
            ) : activeTab === 'Inversiones & Plazos' ? (
              <InvestmentsView deposits={deposits} setDeposits={setDeposits} />
            ) : activeTab === 'Transferencias' ? (
              <TransfersView transfers={transfers} accounts={accounts} onTransfer={() => setModalType('transfer')} />
            ) : activeTab === 'Cambio de Moneda' ? (
              <ExchangesView onExchange={() => setModalType('exchange')} />
            ) : activeTab === 'Presupuestos' ? (
              <BudgetsView
                budgets={budgets}
                setBudgets={setBudgets}
                transactions={transactions}
                dashboardCurrency={dashboardCurrency}
                convertAmount={convertAmount}
                getRawAmount={getRawAmount}
                getCurrency={getCurrency}
              />
            ) : activeTab === 'Metas de Ahorro' ? (
              <GoalsView />
            ) : activeTab === 'Importación & OCR' ? (
              <ImportView accounts={accounts} onImportItems={handleImportItems} />
            ) : activeTab === 'Catálogos & Maestras' ? (
              <CatalogsView />
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
                <Group gap="md">
                  <SegmentedControl
                    value={dashboardCurrency}
                    onChange={(val) => setDashboardCurrency(val as 'PEN' | 'USD')}
                    data={[
                      { label: 'Soles (S/)', value: 'PEN' },
                      { label: 'Dólares ($)', value: 'USD' },
                    ]}
                    color="teal"
                  />
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
                        Patrimonio Total ({dashboardCurrency})
                      </Text>
                      <ThemeIcon color="teal" variant="light" size="md">
                        <IconWallet size={18} />
                      </ThemeIcon>
                    </Group>
                    <Title order={2} style={{ color: '#2dd4bf' }}>
                      {formatCurrency(patrimonioTotal)}
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
                        Balance Mensual
                      </Text>
                      <ThemeIcon color="blue" variant="light" size="md">
                        <IconTrendingUp size={18} />
                      </ThemeIcon>
                    </Group>
                    <Title order={2} style={{ color: '#38bdf8' }}>
                      {formatCurrency(ingresosTotales - gastosTotales)}
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Ingresos - Gastos del Mes
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
                      {formatCurrency(ingresosTotales)}
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Consolidado todas las cuentas
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
                      {formatCurrency(gastosTotales)}
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                      Ejecución de presupuesto: {totalBudgetExecutedPct}%
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
                          <Table.Th style={{ width: 40 }}></Table.Th>
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
                            <Table.Td>
                              <ActionIcon variant="subtle" color="gray" onClick={() => openEditTx(tx)}>
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Table.Td>
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
                          {formatCurrency(gastosTotales)} / {formatCurrency(totalBudgetLimit)}
                        </Text>
                      </Group>
                      <Progress value={totalBudgetExecutedPct} color="teal" size="lg" radius="xl" animated mb="md" />

                      <Stack gap="xs">
                        {dynamicBudgets.map((b) => {
                          const pct = Math.min(100, Math.round((b.executed / b.limit) * 100));
                          return (
                            <div key={b.id}>
                              <Group justify="space-between">
                                <Text size="xs">{b.cat} ({pct}%)</Text>
                                <Text size="xs" fw={700} c={b.color}>{formatCurrency(b.executed)} / {formatCurrency(b.limit)}</Text>
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
                        const savedVal = g.savedAmount ?? g.saved ?? 0;
                        const targetVal = g.targetAmount ?? g.target ?? 1;
                        const pct = Math.round((savedVal / targetVal) * 100);
                        const isPen = g.currency === 0 || g.currency === 'PEN';
                        return (
                          <div key={g.id} style={{ marginBottom: 12 }}>
                            <Text size="sm" fw={600} color="teal">{g.name}</Text>
                            <Group justify="space-between" mb={4}>
                              <Text size="xs">Ahorrado: {isPen ? 'S/' : '$'} {(savedVal ?? 0).toLocaleString()}</Text>
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
            <Select label="Cuenta o Tarjeta de Origen" data={accountNames} defaultValue={accountNames[0]} />
            <Button color="teal" fullWidth onClick={handleAddExpense} leftSection={<IconSend size={18} />}>
              Guardar Gasto
            </Button>
          </Stack>
        </Modal>

        {/* MODAL 2: TRANSFERENCIA PROPIA */}
        <Modal opened={modalType === 'transfer'} onClose={() => setModalType(null)} title="Transferir entre Cuentas Propias" centered radius="md">
          <Stack gap="md">
            <Select label="Cuenta Origen" data={accountNames} defaultValue={accountNames[0]} />
            <Select label="Cuenta Destino" data={accountNames} defaultValue={accountNames.length > 1 ? accountNames[1] : accountNames[0]} />
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

        {/* MODAL 4: EDITAR TIPO/CATEGORIA */}
        <Modal opened={modalType === 'editTx'} onClose={() => setModalType(null)} title="Editar Movimiento" centered radius="md">
          <Stack gap="md">
            <Select 
              label="Tipo de Movimiento" 
              data={['GASTO', 'INGRESO', 'TRANSFERENCIA', 'CAMBIO MONEDA']} 
              value={editTxType} 
              onChange={(val) => setEditTxType(val || 'GASTO')} 
              required 
            />
            {editTxType.includes('TRANSFERENCIA') ? (
              <>
                <Select 
                  label="Cuenta Origen" 
                  data={accountNames} 
                  value={editTxOrigin}
                  onChange={(val) => setEditTxOrigin(val || accountNames[0])} 
                  required
                />
                <Select 
                  label="Cuenta Destino" 
                  data={accountNames} 
                  value={editTxDest}
                  onChange={(val) => setEditTxDest(val || accountNames[0])} 
                  required
                />
              </>
            ) : (
              <TextInput 
                label="Categoría" 
                placeholder="ej. Varios / Otros" 
                value={editTxCat} 
                onChange={(e) => setEditTxCat(e.target.value)} 
                required 
              />
            )}
            <Button color="blue" fullWidth onClick={handleUpdateTx} leftSection={<IconEdit size={18} />}>
              Actualizar Movimiento
            </Button>
          </Stack>
        </Modal>

      </AppShell>
    </MantineProvider>
  );
}
