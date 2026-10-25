# SLD Inventory Scan · MVP web

Aplicación experimental para leer un PDF unifilar de una página, proponer etiquetas y revisar un inventario. El PDF y su texto se procesan en el navegador y no se envían a ningún servidor. Los archivos se mantienen en memoria hasta cerrar o recargar la página; exporta el resultado antes de salir.

## Uso local

Necesitas Node.js 22 o posterior. En esta carpeta:

```bash
npm ci
npm run dev
```

Abre la dirección local mostrada por Vite, selecciona un PDF de una página y pulsa **Analizar plano**. Para PDF escaneados o mixtos activa OCR. El OCR y el modelo se descargan desde el propio sitio y se ejecutan en tu equipo. En planos grandes el proceso puede tardar y consumir bastante memoria. Cancelar detiene el análisis al terminar el fragmento actual.

En la revisión puedes buscar, filtrar, seleccionar, corregir y validar propuestas; las acciones de validación masiva afectan únicamente a los resultados visibles. Selecciona una propuesta para ver su recorte y centrarla en el plano. Exporta JSON o Excel. Las coordenadas se expresan en puntos PDF con origen arriba a la izquierda. Una confianza vacía indica texto vectorial sin puntuación OCR. El inventario no guarda el PDF ni proporciona un borrador persistente.

## Límites de la detección

Las etiquetas y características se asocian mediante reglas espaciales y son propuestas, no resultados verificados. No se trazan conexiones. Las detecciones visuales aparecen identificadas como experimentales; deben revisarse antes de usarse en ingeniería. El modelo opcional YOLO11s distribuido aquí es la versión genérica entrenada en COCO: sus 80 clases representan objetos comunes, no símbolos de unifilar. Una ausencia de detecciones no demuestra ausencia de equipos. Su funcionamiento no equivale a la detección especializada de MEPdetect.

En una prueba local preliminar con el plano privado, YOLO11s no produjo detecciones a un umbral de confianza del 35 %. La primera prueba de OCR web produjo 9 propuestas y algunos falsos positivos; la versión Windows produjo 123 propuestas en 122 segundos en el mismo equipo. Son cantidades sin revisar, no medidas de precisión ni exhaustividad. Se han ajustado las reglas después de la prueba web; todavía no hay una verdad de referencia revisada para comparar la calidad. No se debe emplear el recuento sin revisión técnica.

## Construcción y Cloudflare

```bash
npm ci
npm test
npm run build
```

La salida está en `dist/`. `wrangler.jsonc` configura Workers Static Assets. En Cloudflare Workers Builds conecta este repositorio GitHub: comando de compilación `npm ci && npm run build`, comando de despliegue `npx wrangler deploy` y rama `main`. El despliegue sirve únicamente archivos estáticos; no necesita backend ni almacenamiento de planos. El archivo `_headers` incluye una política de seguridad que restringe las conexiones al propio origen. No usar archivos privados como fixtures del repositorio.

## Componentes y licencias

Código del proyecto: AGPL-3.0 o posterior, ver [LICENSE](LICENSE). Los paquetes conservan sus propias licencias en `node_modules` tras instalar. PDF.js (Apache-2.0), Tesseract.js y sus núcleos (Apache-2.0), tessdata_fast `eng.traineddata` (Apache-2.0), ONNX Runtime Web (MIT), ExcelJS (MIT), React (MIT) y Vite (MIT).

Los pesos son YOLO11s genérico de [Ultralytics](https://huggingface.co/Ultralytics/YOLO11), conversión ONNX publicada por [unileon-robotics](https://huggingface.co/unileon-robotics/YOLO11-ONNX), AGPL-3.0. El archivo ONNX de 480 × 640 se divide en dos partes para respetar el límite de tamaño por recurso de Cloudflare; SHA-256 tras concatenarlas: `ade501f5c53ea4c771e2c014c86ff79e187698ec9d56442473b4f00a73c8fbc3`. [MEPdetect](https://github.com/DynMEP/MEPdetect) es una referencia independiente; sus pesos especializados no forman parte de este proyecto.
