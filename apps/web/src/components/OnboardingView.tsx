import { useState } from 'react';
import {
  Card,
  TextInput,
  NumberInput,
  Button,
  Title,
  Text,
  Stack,
  Group,
  Select,
  Box,
  Stepper,
  Paper,
  Checkbox,
  Divider,
  Grid,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconCreditCard,
  IconChartPie,
  IconCircleCheck,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';

interface OnboardingViewProps {
  onComplete: () => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Paso 1: Bienvenida y Moneda Base
  const [baseCurrency, setBaseCurrency] = useState<'PEN' | 'USD'>('PEN');

  // Paso 2: Primera Cuenta Bancaria
  const [bankName, setBankName] = useState('BCP');
  const [accountName, setAccountName] = useState('Cuenta de Ahorros Principal');
  const [accountCci, setAccountCci] = useState('');
  const [accountBalance, setAccountBalance] = useState<number | string>(0);
  const [accountCurrency, setAccountCurrency] = useState<'PEN' | 'USD'>('PEN');

  // Paso 3: Primera Tarjeta de Crédito (Opcional)
  const [hasCard, setHasCard] = useState(false);
  const [cardBank, setCardBank] = useState('BCP');
  const [cardName, setCardName] = useState('Tarjeta de Crédito Visa');
  const [cardLimit, setCardLimit] = useState<number | string>(3000);
  const [cardClosingDay, setCardClosingDay] = useState<number | string>(10);
  const [cardPaymentDay, setCardPaymentDay] = useState<number | string>(20);
  const [cardCurrency, setCardCurrency] = useState<'PEN' | 'USD'>('PEN');

  // Paso 4: Presupuestos y Metas
  const [budgetLimit, setBudgetLimit] = useState<number | string>(1500);
  const [goalName, setGoalName] = useState('Fondo de Emergencia');
  const [goalTarget, setGoalTarget] = useState<number | string>(5000);

  // Paso 5: Alertas e Integraciones
  const [alertEmail, setAlertEmail] = useState(true);
  const [alertTelegram, setAlertTelegram] = useState(false);

  const handleNext = () => {
    setActiveStep((current) => current + 1);
  };

  const handlePrev = () => {
    setActiveStep((current) => current - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const bankIds: Record<string, string> = {
        'BCP': '10000000-0000-0000-0000-000000000001',
        'BBVA': '10000000-0000-0000-0000-000000000002',
        'Interbank': '10000000-0000-0000-0000-000000000003',
        'Banco Falabella': '10000000-0000-0000-0000-000000000004',
        'Efectivo': '10000000-0000-0000-0000-000000000001'
      };

      // 1. Guardar la primera Cuenta
      const lastFour = accountCci.trim().slice(-4) || '0000';
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName,
          name: accountName,
          cciNumber: accountCci,
          institutionId: bankIds[bankName] || bankIds['BCP'],
          type: 1, // Savings
          currency: accountCurrency === 'PEN' ? 0 : 1,
          balanceAvailable: Number(accountBalance),
          balanceBook: Number(accountBalance),
          lastFourDigits: lastFour,
          isIncludedInNetWorth: true
        }),
      });

      // 2. Guardar la Tarjeta de Crédito si se configuró
      if (hasCard) {
        await fetch('/api/creditcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cardName,
            institutionId: bankIds[cardBank] || bankIds['BCP'],
            creditLimit: Number(cardLimit),
            availableLimit: Number(cardLimit),
            closingDay: Number(cardClosingDay),
            dueDay: Number(cardPaymentDay),
            mainCurrency: cardCurrency === 'PEN' ? 0 : 1,
            lastFourDigits: '1234'
          }),
        });
      }

      // 3. Guardar el primer Presupuesto (Supermercado por defecto)
      await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryName: 'Supermercado',
          limitAmount: Number(budgetLimit),
          executedAmount: 0,
          month: 8,
          year: 2026
        }),
      });

      // 4. Guardar la primera Meta de Ahorro
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: goalName,
          targetAmount: Number(goalTarget),
          savedAmount: 0,
          currency: baseCurrency === 'PEN' ? 0 : 1,
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 6 meses
        }),
      });

      // Llamar al callback de finalización
      onComplete();
    } catch (err) {
      console.error('Error al guardar datos del onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgb(15, 23, 42) 0%, rgb(9, 15, 30) 100%)',
        padding: '30px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow effects */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%)',
        top: '10%', left: '10%', filter: 'blur(60px)', zIndex: 1
      }} />
      <div style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0) 70%)',
        bottom: '10%', right: '10%', filter: 'blur(60px)', zIndex: 1
      }} />

      <Card
        w={750}
        radius="lg"
        p="xl"
        style={{
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          zIndex: 2,
        }}
      >
        <Stack gap="xl">
          <Group justify="space-between">
            <Group gap="xs">
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800
              }}>
                K
              </div>
              <Title order={3} style={{ color: '#f8fafc', fontWeight: 800 }}>
                Configuración Inicial de Kipu
              </Title>
            </Group>
            <Text size="sm" c="dimmed">
              Paso {activeStep + 1} de 5
            </Text>
          </Group>

          <Stepper active={activeStep} size="sm" color="indigo" styles={{
            stepIcon: { border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)' },
            stepLabel: { color: '#cbd5e1', fontWeight: 600 }
          }}>
            <Stepper.Step label="Moneda" icon={<IconBuildingBank size={18} />} />
            <Stepper.Step label="Cuenta" icon={<IconBuildingBank size={18} />} />
            <Stepper.Step label="Tarjeta" icon={<IconCreditCard size={18} />} />
            <Stepper.Step label="Planificación" icon={<IconChartPie size={18} />} />
            <Stepper.Step label="Completado" icon={<IconCircleCheck size={18} />} />
          </Stepper>

          <Divider my="sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Box style={{ minHeight: '260px' }}>
            {/* PASO 1: MONEDA BASE Y BIENVENIDA */}
            {activeStep === 0 && (
              <Stack gap="md">
                <Title order={4} style={{ color: '#f1f5f9' }}>¡Te damos la bienvenida a tu nueva cuenta!</Title>
                <Text size="sm" c="dimmed">
                  Kipu Finanzas te ayudará a organizar tus saldos, tarjetas de crédito e inversiones en un solo panel consolidado. 
                  Para comenzar, seleccionemos la moneda principal que usará tu familia para los reportes agregados:
                </Text>
                <Select
                  label="Moneda Base para Reportes"
                  data={[
                    { value: 'PEN', label: 'Soles Peruanos (S/)' },
                    { value: 'USD', label: 'Dólares Americanos ($)' },
                  ]}
                  value={baseCurrency}
                  onChange={(val) => setBaseCurrency(val as 'PEN' | 'USD')}
                  radius="md"
                  styles={{
                    input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                    label: { color: '#cbd5e1', fontWeight: 500, marginBottom: '6px' },
                  }}
                />
              </Stack>
            )}

            {/* PASO 2: PRIMERA CUENTA BANCARIA */}
            {activeStep === 1 && (
              <Stack gap="md">
                <Title order={4} style={{ color: '#f1f5f9' }}>1. Configura tu Cuenta Principal</Title>
                <Text size="sm" c="dimmed">
                  Ingresa tu cuenta principal (por ejemplo, donde recibes tu sueldo o tus ahorros cotidianos) para iniciar tu balance patrimonial:
                </Text>
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Banco / Entidad"
                      data={['BCP', 'BBVA', 'Interbank', 'Banco Falabella', 'Efectivo']}
                      value={bankName}
                      onChange={(val) => setBankName(val || 'BCP')}
                      radius="md"
                      styles={{
                        input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                        label: { color: '#cbd5e1' },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Nombre de la Cuenta"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="ej. Cuenta Sueldo BCP"
                      required
                      radius="md"
                      styles={{
                        input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                        label: { color: '#cbd5e1' },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Saldo Inicial Disponible"
                      value={accountBalance}
                      onChange={setAccountBalance}
                      min={0}
                      decimalScale={2}
                      required
                      radius="md"
                      styles={{
                        input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                        label: { color: '#cbd5e1' },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Moneda"
                      data={['PEN', 'USD']}
                      value={accountCurrency}
                      onChange={(val) => setAccountCurrency(val as 'PEN' | 'USD')}
                      radius="md"
                      styles={{
                        input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                        label: { color: '#cbd5e1' },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TextInput
                      label="Código de Cuenta Interbancario (CCI) - Opcional"
                      value={accountCci}
                      onChange={(e) => setAccountCci(e.target.value)}
                      placeholder="ej. 002-191-XXXXXXXXXXXXXXXX"
                      radius="md"
                      styles={{
                        input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                        label: { color: '#cbd5e1' },
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            )}

            {/* PASO 3: PRIMERA TARJETA DE CRÉDITO */}
            {activeStep === 2 && (
              <Stack gap="md">
                <Title order={4} style={{ color: '#f1f5f9' }}>2. Configura tu Tarjeta de Crédito (Opcional)</Title>
                <Checkbox
                  label="Tengo una tarjeta de crédito activa que quiero registrar"
                  checked={hasCard}
                  onChange={(e) => setHasCard(e.currentTarget.checked)}
                  styles={{ label: { color: '#cbd5e1', fontWeight: 600 } }}
                />

                {hasCard && (
                  <Paper p="md" radius="md" style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Grid>
                      <Grid.Col span={6}>
                        <Select
                          label="Banco Emisor"
                          data={['BCP', 'BBVA', 'Interbank', 'Banco Falabella']}
                          value={cardBank}
                          onChange={(val) => setCardBank(val || 'BCP')}
                          radius="md"
                          styles={{
                            input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                            label: { color: '#cbd5e1' },
                          }}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <TextInput
                          label="Nombre de la Tarjeta"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="ej. Tarjeta Visa Signature"
                          required
                          radius="md"
                          styles={{
                            input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                            label: { color: '#cbd5e1' },
                          }}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Línea de Crédito Autorizada"
                          value={cardLimit}
                          onChange={setCardLimit}
                          min={0}
                          radius="md"
                          styles={{
                            input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                            label: { color: '#cbd5e1' },
                          }}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Select
                          label="Moneda Facturación"
                          data={['PEN', 'USD']}
                          value={cardCurrency}
                          onChange={(val) => setCardCurrency(val as 'PEN' | 'USD')}
                          radius="md"
                          styles={{
                            input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                            label: { color: '#cbd5e1' },
                          }}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Día de Corte de Ciclo"
                          value={cardClosingDay}
                          onChange={setCardClosingDay}
                          min={1}
                          max={31}
                          radius="md"
                          styles={{
                            input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                            label: { color: '#cbd5e1' },
                          }}
                        />
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <NumberInput
                          label="Día Límite de Pago"
                          value={cardPaymentDay}
                          onChange={setCardPaymentDay}
                          min={1}
                          max={31}
                          radius="md"
                          styles={{
                            input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                            label: { color: '#cbd5e1' },
                          }}
                        />
                      </Grid.Col>
                    </Grid>
                  </Paper>
                )}
              </Stack>
            )}

            {/* PASO 4: PLANIFICACIÓN (PRESUPUESTO Y METAS) */}
            {activeStep === 3 && (
              <Stack gap="md">
                <Title order={4} style={{ color: '#f1f5f9' }}>3. Planificación Inicial</Title>
                <Text size="sm" c="dimmed">
                  Establezcamos una meta de ahorro y un límite para tu categoría principal de gastos para comenzar a monitorear tu presupuesto:
                </Text>
                <Grid>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Límite Presupuesto: Supermercados (Mensual)"
                      value={budgetLimit}
                      onChange={setBudgetLimit}
                      min={0}
                      radius="md"
                      styles={{
                        input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                        label: { color: '#cbd5e1' },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Nombre de tu Meta de Ahorro"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      placeholder="ej. Fondo de Emergencia, Vacaciones"
                      radius="md"
                      styles={{
                        input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                        label: { color: '#cbd5e1' },
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <NumberInput
                      label={`Monto Objetivo de Ahorro (${baseCurrency === 'PEN' ? 'S/' : '$'})`}
                      value={goalTarget}
                      onChange={setGoalTarget}
                      min={100}
                      radius="md"
                      styles={{
                        input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                        label: { color: '#cbd5e1' },
                      }}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            )}

            {/* PASO 5: ALERTAS Y PREPARACIÓN FINAL */}
            {activeStep === 4 && (
              <Stack gap="md">
                <Title order={4} style={{ color: '#f1f5f9' }}>¡Todo Listo para Empezar!</Title>
                <Text size="sm" c="dimmed">
                  El asistente está listo para inicializar los datos de tu familia en Kipu. Opcionalmente, configura tus canales de alerta activa:
                </Text>
                <Stack gap="sm" mt="xs">
                  <Checkbox
                    label="Recibir alertas de presupuestos excedidos por correo electrónico"
                    checked={alertEmail}
                    onChange={(e) => setAlertEmail(e.currentTarget.checked)}
                    styles={{ label: { color: '#cbd5e1' } }}
                  />
                  <Checkbox
                    label="Activar bot de alertas en Telegram (podrás enlazarlo en la pestaña de Integraciones)"
                    checked={alertTelegram}
                    onChange={(e) => setAlertTelegram(e.currentTarget.checked)}
                    styles={{ label: { color: '#cbd5e1' } }}
                  />
                </Stack>
              </Stack>
            )}
          </Box>

          <Divider my="sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Group justify="space-between">
            <Button
              variant="default"
              onClick={handlePrev}
              disabled={activeStep === 0 || loading}
              leftSection={<IconArrowLeft size={16} />}
              radius="md"
              styles={{
                root: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#cbd5e1' }
              }}
            >
              Atrás
            </Button>
            {activeStep < 4 ? (
              <Button
                onClick={handleNext}
                rightSection={<IconArrowRight size={16} />}
                radius="md"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                  border: 0,
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                loading={loading}
                rightSection={<IconArrowRight size={16} />}
                radius="md"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  border: 0,
                }}
              >
                Finalizar Configuración
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    </Box>
  );
}
