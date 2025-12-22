// Datos de puestos por departamento
const puestosPorDepartamento = {
    mantenimiento: [
        "Ayudante General",
        "Técnico Especializado"
    ],
    produccion: [
        "Técnico de Operaciones",
        "Supervisor de Amasado",
        "Supervisor de Corte",
        "Supervisor de Relleno",
        "Operadores de amasado y laminado",
        "Operadores de corte/horneado",
        "Operadores de relleno",
        "Operadores de recubrimiento",
        "Empacadores y auxiliares",
        "Supervisor de Recubrimiento",
        "Supervisor de Empaque",
        "Jefe Maestros Galleteros"
    ],
    calidad: [
        "Inspector de Calidad",
        "Jefe de Calidad"
    ],
    logistica: [
        "Chófer Vendedor",
        "Auxiliar de Almacén"
    ],
    ventas: [
        "Representante de Ventas",
        "Supervisor de Ventas"
    ],
    administracion: [
        "Auxiliar Administrativo",
        "Oficial de Nóminas"
    ],
    seguridad: [
        "Oficial Seguridad e Higiene"
    ],
    direccion: [
        "Gerente Producción Línea Mamut",
        "Director de Planta Gamesa"
    ]
};

// Referencias a elementos del DOM
const departamentoSelect = document.getElementById('departamento');
const puestoSelect = document.getElementById('puesto');
const nominaForm = document.getElementById('nomina-form');
const limpiarBtn = document.getElementById('limpiar');
const imprimirBtn = document.getElementById('imprimir');
const historialBtn = document.getElementById('historial');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close-modal');
const modalBody = document.getElementById('modal-body');
const historialBody = document.getElementById('historial-body');
const emptyHistory = document.getElementById('empty-history');

// Variable para controlar horas extra semanales
let horasExtraSemanales = {};

// Cargar puestos según el departamento seleccionado
departamentoSelect.addEventListener('change', function() {
    const depto = this.value;
    puestoSelect.innerHTML = '<option value="">Seleccione un puesto</option>';
    
    if (depto && puestosPorDepartamento[depto]) {
        puestosPorDepartamento[depto].forEach(puesto => {
            const option = document.createElement('option');
            option.value = puesto.toLowerCase().replace(/\s+/g, '-');
            option.textContent = puesto;
            puestoSelect.appendChild(option);
        });
    }
});

// Configurar el botón "Ver Historial"
if (historialBtn) {
    historialBtn.addEventListener('click', function() {
        document.querySelector('.history-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
}

// Función para calcular horas extra según LFT
function calcularHorasExtra(salarioDiario, horasExtra, empleadoId = 'temp') {
    const valorHora = salarioDiario / 8;
    
    const horasExtraAcumuladas = horasExtraSemanales[empleadoId] || 0;
    const totalHorasEstaSemana = horasExtraAcumuladas + horasExtra;
    
    let horasDobles = 0;
    let horasTriples = 0;
    
    if (totalHorasEstaSemana <= 9) {
        horasDobles = horasExtra;
    } else {
        const horasDoblesDisponibles = Math.max(0, 9 - horasExtraAcumuladas);
        horasDobles = Math.min(horasExtra, horasDoblesDisponibles);
        horasTriples = Math.max(0, horasExtra - horasDoblesDisponibles);
    }
    
    const pagoHorasDobles = horasDobles * valorHora * 2;
    const pagoHorasTriples = horasTriples * valorHora * 3;
    const totalPago = pagoHorasDobles + pagoHorasTriples;
    
    horasExtraSemanales[empleadoId] = totalHorasEstaSemana;
    
    return {
        totalPago,
        horasDobles,
        horasTriples,
        pagoHorasDobles,
        pagoHorasTriples,
        valorHora
    };
}

// Calcular nómina
nominaForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value;
    const departamento = departamentoSelect.options[departamentoSelect.selectedIndex].text;
    const puesto = puestoSelect.options[puestoSelect.selectedIndex].text;
    const salario = parseFloat(document.getElementById('salario').value);
    const diasTrabajados = parseInt(document.getElementById('dias-trabajados').value);
    const horasExtra = parseFloat(document.getElementById('horas-extra').value) || 0;
    const faltas = parseInt(document.getElementById('faltas').value) || 0;
    const bonificaciones = parseFloat(document.getElementById('bonificaciones').value) || 0;
    
    if (diasTrabajados > 30) {
        alert('Los días trabajados no pueden ser más de 30');
        return;
    }
    
    // Calcular salario proporcional
    const salarioDiario = salario / 30;
    const salarioProporcional = salarioDiario * diasTrabajados;
    
    // Calcular horas extra según LFT
    const resultadoHorasExtra = calcularHorasExtra(salarioDiario, horasExtra, nombre);
    const pagoHorasExtra = resultadoHorasExtra.totalPago;
    
    // Calcular deducción por faltas
    const deduccionFaltas = faltas * salarioDiario;
    
    // Calcular ISR (simplificado)
    const isr = salarioProporcional * 0.15;
    
    // Calcular seguro social (simplificado)
    const seguroSocial = salarioProporcional * 0.05;
    
    // Calcular totales
    const totalPercepciones = salarioProporcional + pagoHorasExtra + bonificaciones;
    const totalDeducciones = deduccionFaltas + isr + seguroSocial;
    const netoPagar = totalPercepciones - totalDeducciones;
    
    // Crear objeto con datos de nómina
    const datosNomina = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        nombre,
        departamento,
        puesto,
        salario,
        salarioProporcional,
        diasTrabajados,
        horasExtra,
        horasExtraDobles: resultadoHorasExtra.horasDobles,
        horasExtraTriples: resultadoHorasExtra.horasTriples,
        pagoHorasExtra,
        pagoHorasDobles: resultadoHorasExtra.pagoHorasDobles,
        pagoHorasTriples: resultadoHorasExtra.pagoHorasTriples,
        faltas,
        bonificaciones,
        deduccionFaltas,
        isr,
        seguroSocial,
        totalPercepciones,
        totalDeducciones,
        netoPagar
    };
    
    // Actualizar la interfaz con los resultados
    actualizarResultados(datosNomina);
    
    // Guardar automáticamente en historial
    guardarEnHistorial(datosNomina);
    
    // Habilitar botón de imprimir
    imprimirBtn.disabled = false;
    
    // Desplazarse automáticamente al historial
    setTimeout(() => {
        document.querySelector('.history-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }, 500);
});

// Función para guardar automáticamente en historial
function guardarEnHistorial(datosNomina) {
    let historial = JSON.parse(localStorage.getItem('nominas') || '[]');
    
    historial.unshift(datosNomina);
    
    if (historial.length > 20) {
        historial = historial.slice(0, 20);
    }
    
    localStorage.setItem('nominas', JSON.stringify(historial));
    
    actualizarHistorial();
    
    mostrarNotificacion('Nómina calculada y guardada en historial', 'success');
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);
    
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Actualizar resultados en la interfaz
function actualizarResultados(datos) {
    document.getElementById('nombre-empleado').textContent = datos.nombre;
    document.getElementById('info-puesto').textContent = `Departamento: ${datos.departamento} | Puesto: ${datos.puesto}`;
    
    document.getElementById('salario-base').textContent = `$${datos.salarioProporcional.toFixed(2)}`;
    document.getElementById('pago-horas-extra').textContent = `$${datos.pagoHorasExtra.toFixed(2)}`;
    document.getElementById('pago-bonificaciones').textContent = `$${datos.bonificaciones.toFixed(2)}`;
    document.getElementById('total-percepciones').textContent = `$${datos.totalPercepciones.toFixed(2)}`;
    
    document.getElementById('deduccion-faltas').textContent = `$${datos.deduccionFaltas.toFixed(2)}`;
    document.getElementById('isr').textContent = `$${datos.isr.toFixed(2)}`;
    document.getElementById('seguro-social').textContent = `$${datos.seguroSocial.toFixed(2)}`;
    document.getElementById('total-deducciones').textContent = `$${datos.totalDeducciones.toFixed(2)}`;
    
    document.getElementById('neto-pagar').textContent = `$${datos.netoPagar.toFixed(2)}`;
    document.getElementById('fecha-calculo').textContent = `Calculado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`;
    
    // Guardar datos para imprimir
    imprimirBtn.dataset.nominaData = JSON.stringify(datos);
}

// Limpiar formulario
limpiarBtn.addEventListener('click', function() {
    nominaForm.reset();
    puestoSelect.innerHTML = '<option value="">Seleccione un puesto</option>';
    
    document.getElementById('nombre-empleado').textContent = '-';
    document.getElementById('info-puesto').textContent = 'Departamento: - | Puesto: -';
    
    const resultElements = document.querySelectorAll('.results-container span:not(:first-child)');
    resultElements.forEach(el => {
        if (el.id !== 'nombre-empleado' && el.id !== 'info-puesto') {
            el.textContent = el.id === 'neto-pagar' ? '$0.00' : '$0.00';
        }
    });
    
    document.getElementById('fecha-calculo').textContent = '-';
    
    imprimirBtn.disabled = true;
});

// Imprimir recibo actual
imprimirBtn.addEventListener('click', function() {
    const datosStr = imprimirBtn.dataset.nominaData;
    if (!datosStr) {
        mostrarNotificacion('No hay datos de nómina para imprimir', 'warning');
        return;
    }
    
    try {
        const datos = JSON.parse(datosStr);
        imprimirRecibo(datos);
    } catch (error) {
        mostrarNotificacion('Error al cargar los datos de nómina', 'warning');
        console.error('Error al parsear datos:', error);
    }
});

// Función para convertir número a palabras (MEJORADA para cantidades grandes)
function numeroAPalabras(numero) {
    if (numero === 0) return 'CERO PESOS';
    if (numero < 0) return 'MENOS ' + numeroAPalabras(Math.abs(numero));
    
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
    
    let entero = Math.floor(numero);
    let decimal = Math.round((numero - entero) * 100);
    
    let palabras = '';
    
    // Procesar miles
    if (entero >= 1000) {
        const miles = Math.floor(entero / 1000);
        if (miles === 1) {
            palabras += 'MIL ';
        } else {
            palabras += convertirGrupo(miles) + ' MIL ';
        }
        entero %= 1000;
    }
    
    // Procesar cientos
    if (entero > 0) {
        palabras += convertirGrupo(entero);
    }
    
    // Si no hay entero pero hay decimales
    if (palabras === '') {
        palabras = 'CERO';
    }
    
    palabras += ' PESOS';
    
    // Agregar centavos si existen
    if (decimal > 0) {
        palabras += ' ' + decimal + '/100';
    }
    
    palabras += ' M.N.';
    
    return palabras.trim();
    
    // Función auxiliar para convertir grupos de 3 dígitos
    function convertirGrupo(num) {
        if (num === 0) return '';
        if (num === 100) return 'CIEN';
        
        let resultado = '';
        const cientos = Math.floor(num / 100);
        const resto = num % 100;
        
        if (cientos > 0) {
            resultado += centenas[cientos] + ' ';
        }
        
        if (resto > 0) {
            if (resto < 10) {
                resultado += unidades[resto];
            } else if (resto < 20) {
                if (resto === 10) {
                    resultado += 'DIEZ';
                } else {
                    resultado += especiales[resto - 10];
                }
            } else {
                const decena = Math.floor(resto / 10);
                const unidad = resto % 10;
                
                if (decena === 2 && unidad > 0) {
                    resultado += 'VEINTI' + unidades[unidad];
                } else {
                    resultado += decenas[decena];
                    if (unidad > 0) {
                        resultado += ' Y ' + unidades[unidad];
                    }
                }
            }
        }
        
        return resultado.trim();
    }
}

// Función para imprimir recibo
function imprimirRecibo(datos) {
    if (!datos || typeof datos !== 'object') {
        mostrarNotificacion('Datos de nómina inválidos', 'warning');
        return;
    }

    // Crear contenido HTML para el recibo
    const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recibo de Nómina - ${datos.nombre || 'Empleado'}</title>
            <meta charset="UTF-8">
            <style>
                @media print {
                    @page {
                        size: letter;
                        margin: 1.5cm;
                    }
                    
                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #000;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: white;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px double #333;
                    padding-bottom: 20px;
                }
                
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }
                
                .company-subtitle {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 10px;
                }
                
                .document-title {
                    font-size: 20px;
                    font-weight: bold;
                    margin: 15px 0;
                    color: #2c3e50;
                }
                
                .employee-info {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-bottom: 25px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 5px;
                    border-left: 4px solid #3498db;
                }
                
                .info-item {
                    margin-bottom: 8px;
                }
                
                .info-label {
                    font-weight: bold;
                    color: #2c3e50;
                    display: inline-block;
                    width: 120px;
                }
                
                .calculation-sections {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 25px;
                }
                
                .section {
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    overflow: hidden;
                }
                
                .section-title {
                    background: #2c3e50;
                    color: white;
                    padding: 10px 15px;
                    font-weight: bold;
                    font-size: 14px;
                }
                
                .section-content {
                    padding: 15px;
                }
                
                .calculation-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed #eee;
                }
                
                .calculation-row:last-child {
                    border-bottom: none;
                }
                
                .calculation-row.total {
                    font-weight: bold;
                    border-top: 2px solid #333;
                    border-bottom: none;
                    margin-top: 10px;
                    padding-top: 10px;
                }
                
                .neto-section {
                    text-align: center;
                    margin: 30px 0;
                    padding: 25px;
                    border: 2px solid #27ae60;
                    border-radius: 8px;
                    background: #f8fff9;
                }
                
                .neto-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 15px;
                }
                
                .neto-amount {
                    font-size: 36px;
                    font-weight: bold;
                    color: #27ae60;
                    margin: 10px 0;
                }
                
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    font-size: 11px;
                    color: #666;
                }
                
                .signature-section {
                    margin-top: 50px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                }
                
                .signature-line {
                    border-top: 1px solid #333;
                    padding-top: 40px;
                    text-align: center;
                }
                
                .signature-label {
                    font-weight: bold;
                    margin-top: 5px;
                }
                
                .horas-extra-table {
                    width: 100%;
                    margin-top: 10px;
                    border-collapse: collapse;
                }
                
                .horas-extra-table th,
                .horas-extra-table td {
                    border: 1px solid #ddd;
                    padding: 6px;
                    text-align: center;
                    font-size: 11px;
                }
                
                .horas-extra-table th {
                    background: #f2f2f2;
                }
                
                .button-container {
                    margin: 20px 0;
                    text-align: center;
                }
                
                button {
                    padding: 10px 20px;
                    margin: 0 10px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                button:hover {
                    background: #2980b9;
                }
                
                button.print-btn {
                    background: #27ae60;
                }
                
                button.print-btn:hover {
                    background: #219653;
                }
                
                .monto-letra {
                    font-size: 14px;
                    margin-top: 10px;
                    font-style: italic;
                    color: #444;
                }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body>
            <div class="header">
                <div class="company-name">EMPRESA GAMESA</div>
                <div class="company-subtitle">Sistema de Nómina Interno</div>
                <div class="document-title">RECIBO DE NÓMINA</div>
                <div><strong>Fecha:</strong> ${new Date(datos.fecha || Date.now()).toLocaleDateString()}</div>
                <div><strong>Folio:</strong> NOM-${(datos.id || Date.now()).toString().slice(-6)}</div>
            </div>
            
            <div class="employee-info">
                <div class="info-item">
                    <span class="info-label">Empleado:</span>
                    ${datos.nombre || 'No especificado'}
                </div>
                <div class="info-item">
                    <span class="info-label">Departamento:</span>
                    ${datos.departamento || 'No especificado'}
                </div>
                <div class="info-item">
                    <span class="info-label">Puesto:</span>
                    ${datos.puesto || 'No especificado'}
                </div>
                <div class="info-item">
                    <span class="info-label">Salario Mensual:</span>
                    $${(datos.salario || 0).toFixed(2)}
                </div>
                <div class="info-item">
                    <span class="info-label">Días Trabajados:</span>
                    ${datos.diasTrabajados || 0} / 30
                </div>
                <div class="info-item">
                    <span class="info-label">Horas Extra:</span>
                    ${datos.horasExtra || 0} horas
                </div>
            </div>
            
            <div class="calculation-sections">
                <div class="section">
                    <div class="section-title">PERCEPCIONES</div>
                    <div class="section-content">
                        <div class="calculation-row">
                            <span>Salario Proporcional:</span>
                            <span>$${(datos.salarioProporcional || 0).toFixed(2)}</span>
                        </div>
                        
                        <div class="calculation-row">
                            <span>Horas Extra:</span>
                            <span>$${(datos.pagoHorasExtra || 0).toFixed(2)}</span>
                        </div>
                        
                        <div class="calculation-row">
                            <span>Bonificaciones:</span>
                            <span>$${(datos.bonificaciones || 0).toFixed(2)}</span>
                        </div>
                        
                        <table class="horas-extra-table">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Horas</th>
                                    <th>Valor/Hr</th>
                                    <th>Factor</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Horas Dobles</td>
                                    <td>${datos.horasExtraDobles || 0}</td>
                                    <td>$${((datos.salario || 0)/30/8).toFixed(2)}</td>
                                    <td>× 2</td>
                                    <td>$${(datos.pagoHorasDobles || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Horas Triples</td>
                                    <td>${datos.horasExtraTriples || 0}</td>
                                    <td>$${((datos.salario || 0)/30/8).toFixed(2)}</td>
                                    <td>× 3</td>
                                    <td>$${(datos.pagoHorasTriples || 0).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div class="calculation-row total">
                            <span>TOTAL PERCEPCIONES:</span>
                            <span>$${(datos.totalPercepciones || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">DEDUCCIONES</div>
                    <div class="section-content">
                        <div class="calculation-row">
                            <span>Faltas (${datos.faltas || 0} días):</span>
                            <span>$${(datos.deduccionFaltas || 0).toFixed(2)}</span>
                        </div>
                        <div class="calculation-row">
                            <span>ISR (15%):</span>
                            <span>$${(datos.isr || 0).toFixed(2)}</span>
                        </div>
                        <div class="calculation-row">
                            <span>Seguro Social (5%):</span>
                            <span>$${(datos.seguroSocial || 0).toFixed(2)}</span>
                        </div>
                        <div class="calculation-row total">
                            <span>TOTAL DEDUCCIONES:</span>
                            <span>$${(datos.totalDeducciones || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="neto-section">
                <div class="neto-title">NETO A PAGAR</div>
                <div class="neto-amount">$${(datos.netoPagar || 0).toFixed(2)}</div>
                <div class="monto-letra"><strong>(${numeroAPalabras(datos.netoPagar || 0)})</strong></div>
            </div>
            
            <div class="signature-section">
                <div class="signature-line">
                    <div>___________________________</div>
                    <div class="signature-label">EMPLEADO</div>
                </div>
                <div class="signature-line">
                    <div>___________________________</div>
                    <div class="signature-label">DEPARTAMENTO DE NÓMINAS</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Este documento es un comprobante de pago de nómina emitido por el Sistema de Nómina Interno de Empresa Gamesa</p>
                <p>Fecha de impresión: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="button-container no-print">
                <button class="print-btn" onclick="window.print()">
                    <i class="fas fa-print"></i> Imprimir Recibo
                </button>
                <button onclick="window.close()">
                    <i class="fas fa-times"></i> Cerrar
                </button>
            </div>
        </body>
        </html>
    `;
    
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
        mostrarNotificacion('Por favor, permite ventanas emergentes para imprimir', 'warning');
        return;
    }
    
    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
}

// Actualizar tabla de historial
function actualizarHistorial() {
    const historial = JSON.parse(localStorage.getItem('nominas') || '[]');
    
    if (historial.length === 0) {
        emptyHistory.style.display = 'block';
        historialBody.innerHTML = '';
        return;
    }
    
    emptyHistory.style.display = 'none';
    
    historialBody.innerHTML = historial.map(item => `
        <tr>
            <td>${new Date(item.fecha).toLocaleDateString()}</td>
            <td>${item.nombre}</td>
            <td>${item.departamento}</td>
            <td>${item.puesto}</td>
            <td><strong>$${item.netoPagar.toFixed(2)}</strong></td>
            <td>
                <div class="historial-actions">
                    <button class="action-btn btn-view" onclick="verDetalles(${item.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="action-btn btn-print" onclick="imprimirDesdeHistorial(${item.id})">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                    <button class="action-btn btn-delete" onclick="eliminarNomina(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Función para imprimir desde historial
window.imprimirDesdeHistorial = function(id) {
    const historial = JSON.parse(localStorage.getItem('nominas') || '[]');
    const nomina = historial.find(item => item.id === id);
    
    if (nomina) {
        imprimirRecibo(nomina);
    } else {
        mostrarNotificacion('No se encontró la nómina en el historial', 'warning');
    }
};

// Ver detalles de nómina
window.verDetalles = function(id) {
    const historial = JSON.parse(localStorage.getItem('nominas') || '[]');
    const nomina = historial.find(item => item.id === id);
    
    if (!nomina) {
        mostrarNotificacion('No se encontró la nómina', 'warning');
        return;
    }
    
    modalBody.innerHTML = `
        <div class="employee-info">
            <h4>${nomina.nombre}</h4>
            <p><strong>Departamento:</strong> ${nomina.departamento}</p>
            <p><strong>Puesto:</strong> ${nomina.puesto}</p>
            <p><strong>Fecha de cálculo:</strong> ${new Date(nomina.fecha).toLocaleString()}</p>
            <p><strong>Salario Base:</strong> $${nomina.salario.toFixed(2)}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div class="result-category">
                <h4>Percepciones</h4>
                <div class="result-item">
                    <span>Salario Base:</span>
                    <span>$${nomina.salarioProporcional.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span>Horas Extra (${nomina.horasExtra} hrs):</span>
                    <span>$${nomina.pagoHorasExtra.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span>Bonificaciones:</span>
                    <span>$${nomina.bonificaciones.toFixed(2)}</span>
                </div>
                <div class="result-item total">
                    <span>Total Percepciones:</span>
                    <span>$${nomina.totalPercepciones.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="result-category">
                <h4>Deducciones</h4>
                <div class="result-item">
                    <span>Faltas (${nomina.faltas} días):</span>
                    <span>$${nomina.deduccionFaltas.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span>ISR:</span>
                    <span>$${nomina.isr.toFixed(2)}</span>
                </div>
                <div class="result-item">
                    <span>Seguro Social:</span>
                    <span>$${nomina.seguroSocial.toFixed(2)}</span>
                </div>
                <div class="result-item total">
                    <span>Total Deducciones:</span>
                    <span>$${nomina.totalDeducciones.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div class="result-final" style="margin-top: 20px; text-align: center;">
            <h4>Neto a Pagar</h4>
            <div style="font-size: 2.5rem; font-weight: bold; color: #27ae60; margin: 15px 0;">
                $${nomina.netoPagar.toFixed(2)}
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn btn-print" onclick="imprimirDesdeHistorial(${nomina.id})" style="margin: 0 10px;">
                <i class="fas fa-print"></i> Imprimir Recibo
            </button>
        </div>
    `;
    
    document.getElementById('modal-title').textContent = `Detalles de Nómina - ${nomina.nombre}`;
    modal.style.display = 'flex';
};

// Eliminar nómina del historial
window.eliminarNomina = function(id) {
    if (confirm('¿Está seguro de eliminar este registro de nómina?')) {
        let historial = JSON.parse(localStorage.getItem('nominas') || '[]');
        historial = historial.filter(item => item.id !== id);
        localStorage.setItem('nominas', JSON.stringify(historial));
        actualizarHistorial();
        mostrarNotificacion('Registro eliminado del historial', 'success');
    }
};

// Función para imprimir historial completo
function imprimirHistorialCompleto() {
    const historial = JSON.parse(localStorage.getItem('nominas') || '[]');
    
    if (historial.length === 0) {
        mostrarNotificacion('No hay historial para imprimir', 'warning');
        return;
    }
    
    // Calcular totales
    let totalNeto = 0;
    let totalPercepciones = 0;
    let totalDeducciones = 0;
    
    let tablaHTML = '';
    historial.forEach((item, index) => {
        totalNeto += item.netoPagar;
        totalPercepciones += item.totalPercepciones;
        totalDeducciones += item.totalDeducciones;
        
        tablaHTML += `
            <tr>
                <td>${new Date(item.fecha).toLocaleDateString()}</td>
                <td>${item.nombre}</td>
                <td>${item.departamento}</td>
                <td>${item.puesto}</td>
                <td>${item.diasTrabajados}</td>
                <td>${item.horasExtra}</td>
                <td>$${item.totalPercepciones.toFixed(2)}</td>
                <td>$${item.totalDeducciones.toFixed(2)}</td>
                <td><strong>$${item.netoPagar.toFixed(2)}</strong></td>
            </tr>
        `;
    });
    
    const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Historial Completo de Nóminas</title>
            <meta charset="UTF-8">
            <style>
                @media print {
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                    
                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 10px;
                        line-height: 1.3;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 20px;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 15px;
                }
                
                .company-name {
                    font-size: 22px;
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                .report-title {
                    font-size: 18px;
                    margin: 10px 0;
                    color: #2c3e50;
                }
                
                .report-info {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 15px;
                }
                
                .historial-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                
                .historial-table th {
                    background: #2c3e50;
                    color: white;
                    padding: 10px;
                    text-align: left;
                    font-weight: bold;
                    border: 1px solid #ddd;
                }
                
                .historial-table td {
                    padding: 8px;
                    border: 1px solid #ddd;
                }
                
                .historial-table tr:nth-child(even) {
                    background: #f9f9f9;
                }
                
                .total-row {
                    font-weight: bold;
                    background: #e8f4f8 !important;
                }
                
                .summary {
                    margin-top: 30px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
                
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                
                .summary-label {
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                .button-container {
                    margin: 20px 0;
                    text-align: center;
                }
                
                button {
                    padding: 10px 20px;
                    margin: 0 10px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                button:hover {
                    background: #2980b9;
                }
                
                button.print-btn {
                    background: #27ae60;
                }
                
                button.print-btn:hover {
                    background: #219653;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">EMPRESA GAMESA</div>
                <div class="report-title">HISTORIAL COMPLETO DE NÓMINAS</div>
                <div class="report-info">
                    Reporte generado el: ${new Date().toLocaleString()} | 
                    Total de registros: ${historial.length}
                </div>
            </div>
            
            <table class="historial-table">
                <thead>
                    <tr>
                        <th width="100">Fecha</th>
                        <th width="120">Empleado</th>
                        <th width="100">Departamento</th>
                        <th width="120">Puesto</th>
                        <th width="80">Días Trab.</th>
                        <th width="60">H. Extra</th>
                        <th width="100">Percepciones</th>
                        <th width="100">Deducciones</th>
                        <th width="100">Neto a Pagar</th>
                    </tr>
                </thead>
                <tbody>
                    ${tablaHTML}
                    <tr class="total-row">
                        <td colspan="6"><strong>TOTALES GENERALES:</strong></td>
                        <td><strong>$${totalPercepciones.toFixed(2)}</strong></td>
                        <td><strong>$${totalDeducciones.toFixed(2)}</strong></td>
                        <td><strong>$${totalNeto.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="summary">
                <div class="section-title">RESUMEN DEL REPORTE</div>
                <div class="summary-item">
                    <span class="summary-label">Total de nóminas procesadas:</span>
                    <span>${historial.length}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total en percepciones:</span>
                    <span>$${totalPercepciones.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total en deducciones:</span>
                    <span>$${totalDeducciones.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total neto pagado:</span>
                    <span>$${totalNeto.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Promedio por nómina:</span>
                    <span>$${(totalNeto / historial.length).toFixed(2)}</span>
                </div>
            </div>
            
            <div class="button-container no-print">
                <button class="print-btn" onclick="window.print()">
                    Imprimir Historial
                </button>
                <button onclick="window.close()">
                    Cerrar
                </button>
            </div>
        </body>
        </html>
    `;
    
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
        mostrarNotificacion('Por favor, permite ventanas emergentes para imprimir', 'warning');
        return;
    }
    
    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
}

// Cerrar modal
closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Cargar historial al iniciar y configurar botones
document.addEventListener('DOMContentLoaded', function() {
    actualizarHistorial();
    
    // Configurar botón de imprimir historial completo
    const imprimirHistorialBtn = document.getElementById('imprimir-historial');
    if (imprimirHistorialBtn) {
        imprimirHistorialBtn.addEventListener('click', imprimirHistorialCompleto);
    }
    
    // Configurar botón "Ver Historial"
    const verHistorialBtn = document.getElementById('historial');
    if (verHistorialBtn) {
        verHistorialBtn.addEventListener('click', function() {
            document.querySelector('.history-section').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
    
    // Crear estilos para notificaciones
    const style = document.createElement('style');
    style.textContent = `
        .notificacion {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            transform: translateX(150%);
            transition: transform 0.3s ease-in-out;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .notificacion.mostrar {
            transform: translateX(0);
        }
        
        .notificacion-success {
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            border-left: 5px solid #219653;
        }
        
        .notificacion-warning {
            background: linear-gradient(135deg, #f39c12, #f1c40f);
            border-left: 5px solid #d68910;
        }
        
        .notificacion-info {
            background: linear-gradient(135deg, #3498db, #2980b9);
            border-left: 5px solid #2980b9;
        }
    `;
    document.head.appendChild(style);
});