export interface ParsedTextTransaction {
  id: number;
  date: string;
  rawDesc: string;
  normalizedDesc: string;
  cat: string;
  account: string;
  type: string;
  currency: string;
  rawAmount: number;
  amountFormatted: string;
  color: string;
  isDuplicate?: boolean;
}

function parseDateText(line: string): string | null {
  const dateRegex = /^(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})$/;
  if (dateRegex.test(line)) return line;

  const monthRegex = /^(\d{1,2})\s+(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*$/i;
  const match = line.match(monthRegex);
  if (match) {
    const day = match[1].padStart(2, '0');
    const monthStr = match[2].toLowerCase();
    const months: Record<string, string> = { ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06', jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12' };
    const month = months[monthStr];
    return `${day}/${month}/2026`;
  }
  
  return null;
}

export function parseBankText(rawText: string, defaultAccount: string = 'Interbank USD'): ParsedTextTransaction[] {
  const lines = rawText.split('\n')
    .map((l) => l.trim())
    .filter((l) => 
      l.length > 0 && 
      !['angle-down', 'angle-up', 'fecha', 'descripción', 'monto'].includes(l.toLowerCase()) && 
      l.length > 1
    );

  const results: ParsedTextTransaction[] = [];
  const amountRegex = /^(US\$|S\/|\$|PEN|USD)?\s*(-?\s*[\d,]+\.?\d*)$/i;

  let currentDate = '';
  let currentDesc = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const parsedDate = parseDateText(line);
    if (parsedDate) {
      currentDate = parsedDate;
      continue;
    }

    const amountMatch = line.match(amountRegex);
    if (amountMatch && currentDate) {
      const currencySymbol = amountMatch[1] || '';
      const rawNumStr = amountMatch[2].replace(/\s/g, '').replace(/,/g, '');
      const num = parseFloat(rawNumStr);

      if (!isNaN(num)) {
        const isUSD = currencySymbol.toUpperCase().includes('US') || currencySymbol.includes('$');
        const currencyCode = isUSD ? '$' : 'S/';
        const isExpense = num < 0;
        const absVal = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const amountFormatted = isExpense ? `- ${currencyCode} ${absVal}` : `+ ${currencyCode} ${absVal}`;
        const color = isExpense ? 'red' : 'teal';

        const { normalizedDesc, category, type } = classifyDescription(currentDesc, isExpense);

        results.push({
          id: Date.now() + Math.random(),
          date: currentDate,
          rawDesc: currentDesc,
          normalizedDesc,
          cat: category,
          account: defaultAccount,
          type,
          currency: isUSD ? 'USD' : 'PEN',
          rawAmount: num,
          amountFormatted,
          color,
        });

        currentDesc = '';
      }
    } else {
      if (currentDesc) {
        currentDesc += ' ' + line;
      } else {
        currentDesc = line;
      }
    }
  }

  return results;
}

function classifyDescription(desc: string, isExpense: boolean): { normalizedDesc: string; category: string; type: string } {
  const upper = desc.toUpperCase();

  if (upper.includes('PLAYSTATION') || upper.includes('PSN')) {
    return { normalizedDesc: 'PlayStation Store', category: 'Entretenimiento & Juegos', type: 'Gasto' };
  }
  if (upper.includes('SPOTIFY')) {
    return { normalizedDesc: 'Spotify Premium', category: 'Streaming & Música', type: 'Gasto Fijo' };
  }
  if (upper.includes('OPENAI') || upper.includes('CHATGPT')) {
    return { normalizedDesc: 'OpenAI ChatGPT Subscription', category: 'Tecnología & IA', type: 'Gasto Fijo' };
  }
  if (upper.includes('TRANSF INMEDIATA') || upper.includes('TRANSFERENCIA') || upper.includes('TRANSF.BCO') || upper.includes('TRAS A :')) {
    return { normalizedDesc: desc, category: 'Transferencia Inmediata', type: 'Transferencia' };
  }
  if (upper.includes('PAG.T.PROP.VISA') || upper.includes('PAGO DE TARJETA')) {
    return { normalizedDesc: desc, category: 'Pago de Tarjeta', type: 'Transferencia' };
  }
  if (upper.includes('DEP.PLAZ') || upper.includes('DEPOSITO PLAZO')) {
    return { normalizedDesc: desc, category: 'Depósito a Plazo Fijo', type: 'Transferencia' };
  }
  if (upper.startsWith('YC-') || upper.startsWith('YP ') || upper.startsWith('YAPE')) {
    return { normalizedDesc: desc, category: isExpense ? 'Pagos Yape' : 'Ingresos Yape', type: isExpense ? 'Gasto' : 'Ingreso' };
  }
  if (upper.includes('ABON PLIN') || upper.includes('PLIN')) {
    return { normalizedDesc: desc, category: isExpense ? 'Pagos Plin' : 'Ingresos Plin', type: isExpense ? 'Gasto' : 'Ingreso' };
  }
  if (upper.includes('COM. Y GASTOS') || upper.includes('ITF') || upper.includes('CARGO') || upper.includes('COMISION')) {
    return { normalizedDesc: desc, category: 'Comisiones & Impuestos', type: 'Comisión Bancaria' };
  }
  if (upper.includes('O.PAGO REC EXT') || upper.includes('ABONO') || upper.includes('SUELDO') || upper.includes('INGRESO')) {
    return { normalizedDesc: desc, category: 'Ingreso / Pago Recibido', type: 'Ingreso' };
  }

  return {
    normalizedDesc: desc,
    category: isExpense ? 'Varios / Otros' : 'Ingresos Varios',
    type: isExpense ? 'Gasto' : 'Ingreso',
  };
}
