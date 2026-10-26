# SLD Inventory Scan · MVP web

Aplicación experimental para leer un PDF unifilar, proponer etiquetas y revisar un inventario. El PDF y su texto se procesan en el navegador y no se envían a ningún servidor. Los archivos se mantienen en memoria hasta cerrar o recargar la página; exporta el resultado antes de salir.

**[Abrir SLD Inventory Scan](https://sld-inventory-scan.carreras-albacete-david.workers.dev/)** · No requiere instalación.

## Uso local

Necesitas Node.js 22 o posterior. En esta carpeta:

```bash
npm ci
npm run dev
```

Abre la dirección local mostrada por Vite y selecciona un PDF. Puedes cambiar la interfaz entre español e inglés desde el selector superior; el idioma elegido se guarda en el navegador. Revisa las páginas en la vista previa y utiliza los controles de zoom antes de pulsar **Analizar plano**. Se analizan todas las páginas y las propuestas conservan su número de página. Para PDF escaneados o mixtos activa OCR. El OCR y el modelo se descargan desde el propio sitio y se ejecutan en tu equipo. En planos grandes o con muchas páginas el proceso puede tardar y consumir bastante memoria.

En la revisión puedes buscar, filtrar, seleccionar, corregir y validar propuestas; las acciones de validación masiva afectan únicamente a los resultados visibles. Selecciona una propuesta para ver su recorte y centrarla en el plano. Exporta JSON o Excel. Las coordenadas se expresan en puntos PDF con origen arriba a la izquierda. Una confianza vacía indica texto vectorial sin puntuación OCR. El inventario no guarda el PDF ni proporciona un borrador persistente.

## Límites de la detección

Las etiquetas y características se asocian mediante reglas espaciales y son propuestas, no resultados verificados. No se trazan conexiones. Las detecciones visuales aparecen identificadas como experimentales; deben revisarse antes de usarse en ingeniería. El modelo opcional YOLO11s distribuido aquí es la versión genérica entrenada en COCO: sus 80 clases representan objetos comunes, no símbolos de unifilar. Una ausencia de detecciones no demuestra ausencia de equipos. Su funcionamiento no equivale a la detección especializada de MEPdetect.

La interpretación de texto contempla nombres y abreviaturas habituales de equipos de subestación, como interruptores, seccionadores, transformadores de medida y pararrayos. El tipo propuesto indica si se infirió de la etiqueta o de una descripción próxima; si hay varias categorías posibles se deja sin clasificar. Las abreviaturas dependen del proyecto y deben contrastarse con su leyenda. Estos criterios no entrenan el OCR ni reconocen símbolos gráficos. Como contexto técnico pueden consultarse [circuitos de aparamenta AT/MT](https://electrical-engineering-portal.com/circuit-configurations-hv-mv-switchgear-installations) y la referencia de símbolos [IEC 60617](https://webstore.iec.ch/en/publication/2723); no se incluyen ni reproducen sus gráficos y no se declara conformidad con la norma.

En una prueba local preliminar con el plano privado, YOLO11s no produjo detecciones a un umbral de confianza del 35 %. El OCR web a 216 ppp produjo 16 propuestas (incluidos falsos positivos) y 2.038 fragmentos de texto; la versión Windows a 300 ppp produjo 123 propuestas y 1.248 palabras en 122 segundos en el mismo equipo. Las condiciones de OCR son distintas y estas cantidades no están revisadas; no son medidas de precisión ni exhaustividad. Todavía no hay una verdad de referencia revisada para comparar la calidad. No se debe emplear el recuento sin revisión técnica.

En una prueba local posterior de la versión en desarrollo, con el OCR experimental y las nuevas reglas, hubo 8 coincidencias de etiqueta y posición en una muestra de 12 propuestas de escritorio, frente a 5 en una ejecución web anterior. La muestra y las propuestas no se han validado manualmente, las dos versiones web emplean configuraciones distintas y los recuentos no miden los falsos positivos. No constituye una validación del OCR ni demuestra el objetivo de calidad pendiente.

## Construcción y Cloudflare

```bash
npm ci
npm test
npm run build
```

La salida está en `dist/`. `wrangler.jsonc` configura Workers Static Assets. Cloudflare Workers Builds instala las dependencias y despliega automáticamente la rama `main` de este repositorio con `npm run build` y `npx wrangler deploy`. El despliegue sirve únicamente archivos estáticos; no necesita backend ni almacenamiento de planos. El archivo `_headers` incluye una política de seguridad que restringe las conexiones al propio origen. No usar archivos privados como fixtures del repositorio.

## Medición de paridad OCR

La calidad se compara contra una referencia revisada por una persona, no por el número de propuestas. Exporta el resultado web a JSON y conserva tanto ese archivo como la referencia validada fuera de Git. La referencia de escritorio debe marcar explícitamente los elementos correctos con `accepted: true` o `validated: true`.

```bash
node scripts/measure-parity.mjs private/referencia-validada.json private/resultado-web.json
```

El informe devuelve recall, precisión, falsos positivos, omisiones y distancia media de coordenadas. El objetivo de publicación para una mejora OCR es recuperar al menos el 90 % de las detecciones válidas de escritorio sin empeorar los falsos positivos, tras revisión humana.

## Componentes y licencias

Código del proyecto: AGPL-3.0 o posterior, ver [LICENSE](LICENSE). Los paquetes conservan sus propias licencias en `node_modules` tras instalar. PDF.js (Apache-2.0), Tesseract.js y sus núcleos (Apache-2.0), tessdata_fast `eng.traineddata` (Apache-2.0), PaddleOCR.js y los modelos RapidOCR incluidos (Apache-2.0), ONNX Runtime Web (MIT), ExcelJS (MIT), React (MIT) y Vite (MIT).

Los pesos son YOLO11s genérico de [Ultralytics](https://huggingface.co/Ultralytics/YOLO11), conversión ONNX publicada por [unileon-robotics](https://huggingface.co/unileon-robotics/YOLO11-ONNX), AGPL-3.0. El archivo ONNX de 480 × 640 se divide en dos partes para respetar el límite de tamaño por recurso de Cloudflare; SHA-256 tras concatenarlas: `ade501f5c53ea4c771e2c014c86ff79e187698ec9d56442473b4f00a73c8fbc3`. [MEPdetect](https://github.com/DynMEP/MEPdetect) es una referencia independiente; sus pesos especializados no forman parte de este proyecto.
