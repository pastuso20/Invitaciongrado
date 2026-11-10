import { RsvpEntry } from '../types/invitation';
import { getAccessToken } from './googleAuth';

export interface SheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheetName: string;
  lastSyncedAt?: string;
}

const SHEETS_CONFIG_KEY = 'graduation_sheets_config_v1';

export const getStoredSheetsConfig = (): SheetsConfig | null => {
  try {
    const raw = localStorage.getItem(SHEETS_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSheetsConfig = (config: SheetsConfig): void => {
  try {
    localStorage.setItem(SHEETS_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Error guardando configuración de Google Sheets:', err);
  }
};

export const clearSheetsConfig = (): void => {
  try {
    localStorage.removeItem(SHEETS_CONFIG_KEY);
  } catch {
    // ignore
  }
};

/**
 * Creates a new Google Spreadsheet in the user's Google Drive with styled headers
 */
export const createGraduationSpreadsheet = async (
  accessToken: string,
  customTitle?: string
): Promise<SheetsConfig> => {
  const title = customTitle || 'Asistencia - Gala de Graduación 2026 (I.E.M. Chambú)';
  const sheetName = 'Confirmaciones';

  const body = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: sheetName,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Fecha y Hora' } },
                  { userEnteredValue: { stringValue: 'Código de Pase' } },
                  { userEnteredValue: { stringValue: 'Nombre Completo' } },
                  { userEnteredValue: { stringValue: '¿Asistirá?' } },
                  { userEnteredValue: { stringValue: 'Acompañantes' } },
                  { userEnteredValue: { stringValue: 'Pases Totales' } },
                  { userEnteredValue: { stringValue: 'Canción Sugerida' } },
                  { userEnteredValue: { stringValue: 'Mensaje de Felicitación' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Error al crear hoja de cálculo (${res.status})`
    );
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl =
    data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Apply styling to header row (Navy Blue background, bold white text)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: data.sheets?.[0]?.properties?.sheetId || 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 }, // Navy slate #0f172a
                  textFormat: {
                    foregroundColor: { red: 0.98, green: 0.85, blue: 0.45 }, // Gold #fcd34d
                    bold: true,
                    fontSize: 11,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('No se pudo aplicar estilo opcional a los encabezados:', styleErr);
  }

  const config: SheetsConfig = {
    spreadsheetId,
    spreadsheetUrl,
    title,
    sheetName,
    lastSyncedAt: new Date().toISOString(),
  };

  saveSheetsConfig(config);
  return config;
};

/**
 * Verifies access to an existing spreadsheet and discovers its first sheet name
 */
export const verifySpreadsheetAccess = async (
  accessToken: string,
  spreadsheetId: string
): Promise<{ title: string; sheetName: string; spreadsheetUrl: string }> => {
  const cleanId = spreadsheetId.includes('/')
    ? spreadsheetId.split('/d/')[1]?.split('/')[0] || spreadsheetId
    : spreadsheetId.trim();

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title,sheets.properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        `No se pudo acceder a la hoja (${res.status}). Verifica los permisos y el ID.`
    );
  }

  const data = await res.json();
  const title = data.properties?.title || 'Hoja de Asistencia';
  const firstSheetName = data.sheets?.[0]?.properties?.title || 'Sheet1';
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;

  return {
    title,
    sheetName: firstSheetName,
    spreadsheetUrl,
  };
};

/**
 * Appends a single RSVP entry to the Google Sheet
 */
export const appendRsvpToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  entry: RsvpEntry
): Promise<boolean> => {
  const dateFormatted = new Date(entry.createdAt).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const row = [
    dateFormatted,
    entry.ticketCode,
    entry.name,
    entry.attending ? 'SÍ' : 'NO',
    entry.attending ? entry.companions : 0,
    entry.attending ? 1 + entry.companions : 0,
    entry.songRequest || '-',
    entry.message || '-',
  ];

  const range = encodeURIComponent(`${sheetName}!A:H`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Error al guardar fila en Google Sheets');
  }

  return true;
};

/**
 * Synchronizes a list of RSVP entries to Google Sheets, skipping any that already exist
 */
export const syncEntriesToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  entries: RsvpEntry[]
): Promise<{ syncedCount: number }> => {
  if (entries.length === 0) return { syncedCount: 0 };

  // Fetch existing ticket codes in Column B to prevent duplicate rows
  const rangeB = encodeURIComponent(`${sheetName}!B:B`);
  let existingCodes = new Set<string>();

  try {
    const checkRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeB}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (Array.isArray(data.values)) {
        data.values.forEach((row: any[]) => {
          if (row?.[0]) existingCodes.add(String(row[0]).trim());
        });
      }
    }
  } catch (checkErr) {
    console.warn('No se pudieron leer códigos existentes, se continuará normalmente:', checkErr);
  }

  // Filter out already synced entries
  const newEntries = entries.filter((e) => !existingCodes.has(e.ticketCode));

  if (newEntries.length === 0) {
    return { syncedCount: 0 };
  }

  const rows = newEntries.map((entry) => [
    new Date(entry.createdAt).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    entry.ticketCode,
    entry.name,
    entry.attending ? 'SÍ' : 'NO',
    entry.attending ? entry.companions : 0,
    entry.attending ? 1 + entry.companions : 0,
    entry.songRequest || '-',
    entry.message || '-',
  ]);

  const range = encodeURIComponent(`${sheetName}!A:H`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Error sincronizando registros con Google Sheets');
  }

  // Update lastSyncedAt
  const currentConfig = getStoredSheetsConfig();
  if (currentConfig && currentConfig.spreadsheetId === spreadsheetId) {
    currentConfig.lastSyncedAt = new Date().toISOString();
    saveSheetsConfig(currentConfig);
  }

  return { syncedCount: newEntries.length };
};

export const DEFAULT_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbyKnoNBTrPiSIt8YhfmFj1jEwdYsk_I6DtRPImZTSAl14hQK6dchkDxsWq6cbyztlXMcQ/exec';

/**
 * Directly submits RSVP to Google Sheets automatically when a user confirms attendance.
 * Works seamlessly without requiring guests to sign in.
 */
export const sendRsvpDirectlyToGoogleSheets = async (
  entry: RsvpEntry
): Promise<{ success: boolean; method: string }> => {
  const payload = {
    fecha: new Date(entry.createdAt).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    codigo: entry.ticketCode,
    nombre: entry.name,
    asistira: entry.attending ? 'SÍ' : 'NO',
    acompanantes: entry.attending ? entry.companions : 0,
    pasesTotales: entry.attending ? 1 + entry.companions : 0,
    cancion: entry.songRequest || '-',
    mensaje: entry.message || '-',
  };

  let sent = false;
  let method = 'local';

  // 1. Send via Google Apps Script Webhook if configured (no guest login needed)
  const webhookUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL) ||
    localStorage.getItem('graduation_sheets_webhook_url') ||
    DEFAULT_WEBHOOK_URL;

  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      sent = true;
      method = 'webhook';
    } catch (e) {
      console.warn('Webhook dispatch warning:', e);
    }
  }

  // 2. Send via Google Sheets API if an active token and config exist
  try {
    const config = getStoredSheetsConfig();
    const token = await getAccessToken();
    if (config && token) {
      await appendRsvpToSheet(token, config.spreadsheetId, config.sheetName, entry);
      sent = true;
      method = 'sheets_api';
    }
  } catch (apiErr) {
    console.warn('Sheets API auto-save deferred:', apiErr);
  }

  // 3. Send to server /api/rsvp backup endpoint if available
  try {
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => null);
  } catch {}

  return { success: sent, method };
};

/**
 * Tests connection to a Google Apps Script Webhook URL by sending a sample ping entry
 */
export const testWebhookEndpoint = async (
  url: string
): Promise<{ success: boolean; message: string }> => {
  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'La URL ingresada no es válida. Debe comenzar con https://script.google.com/macros/s/...' };
  }

  const testPayload = {
    fecha: new Date().toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    codigo: 'TEST-0001',
    nombre: '🧪 Prueba de Conexión (Organizador)',
    asistira: 'SÍ',
    acompanantes: 1,
    pasesTotales: 2,
    cancion: 'Música de Celebración',
    mensaje: '¡Conexión verificada exitosamente entre la invitación y Google Sheets!',
  };

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(testPayload),
    });

    return {
      success: true,
      message: '¡Prueba enviada! Abre tu Google Sheet para confirmar que apareció la fila con código "TEST-0001".',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Error de red al conectar con el Webhook de Google Apps Script.',
    };
  }
};
