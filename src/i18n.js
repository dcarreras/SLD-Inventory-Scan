const english={
  'Información sobre OCR por fragmentos':'Information about tiled OCR',
  'Información sobre YOLO11s':'Information about YOLO11s',
  'Usa la rueda o pellizca para ampliar; arrastra el plano para desplazarte.':'Use the wheel or pinch to zoom; drag the diagram to pan.',
  'El OCR divide cada página en fragmentos y reconoce texto en imágenes mediante modelos locales. Complementa el texto vectorial extraído del PDF.':'OCR divides each page into tiles and recognizes text in images using local models. It supplements the vector text extracted from the PDF.',
  'Beneficio: puede recuperar etiquetas y características de planos escaneados o mixtos. Limitaciones: textos pequeños, borrosos o girados pueden omitirse o interpretarse mal; requiere tiempo y memoria. Revisa las propuestas y sus evidencias.':'Benefit: it can recover tags and specifications from scanned or mixed diagrams. Limitations: small, blurry or rotated text may be missed or misread; processing takes time and memory. Review proposals and their evidence.',
  'YOLO11s es un modelo de visión artificial que busca objetos en imágenes. Esta versión usa clases generales COCO y genera detecciones visuales experimentales por separado del OCR.':'YOLO11s is a computer vision model that searches for objects in images. This version uses general COCO classes and produces experimental visual detections separately from OCR.',
  'Limitaciones: no está entrenado para símbolos eléctricos y no lee texto ni mejora el OCR. Puede producir detecciones irrelevantes o pasar por alto equipos; úsalo solo para explorar y verifica los resultados.':'Limitations: it is not trained for electrical symbols and does not read text or improve OCR. It may produce irrelevant detections or miss equipment; use it only for exploration and verify the results.',
  'Cómo se combinan':'How these options work together',
  'El texto vectorial se lee siempre. Las opciones son independientes y se ejecutan por separado.':'Vector text is always extracted. The options are independent and run separately.',
  'El texto vectorial se incluye junto con las opciones elegidas.':'Vector text is included with the selected options.',
  'El texto vectorial está desactivado; el resultado puede compararse directamente con el OCR de escritorio.':'Vector text is disabled; the result can be directly compared with desktop OCR.',
  'Con ambas: OCR y después YOLO en cada página; requiere más tiempo y no mejora el OCR.':'Both: OCR runs first, followed by YOLO on each page; this takes longer and does not improve OCR.',
  'Con OCR: se busca texto también en las imágenes; recomendado para escaneos.':'OCR: also searches for text in images; recommended for scans.',
  'Con YOLO: se buscan objetos generales, pero no se lee el texto de imágenes.':'YOLO: searches for general objects but does not read text in images.',
  'Sin OCR: no se leerán las imágenes del documento.':'Without OCR, images in the document will not be read.',
  'PLANO A INVENTARIO':'DIAGRAM TO INVENTORY',
  'Procesamiento local en tu navegador':'Processed locally in your browser',
  'Abrir instrucciones de uso':'Open user instructions', 'Cerrar instrucciones':'Close instructions', 'Guía de uso':'User guide', 'Entendido':'Got it',
  'Utiliza esta herramienta para preparar un inventario revisable de equipos a partir de un plano unifilar.':'Use this tool to prepare a reviewable equipment inventory from a single-line diagram.',
  '1. Abre y revisa el PDF':'1. Open and inspect the PDF',
  'Selecciona un PDF, cambia de página y usa el zoom para inspeccionarlo antes de analizarlo.':'Select a PDF, navigate its pages and use zoom to inspect it before analysis.',
  '2. Analiza el documento':'2. Analyze the document',
  'Activa el OCR para planos escaneados o mixtos y pulsa Analizar plano. Se procesan todas las páginas; los documentos grandes pueden tardar.':'Enable OCR for scanned or mixed diagrams and select Analyze diagram. All pages are processed; large documents may take time.',
  '3. Comprueba cada propuesta':'3. Check each proposal',
  'Selecciona una fila para localizarla en el plano y ver su evidencia. Corrige los datos y verifica las omisiones antes de validar.':'Select a row to locate it on the diagram and view its evidence. Correct the data and check for omissions before validating.',
  '4. Filtra y valida':'4. Filter and validate',
  'Busca por etiqueta o características y filtra por estado o tipo. Las acciones masivas afectan solo a las filas visibles, incluso si pertenecen a páginas distintas.':'Search by tag or characteristics and filter by status or type. Bulk actions affect only visible rows, even when they belong to different pages.',
  '5. Exporta el inventario':'5. Export the inventory',
  'Descarga JSON o Excel antes de cerrar o recargar. La exportación incluye todas las propuestas y su estado de validación; no hay borrador persistente.':'Download JSON or Excel before closing or reloading. The export includes all proposals and their validation status; there is no persistent draft.',
  'Para la revisión técnica':'For technical review',
  'Las detecciones son propuestas y pueden contener errores u omisiones. La confianza OCR no garantiza que una identificación sea correcta. YOLO11s es experimental y no identifica símbolos eléctricos de forma validada; la aplicación no traza conexiones.':'Detections are proposals and may contain errors or omissions. OCR confidence does not guarantee a correct identification. YOLO11s is experimental and its recognition of electrical symbols is not validated; the application does not trace connections.',
  'El PDF se procesa en el navegador. Los modelos se descargan desde el sitio; los datos de la sesión se pierden al cerrar o recargar.':'The PDF is processed in the browser. Models are downloaded from the site; session data is lost when closing or reloading.',
  'Código fuente ↗':'Source code ↗',
  'ESPACIO DE TRABAJO / INVENTARIO':'WORKSPACE / INVENTORY',
  'De plano a inventario':'From diagram to inventory',
  'Analiza unifilares, revisa cada propuesta y exporta tu inventario.':'Analyze single-line diagrams, review each proposal and export your inventory.',
  'Cambiar plano':'Change diagram', 'PRIMER PASO':'FIRST STEP', 'Comienza con tu plano':'Start with your diagram',
  'Selecciona un PDF y revísalo antes de analizarlo. El documento permanece en tu equipo.':'Select a PDF and review it before analysis. The document stays on your device.',
  'Cambiar PDF':'Change PDF', 'Seleccionar PDF':'Select PDF', 'PDF · una o varias páginas':'PDF · one or more pages',
  'VISTA PREVIA':'PREVIEW', 'Revisa el plano antes del análisis':'Review the diagram before analysis',
  'Página':'Page', 'Página anterior':'Previous page', 'Página siguiente':'Next page', 'DOCUMENTO':'DOCUMENT',
  'Reducir vista previa':'Zoom out preview', 'Ampliar vista previa':'Zoom in preview', 'Ajustar ancho':'Fit width',
  'Preparando vista previa…':'Preparing preview…', 'Vista previa del plano seleccionado':'Preview of the selected diagram',
  'No hay vista previa disponible.':'No preview is available.', 'OCR por fragmentos':'Tiled OCR', 'Texto vectorial':'Vector text',
  'Extrae el texto embebido en el PDF; desactívalo para comparar solo OCR con la aplicación Windows':'Extracts text embedded in the PDF; disable it to compare OCR only with the Windows application',
  'Recomendado para planos escaneados o mixtos':'Recommended for scanned or mixed diagrams',
  'YOLO11s experimental':'Experimental YOLO11s',
  'Clases COCO generales; no reconoce símbolos unifilares de forma validada':'General COCO classes; recognition of single-line symbols is not validated',
  'Analizar plano →':'Analyze diagram →', 'Cancelar':'Cancel', 'Cancelando análisis':'Canceling analysis',
  'PROPUESTAS':'PROPOSALS', 'VISIBLES':'VISIBLE', 'SELECCIONADAS':'SELECTED', 'VALIDADAS':'VALIDATED',
  'Exportar JSON':'Export JSON', 'Exportar Excel ↓':'Export Excel ↓', 'DOCUMENTO · PÁGINA 1':'DOCUMENT · PAGE 1',
  'Plano unifilar':'Single-line diagram', 'Ajustar':'Fit page', 'REVISIÓN HUMANA':'HUMAN REVIEW',
  'Inventario propuesto':'Proposed inventory', 'Buscar etiqueta, tipo, tensión…':'Search tag, type, voltage…',
  'Todas':'All', 'Pendientes':'Pending', 'Validadas':'Validated', 'Todos':'All types',
  'Seleccionar visibles':'Select visible', 'Deseleccionar visibles':'Deselect visible',
  'Validar visibles':'Validate visible', 'Desvalidar visibles':'Mark visible as pending',
  'No hay propuestas para mostrar.':'No proposals to display.', 'Validada':'Validated', 'Pendiente':'Pending',
  'DETALLE Y EVIDENCIA':'DETAILS AND EVIDENCE', 'Recorte de evidencia':'Evidence crop', 'Etiqueta':'Tag', 'Tipo':'Type',
  'Base del tipo propuesto':'Basis for proposed type', 'Sin clasificar':'Unclassified', 'Edición manual':'Manual edit', 'Revisar tras edición':'Review after editing',
  'Descripción':'Description', 'Tensión':'Voltage', 'Corriente':'Current', 'Centrar evidencia en plano ↗':'Center evidence on diagram ↗',
  'SLD Inventory Scan · Las propuestas necesitan revisión técnica. Los datos permanecen en el navegador.':'SLD Inventory Scan · Proposals require technical review. Data stays in the browser.',
  'El MVP admite PDF de una página.':'The MVP supports one-page PDFs.',
  'No se pudo abrir el PDF. Comprueba que el archivo es válido y no está protegido.':'Could not open the PDF. Check that it is valid and not password-protected.',
  'No se pudo analizar el PDF.':'Could not analyze the PDF.', 'Análisis cancelado.':'Analysis canceled.',
  'No se pudo iniciar el OCR local en este navegador.':'Could not start local OCR in this browser.',
  'No se han encontrado los pesos locales de YOLO11s.':'Local YOLO11s weights were not found.',
  'Preparando vista del plano':'Preparing diagram preview', 'Cargando OCR local':'Loading local OCR',
  'Analizando el primer fragmento':'Analyzing the first tile', 'Evaluando YOLO11s experimental':'Evaluating experimental YOLO11s',
  'Interruptor automático':'Circuit breaker', 'Seccionador':'Disconnector', 'Seccionador de puesta a tierra':'Earthing switch',
  'Transformador de corriente':'Current transformer', 'Transformador de tensión':'Voltage transformer',
  'Pararrayos':'Surge arrester', 'Transformador de potencia':'Power transformer', 'Reactor':'Reactor',
  'Barra':'Busbar', 'Equipo eléctrico':'Electrical equipment', 'Elemento por revisar':'Item to review',
  'Detección visual experimental':'Experimental visual detection', 'Texto vectorial':'Vector text',
  'Clase COCO experimental; no identificada como símbolo eléctrico':'Experimental COCO class; not identified as an electrical symbol'
};

export function translate(language,text) {
  if(language!=='en'||!text)return text;
  if(english[text])return english[text];
  let page=text.match(/^Procesando página (\d+) de (\d+)$/);
  if(page)return `Processing page ${page[1]} of ${page[2]}`;
  page=text.match(/^Página (\d+) de (\d+) · OCR (\d+) de (\d+)$/);
  if(page)return `Page ${page[1]} of ${page[2]} · OCR ${page[3]} of ${page[4]}`;
  let match=text.match(/^OCR local · fragmento (\d+) de (\d+)$/);
  if(match)return `Local OCR · tile ${match[1]} of ${match[2]}`;
  match=text.match(/^Análisis terminado: (\d+) fragmentos de texto y (\d+) propuestas\. Revisa cada resultado\.$/);
  if(match)return `Analysis complete: ${match[1]} text fragments and ${match[2]} proposals. Review each result.`;
  match=text.match(/^No se pudo iniciar el OCR local\. Detalle técnico: (.+)$/);
  if(match)return `Could not start local OCR. Technical detail: ${match[1]}`;
  return text;
}
