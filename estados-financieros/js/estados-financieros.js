// Obtener referencias a elementos del formulario
const form = document.getElementById('estados-form');
const limpiarBtn = document.getElementById('limpiar');

// Función para mostrar valores en consola (puedes modificar para mostrar en resultados)
function mostrarValores() {
  // Puedes usar los ids directamente
  const nombre = document.getElementById('nombre').value;
  const presentacion = document.getElementById('presentacion').value;
  const fechaInicio = document.getElementById('range-start').value;
  const fechaFin = document.getElementById('range-end').value;
  const ejercicio = document.getElementById('excercize').value;
  const unitario = parseFloat(document.getElementById('unitary').value) || 0;
  const ventas = parseInt(document.getElementById('sales').value) || 0;
  const matPrima = parseFloat(document.getElementById('prime-mat-cost').value) || 0;
  const manoObra = parseFloat(document.getElementById('man-hand-cost').value) || 0;
  const costosInd = parseFloat(document.getElementById('ind-costs').value) || 0;
  const depreciacion = parseFloat(document.getElementById('depreciation').value) || 0;
  const invVariation = document.getElementById('inv-variation').value;

  console.log({
    nombre,
    presentacion,
    fechaInicio,
    fechaFin,
    ejercicio,
    unitario,
    ventas,
    matPrima,
    manoObra,
    costosInd,
    depreciacion,
    invVariation
  });
}

// Evento para limpiar el formulario
limpiarBtn.addEventListener('click', () => {
  form.reset(); // Limpia todos los inputs
  // Opcional: también puedes resetear los resultados en pantalla
  const resultados = document.querySelectorAll('.results-container span[id]');
  resultados.forEach(span => span.textContent = '$0.00');
});

// Evento al enviar formulario (ejemplo para mostrar valores)
form.addEventListener('submit', (e) => {
  e.preventDefault(); // Evita que la página se recargue
  mostrarValores();
  // Aquí podrías agregar tus cálculos y actualizar los spans de resultados
});
