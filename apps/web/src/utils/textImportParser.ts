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

export function parseBankText(rawText: string, defaultAccount: string = 'Interbank USD'): ParsedTextTransaction[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const results: ParsedTextTransaction[] = [];

  const dateRegex = /^(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})$/;
  const amountRegex = /^(US\$|S\/|\$|PEN|USD)?\s*(-?\s*[\d,]+\.?\d*)$/i;

  let currentDate = '';
  let currentDesc = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === 'FECHA' || line === 'DESCRIPCIÓN' || line === 'MONTO') {
      continue;
    }

    if (dateRegex.test(line)) {
      currentDate = line;
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
  if (upper.includes('TRANSF INMEDIATA') || upper.includes('TRANSFERENCIA')) {
    return { normalizedDesc: desc, category: 'Transferencia Inmediata', type: 'Transferencia' };
  }
  if (upper.includes('COM. Y GASTOS') || upper.includes('ITF') || upper.includes('CARGO')) {
    return { normalizedDesc: desc, category: 'Comisiones & Impuestos', type: 'Comisión Bancaria' };
  }
  if (upper.includes('O.PAGO REC EXT') || upper.includes('ABONO') || upper.includes('SUELDO')) {
    return { normalizedDesc: desc, category: 'Ingreso / Pago Recibido', type: 'Ingreso' };
  }

  return {
    normalizedDesc: desc,
    category: isExpense ? 'Varios / Otros' : 'Ingresos Varios',
    type: isExpense ? 'Gasto' : 'Ingreso',
  };
}
