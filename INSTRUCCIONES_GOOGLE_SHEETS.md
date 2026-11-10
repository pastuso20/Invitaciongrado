# 📋 Guía Paso a Paso: Guardar Registros de Asistencia en Google Sheets (En Despliegue)

Esta guía explica **por qué no se guardaban las respuestas en el despliegue** y **cómo dejarlo funcionando al 100% en menos de 3 minutos**.

---

## 🧐 ¿Por qué no se guardaban los registros en el despliegue?

1. **La web se ejecuta en el navegador de cada invitado:**  
   Cuando un familiar o amigo abre la invitación en su celular, esa persona **no tiene tu sesión de Google abierta**. La API directa de Google Sheets requiere que quien guarde tenga permisos de editor en tu Google Drive.
2. **La solución oficial de Google:**  
   Se utiliza un **Google Apps Script Web App (Webhook)** asociado a tu hoja de cálculo. Este script actúa como un "buzón seguro": cualquier invitado envía su formulario y el script lo escribe inmediatamente en tu hoja de cálculo con los permisos del anfitrión, sin pedirles contraseña ni inicio de sesión a los invitados.

---

## 🚀 Pasos para Activar el Guardado Automático

### Paso 1: Abrir el editor de Apps Script en tu hoja
1. Abre tu hoja de Google Sheets: **`Asistencia - Gala de Graduación 2026 (I.E.M. Chambú)`** (la que ya tienes abierta).
2. En la barra de menús superior, haz clic en **Extensiones** ➔ **Apps Script**.

---

### Paso 2: Pegar el código del Webhook
1. Borra cualquier código existente en el archivo `Código.gs`.
2. Copia y pega el siguiente código completo (también guardado en el archivo `google-apps-script.js` del proyecto):

```javascript
/**
 * SISTEMA DE RECEPCIÓN DE ASISTENCIAS - GALA DE GRADUACIÓN 2026
 * Institución Educativa Municipal Chambú
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Evita colisiones si varios invitados confirman al tiempo

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    // Busca la pestaña 'Confirmaciones' o usa la primera pestaña activa
    var sheet = ss.getSheetByName("Confirmaciones") || ss.getActiveSheet();

    // Si la hoja está vacía, crea la fila de encabezados oficial
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
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#fcd34d");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Extraer datos del formulario
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

    // Insertar la confirmación del invitado
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

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registro guardado exitosamente",
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

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "El Webhook de Google Sheets para la Gala de Graduación está listo y funcionando."
  })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Haz clic en el icono de **Guardar** 💾 (o presiona `Ctrl + S`).

---

### Paso 3: Desplegar como Aplicación Web (¡Paso Clave!)
1. En la esquina superior derecha de Apps Script, haz clic en el botón azul **Implementar** (Deploy) ➔ **Nueva implementación**.
2. En la ventana emergente, haz clic en el icono de engranaje ⚙️ junto a *Seleccionar tipo* y elige **Aplicación web**.
3. Rellena los campos exactamente así:
   - **Descripción**: `Webhook Asistencias Gala 2026`
   - **Ejecutar como**: `Yo (tu correo de Google)`
   - **Quién tiene acceso**: <mark>**Cualquier persona**</mark> *(⚠️ ¡MUY IMPORTANTE! Si dejas "Solo yo", los invitados recibirán error y no se guardará nada).*
4. Haz clic en **Implementar**.
5. Google te pedirá autorizar el acceso:
   - Haz clic en **Revisar permisos**.
   - Selecciona tu cuenta de Google.
   - Si sale una advertencia ("Google no ha verificado esta app"), haz clic en **Avanzado** (o *Configuración avanzada*) y luego en **Ir a Proyecto (no seguro)**.
   - Haz clic en **Permitir**.
6. Se mostrará una ventana con la **URL de la aplicación web**. Copia esa URL (termina en `/exec`).  
   Ejemplo: `https://script.google.com/macros/s/AKfycbx.../exec`.

---

### Paso 4: Conectar la URL a tu Proyecto y Despliegue

Tienes dos maneras de enlazar la URL:

#### Opción A: Desde el archivo `.env` (Para nuevo despliegue)
1. Abre el archivo `.env` en la raíz de tu proyecto.
2. Pega tu URL en la variable:
   ```env
   VITE_GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/TU_ID_AQUI/exec"
   ```
3. Si despliegas en **Vercel, Netlify o Firebase**:
   - Ve al panel de control de tu proyecto (Settings ➔ Environment Variables).
   - Agrega la variable con nombre `VITE_GOOGLE_SHEETS_WEBHOOK_URL` y valor tu URL de `/exec`.
   - Vuelve a desplegar (*Redeploy*) para que la web empaquete la URL.

#### Opción B: Directamente desde la web (Prueba inmediata)
1. En la invitación desplegada, baja hasta el final del pergamino y haz clic en:  
   **`⚙ Hoja de Google Sheets (Organizador)`**
2. Despliega la opción **"Conexión Webhook"**.
3. Pega la URL en el campo y haz clic en **Guardar URL**.
4. Haz clic en el botón **🧪 Probar Conexión**: ¡verás aparecer una fila de prueba inmediatamente en tu Google Sheet!

