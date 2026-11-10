/**
 * ==============================================================================
 * CÓDIGO DE GOOGLE APPS SCRIPT PARA RECEPCIÓN DE ASISTENCIAS
 * Gala de Graduación 2026 - I.E.M. Chambú
 * ==============================================================================
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Abre tu hoja de cálculo de Google: "Asistencia - Gala de Graduación 2026 (I.E.M. Chambú)"
 * 2. En el menú superior, ve a: Extensiones > Apps Script
 * 3. Borra cualquier código que aparezca allí y pega TODO este archivo.
 * 4. Haz clic en el icono de Guardar (disquete).
 * 5. Haz clic en el botón azul superior "Implementar" > "Nueva implementación".
 * 6. En el engranaje "Seleccionar tipo", elige "Aplicación web".
 * 7. Configura exactamente así:
 *    - Descripción: Webhook Asistencia Gala 2026
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquier persona" (¡IMPORTANTE! Si seleccionas "Solo yo", los invitados no podrán registrarse)
 * 8. Haz clic en "Implementar".
 * 9. Otorga los permisos requeridos (Revisar permisos > Seleccionar tu cuenta > Avanzado > Ir a proyecto > Permitir).
 * 10. Copia la "URL de la aplicación web" generada (termina en /exec) y pégala en tu proyecto (.env).
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Evita colisiones si varios invitados confirman al mismo segundo
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // Busca pestaña 'Confirmaciones' o la primera pestaña activa
    var sheet = ss.getSheetByName("Confirmaciones") || ss.getActiveSheet();

    // Si la hoja está totalmente vacía, crear la fila de encabezados oficial
    if (sheet.getLastRow() === 0) {
      var headerRow = [
        "Fecha y Hora",
        "Código de Pase",
        "Nombre Completo",
        "¿Asistirá?",
        "Acompañantes",
        "Pases Totales",
        "Canción Sugerida",
        "Mensaje de Felicitación"
      ];
      sheet.appendRow(headerRow);

      var headerRange = sheet.getRange(1, 1, 1, headerRow.length);
      headerRange.setBackground("#0f172a"); // Azul pizarra elegante
      headerRange.setFontColor("#fcd34d");  // Letras doradas
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Extraer datos enviados (soporta formato JSON o application/x-www-form-urlencoded)
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var fecha = data.fecha || Utilities.formatDate(new Date(), "America/Bogota", "dd/MM/yyyy, hh:mm a");
    var codigo = data.codigo || "";
    var nombre = data.nombre || "Invitado sin nombre";
    var asistira = data.asistira || "SÍ";
    var acompanantes = (data.acompanantes !== undefined && data.acompanantes !== null) ? data.acompanantes : 0;
    var pasesTotales = (data.pasesTotales !== undefined && data.pasesTotales !== null)
      ? data.pasesTotales
      : (asistira === "SÍ" ? 1 + Number(acompanantes) : 0);
    var cancion = data.cancion || "-";
    var mensaje = data.mensaje || "-";

    // Insertar la fila al final de la hoja
    sheet.appendRow([
      fecha,
      codigo,
      nombre,
      asistira,
      acompanantes,
      pasesTotales,
      cancion,
      mensaje
    ]);

    // Retorna respuesta JSON válida
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registro guardado correctamente",
      codigo: codigo
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Permite comprobar en el navegador que el Webhook está activo abriendo la URL directamente
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Asistencias Gala de Graduación 2026",
    institution: "I.E.M. Chambú",
    message: "El Webhook está activo y listo para recibir confirmaciones de asistencia."
  })).setMimeType(ContentService.MimeType.JSON);
}

