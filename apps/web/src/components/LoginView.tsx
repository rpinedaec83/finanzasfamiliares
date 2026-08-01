import React, { useState } from 'react';
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Tabs,
  Group,
  Alert,
  Box,
} from '@mantine/core';
import { IconLock, IconMail, IconUser, IconUsers, IconAlertCircle } from '@tabler/icons-react';

interface LoginViewProps {
  onAuthSuccess: (token: string, user: any, family: any) => void;
}

export function LoginView({ onAuthSuccess }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = activeTab === 'login'
        ? { email, password }
        : { email, password, fullName, familyName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        onAuthSuccess(data.token, data.user, data.family);
      } else {
        setError(data.message || 'Ocurrió un error inesperado.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor.');
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
        background: 'radial-gradient(circle at 10% 20%, rgb(15, 23, 42) 0%, rgb(9, 15, 30) 90%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Glowing Orbs */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 70%)',
          top: '-10%',
          left: '10%',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0) 70%)',
          bottom: '-10%',
          right: '5%',
          filter: 'blur(50px)',
          zIndex: 1,
        }}
      />

      <Card
        w={420}
        radius="lg"
        p="xl"
        style={{
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          zIndex: 2,
        }}
      >
        <Stack align="center" gap="xs" mb="lg">
          <Group gap="xs" align="center">
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Text fw={900} size="lg" style={{ color: '#fff', letterSpacing: '-1px' }}>K</Text>
            </div>
            <Title order={2} style={{ color: '#f8fafc', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Kipu Finanzas
            </Title>
          </Group>
          <Text size="sm" c="dimmed" style={{ textAlign: 'center' }}>
            Control financiero premium para familias y parejas
          </Text>
        </Stack>

        <Tabs value={activeTab} onChange={(val) => { setActiveTab(val || 'login'); setError(null); }} variant="pills" radius="md" mb="md">
          <Tabs.List grow style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '4px', borderRadius: '8px' }}>
            <Tabs.Tab value="login" style={{ color: activeTab === 'login' ? '#fff' : '#94a3b8', fontWeight: 600 }}>
              Ingresar
            </Tabs.Tab>
            <Tabs.Tab value="register" style={{ color: activeTab === 'register' ? '#fff' : '#94a3b8', fontWeight: 600 }}>
              Registrarse
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {error && (
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertCircle size={16} />}
            title="Error de Autenticación"
            mb="md"
            radius="md"
            style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {activeTab === 'register' && (
              <>
                <TextInput
                  label="Nombre Completo"
                  placeholder="Tu nombre y apellido"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftSection={<IconUser size={16} />}
                  required
                  radius="md"
                  styles={{
                    input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                    label: { color: '#cbd5e1', fontWeight: 500 },
                  }}
                />
                <TextInput
                  label="Nombre de Familia"
                  placeholder="ej. Familia Pineda, Los Pérez"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  leftSection={<IconUsers size={16} />}
                  required
                  radius="md"
                  styles={{
                    input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                    label: { color: '#cbd5e1', fontWeight: 500 },
                  }}
                />
              </>
            )}

            <TextInput
              label="Correo Electrónico"
              placeholder="correo@ejemplo.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftSection={<IconMail size={16} />}
              required
              radius="md"
              styles={{
                input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc' },
                label: { color: '#cbd5e1', fontWeight: 500 },
              }}
            />

            <PasswordInput
              label="Contraseña"
              placeholder="Tu contraseña secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftSection={<IconLock size={16} />}
              required
              radius="md"
              styles={{
                innerInput: { color: '#f8fafc' },
                input: { background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.1)' },
                label: { color: '#cbd5e1', fontWeight: 500 },
              }}
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              mt="md"
              radius="md"
              size="md"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                border: 0,
              }}
            >
              {activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta y Familia'}
            </Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
