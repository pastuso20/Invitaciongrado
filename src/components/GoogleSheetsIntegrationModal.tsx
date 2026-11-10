import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  LogOut,
  AlertCircle,
  Plus,
  Link as LinkIcon,
  X,
  Sparkles,
  Copy,
  Check,
  Code,
  Send,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/googleAuth';
import {
  SheetsConfig,
  getStoredSheetsConfig,
  saveSheetsConfig,
  clearSheetsConfig,
  createGraduationSpreadsheet,
  verifySpreadsheetAccess,
  syncEntriesToSheet,
  testWebhookEndpoint,
  DEFAULT_WEBHOOK_URL,
} from '../services/googleSheets';
import { RsvpEntry } from '../types/invitation';

interface GoogleSheetsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  localEntries: RsvpEntry[];
  onSynced?: () => void;
}

export const GoogleSheetsIntegrationModal: React.FC<GoogleSheetsIntegrationModalProps> = ({
  isOpen,
  onClose,
  localEntries,
  onSynced,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig | null>(getStoredSheetsConfig());

  // Action states
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isLinkingManual, setIsLinkingManual] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(
    () =>
      localStorage.getItem('graduation_sheets_webhook_url') ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SHEETS_WEBHOOK_URL) ||
      DEFAULT_WEBHOOK_URL
  );
  const [showWebhookInput, setShowWebhookInput] = useState(false);
  const [savedWebhook, setSavedWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const APPS_SCRIPT_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Confirmaciones") || ss.getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Fecha y Hora", "Código de Pase", "Nombre Completo", "¿Asistirá?", "Acompañantes", "Pases Totales", "Canción Sugerida", "Mensaje de Felicitación"]);
    }
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter || {}; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    var fecha = data.fecha || Utilities.formatDate(new Date(), "America/Bogota", "dd/MM/yyyy, hh:mm a");
    var codigo = data.codigo || "";
    var nombre = data.nombre || "Invitado";
    var asistira = data.asistira || "SÍ";
    var acompanantes = (data.acompanantes !== undefined && data.acompanantes !== null) ? data.acompanantes : 0;
    var pasesTotales = (data.pasesTotales !== undefined && data.pasesTotales !== null) ? data.pasesTotales : (asistira === "SÍ" ? 1 + Number(acompanantes) : 0);
    var cancion = data.cancion || "-";
    var mensaje = data.mensaje || "-";

    sheet.appendRow([fecha, codigo, nombre, asistira, acompanantes, pasesTotales, cancion, mensaje]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "online", message: "Webhook activo" })).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleTestWebhook = async () => {
    const url = webhookUrl.trim();
    if (!url) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor ingresa primero la URL del Webhook para probar la conexión.',
      });
      return;
    }
    setIsTestingWebhook(true);
    setStatusMessage(null);
    try {
      const res = await testWebhookEndpoint(url);
      setStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error probando la conexión.',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (webhookUrl.trim()) {
      localStorage.setItem('graduation_sheets_webhook_url', webhookUrl.trim());
      setSavedWebhook(true);
      setTimeout(() => setSavedWebhook(false), 2500);
      setStatusMessage({
        type: 'success',
        text: '¡Enlace directo de Google Sheets guardado! Cada confirmación se enviará directamente a esta URL.',
      });
    } else {
      localStorage.removeItem('graduation_sheets_webhook_url');
      setStatusMessage({
        type: 'success',
        text: 'Enlace directo de Google Sheets eliminado.',
      });
    }
  };

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Update config from localStorage when opened
  useEffect(() => {
    if (isOpen) {
      setSheetsConfig(getStoredSheetsConfig());
      setStatusMessage(null);
    }
  }, [isOpen]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      setUser(res.user);
      setToken(res.accessToken);
      setStatusMessage({
        type: 'success',
        text: `¡Bienvenido, ${res.user.displayName || res.user.email}! Cuenta de Google conectada.`,
      });
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'No se pudo completar el inicio de sesión con Google.',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setStatusMessage({
      type: 'success',
      text: 'Sesión de Google cerrada correctamente.',
    });
  };

  const handleCreateNewSheet = async () => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor, inicia sesión con Google primero para crear la hoja en tu Google Drive.',
      });
      return;
    }

    setIsCreatingSheet(true);
    setStatusMessage(null);
    try {
      const newConfig = await createGraduationSpreadsheet(activeToken);
      setSheetsConfig(newConfig);

      // Auto sync existing local RSVPs if any
      if (localEntries.length > 0) {
        const { syncedCount } = await syncEntriesToSheet(
          activeToken,
          newConfig.spreadsheetId,
          newConfig.sheetName,
          localEntries
        );
        setStatusMessage({
          type: 'success',
          text: `¡Hoja creada con éxito en Google Drive y ${syncedCount} confirmaciones sincronizadas!`,
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: '¡Hoja "Asistencia - Gala de Graduación 2026" creada con éxito en tu Google Drive!',
        });
      }

      if (onSynced) onSynced();
    } catch (err: any) {
      console.error('Error creating spreadsheet:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Ocurrió un error al crear la hoja en Google Drive.',
      });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleLinkExistingSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor, inicia sesión con Google primero.',
      });
      return;
    }

    setIsLinkingManual(true);
    setStatusMessage(null);
    try {
      const info = await verifySpreadsheetAccess(activeToken, manualInput.trim());
      const cleanId = manualInput.includes('/')
        ? manualInput.split('/d/')[1]?.split('/')[0] || manualInput.trim()
        : manualInput.trim();

      const newConfig: SheetsConfig = {
        spreadsheetId: cleanId,
        spreadsheetUrl: info.spreadsheetUrl,
        title: info.title,
        sheetName: info.sheetName,
        lastSyncedAt: new Date().toISOString(),
      };

      saveSheetsConfig(newConfig);
      setSheetsConfig(newConfig);
      setShowManualInput(false);
      setManualInput('');

      setStatusMessage({
        type: 'success',
        text: `¡Hoja "${info.title}" vinculada correctamente!`,
      });
      if (onSynced) onSynced();
    } catch (err: any) {
      console.error('Error linking spreadsheet:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'No se pudo verificar la hoja. Revisa el enlace o permisos.',
      });
    } finally {
      setIsLinkingManual(false);
    }
  };

  const handleSyncNow = async () => {
    if (!sheetsConfig) return;
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setStatusMessage({
        type: 'error',
        text: 'Tu sesión de Google expiró. Por favor inicia sesión de nuevo para sincronizar.',
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const { syncedCount } = await syncEntriesToSheet(
        activeToken,
        sheetsConfig.spreadsheetId,
        sheetsConfig.sheetName,
        localEntries
      );
      setSheetsConfig(getStoredSheetsConfig());
      setStatusMessage({
        type: 'success',
        text:
          syncedCount > 0
            ? `¡Se sincronizaron ${syncedCount} nuevas confirmaciones en Google Sheets!`
            : '¡Tu hoja de Google Sheets ya está 100% al día con todos los registros!',
      });
      if (onSynced) onSynced();
    } catch (err: any) {
      console.error('Sync error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al sincronizar con Google Sheets.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectSheet = () => {
    const confirmed = window.confirm(
      '¿Deseas desvincular la hoja de cálculo de esta invitación? (La hoja continuará guardada en tu Google Drive).'
    );
    if (!confirmed) return;
    clearSheetsConfig();
    setSheetsConfig(null);
    setStatusMessage({
      type: 'success',
      text: 'Hoja de Google Sheets desvinculada de la invitación.',
    });
    if (onSynced) onSynced();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0c121e] border-2 border-amber-500/50 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="relative px-5 py-4 border-b border-amber-500/30 bg-gradient-to-r from-[#0f172a] via-[#162033] to-[#0f172a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full rounded-[10px] bg-[#0c121e] flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                Google Sheets · Asistencias
              </h2>
              <p className="text-[11px] font-sans text-amber-200/80">
                Gala de Graduación · I.E.M. Chambú 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-sans flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* User Auth Section */}
          <div className="p-3.5 rounded-xl bg-[#111927] border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-slate-400">
                Cuenta de Google de los Organizadores
              </span>
              {user && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conectado
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-8 h-8 rounded-full border border-amber-400/50 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs shrink-0">
                      {(user.displayName || user.email || 'G')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.displayName || 'Organizador de Gala'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans font-medium flex items-center gap-1.5 border border-slate-600 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 space-y-2.5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conecta tu cuenta de Google para sincronizar las respuestas del formulario de confirmación directamente a una hoja de cálculo en tu Google Drive.
                </p>

                {/* Official Google Material Sign-In Button */}
                <div className="flex justify-center pt-1">
                  <button
                    onClick={handleSignIn}
                    disabled={isAuthenticating}
                    className="gsi-material-button disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="gsi-material-button-state"></div>
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          style={{ display: 'block' }}
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                      </div>
                      <span className="gsi-material-button-contents">
                        {isAuthenticating ? 'Conectando con Google...' : 'Acceder con Google'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Connected Sheet Details OR Setup Options */}
          {sheetsConfig ? (
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#13221b] to-[#0c1613] border border-emerald-500/50 shadow-lg space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                      Hoja Vinculada
                    </span>
                    <h3 className="font-semibold text-sm text-white">{sheetsConfig.title}</h3>
                  </div>
                </div>

                <a
                  href={sheetsConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-bold shadow-md transition-colors"
                >
                  <span>Abrir Hoja</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-sans pt-1">
                <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Pestaña Activa
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">{sheetsConfig.sheetName}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/20">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Registros Locales
                  </span>
                  <span className="font-bold text-amber-300">
                    {localEntries.length} {localEntries.length === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-emerald-500/30">
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-sans font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Todas las Asistencias'}</span>
                </button>

                <button
                  onClick={handleDisconnectSheet}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:border-rose-500/60 text-slate-300 hover:text-rose-200 border border-slate-700 font-sans font-medium text-xs transition-colors cursor-pointer"
                >
                  Desvincular Hoja
                </button>
              </div>

              <p className="text-[11px] text-emerald-300/80 font-sans text-center">
                ✓ Cada nueva confirmación enviada en el formulario se guardará automáticamente en esta hoja.
              </p>

              {/* Webhook Configuration for public deploy */}
              <div className="pt-2 border-t border-emerald-500/30">
                <button
                  type="button"
                  onClick={() => setShowWebhookInput(!showWebhookInput)}
                  className="w-full flex items-center justify-between text-xs text-emerald-300 hover:text-emerald-100 font-sans font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Conexión Webhook para Invitados (Despliegue Web)</span>
                  </div>
                  <span className="text-amber-400 text-xs font-bold">{showWebhookInput ? '▲ Ocultar' : '▼ Ver / Configurar'}</span>
                </button>

                {showWebhookInput && (
                  <div className="mt-3 p-3 rounded-lg bg-black/40 border border-emerald-500/30 space-y-2.5 text-xs font-sans">
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Para que los invitados guarden automáticamente desde sus teléfonos sin iniciar sesión:
                    </p>
                    <div className="flex items-center justify-between gap-2 p-2 rounded bg-slate-900 border border-slate-700">
                      <span className="text-[11px] text-slate-300 truncate">1. Script para Apps Script</span>
                      <button
                        type="button"
                        onClick={handleCopyScript}
                        className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 cursor-pointer flex items-center gap-1"
                      >
                        {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedScript ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <form onSubmit={handleSaveWebhook} className="space-y-2">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/.../exec"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono outline-none focus:border-emerald-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                        >
                          {savedWebhook ? '¡Guardado!' : 'Guardar URL'}
                        </button>
                        <button
                          type="button"
                          onClick={handleTestWebhook}
                          disabled={isTestingWebhook || !webhookUrl.trim()}
                          className="py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {isTestingWebhook ? 'Probando...' : '🧪 Probar'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Option 1: Create automatic sheet */}
              <div className="p-4 rounded-xl bg-[#111927] border border-amber-500/40 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-cinzel font-bold text-xs uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Opción Recomendada: Crear Hoja Nueva</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Crea automáticamente una hoja de cálculo en tu Google Drive titulada <strong>"Asistencia - Gala de Graduación 2026 (I.E.M. Chambú)"</strong> con las columnas oficiales ya configuradas (Fecha, Código, Nombre, Asistencia, Pases, Canción y Mensaje).
                </p>

                <button
                  onClick={handleCreateNewSheet}
                  disabled={isCreatingSheet}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-sans font-bold text-xs tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isCreatingSheet ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creando hoja en Google Drive...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Crear Hoja de Asistencia en Google Drive</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: Link existing sheet */}
              <div className="p-3.5 rounded-xl bg-[#111927]/70 border border-slate-700 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white font-sans font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>O vincular una hoja existente por enlace o ID</span>
                  </div>
                  <span className="text-amber-400 text-xs">{showManualInput ? 'Ocultar' : 'Mostrar'}</span>
                </button>

                {showManualInput && (
                  <form onSubmit={handleLinkExistingSheet} className="pt-2 space-y-2 font-sans text-xs">
                    <input
                      type="text"
                      placeholder="Pega el enlace o ID de tu Google Sheet..."
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 text-xs outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={isLinkingManual || !manualInput.trim()}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLinkingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                      <span>Vincular Hoja Existente</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Option 3: Direct Webhook / Apps Script URL (Crucial for Public Deploy) */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#0d1e17] to-[#0a1510] border border-emerald-500/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white font-cinzel">
                      Conexión Webhook (Recomendada para Despliegue)
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Público
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Para que los <strong>invitados desde cualquier celular o PC</strong> guarden automáticamente sus datos en tu Google Sheet sin tener que iniciar sesión, usa este Webhook de Google Apps Script:
                </p>

                {/* Step 1: Copy script */}
                <div className="p-2.5 rounded-lg bg-black/50 border border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Code className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="text-[11px] text-slate-300 truncate">
                      <span>Paso 1: Copia el script listo para Apps Script</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="px-2.5 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-sans font-bold flex items-center gap-1.5 border border-amber-400/40 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? '¡Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>

                {/* Steps instructions */}
                <ol className="text-[11px] text-slate-300/90 font-sans list-decimal list-inside space-y-1 pl-1">
                  <li>En tu Google Sheet, ve a: <strong>Extensiones &gt; Apps Script</strong>.</li>
                  <li>Borra el código que haya, pega el código copiado y haz clic en <strong>Guardar</strong>.</li>
                  <li>Haz clic en <strong>Implementar &gt; Nueva implementación</strong>, selecciona tipo <strong>Aplicación web</strong>.</li>
                  <li>Configura: <em>Ejecutar como</em> = <strong>Yo</strong>, y <em>Quién tiene acceso</em> = <strong className="text-amber-300">Cualquier persona</strong>.</li>
                  <li>Haz clic en <strong>Implementar</strong>, autoriza los permisos y copia la URL que termina en <code>/exec</code>.</li>
                </ol>

                {/* Step 2: Paste URL and Test */}
                <form onSubmit={handleSaveWebhook} className="space-y-2 pt-1 font-sans text-xs">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 text-xs outline-none focus:border-emerald-500 font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{savedWebhook ? '¡Guardado!' : 'Guardar URL'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleTestWebhook}
                      disabled={isTestingWebhook || !webhookUrl.trim()}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <Send className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                      <span>{isTestingWebhook ? 'Probando...' : '🧪 Probar Conexión'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Explanation note */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
            <strong className="text-slate-300 block mb-0.5">ℹ️ ¿Cómo funciona?</strong>
            Las confirmaciones que los invitados envíen en la invitación se registrarán en tu Google Sheets. Si eres el organizador, puedes acceder a este panel en cualquier momento para abrir el archivo o sincronizar los registros.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0a0f19] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-semibold transition-colors cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
