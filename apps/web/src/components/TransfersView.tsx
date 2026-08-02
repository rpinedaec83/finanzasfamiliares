import { useState, useMemo } from 'react';
import {
  Title,
  Text,
  Group,
  Stack,
  Badge,
  Table,
  Card,
  Alert,
  Center,
  Modal,
  Tabs,
  Divider,
  Button,
} from '@mantine/core';
import {
  IconArrowsExchange,
  IconInfoCircle,
  IconExchange,
  IconSearch,
  IconCreditCard,
  IconPigMoney,
  IconTrendingUp,
} from '@tabler/icons-react';

interface TransfersViewProps {
  transfers: any[];
  accounts: any[];
  creditCards?: any[];
  deposits?: any[];
  transactions: any[];
  onTransfer: () => void;
}

export function TransfersView({
  transfers,
  accounts,
  creditCards = [],
  deposits = [],
  transactions,
  onTransfer,
}: TransfersViewProps) {
  const [modalOpened, setModalOpened] = useState(false);

  const getAccountName = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (acc) return `${acc.bankName} - ${acc.name}`;
    const card = creditCards.find((c) => c.id === id);
    if (card) return `Tarjeta: ${card.name}`;
    const dep = deposits.find((d) => d.id === id);
    if (dep) return `Inversión: ${dep.name}`;
    return 'Cuenta Desconocida';
  };

  const formatAmount = (amount: number, currency: number | string) => {
    const curStr = (currency === 0 || currency === 'PEN') ? 'S/' : '$';
    return `${curStr} ${(amount ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  // 1. Identificar Transferencias entre Cuentas
  const identifiedTransfers = useMemo(() => {
    const outflows = transactions.filter((t) => (t.rawAmount ?? t.amount) < 0 && t.type === 2);
    const inflows = transactions.filter((t) => (t.rawAmount ?? t.amount) > 0 && t.type === 2);
    const pairs: any[] = [];

    outflows.forEach((out) => {
      const match = inflows.find((inf) => {
        const outAmt = Math.abs(out.rawAmount ?? out.amount);
        const infAmt = inf.rawAmount ?? inf.amount;
        return (
          infAmt === outAmt &&
          inf.currency === out.currency &&
          inf.accountId !== out.accountId &&
          out.date === inf.date
        );
      });
      if (match) {
        pairs.push({
          id: `${out.id}-${match.id}`,
          date: out.date,
          origin: getAccountName(out.accountId),
          destination: getAccountName(match.accountId),
          amount: Math.abs(out.rawAmount ?? out.amount),
          currency: out.currency,
          description: out.desc || out.descriptionOriginal,
        });
      }
    });
    return pairs;
  }, [transactions, accounts, creditCards]);

  // 2. Identificar Pagos a Tarjetas
  const identifiedCardPayments = useMemo(() => {
    const cardPayments = transactions.filter((t) => {
      const isCardLinked = t.creditCardId !== null && t.creditCardId !== undefined;
      const isCardDest = t.account?.toLowerCase().includes('tarjeta') || t.desc?.toLowerCase().includes('pago tc');
      const isIncoming = (t.rawAmount ?? t.amount) > 0;
      return (isCardLinked && isIncoming) || (isCardDest && isIncoming);
    });

    return cardPayments.map((t) => {
      const cardName = t.account || 'Tarjeta';
      return {
        id: t.id,
        date: t.date,
        destination: cardName,
        amount: Math.abs(t.rawAmount ?? t.amount),
        currency: t.currency,
        description: t.desc || t.descriptionOriginal,
      };
    });
  }, [transactions]);

  // 3. Identificar Depósitos a Plazo Fijo
  const identifiedFixedDeposits = useMemo(() => {
    return transactions.filter((t) => {
      const desc = (t.desc || t.descriptionOriginal || '').toLowerCase();
      const cat = (t.cat || t.category || '').toLowerCase();
      return (
        desc.includes('plazo fijo') ||
        desc.includes('dep.plaz') ||
        cat.includes('plazo') ||
        cat.includes('inversión')
      );
    });
  }, [transactions]);

  // 4. Identificar Operaciones Cambiarias (Compra/Venta Moneda)
  const identifiedExchanges = useMemo(() => {
    const outflows = transactions.filter((t) => (t.rawAmount ?? t.amount) < 0);
    const inflows = transactions.filter((t) => (t.rawAmount ?? t.amount) > 0);
    const exchanges: any[] = [];

    outflows.forEach((out) => {
      const match = inflows.find((inf) => {
        return (
          inf.currency !== out.currency &&
          out.date === inf.date &&
          (out.desc?.toLowerCase().includes('cambio') ||
            inf.desc?.toLowerCase().includes('cambio') ||
            out.desc?.toLowerCase().includes('dolar') ||
            inf.desc?.toLowerCase().includes('dolar') ||
            out.cat?.toLowerCase().includes('cambio') ||
            inf.cat?.toLowerCase().includes('cambio'))
        );
      });
      if (match) {
        exchanges.push({
          id: `${out.id}-${match.id}`,
          date: out.date,
          sold: {
            amount: Math.abs(out.rawAmount ?? out.amount),
            currency: out.currency,
            account: getAccountName(out.accountId),
          },
          bought: {
            amount: match.rawAmount ?? match.amount,
            currency: match.currency,
            account: getAccountName(match.accountId),
          },
        });
      }
    });
    return exchanges;
  }, [transactions, accounts, creditCards]);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Transferencias entre Cuentas Propias
          </Title>
          <Text size="sm" c="dimmed">
            Movimientos detectados automáticamente u ordenados entre cuentas de la misma familia
          </Text>
        </div>
        <Group gap="xs">
          <Button
            variant="light"
            color="violet"
            leftSection={<IconSearch size={16} />}
            onClick={() => setModalOpened(true)}
          >
            Revisar & Identificar Operaciones
          </Button>
          <Button color="blue" leftSection={<IconArrowsExchange size={16} />} onClick={onTransfer}>
            Nueva Transferencia
          </Button>
        </Group>
      </Group>

      <Alert color="blue" icon={<IconInfoCircle size={18} />} title="Regla Financiera del Sistema">
        Las transferencias entre cuentas de la misma familia <b>NO</b> se contabilizan como gastos ni como ingresos en el presupuesto global. Simplemente reasignan el saldo neto.
      </Alert>

      {transfers.length === 0 ? (
        <Card p="xl" radius="md" style={{ background: '#1e293b', border: '1px solid #334155', minHeight: 200 }}>
          <Center style={{ height: '100%' }}>
            <Stack align="center" gap="xs">
              <IconExchange size={48} color="#94a3b8" stroke={1.5} />
              <Text fw={700} style={{ color: '#f8fafc' }} size="lg">No hay transferencias registradas</Text>
              <Text size="sm" c="dimmed" style={{ maxWidth: 400, textAlign: 'center' }}>
                No se detectaron transferencias entre tus cuentas en el historial de transacciones. 
                Puedes registrar una manualmente o presionar "Revisar & Identificar Operaciones" para que el motor las extraiga.
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr style={{ borderColor: '#334155' }}>
                <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                <Table.Th style={{ color: '#94a3b8' }}>Cuenta Origen</Table.Th>
                <Table.Th style={{ color: '#94a3b8' }}>Cuenta Destino</Table.Th>
                <Table.Th style={{ color: '#94a3b8' }}>Monto</Table.Th>
                <Table.Th style={{ color: '#94a3b8' }}>Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transfers.map((t) => (
                <Table.Tr key={t.id} style={{ borderColor: '#334155' }}>
                  <Table.Td>{t.date || new Date(t.sendDate).toLocaleDateString('es-PE')}</Table.Td>
                  <Table.Td><Text size="sm" fw={600} style={{ color: '#f8fafc' }}>{getAccountName(t.originAccountId || t.originAccount)}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={600} style={{ color: '#f8fafc' }}>{getAccountName(t.destinationAccountId || t.destinationAccount)}</Text></Table.Td>
                  <Table.Td><Text fw={700} color="blue">{formatAmount(t.sentAmount || t.amount, t.sentCurrency || t.currency)}</Text></Table.Td>
                  <Table.Td>
                    <Badge color={t.status === 'Conciliated' ? 'green' : 'blue'} variant="light">
                      {t.status === 'Conciliated' ? 'Conciliada' : t.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* RECONCILIATION & ANALYSIS MODAL */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={
          <Group gap="xs">
            <IconSearch size={22} color="#8b5cf6" />
            <Text fw={700} size="lg" style={{ color: '#f8fafc' }}>
              Motor de Detección e Identificación de Operaciones Propias
            </Text>
          </Group>
        }
        size="xl"
        centered
        radius="md"
      >
        <Text size="sm" c="dimmed" mb="md">
          El sistema analiza el historial completo de transacciones para identificar y aislar movimientos internos de capital para evitar duplicar gastos.
        </Text>

        <Tabs defaultValue="transfers" color="violet">
          <Tabs.List mb="md">
            <Tabs.Tab value="transfers" leftSection={<IconArrowsExchange size={16} />}>
              Transferencias ({identifiedTransfers.length})
            </Tabs.Tab>
            <Tabs.Tab value="cards" leftSection={<IconCreditCard size={16} />}>
              Pagos a Tarjetas ({identifiedCardPayments.length})
            </Tabs.Tab>
            <Tabs.Tab value="deposits" leftSection={<IconPigMoney size={16} />}>
              Plazos Fijos / Inversiones ({identifiedFixedDeposits.length})
            </Tabs.Tab>
            <Tabs.Tab value="exchanges" leftSection={<IconTrendingUp size={16} />}>
              Cambios de Moneda ({identifiedExchanges.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="transfers">
            {identifiedTransfers.length === 0 ? (
              <Center py="xl"><Text size="sm" c="dimmed">No se detectaron transferencias cruzadas en el historial de este mes.</Text></Center>
            ) : (
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr style={{ borderColor: '#334155' }}>
                    <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Origen ➔ Destino</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Descripción</Table.Th>
                    <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Monto</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {identifiedTransfers.map((p) => (
                    <Table.Tr key={p.id} style={{ borderColor: '#334155' }}>
                      <Table.Td>{p.date}</Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600} style={{ color: '#f8fafc' }}>{p.origin}</Text>
                        <Text size="xs" c="dimmed">➔ {p.destination}</Text>
                      </Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{p.description}</Text></Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                        {formatAmount(p.amount, p.currency)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="cards">
            {identifiedCardPayments.length === 0 ? (
              <Center py="xl"><Text size="sm" c="dimmed">No se detectaron pagos a tarjetas de crédito en el historial.</Text></Center>
            ) : (
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr style={{ borderColor: '#334155' }}>
                    <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Tarjeta Destino</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Descripción Operación</Table.Th>
                    <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Monto Abonado</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {identifiedCardPayments.map((p) => (
                    <Table.Tr key={p.id} style={{ borderColor: '#334155' }}>
                      <Table.Td>{p.date}</Table.Td>
                      <Table.Td><Text size="sm" fw={600} style={{ color: '#f8fafc' }}>{p.destination}</Text></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{p.description}</Text></Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                        {formatAmount(p.amount, p.currency)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="deposits">
            {identifiedFixedDeposits.length === 0 ? (
              <Center py="xl"><Text size="sm" c="dimmed">No se detectaron colocaciones a plazo fijo o inversiones.</Text></Center>
            ) : (
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr style={{ borderColor: '#334155' }}>
                    <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Descripción</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Categoría</Table.Th>
                    <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Monto Fondeado</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {identifiedFixedDeposits.map((p) => (
                    <Table.Tr key={p.id} style={{ borderColor: '#334155' }}>
                      <Table.Td>{p.date}</Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600} style={{ color: '#f8fafc' }}>{p.desc || p.descriptionOriginal}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="violet" size="xs" variant="light">{p.cat || p.category}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right', fontWeight: 700, color: '#a78bfa' }}>
                        {formatAmount(Math.abs(p.rawAmount ?? p.amount), p.currency)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="exchanges">
            {identifiedExchanges.length === 0 ? (
              <Center py="xl"><Text size="sm" c="dimmed">No se detectaron operaciones de cambio de divisas en las mismas fechas.</Text></Center>
            ) : (
              <Table verticalSpacing="xs">
                <Table.Thead>
                  <Table.Tr style={{ borderColor: '#334155' }}>
                    <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Divisa Entregada</Table.Th>
                    <Table.Th style={{ color: '#94a3b8' }}>Divisa Recibida</Table.Th>
                    <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Tasa Implícita</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {identifiedExchanges.map((p) => {
                    const rate = p.sold.currency === 'USD' 
                      ? p.bought.amount / p.sold.amount 
                      : p.sold.amount / p.bought.amount;
                    return (
                      <Table.Tr key={p.id} style={{ borderColor: '#334155' }}>
                        <Table.Td>{p.date}</Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600} style={{ color: '#f87171' }}>
                            - {formatAmount(p.sold.amount, p.sold.currency)}
                          </Text>
                          <Text size="xs" c="dimmed">{p.sold.account}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600} style={{ color: '#4ade80' }}>
                            + {formatAmount(p.bought.amount, p.bought.currency)}
                          </Text>
                          <Text size="xs" c="dimmed">{p.bought.account}</Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right', fontWeight: 700, color: '#facc15' }}>
                          S/ {rate.toFixed(4)}
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        <Group justify="flex-end">
          <Button color="violet" onClick={() => setModalOpened(false)}>
            Cerrar Análisis
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
