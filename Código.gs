/**
 * Script de Google Apps Script para Conecta+
 * Maneja: Login, Registro de Alumnos, Directorio y Evidencias
 */

function doPost(e) {
  try {
    var request = JSON.parse(e.postData.contents);
    var action = request.action;
    var data = request.data;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. ACCIÓN: LOGIN (Practicantes y Admin)
    if (action === 'login') {
      var sheet = ss.getSheetByName('Practicantes');
      if (!sheet) return createJsonResponse({ "result": "error", "message": "Hoja 'Practicantes' no encontrada" });
      
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var nombreSheet = rows[i][0].toString().trim().toLowerCase();
        var passSheet = rows[i][1].toString().trim();
        
        if (nombreSheet === data.nombre.toLowerCase().trim() && passSheet === data.password.toString().trim()) {
          return createJsonResponse({ 
            "result": "success", 
            "message": "Bienvenido " + rows[i][0] 
          });
        }
      }
      return createJsonResponse({ "result": "error", "message": "Nombre o contraseña incorrectos" });
    }

    // 2. ACCIÓN: CREATE_CASE (Crear un nuevo caso)
    if (action === 'create_case') {
      var sheet = ss.getSheetByName('Casos'); // Nueva hoja para casos
      if (!sheet) return createJsonResponse({ "result": "error", "message": "Hoja 'Casos' no encontrada" });
      
      sheet.appendRow([
        data.case_id,
        data.case_title || "", // Etiqueta opcional
        data.practitioner_creator, // Quién creó el caso
        new Date().toISOString().split('T')[0] // Fecha de creación
      ]);
      return createJsonResponse({ "result": "success" });
    }

    // 5. ACCIÓN: UPDATE_STUDENT (Eliminada, los casos no se editan, solo se cierran o se les da seguimiento)

    // 3. ACCIÓN: EVIDENCE (Guardar sesión en el historial)
    if (action === 'evidence') {
      var sheet = ss.getSheetByName('Evidencias');
      if (!sheet) return createJsonResponse({ "result": "error", "message": "Hoja 'Evidencias' no encontrada" });
      
      sheet.appendRow([
        data.fecha,
        data.practicante,
        data.case_id, // Ahora se guarda el ID del caso
        data.tipo_intervencion,
        data.semaforo,
        data.notas,
        data.consentimiento
      ]);
      return createJsonResponse({ "result": "success" });
    }

    // 4. ACCIÓN: GET_PRACTITIONER_DATA (Cargar Directorio y Timelines)
    if (action === 'get_practitioner_data' || action === 'get_evidences') {
      var caseSheet = ss.getSheetByName('Casos'); // Nueva hoja para casos
      var evidenceSheet = ss.getSheetByName('Evidencias');
      
      var casesRaw = caseSheet ? caseSheet.getDataRange().getValues() : []; // Datos de casos
      var evidencesRaw = evidenceSheet ? evidenceSheet.getDataRange().getValues() : [];
      
      var cases = []; // Lista de casos
      for (var i = 1; i < casesRaw.length; i++) {
        cases.push({
          case_id: casesRaw[i][0],
          case_title: casesRaw[i][1],
          practitioner_creator: casesRaw[i][2],
          creation_date: formatDate(casesRaw[i][3])
        });
      }
      
      var evidences = [];
      for (var j = 1; j < evidencesRaw.length; j++) {
        evidences.push({
          fecha: formatDate(evidencesRaw[j][0]),
          practicante: evidencesRaw[j][1],
          case_id: evidencesRaw[j][2], // Ahora es case_id
          tipo_intervencion: evidencesRaw[j][3],
          semaforo: evidencesRaw[j][4],
          notas: evidencesRaw[j][5]
        });
      }

      // Si es para el admin, devolvemos la estructura plana original en 'data'
      if (action === 'get_evidences') {
        return createJsonResponse({ "result": "success", "data": evidences.reverse() });
      }
      
      return createJsonResponse({ "result": "success", "cases": cases, "evidences": evidences }); // Devolvemos casos
    }

    return createJsonResponse({ "result": "error", "message": "Acción no reconocida" });

  } catch (err) {
    return createJsonResponse({ "result": "error", "message": err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
         .setMimeType(ContentService.MimeType.JSON);
}

function formatDate(date) {
  // Usar toISOString es significativamente más rápido que Utilities.formatDate dentro de bucles
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return date.toString();
}