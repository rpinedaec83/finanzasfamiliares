import { useState } from 'react';
import {
  Modal,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Table,
  Select,
  Paper,
  Title,
} from '@mantine/core';
import { IconSparkles, IconCheck } from '@tabler/icons-react';
import { parseBankText, ParsedTextTransaction } from '../utils/textImportParser';

interface TextImportModalProps {
  opened: boolean;
  onClose: () => void;
  onImport: (items: any[]) => void;
}

export function TextImportModal({ opened, onClose, onImport }: TextImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [targetAccount, setTargetAccount] = useState('Interbank USD');
  const [parsedRows, setParsedRows] = useState<ParsedTextTransaction[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  const handleParse = () => {
    if (!rawText.trim()) return;
    const rows = parseBankText(rawText, targetAccount);
    setParsedRows(rows);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    const formattedForState = parsedRows.map((r) => ({
      id: r.id,
      date: r.date,
      desc: r.normalizedDesc,
      cat: r.cat,
      account: r.account,
      type: r.type,
      amount: r.amountFormatted,
      color: r.color,
    }));

    onImport(formattedForState);
    setRawText('');
    setParsedRows([]);
    setStep('input');
    onClose();
  };

  const sampleText = `FECHA
DESCRIPCIÓN
MONTO
30/07/2026
PLAYSTATION /455103******7819
US$ -17.69
24/07/2026
EBN*SPOTIFY /455103******7819
US$ -7.23
20/07/2026
OPENAI *CHATGPT SUBS/455103******7819
US$ -24.17
03/07/2026
O.PAGO REC EXT LIQ:0143519
US$ 2,808.00`;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconSparkles size={20} color="#38bdf8" />
          <Title order={4} style={{ color: '#f8fafc' }}>
            Importar Pegando Texto Bancario (IA & Reglas)
          </Title>
        </Group>
      }
      size="xl"
      centered
      radius="md"
    >
      {step === 'input' ? (
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            Pega directamente el texto copiado de tu banca por internet (Interbank, BCP, BBVA, Falabella). El motor de IA extraerá automáticamente fechas, descripciones, importes, divisas y categorías.
          </Text>

          <Group justify="space-between" align="flex-end">
            <Select
              label="Cuenta de Destino"
              data={['Interbank USD', 'BCP Sueldo Soles', 'BBVA Ahorros USD', 'Falabella Soles']}
              value={targetAccount}
              onChange={(v) => setTargetAccount(v || 'Interbank USD')}
              style={{ width: 250 }}
            />
            <Button
              variant="subtle"
              color="blue"
              size="xs"
              onClick={() => setRawText(sampleText)}
            >
              Cargar Ejemplo de Prueba
            </Button>
          </Group>

          <Textarea
            label="Texto Copiado de la Banca Online"
            placeholder="Pega aquí el texto con las fechas, descripciones y montos..."
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            style={{ fontFamily: 'monospace' }}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              color="violet"
              disabled={!rawText.trim()}
              leftSection={<IconSparkles size={16} />}
              onClick={handleParse}
            >
              Procesar e Identificar Movimientos
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <Badge color="green" size="lg">
                {parsedRows.length} Movimientos Detectados
              </Badge>
              <Badge color="blue" variant="light">
                Cuenta: {targetAccount}
              </Badge>
            </Group>
            <Button variant="subtle" color="gray" size="xs" onClick={() => setStep('input')}>
              Editar Texto Original
            </Button>
          </Group>

          <Paper p="xs" radius="md" style={{ background: '#0f172a', border: '1px solid #334155', maxHeight: 350, overflowY: 'auto' }}>
            <Table highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr style={{ borderColor: '#334155' }}>
                  <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Descripción Identificada</Table.Th>
                  <Table.Th style={{ color: '#94a3b8' }}>Categoría IA</Table.Th>
                  <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Monto</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {parsedRows.map((r, idx) => (
                  <Table.Tr key={idx} style={{ borderColor: '#334155' }}>
                    <Table.Td>{r.date}</Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>{r.normalizedDesc}</Text>
                      {r.rawDesc !== r.normalizedDesc && (
                        <Text size="xs" c="dimmed">{r.rawDesc}</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color="gray" size="xs" variant="light">{r.cat}</Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text fw={700} color={r.color === 'red' ? 'red' : 'teal'}>
                        {r.amountFormatted}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setStep('input')}>
              Atrás
            </Button>
            <Button color="teal" leftSection={<IconCheck size={16} />} onClick={handleConfirmImport}>
              Confirmar e Importar {parsedRows.length} Movimientos
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
