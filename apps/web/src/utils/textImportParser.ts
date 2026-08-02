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
    .filter((l) => l.length > 0);

  const results: ParsedTextTransaction[] = [];
  const amountRegex = /^(US\$|S\/|\$|PEN|USD)?\s*(-?\s*[\d,]+\.?\d*)$/i;

  let currentDate = '';
  let currentDesc = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ignorar cabeceras típicas de copiado
    if (line.toLowerCase().includes('fecha de compra') || line.toLowerCase().includes('titular/adicional')) {
      continue;
    }

    // CASO A: SI CONTIENE TABULADORES (Formato tabla / Excel)
    if (line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim());
      
      // Intentar encontrar la fecha de la transacción (suele estar al principio)
      const datePart = parts.find(p => /^(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})$/.test(p));
      if (!datePart) continue;

      // Normalizar separadores de fecha a /
      const formattedDate = datePart.replace(/-/g, '/');

      // La descripción suele ser la segunda columna o la que sigue a la fecha
      const descPart = parts[1] || parts[0];

      // Monto: buscar una columna numérica útil
      let amountVal = 0;
      let currencyStr = 'PEN';
      
      for (let j = parts.length - 1; j >= 2; j--) {
        const p = parts[j];
        const cleanVal = p.replace(/\s/g, '').replace(/,/g, '').replace('S/', '').replace('$', '');
        const parsed = parseFloat(cleanVal);
        if (!isNaN(parsed) && parsed !== 0 && !p.includes('/') && p.length < 15) {
          amountVal = parsed;
          if (p.includes('$') || line.includes('$') || line.toLowerCase().includes('usd')) {
            currencyStr = 'USD';
          }
          break;
        }
      }

      if (amountVal !== 0) {
        // REGRA DE SIGNOS TARJETAS DE CRÉDITO
        // En extractos de tarjeta, consumos son positivos (deuda) y abonos/pagos son negativos (abono).
        // Debemos invertir los signos para que el presupuesto y la deuda de tarjeta sean correctos:
        const upperDesc = descPart.toUpperCase();
        let finalAmount = amountVal;

        if (upperDesc.includes('PAGO') || upperDesc.includes('ABONO') || upperDesc.includes('DEVOLUCION') || upperDesc.includes('REEMBOLSO')) {
          finalAmount = Math.abs(amountVal); // Pago/abono reduce deuda (es positivo para la tarjeta)
        } else {
          finalAmount = -Math.abs(amountVal); // Consumo/seguro/comisión aumenta deuda (es negativo)
        }

        const isExpense = finalAmount < 0;
        const currencyCode = currencyStr === 'USD' ? '$' : 'S/';
        const absVal = Math.abs(finalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const amountFormatted = isExpense ? `- ${currencyCode} ${absVal}` : `+ ${currencyCode} ${absVal}`;
        const color = isExpense ? 'red' : 'teal';

        const { normalizedDesc, category, type } = classifyDescription(descPart, isExpense);

        results.push({
          id: Date.now() + Math.random(),
          date: formattedDate,
          rawDesc: descPart,
          normalizedDesc,
          cat: category,
          account: defaultAccount,
          type,
          currency: currencyStr,
          rawAmount: finalAmount,
          amountFormatted,
          color,
        });
      }
      continue;
    }

    // CASO B: MONO-COLUMNA TRADICIONAL
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

  if (upper.includes('SEGURO DESGRAVAMEN') || upper.includes('DESGRAVAMEN')) {
    return { normalizedDesc: 'Seguro de Desgravamen', category: 'Seguro de desgravamen', type: 'Gasto' };
  }
  if (upper.includes('COMISION PAGO TARJETA') || upper.includes('COMISION')) {
    return { normalizedDesc: desc, category: 'Comisión bancaria', type: 'Gasto' };
  }
  if (upper.includes('ITF')) {
    return { normalizedDesc: 'ITF (Impuesto Transacciones)', category: 'Comisiones & Impuestos', type: 'Gasto' };
  }
  if (upper.includes('PLAYSTATION') || upper.includes('PSN')) {
    return { normalizedDesc: 'PlayStation Store', category: 'Entretenimiento & Juegos', type: 'Gasto' };
  }
  if (upper.includes('SPOTIFY')) {
    return { normalizedDesc: 'Spotify Premium', category: 'Streaming & Música', type: 'Gasto Fijo' };
  }
  if (upper.includes('OPENAI') || upper.includes('CHATGPT')) {
    return { normalizedDesc: 'OpenAI ChatGPT Subscription', category: 'Tecnología & IA', type: 'Gasto Fijo' };
  }
  if (upper.includes('TRANSF INMEDIATA') || upper.includes('TRANSFERENCIA') || upper.includes('TRANSF.BCO') || upper.includes('TRAS A :') || upper.includes('PAGO TRANSF')) {
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
  if (upper.includes('COM. Y GASTOS') || upper.includes('CARGO')) {
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
