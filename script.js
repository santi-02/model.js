let modelo; // Variable global para el modelo cargado
let ctx;    // Contexto del canvas
let dibujo = []; // Para almacenar los datos del dibujo

// Función para cargar el modelo
async function cargarModelo() {
  try {
    // Cargar el modelo desde la misma carpeta donde se encuentra el archivo index.html
    modelo = await tf.loadLayersModel('model.json'); // Usar solo el nombre del archivo si está en la misma carpeta
    console.log("Modelo cargado correctamente");
    document.getElementById("status").innerText = "El modelo está listo.";
  } catch (error) {
    console.error("Error cargando el modelo:", error);
    document.getElementById("status").innerText = "El modelo aún no se ha cargado. Intenta de nuevo más tarde.";
  }
}

// Función para inicializar el canvas y los eventos de dibujo
function initCanvas() {
  const canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000000"; // Color del lápiz

  canvas.addEventListener("mousedown", empezarDibujo);
  canvas.addEventListener("mousemove", dibujar);
  canvas.addEventListener("mouseup", detenerDibujo);
  canvas.addEventListener("mouseleave", detenerDibujo);
}

// Variables para controlar el dibujo
let dibujando = false;
function empezarDibujo(e) {
  dibujando = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function dibujar(e) {
  if (!dibujando) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function detenerDibujo() {
  if (!dibujando) return;
  dibujando = false;
  ctx.closePath();
  // Obtener los datos del dibujo en formato de imagen
  dibujo = document.getElementById("canvas").toDataURL();
}

// Función para hacer la predicción
async function hacerPrediccion() {
  if (!modelo) {
    alert("El modelo no está cargado. Intenta nuevamente.");
    return;
  }

  // Convertir la imagen de canvas en un tensor para la predicción
  const canvas = document.getElementById("canvas");
  const imagen = tf.browser.fromPixels(canvas);
  const imagenRedimensionada = tf.image.resizeBilinear(imagen, [224, 224]); // Cambiar el tamaño según lo que espera tu modelo
  const imagenNormalizada = imagenRedimensionada.div(255).expandDims(0); // Normaliza y agrega dimensión para predicción

  // Realizar la predicción
  const resultado = modelo.predict(imagenNormalizada);
  const valorPredicho = resultado.arraySync()[0]; // Ajustar según el modelo

  // Mostrar el resultado
  document.getElementById("result").innerText = `Predicción: ${valorPredicho}`;
  imagen.dispose(); // Liberar memoria
}

// Asociar eventos al cargar la página
window.onload = () => {
  cargarModelo(); // Cargar el modelo al iniciar
  initCanvas();   // Inicializar el canvas
  document.getElementById("predictButton").addEventListener("click", hacerPrediccion);
};
