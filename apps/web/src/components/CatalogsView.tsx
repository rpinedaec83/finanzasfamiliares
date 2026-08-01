import { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Card,
  Table,
  Tabs,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  Switch,
} from '@mantine/core';
import {
  IconCategory,
  IconBuildingBank,
  IconSparkles,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCurrencyDollar,
  IconDownload,
} from '@tabler/icons-react';

interface CategoryCatalogItem {
  id: number;
  name: string;
  type: 'Expense' | 'Income' | 'Transfer';
  color: string;
  active: boolean;
}

interface BankCatalogItem {
  id: number;
  name: string;
  code: string;
  country: string;
  active: boolean;
}

interface AiRuleItem {
  id: number;
  pattern: string;
  normalizedMerchant: string;
  category: string;
}

interface ExchangeRateItem {
  id: string;
  date: string;
  buyRate: number;
  sellRate: number;
}

export function CatalogsView() {
  const [activeTab, setActiveTab] = useState<string | null>('categories');

  // 1. Categories State with localStorage Persistence
  const [categories, setCategories] = useState<CategoryCatalogItem[]>(() => {
    const saved = localStorage.getItem('kipu_catalog_categories');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, name: 'Supermercado & Víveres', type: 'Expense', color: 'orange', active: true },
      { id: 2, name: 'Combustible & Transporte', type: 'Expense', color: 'teal', active: true },
      { id: 3, name: 'Tecnología & Equipos', type: 'Expense', color: 'blue', active: true },
      { id: 4, name: 'Streaming & Servicios Digitales', type: 'Expense', color: 'violet', active: true },
      { id: 5, name: 'Sueldo & Honorarios', type: 'Income', color: 'green', active: true },
      { id: 6, name: 'Comisiones & Impuestos', type: 'Expense', color: 'red', active: true },
      { id: 7, name: 'Transferencia entre Cuentas', type: 'Transfer', color: 'cyan', active: true },
    ];
  });

  // 2. Banks State with localStorage Persistence
  const [banks, setBanks] = useState<BankCatalogItem[]>(() => {
    const saved = localStorage.getItem('kipu_catalog_banks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, name: 'Banco de Crédito del Perú (BCP)', code: 'BCP', country: 'Perú 🇵🇪', active: true },
      { id: 2, name: 'BBVA Perú', code: 'BBVA', country: 'Perú 🇵🇪', active: true },
      { id: 3, name: 'Interbank', code: 'IBK', country: 'Perú 🇵🇪', active: true },
      { id: 4, name: 'Banco Falabella', code: 'FALABELLA', country: 'Perú 🇵🇪', active: true },
      { id: 5, name: 'Scotiabank Perú', code: 'SCOTIA', country: 'Perú 🇵🇪', active: true },
      { id: 6, name: 'Billetera Efectivo', code: 'CASH', country: 'Perú 🇵🇪', active: true },
    ];
  });

  // 3. AI Rules State with localStorage Persistence
  const [aiRules, setAiRules] = useState<AiRuleItem[]>(() => {
    const saved = localStorage.getItem('kipu_catalog_airules');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, pattern: 'PLAYSTATION', normalizedMerchant: 'PlayStation Store', category: 'Streaming & Servicios Digitales' },
      { id: 2, pattern: 'SPOTIFY', normalizedMerchant: 'Spotify Premium', category: 'Streaming & Servicios Digitales' },
      { id: 3, pattern: 'OPENAI', normalizedMerchant: 'OpenAI ChatGPT Subscription', category: 'Tecnología & Equipos' },
      { id: 4, pattern: 'WONG', normalizedMerchant: 'Supermercados Wong', category: 'Supermercado & Víveres' },
    ];
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRateItem[]>([]);
  const [loadingSync, setLoadingSync] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('8'); // Agosto por defecto en 2026
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const formatDateIgnoreTimezone = (dateStr: string) => {
    if (!dateStr) return '';
    // Obtener la parte YYYY-MM-DD
    const dateOnly = dateStr.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      // Retorna formato DD/MM/YYYY
      return `${parseInt(parts[2])}/${parseInt(parts[1])}/${parts[0]}`;
    }
    return new Date(dateStr).toLocaleDateString();
  };

  const fetchExchangeRates = () => {
    fetch(`/api/catalogs/exchange-rates?month=${selectedMonth}&year=${selectedYear}`)
      .then(res => res.json())
      .then(data => setExchangeRates(data))
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchExchangeRates();
  }, [selectedMonth, selectedYear]);

  const handleSyncSUNAT = async () => {
    setLoadingSync(true);
    try {
      const res = await fetch('/api/catalogs/sync-exchange-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: Number(selectedMonth), year: Number(selectedYear) })
      });
      if (res.ok) {
        fetchExchangeRates();
        alert(`Tipos de cambio para ${selectedMonth}/${selectedYear} sincronizados exitosamente.`);
      }
    } catch (e) {
      console.error(e);
      alert('Error sincronizando SUNAT');
    }
    setLoadingSync(false);
  };

  useEffect(() => {
    localStorage.setItem('kipu_catalog_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kipu_catalog_banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('kipu_catalog_airules', JSON.stringify(aiRules));
  }, [aiRules]);

  // Modal States
  const [catModalOpened, setCatModalOpened] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'Expense' | 'Income' | 'Transfer'>('Expense');
  const [catColor, setCatColor] = useState('blue');

  const [bankModalOpened, setBankModalOpened] = useState(false);
  const [editingBankId, setEditingBankId] = useState<number | null>(null);
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');

  const [ruleModalOpened, setRuleModalOpened] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [rulePattern, setRulePattern] = useState('');
  const [ruleMerchant, setRuleMerchant] = useState('');
  const [ruleCat, setRuleCat] = useState('');

  // Category Handlers
  const handleSaveCategory = () => {
    if (!catName.trim()) return;
    if (editingCatId !== null) {
      setCategories(categories.map((c) => c.id === editingCatId ? { ...c, name: catName, type: catType, color: catColor } : c));
    } else {
      setCategories([...categories, { id: Date.now(), name: catName, type: catType, color: catColor, active: true }]);
    }
    setCatModalOpened(false);
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm('¿Desea eliminar esta categoría del catálogo?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  // Bank Handlers
  const handleSaveBank = () => {
    if (!bankName.trim()) return;
    if (editingBankId !== null) {
      setBanks(banks.map((b) => b.id === editingBankId ? { ...b, name: bankName, code: bankCode } : b));
    } else {
      setBanks([...banks, { id: Date.now(), name: bankName, code: bankCode || bankName.substring(0, 4).toUpperCase(), country: 'Perú 🇵🇪', active: true }]);
    }
    setBankModalOpened(false);
  };

  const handleDeleteBank = (id: number) => {
    if (confirm('¿Desea eliminar esta entidad financiera del catálogo?')) {
      setBanks(banks.filter((b) => b.id !== id));
    }
  };

  // AI Rule Handlers
  const handleSaveRule = () => {
    if (!rulePattern.trim() || !ruleMerchant.trim()) return;
    if (editingRuleId !== null) {
      setAiRules(aiRules.map((r) => r.id === editingRuleId ? { ...r, pattern: rulePattern, normalizedMerchant: ruleMerchant, category: ruleCat } : r));
    } else {
      setAiRules([...aiRules, { id: Date.now(), pattern: rulePattern.toUpperCase(), normalizedMerchant: ruleMerchant, category: ruleCat || 'General' }]);
    }
    setRuleModalOpened(false);
  };

  const handleDeleteRule = (id: number) => {
    if (confirm('¿Desea eliminar esta regla de clasificación IA?')) {
      setAiRules(aiRules.filter((r) => r.id !== id));
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Mantenedor de Catálogos & Maestras
          </Title>
          <Text size="sm" c="dimmed">
            Administración completa (CRUD) de Categorías, Bancos y Reglas de Inteligencia Artificial
          </Text>
        </div>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
        <Tabs.List style={{ borderColor: '#334155' }}>
          <Tabs.Tab value="categories" leftSection={<IconCategory size={16} />}>
            Categorías ({categories.length})
          </Tabs.Tab>
          <Tabs.Tab value="banks" leftSection={<IconBuildingBank size={16} />}>
            Entidades Financieras ({banks.length})
          </Tabs.Tab>
          <Tabs.Tab value="airules" leftSection={<IconSparkles size={16} />}>
            Reglas de IA & Normalización ({aiRules.length})
          </Tabs.Tab>
          <Tabs.Tab value="exchangerates" leftSection={<IconCurrencyDollar size={16} />}>
            Tipos de Cambio SUNAT
          </Tabs.Tab>
        </Tabs.List>

        {/* TAB 1: CATEGORÍAS */}
        <Tabs.Panel value="categories" pt="md">
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Group justify="space-between" mb="md">
              <Text fw={700} style={{ color: '#f8fafc' }}>Catálogo de Categorías Financieras</Text>
              <Button color="blue" leftSection={<IconPlus size={16} />} onClick={() => { setEditingCatId(null); setCatName(''); setCatType('Expense'); setCatColor('blue'); setCatModalOpened(true); }}>
                + Nueva Categoría
              </Button>
            </Group>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr style={{ borderColor: '#334155' }}>
                  <Table.Th style={{ color: '#94a3b8' }}>Nombre de Categoría</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Tipo de Movimiento</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Estado</Table.Th>
                  <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {categories.map((c) => (
                  <Table.Tr key={c.id} style={{ borderColor: '#334155' }}>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge color={c.color} variant="dot" size="lg" />
                        <Text fw={600} size="sm">{c.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={c.type === 'Expense' ? 'red' : c.type === 'Income' ? 'green' : 'blue'} variant="light">
                        {c.type === 'Expense' ? 'Gasto' : c.type === 'Income' ? 'Ingreso' : 'Transferencia'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Switch
                        checked={c.active}
                        onChange={(e) => setCategories(categories.map((item) => item.id === c.id ? { ...item, active: e.currentTarget.checked } : item))}
                        label={c.active ? 'Activo' : 'Inactivo'}
                        color="teal"
                      />
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Group justify="flex-end" gap="xs">
                        <ActionIcon variant="subtle" color="gray" onClick={() => { setEditingCatId(c.id); setCatName(c.name); setCatType(c.type); setCatColor(c.color); setCatModalOpened(true); }}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteCategory(c.id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        {/* TAB 2: ENTIDADES FINANCIERAS */}
        <Tabs.Panel value="banks" pt="md">
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Group justify="space-between" mb="md">
              <Text fw={700} style={{ color: '#f8fafc' }}>Catálogo de Bancos e Instituciones</Text>
              <Button color="blue" leftSection={<IconPlus size={16} />} onClick={() => { setEditingBankId(null); setBankName(''); setBankCode(''); setBankModalOpened(true); }}>
                + Nuevo Banco
              </Button>
            </Group>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr style={{ borderColor: '#334155' }}>
                  <Table.Th style={{ color: '#94a3b8' }}>Institución Financiera</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Código Interno</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>País</Table.Th>
                  <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {banks.map((b) => (
                  <Table.Tr key={b.id} style={{ borderColor: '#334155' }}>
                    <Table.Td>
                      <Group gap="xs">
                        <IconBuildingBank size={18} color="#38bdf8" />
                        <Text fw={600} size="sm">{b.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="gray" variant="light">{b.code}</Badge>
                    </Table.Td>
                    <Table.Td style={{ color: '#94a3b8' }}>{b.country}</Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Group justify="flex-end" gap="xs">
                        <ActionIcon variant="subtle" color="gray" onClick={() => { setEditingBankId(b.id); setBankName(b.name); setBankCode(b.code); setBankModalOpened(true); }}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteBank(b.id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        {/* TAB 3: REGLAS DE IA */}
        <Tabs.Panel value="airules" pt="md">
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Group justify="space-between" mb="md">
              <div>
                <Text fw={700} style={{ color: '#f8fafc' }}>Reglas de Clasificación e Inferencia IA</Text>
                <Text size="xs" c="dimmed">Mapeos para transformar descripciones sucias de la banca en comercios limpios</Text>
              </div>
              <Button color="violet" leftSection={<IconPlus size={16} />} onClick={() => { setEditingRuleId(null); setRulePattern(''); setRuleMerchant(''); setRuleCat(categories[0]?.name || ''); setRuleModalOpened(true); }}>
                + Nueva Regla IA
              </Button>
            </Group>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr style={{ borderColor: '#334155' }}>
                  <Table.Th style={{ color: '#94a3b8' }}>Patrón Detectado (Regex / Texto)</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Comercio Normalizado</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Categoría Asignada</Table.Th>
                  <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {aiRules.map((r) => (
                  <Table.Tr key={r.id} style={{ borderColor: '#334155' }}>
                    <Table.Td>
                      <Badge color="violet" variant="outline" style={{ fontFamily: 'monospace' }}>{r.pattern}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600} size="sm">{r.normalizedMerchant}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue" variant="light">{r.category}</Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Group justify="flex-end" gap="xs">
                        <ActionIcon variant="subtle" color="gray" onClick={() => { setEditingRuleId(r.id); setRulePattern(r.pattern); setRuleMerchant(r.normalizedMerchant); setRuleCat(r.category); setRuleModalOpened(true); }}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteRule(r.id)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="exchangerates" pt="md">
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Group justify="space-between" mb="md" align="flex-end">
              <Group align="flex-end">
                <Select
                  label="Mes"
                  data={[
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
                  ]}
                  value={selectedMonth}
                  onChange={(v) => setSelectedMonth(v || '8')}
                  style={{ width: 140 }}
                />
                <Select
                  label="Año"
                  data={[
                    { value: '2024', label: '2024' },
                    { value: '2025', label: '2025' },
                    { value: '2026', label: '2026' },
                  ]}
                  value={selectedYear}
                  onChange={(v) => setSelectedYear(v || '2026')}
                  style={{ width: 100 }}
                />
              </Group>
              <Button color="teal" leftSection={<IconDownload size={16} />} loading={loadingSync} onClick={handleSyncSUNAT}>
                Sincronizar SUNAT
              </Button>
            </Group>

            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr style={{ borderColor: '#334155' }}>
                  <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Compra (S/)</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Venta (S/)</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {exchangeRates.map((r) => (
                  <Table.Tr key={r.id} style={{ borderColor: '#334155' }}>
                    <Table.Td>
                      <Text fw={600} size="sm">{formatDateIgnoreTimezone(r.date)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c="teal" fw={700}>{r.buyRate.toFixed(3)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c="blue" fw={700}>{r.sellRate.toFixed(3)}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {exchangeRates.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                      <Text c="dimmed">No hay tipos de cambio guardados. Haz clic en Sincronizar SUNAT.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

      </Tabs>

      {/* MODAL CATEGORÍA */}
      <Modal opened={catModalOpened} onClose={() => setCatModalOpened(false)} title={editingCatId ? 'Editar Categoría' : 'Nueva Categoría'} centered radius="md">
        <Stack gap="md">
          <TextInput label="Nombre de Categoría" placeholder="ej. Mascotas, Servicios Básicos" value={catName} onChange={(e) => setCatName(e.target.value)} required />
          <Select
            label="Tipo de Movimiento"
            data={[
              { value: 'Expense', label: 'Gasto' },
              { value: 'Income', label: 'Ingreso' },
              { value: 'Transfer', label: 'Transferencia' },
            ]}
            value={catType}
            onChange={(v) => setCatType((v as any) || 'Expense')}
          />
          <Select
            label="Color Identificador"
            data={['blue', 'orange', 'teal', 'violet', 'green', 'red', 'cyan', 'yellow']}
            value={catColor}
            onChange={(v) => setCatColor(v || 'blue')}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setCatModalOpened(false)}>Cancelar</Button>
            <Button color="blue" onClick={handleSaveCategory}>{editingCatId ? 'Guardar Cambios' : 'Crear Categoría'}</Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL BANCO */}
      <Modal opened={bankModalOpened} onClose={() => setBankModalOpened(false)} title={editingBankId ? 'Editar Banco' : 'Nuevo Banco'} centered radius="md">
        <Stack gap="md">
          <TextInput label="Nombre del Banco / Entidad" placeholder="ej. Banco GNB, Caja Arequipa" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
          <TextInput label="Código Corto" placeholder="ej. GNB" value={bankCode} onChange={(e) => setBankCode(e.target.value)} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setBankModalOpened(false)}>Cancelar</Button>
            <Button color="blue" onClick={handleSaveBank}>{editingBankId ? 'Guardar Cambios' : 'Crear Banco'}</Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL REGLA IA */}
      <Modal opened={ruleModalOpened} onClose={() => setRuleModalOpened(false)} title={editingRuleId ? 'Editar Regla IA' : 'Nueva Regla IA'} centered radius="md">
        <Stack gap="md">
          <TextInput label="Patrón de Texto en Extracto (Banca)" placeholder="ej. NETFLIX, UBER, STEAM" value={rulePattern} onChange={(e) => setRulePattern(e.target.value)} required />
          <TextInput label="Comercio / Nombre Limpio" placeholder="ej. Netflix LATAM, Uber Rides" value={ruleMerchant} onChange={(e) => setRuleMerchant(e.target.value)} required />
          <Select
            label="Categoría Asignada"
            data={categories.map((c) => c.name)}
            value={ruleCat}
            onChange={(v) => setRuleCat(v || categories[0]?.name || '')}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setRuleModalOpened(false)}>Cancelar</Button>
            <Button color="violet" onClick={handleSaveRule}>{editingRuleId ? 'Guardar Cambios' : 'Crear Regla IA'}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
