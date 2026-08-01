import { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Button,
  Badge,
  Card,
  Grid,
  TextInput,
  ThemeIcon,
  Alert,
} from '@mantine/core';
import {
  IconRobot,
  IconSend,
  IconSparkles,
  IconInfoCircle,
  IconBolt,
  IconAlertTriangle,
} from '@tabler/icons-react';

interface ChatMessage {
  id: number;
  role: string;
  content: string;
  tools: string[];
}

export function AiAssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: '¡Hola! Soy tu Asistente Financiero personal en **Kipu Finanzas** (impulsado por OpenAI GPT-4o).\n\nPuedo consultar tus saldos, analizar tus gastos por categoría, revisar tus tarjetas de crédito y simular escenarios de compra.',
      tools: [],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedPrompts = [
    '¿En qué gasté más este mes?',
    '¿Cuánto debo pagar en tarjetas?',
    '¿Puedo comprar un lente de S/ 7,000?',
    '¿Qué suscripciones tengo activas?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: query, tools: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    setTimeout(() => {
      let replyText = '';
      let toolsUsed: string[] = [];

      const lower = query.toLowerCase();
      if (lower.includes('gasté') || lower.includes('gasto')) {
        toolsUsed = ['GetMonthlyExpenses(Agosto 2026)'];
        replyText = 'Analizando tus finanzas de **Agosto 2026**:\n\n' +
                    '• **Supermercado:** S/ 1,200.00 (80% de tu presupuesto de S/ 1,500.00).\n' +
                    '• **Combustible & Transporte:** S/ 270.00.\n' +
                    '• **Fotografía & Tecnología:** S/ 350.00.\n\n' +
                    '💡 *Recomendación:* Te quedan **S/ 300.00** disponibles en Supermercado para los días restantes del mes.';
      } else if (lower.includes('tarjeta') || lower.includes('pagar') || lower.includes('debo')) {
        toolsUsed = ['GetUpcomingPayments()'];
        replyText = 'Tus próximos vencimientos de tarjeta de crédito:\n\n' +
                    '• **BCP Visa Signature:** Vence el **10 de Agosto** por **S/ 1,840.00**.\n' +
                    '• **Luz del Sur:** Vence el **12 de Agosto** por **S/ 142.80**.\n\n"Dispones de **S/ 4,520.50** en tu cuenta BCP Sueldo para cubrir ambos compromisos.';
      } else if (lower.includes('lente') || lower.includes('7000') || lower.includes('comprar')) {
        toolsUsed = ['ProjectCashFlow(months: 3)', 'GetGoalProgress(Lente Sony)'];
        replyText = 'Evaluación financiera para la compra del **Lente Sony (S/ 7,000.00)**:\n\n' +
                    '• **Monto Ahorrado:** S/ 4,300.00 (61% de la meta).\n' +
                    '• **Flujo Libre Proyectado:** S/ 3,060.00 al cierre de mes.\n\n' +
                    '✅ *Veredicto:* Si aportas el excedente del mes a la meta, alcanzarás los S/ 7,000.00 sin recurrir a deuda con tarjeta ni comprometer tu fondo de emergencia.';
      } else {
        toolsUsed = ['GetActiveSubscriptions()'];
        replyText = 'Detecté **1 suscripción recurrente active**:\n\n' +
                    '• **Netflix:** S/ 44.90 mensuales (Cobrado en Tarjeta Interbank Visa el día 28).\n\n' +
                    'No se han registrado aumentos de tarifa en los últimos 3 meses.';
      }

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: replyText,
        tools: toolsUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Asistente Financiero Inteligente (OpenAI GPT-4o)
          </Title>
          <Text size="sm" c="dimmed">
            Análisis conversacional, proyecciones de flujo de caja y detección de anomalías
          </Text>
        </div>
        <Badge color="violet" size="lg" variant="light" leftSection={<IconSparkles size={16} />}>
          Modelo: GPT-4o (Tool Calling Enabled)
        </Badge>
      </Group>

      <Alert color="blue" icon={<IconInfoCircle size={18} />} title="Exención de Responsabilidad Analítica">
        Las recomendaciones generadas por la IA son estrictamente informativas y analíticas basadas en tus registros. No constituyen asesoría financiera profesional ni legal.
      </Alert>

      <Grid>
        {/* Left Side: Chat Conversation */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155', minHeight: 450, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Stack gap="md" style={{ flexGrow: 1, overflowY: 'auto', maxHeight: 420 }} pr="xs">
              {messages.map((m) => (
                <Group key={m.id} align="flex-start" justify={m.role === 'user' ? 'flex-end' : 'flex-start'}>
                  {m.role === 'assistant' && (
                    <ThemeIcon color="violet" radius="xl" size="md">
                      <IconRobot size={18} />
                    </ThemeIcon>
                  )}
                  <Paper
                    p="sm"
                    radius="md"
                    style={{
                      maxWidth: '85%',
                      background: m.role === 'user' ? '#2563eb' : '#0f172a',
                      color: '#f8fafc',
                      border: m.role === 'user' ? 'none' : '1px solid #334155',
                    }}
                  >
                    {m.tools && m.tools.length > 0 && (
                      <Group gap={4} mb="xs">
                        {m.tools.map((t, idx) => (
                          <Badge key={idx} color="teal" size="xs" variant="light" leftSection={<IconBolt size={10} />}>
                            {t}
                          </Badge>
                        ))}
                      </Group>
                    )}
                    <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                      {m.content}
                    </Text>
                  </Paper>
                </Group>
              ))}
              {isLoading && (
                <Group align="center" gap="xs">
                  <ThemeIcon color="violet" radius="xl" size="sm">
                    <IconSparkles size={14} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">Ejecutando consultas financieras y generando análisis...</Text>
                </Group>
              )}
            </Stack>

            <Stack gap="xs" mt="md">
              <Group gap="xs">
                {suggestedPrompts.map((p, idx) => (
                  <Button key={idx} variant="light" color="gray" size="xs" radius="xl" onClick={() => handleSend(p)}>
                    {p}
                  </Button>
                ))}
              </Group>

              <Group gap="xs">
                <TextInput
                  placeholder="Pregúntale a tu asistente financiero..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  style={{ flexGrow: 1 }}
                />
                <Button color="violet" onClick={() => handleSend()} leftSection={<IconSend size={16} />}>
                  Enviar
                </Button>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Right Side: Anomaly Detection Card */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Group mb="sm">
                <IconAlertTriangle size={20} color="#f59e0b" />
                <Text fw={700} style={{ color: '#f8fafc' }}>
                  Anomalías Detectadas por IA
                </Text>
              </Group>

              <Paper p="sm" radius="md" style={{ background: '#0f172a', border: '1px solid #f59e0b' }}>
                <Text size="xs" fw={700} color="orange">
                  Gasto Inusual: Fotografía & Tecnología
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  El consumo de S/ 800.00 en Fotografía es un 54% superior al promedio histórico (S/ 520.00).
                </Text>
              </Paper>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
