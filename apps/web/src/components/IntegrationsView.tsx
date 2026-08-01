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
  ThemeIcon,
  Modal,
} from '@mantine/core';
import {
  IconMail,
  IconBrandTelegram,
  IconCloud,
  IconCalendar,
} from '@tabler/icons-react';

export function IntegrationsView() {
  const [telegramCode, setTelegramCode] = useState<string | null>(null);

  const handleGenerateTelegramCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setTelegramCode(code);
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Centro de Integraciones & Conexiones
          </Title>
          <Text size="sm" c="dimmed">
            Ingesta automática de estados de cuenta via Gmail, Outlook, IMAP, Drive, OneDrive, Telegram y Calendarios
          </Text>
        </div>
      </Group>

      <Grid>
        {/* CORREOS ELECTRÓNICOS */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon color="red" variant="light" size="lg">
                    <IconMail size={22} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} style={{ color: '#f8fafc' }}>
                      Cuentas de Correo Vinculadas
                    </Text>
                    <Text size="xs" c="dimmed">
                      Filtra por remitentes @bcp.com.pe, @bbva.com, @interbank.com.pe
                    </Text>
                  </div>
                </Group>
                <Badge color="green" variant="light">
                  3 Activas
                </Badge>
              </Group>

              <Stack gap="xs">
                <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={600}>rpinedaec83@gmail.com</Text>
                      <Text size="xs" c="dimmed">Gmail API (OAuth 2.0) • Úl. Sync hace 1 hora</Text>
                    </div>
                    <Badge color="green">Conectado</Badge>
                  </Group>
                </Paper>

                <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={600}>robertdpl_ec@hotmail.com</Text>
                      <Text size="xs" c="dimmed">Microsoft Graph • Úl. Sync hace 3 horas</Text>
                    </div>
                    <Badge color="green">Conectado</Badge>
                  </Group>
                </Paper>

                <Paper p="xs" radius="sm" style={{ background: '#0f172a' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={600}>rpineda@x-codec.org</Text>
                      <Text size="xs" c="dimmed">IMAP SSL (mail.x-codec.org:993) • Cifrado AES-256</Text>
                    </div>
                    <Badge color="green">Conectado</Badge>
                  </Group>
                </Paper>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        {/* TELEGRAM BOT */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon color="blue" variant="light" size="lg">
                    <IconBrandTelegram size={22} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} style={{ color: '#f8fafc' }}>
                      Bot de Telegram Interactivo
                    </Text>
                    <Text size="xs" c="dimmed">
                      @KipuFinanzasBot
                    </Text>
                  </div>
                </Group>
                <Badge color="blue" variant="light">
                  Vinculado
                </Badge>
              </Group>

              <Text size="xs" c="dimmed">
                Envía comandos `/saldo`, `/gastos`, `/presupuesto` o adjunta fotos de recibos al chat oficial de Telegram.
              </Text>

              <Paper p="sm" radius="md" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                <Group justify="space-between">
                  <div>
                    <Text size="xs" c="dimmed">Usuario Vinculado:</Text>
                    <Text fw={700} size="sm" color="teal">@rpinedaec83</Text>
                  </div>
                  <Button variant="light" color="blue" size="xs" onClick={handleGenerateTelegramCode}>
                    Generar Código Vincular
                  </Button>
                </Group>
              </Paper>
            </Stack>
          </Card>
        </Grid.Col>

        {/* ALMACENAMIENTO NUBE & CALENDARIO */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon color="teal" variant="light" size="lg">
                    <IconCloud size={22} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} style={{ color: '#f8fafc' }}>
                      Almacenamiento en la Nube
                    </Text>
                    <Text size="xs" c="dimmed">
                      Carpeta `/Finanzas/EstadosDeCuenta`
                    </Text>
                  </div>
                </Group>
                <Badge color="teal" variant="light">Sincronizado</Badge>
              </Group>

              <Group justify="space-between">
                <Text size="sm">Google Drive (`/Finanzas`)</Text>
                <Badge color="green">Sincronizado</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Microsoft OneDrive (`/Finanzas`)</Text>
                <Badge color="green">Sincronizado</Badge>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Stack gap="md">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon color="orange" variant="light" size="lg">
                    <IconCalendar size={22} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} style={{ color: '#f8fafc' }}>
                      Sincronización de Calendarios
                    </Text>
                    <Text size="xs" c="dimmed">
                      Recordatorios automáticos de pago de tarjetas y servicios
                    </Text>
                  </div>
                </Group>
                <Badge color="orange" variant="light">Activo</Badge>
              </Group>

              <Group justify="space-between">
                <Text size="sm">Google Calendar</Text>
                <Badge color="green">Eventos Creados</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Microsoft Outlook Calendar</Text>
                <Badge color="green">Eventos Creados</Badge>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* MODAL CÓDIGO TELEGRAM */}
      <Modal opened={telegramCode !== null} onClose={() => setTelegramCode(null)} title="Código de Vinculación de Telegram" centered radius="md">
        <Stack gap="md" align="center">
          <Text size="xs" c="dimmed">
            Abre Telegram, busca al bot <b>@KipuFinanzasBot</b> y envía el siguiente comando:
          </Text>
          <Paper p="md" radius="md" style={{ background: '#0f172a', border: '1px solid #38bdf8', width: '100%', textAlign: 'center' }}>
            <Title order={1} style={{ color: '#38bdf8', letterSpacing: 4 }}>
              /start {telegramCode}
            </Title>
          </Paper>
          <Text size="xs" c="dimmed">
            * Este código expira en 10 minutos.
          </Text>
          <Button color="teal" fullWidth onClick={() => setTelegramCode(null)}>
            Entendido
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
