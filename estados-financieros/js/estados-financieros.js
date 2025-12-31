// Obtener referencias a elementos del formulario
const form = document.getElementById('estados-form');
const limpiarBtn = document.getElementById('limpiar');

function calcularEstados(){
  let precioUnitario = parseFloat(document.getElementById('unitary').value) || 0.0;
  let volumenVentas = parseFloat(document.getElementById('sales').value) || 0.0;
  let costoMP = parseFloat(document.getElementById('prime-mat-cost').value) || 0.0;
  let costoMOD = parseFloat(document.getElementById('man-hand-cost').value) || 0.0;
  let costosIndirectos = parseFloat(document.getElementById('ind-costs').value) || 0.0;
  let depreciacion_mantenimiento = parseFloat(document.getElementById('depreciation').value) || 0.0;
  
  // ER
  let ingresosPorVentas = precioUnitario * volumenVentas;
  document.getElementById('sales-gross').textContent = formatoMoneda(ingresosPorVentas);
  let costoVentas = ingresosPorVentas*0.451;
  document.getElementById('sales-cost').textContent = formatoMoneda(-costoVentas);
  let utilidadBruta = ingresosPorVentas - costoVentas;
  document.getElementById('brute-utility').textContent = formatoMoneda(utilidadBruta);
  let gastosOperativos = utilidadBruta-(ingresosPorVentas*0.1043);
  document.getElementById('opp-costs').textContent = formatoMoneda(-gastosOperativos);
  let utilidadNeta = utilidadBruta - gastosOperativos;
  document.getElementById('total-results').textContent = formatoMoneda(utilidadNeta);
  // ECPV
  let materiaPrima = costoMP;
  document.getElementById('prime-mat-cost-res').textContent = formatoMoneda(materiaPrima);
  
  let manoDeObraDirecta = costoMOD;
  document.getElementById('man-hand-cost-res').textContent = formatoMoneda(manoDeObraDirecta);
  
  let CIF = costosIndirectos;
  document.getElementById('cif-res').textContent = formatoMoneda(CIF);
  
  let depreciacion = depreciacion_mantenimiento;
  document.getElementById('depreciation-res').textContent = formatoMoneda(depreciacion);
  let costoIncurrido = materiaPrima+(manoDeObraDirecta+CIF+depreciacion_mantenimiento);
  document.getElementById('costo-incurrido').textContent = formatoMoneda(costoIncurrido);
  document.getElementById('costo-vendido').textContent = formatoMoneda(costoIncurrido);
  
  // ESF
  let activo = 250000000;
  let pasivo = 100000000;
  let capitalContable = activo-pasivo;
  document.getElementById('assigned-active').textContent = formatoMoneda(activo);
  document.getElementById('assigned-pasive').textContent = formatoMoneda(pasivo);
  document.getElementById('countable-cap').textContent = formatoMoneda(capitalContable);
  }

  // Evento para limpiar el formulario
  limpiarBtn.addEventListener('click', () => {
    form.reset();
    const resultados = document.querySelectorAll('.results-container span[id]');
    resultados.forEach(span => span.textContent = '$0.00');
  });

  // Evento al enviar formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calcularEstados();
  });

  function formatoMoneda(valor){
  return valor.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  });
}

