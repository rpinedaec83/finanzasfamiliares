import { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Button,
  Select,
  Badge,
  Table,
  Checkbox,
  Alert,
  Card,
  Grid,
} from '@mantine/core';
import {
  IconFileSpreadsheet,
  IconUpload,
  IconCheck,
  IconBuildingBank,
  IconSparkles,
} from '@tabler/icons-react';
import { TextImportModal } from './TextImportModal';

interface ImportViewProps {
  onImportItems?: (items: any[]) => void;
  accounts?: { id: number; name: string }[];
  creditCards?: { id: string; name: string }[];
}

export function ImportView({ onImportItems, accounts, creditCards }: ImportViewProps) {
  const [selectedBank, setSelectedBank] = useState<string | null>('bcp');
  const [textModalOpened, setTextModalOpened] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  const cardAsAccounts = (creditCards || []).map((c, i) => ({ id: 20000 + i, name: c.name || (c as any).Name || '' }));
  const allAccountsForImport = [...(accounts || []), ...cardAsAccounts];

  const [previewRows, setPreviewRows] = useState([
    { id: 1, date: '28/07/2026', desc: 'COMPRA SUPERMERCADOS WONG PE', normalized: 'Supermercados Wong', amount: 'S/ 385.50', isDebit: true, cat: 'Supermercado', duplicate: false, confirmed: true },
    { id: 2, date: '29/07/2026', desc: 'ABONO POR NOMINA EMPRESA', normalized: 'Abono Sueldo Empresa', amount: 'S/ 7,500.00', isDebit: false, cat: 'Sueldo', duplicate: false, confirmed: true },
    { id: 3, date: '30/07/2026', desc: 'CARGO NETFLIX SUBSCRIPTION', normalized: 'Netflix', amount: 'S/ 44.90', isDebit: true, cat: 'Streaming', duplicate: true, confirmed: false },
    { id: 4, date: '31/07/2026', desc: 'PAGO SERVICIO LUZ LUZ DEL SUR', normalized: 'Luz del Sur', amount: 'S/ 142.80', isDebit: true, cat: 'Servicios Básicos', duplicate: false, confirmed: true },
  ]);

  const handleSimulateUpload = () => {
    setIsUploaded(true);
  };

  const handleConfirmImport = () => {
    alert('¡Importación bancaria realizada con éxito! Se han registrado los movimientos confirmados.');
    setIsUploaded(false);
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2} style={{ color: '#f8fafc' }}>
            Importación Bancaria Determinística & OCR
          </Title>
          <Text size="sm" c="dimmed">
            Ingesta de extractos en PDF, Excel, CSV, Fotos de Vouchers o Pegando Texto Directo
          </Text>
        </div>
        <Button
          color="violet"
          leftSection={<IconSparkles size={16} />}
          onClick={() => setTextModalOpened(true)}
        >
          Pegar Texto Copiado (IA)
        </Button>
      </Group>

      <TextImportModal
        opened={textModalOpened}
        onClose={() => setTextModalOpened(false)}
        onImport={(newItems) => {
          if (onImportItems) {
            onImportItems(newItems);
          }
        }}
        accounts={allAccountsForImport}
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Stack gap="md">
              <Group>
                <IconBuildingBank size={24} color="#38bdf8" />
                <Text fw={700} style={{ color: '#f8fafc' }}>
                  Configuración de Importación
                </Text>
              </Group>

              <Select
                label="Institución Financiera"
                data={[
                  { value: 'BCP', label: 'Banco de Crédito del Perú (BCP)' },
                  { value: 'BBVA', label: 'BBVA Perú' },
                  { value: 'INTERBANK', label: 'Interbank' },
                  { value: 'FALABELLA', label: 'Banco Falabella (CMR)' },
                ]}
                value={selectedBank}
                onChange={setSelectedBank}
              />

              <Select
                label="Formato de Entrada"
                data={[
                  { value: 'pdf', label: 'PDF Vectorial / Digital' },
                  { value: 'excel', label: 'Excel (.xlsx, .xls) / CSV' },
                  { value: 'ocr', label: 'PDF Escaneado / Foto Voucher (OCR)' },
                ]}
                defaultValue="pdf"
              />

              <Paper
                p="xl"
                radius="md"
                style={{
                  border: '2px dashed #38bdf8',
                  background: '#0f172a',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
                onClick={handleSimulateUpload}
              >
                <Stack align="center" gap="xs">
                  <IconUpload size={40} color="#38bdf8" />
                  <Text size="sm" fw={600} style={{ color: '#f8fafc' }}>
                    Arrastra o selecciona tu archivo
                  </Text>
                  <Text size="xs" c="dimmed">
                    Soporta .pdf, .xlsx, .csv, .jpg, .png (máx 15MB)
                  </Text>
                </Stack>
              </Paper>

              <Button
                leftSection={<IconFileSpreadsheet size={18} />}
                color="teal"
                fullWidth
                onClick={handleSimulateUpload}
              >
                Procesar Documento
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          {isUploaded ? (
            <Card p="md" radius="md" style={{ background: '#1e293b', border: '1px solid #334155' }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={700} size="lg" style={{ color: '#f8fafc' }}>
                      Vista Previa de Importación: BCP Cuenta Sueldo
                    </Text>
                    <Text size="xs" c="dimmed">
                      Archivo: `EstadoCuenta_BCP_Julio2026.pdf`
                    </Text>
                  </div>
                  <Badge color="green" size="lg" variant="light" leftSection={<IconCheck size={14} />}>
                    Saldos Cuadrados 100%
                  </Badge>
                </Group>

                <Alert color="teal" icon={<IconCheck size={18} />} title="Validación Contable Positiva">
                  Saldo Inicial: <b>S/ 2,500.00</b> + Créditos: <b>S/ 7,500.00</b> - Débitos: <b>S/ 573.20</b> = Saldo Final: <b>S/ 9,426.80</b>
                </Alert>

                <Table highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr style={{ borderColor: '#334155' }}>
                      <Table.Th style={{ color: '#94a3b8' }}>Importar</Table.Th>
                      <Table.Th style={{ color: '#94a3b8' }}>Fecha</Table.Th>
                      <Table.Th style={{ color: '#94a3b8' }}>Descripción Extraída</Table.Th>
                      <Table.Th style={{ color: '#94a3b8' }}>Categoría Sugerida</Table.Th>
                      <Table.Th style={{ color: '#94a3b8', textAlign: 'right' }}>Monto</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {previewRows.map((row) => (
                      <Table.Tr key={row.id} style={{ borderColor: '#334155' }}>
                        <Table.Td>
                          <Checkbox
                            checked={row.confirmed}
                            onChange={(e) => {
                              const updated = previewRows.map((r) =>
                                r.id === row.id ? { ...r, confirmed: e.currentTarget.checked } : r
                              );
                              setPreviewRows(updated);
                            }}
                          />
                        </Table.Td>
                        <Table.Td>{row.date}</Table.Td>
                        <Table.Td>
                          <Text fw={600} size="sm">{row.normalized}</Text>
                          <Text size="xs" c="dimmed">{row.desc}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color="blue" variant="light">{row.cat}</Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right', fontWeight: 700, color: row.isDebit ? '#f87171' : '#4ade80' }}>
                          {row.isDebit ? `- ${row.amount}` : `+ ${row.amount}`}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                <Group justify="flex-end">
                  <Button variant="light" color="gray" onClick={() => setIsUploaded(false)}>
                    Cancelar
                  </Button>
                  <Button color="teal" leftSection={<IconCheck size={18} />} onClick={handleConfirmImport}>
                    Confirmar e Importar ({previewRows.filter(r => r.confirmed).length}) Movimientos
                  </Button>
                </Group>
              </Stack>
            </Card>
          ) : (
            <Paper p="xl" radius="md" style={{ background: '#1e293b', border: '1px solid #334155', textAlign: 'center' }}>
              <Stack align="center" gap="md">
                <IconFileSpreadsheet size={60} color="#94a3b8" />
                <div>
                  <Title order={3} style={{ color: '#f8fafc' }}>
                    No hay ningún documento seleccionado
                  </Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    Selecciona un banco y sube un estado de cuenta para visualizar la extracción automática de movimientos y verificación de saldos.
                  </Text>
                </div>
              </Stack>
            </Paper>
          )}
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
