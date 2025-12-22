let movimientosMaestros = [];

function toggleCosto() { //ESte deshabilita el costo en salidas
    const tipo = document.getElementById('tipo').value;
    const costoInput = document.getElementById('costo');
    costoInput.disabled = (tipo === 'salida');
    if (tipo === 'salida') costoInput.value = '';
}

function registrarMovimiento() {  //Entradas del USuario 
    const fecha = document.getElementById('fecha').value;
    const orden = document.getElementById('orden').value;
    const tipo = document.getElementById('tipo').value;
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    const costo = parseFloat(document.getElementById('costo').value) || 0;

    if (!fecha || isNaN(cantidad)) return alert("Datos inválidos");

    movimientosMaestros.push({ fecha, orden, tipo, cantidad, costo });
    actualizarSistemas();
}

function calcularMetodo(metodo) { //AQui hace el cálculo de los métodos PEPS, UEPS y Promedio
    let filas = [];
    let capas = [];
    let saldoT = 0;
    let exT = 0;

    movimientosMaestros.forEach(m => {
        let f = { ...m, ex: 0, u: '', p: '', d: 0, h: 0, saldo: 0, e: '', s: '' };

        if (m.tipo === 'entrada') {
            f.e = m.cantidad;
            exT += m.cantidad;
            f.d = m.cantidad * m.costo;
            saldoT += f.d;
            capas.push({ cant: m.cantidad, costo: m.costo });
            f.u = m.costo;
        } else {
            f.s = m.cantidad;
            if (m.cantidad > exT) return; // Ignorar si no hay stock

            if (metodo === 'Promedio') { //Cálculo para Promedio
                let prom = saldoT / exT;
                f.h = m.cantidad * prom;
                f.p = prom;
            } else { //Cálculo para PEPS y UEPS
                let porSurtir = m.cantidad;
                let costoS = 0;
                let capasTemp = JSON.parse(JSON.stringify(capas));

                while (porSurtir > 0 && capasTemp.length > 0) { 
                    let idx = (metodo === 'PEPS') ? 0 : capasTemp.length - 1;
                    let c = capasTemp[idx];

                    if (c.cant <= porSurtir) { //Usa toda la capa
                        costoS += c.cant * c.costo;
                        porSurtir -= c.cant;
                        capasTemp.splice(idx, 1);
                    } else { //Usa parte de la capa
                        costoS += porSurtir * c.costo;
                        c.cant -= porSurtir;
                        porSurtir = 0;
                    }
                }
                f.h = costoS;
                f.u = f.h / m.cantidad;
                capas = capasTemp; // Actualiza las capas reales
            }
            exT -= m.cantidad;
            saldoT -= f.h;
        }
        f.ex = exT; f.saldo = saldoT;
        filas.push(f); // Agrega la fila calculada
    });
    return filas;
}

function renderizarTabla(metodo, gridId) { //Renderiza la tabla en el HTML
    const grid = document.getElementById(gridId);
    const data = calcularMetodo(metodo);

    grid.innerHTML = `
        <div class="header-cell span-v">Fecha</div><div class="header-cell span-v">Orden</div>
        <div class="header-cell span-h3">UNIDADES</div><div class="header-cell span-h2">COSTOS</div><div class="header-cell span-h3">VALORES</div>
        <div class="sub-header">E</div><div class="sub-header">S</div><div class="sub-header">Ex.</div>
        <div class="sub-header">Unit.</div><div class="sub-header">Prom.</div>
        <div class="sub-header">Debe</div><div class="sub-header">Haber</div><div class="sub-header">Saldo</div>
    `;

    data.forEach(r => { // Agrega filas de datos
        [r.fecha, r.orden, r.e, r.s, r.ex, r.u, r.p, r.d, r.h, r.saldo].forEach(val => {
            let div = document.createElement('div');
            div.className = 'data-cell';
            div.textContent = typeof val === 'number' ? val.toFixed(2) : val;
            grid.appendChild(div);
        });
    });

    // Aqui actualiza los valores finales
    const totalH = data.reduce((acc, f) => acc + (f.h || 0), 0);
    const finalS = data.length > 0 ? data[data.length - 1].saldo : 0;

    document.getElementById(`totalSalida${metodo}`).textContent = totalH.toLocaleString('en-US', {minimumFractionDigits: 2});
    document.getElementById(`valorFinal${metodo}`).textContent = finalS.toLocaleString('en-US', {minimumFractionDigits: 2});
}

function actualizarSistemas() { //Actualiza las tres tablas
    renderizarTabla('PEPS', 'gridPEPS');
    renderizarTabla('UEPS', 'gridUEPS');
    renderizarTabla('Promedio', 'gridPromedio');
}

function reiniciar() { //Limpia todo
    movimientosMaestros = [];
    actualizarSistemas();
}