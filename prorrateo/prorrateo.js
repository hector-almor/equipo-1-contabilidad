// --- Manejo de MPI ---
document.getElementById("mpi-form").addEventListener("submit", function(e){
    e.preventDefault();
    let suma = 0;
    const depts = ["A","B","C","D","E","F","G","H","I","J","K"];
    depts.forEach(d=>{
        const val = parseFloat(document.getElementById("mpi"+d).value) || 0;
        document.getElementById("mpi"+d+"cell").textContent = val.toFixed(2);
        suma += val;
    });
    const cell = document.getElementById("totalMPI");
    cell.dataset.val = suma.toFixed(2);
    cell.textContent = suma.toFixed(2);
    });

    // --- Manejo de MOI ---
    document.getElementById("moi-form").addEventListener("submit", function(e){
    e.preventDefault();
    let suma = 0;
    const depts = ["A","B","C","D","E","F","G","H","I","J","K"];
    depts.forEach(d=>{
        const val = parseFloat(document.getElementById("moi"+d).value) || 0;
        document.getElementById("moi"+d+"cell").textContent = val.toFixed(2);
        suma += val;
    });
    const cell = document.getElementById("totalMOI");
    cell.dataset.val = suma.toFixed(2);
    cell.textContent = suma.toFixed(2);
    });

    // --- Guardar valores de fábrica en la tabla ---
    document.getElementById("fabrica-form").addEventListener("submit", function(e){
    e.preventDefault();

    const renta = parseFloat(document.getElementById("renta").value) || 0;
    const deprec = parseFloat(document.getElementById("deprec").value) || 0;
    const servicios = parseFloat(document.getElementById("servicios").value) || 0;
    const seguros = parseFloat(document.getElementById("seguros").value) || 0;

    // Mostrar valores en la tabla
    document.getElementById("fabricaRenta").textContent = renta.toFixed(2);
    document.getElementById("fabricaDeprec").textContent = deprec.toFixed(2);
    document.getElementById("fabricaServicios").textContent = servicios.toFixed(2);
    document.getElementById("fabricaSeguros").textContent = seguros.toFixed(2);

    // Total fábrica
    const totalFabricaNum = renta + deprec + servicios + seguros;
    const tfCell = document.getElementById("totalFabrica");
    tfCell.dataset.val = totalFabricaNum.toFixed(2);
    tfCell.textContent = totalFabricaNum.toFixed(2);
    });

    // --- Función auxiliar para cada fila (NO suma Fábrica en el horizontal) ---
    function calcularFila(concepto, fabrica, base, totalId, fabricaId) {
    const coef = fabrica / base;
    let suma = 0; // solo suma A–K

    document.getElementById(fabricaId).textContent = fabrica.toFixed(2);

    document.querySelectorAll(`input[data-concepto="${concepto}"]`).forEach(inp => {
        const val = parseFloat(inp.value) || 0;
        const resultado = val * coef;
        inp.value = resultado.toFixed(2);
        suma += resultado;
    });

    const totalCell = document.getElementById(totalId);
    totalCell.dataset.val = suma.toFixed(2);
    totalCell.textContent = suma.toFixed(2);

    return suma;
    }

    // --- Calcular totales verticales por departamento (A–K) ---
    function calcularTotalesColumnas() {
    const depts = ["A","B","C","D","E","F","G","H","I","J","K"];

    depts.forEach((d, idx) => {
        let suma = 0;

        // MPI y MOI
        const mpiCell = document.getElementById(`mpi${d}cell`);
        const moiCell = document.getElementById(`moi${d}cell`);
        if (mpiCell) suma += parseFloat(mpiCell.textContent) || 0;
        if (moiCell) suma += parseFloat(moiCell.textContent) || 0;

        // Renta, Deprec, Servicios, Seguros
        const rentaInputs = document.querySelectorAll("#rowRenta input[data-concepto='renta']");
        const deprecInputs = document.querySelectorAll("#rowDeprec input[data-concepto='deprec']");
        const serviciosInputs = document.querySelectorAll("#rowServicios input[data-concepto='servicios']");
        const segurosInputs = document.querySelectorAll("#rowSeguros input[data-concepto='seguros']");

        [rentaInputs, deprecInputs, serviciosInputs, segurosInputs].forEach(arr=>{
        if (arr[idx]) {
            suma += parseFloat(arr[idx].value) || 0;
        }
        });

        const colCell = document.getElementById(`totalCol${d}`);
        colCell.dataset.val = suma.toFixed(2);
        colCell.textContent = suma.toFixed(2);
    });
    }

    // --- Botón independiente para calcular todo ---
    function calcularProrrateo() {
    const renta = parseFloat(document.getElementById("renta").value) || 0;
    const baseRenta = parseFloat(document.getElementById("baseRenta").value) || 1;

    const deprec = parseFloat(document.getElementById("deprec").value) || 0;
    const baseDeprec = parseFloat(document.getElementById("baseDeprec").value) || 1;

    const servicios = parseFloat(document.getElementById("servicios").value) || 0;
    const baseServicios = parseFloat(document.getElementById("baseServicios").value) || 1;

    const seguros = parseFloat(document.getElementById("seguros").value) || 0;
    const baseSeguros = parseFloat(document.getElementById("baseSeguros").value) || 1;

    // Calcular horizontales
    calcularFila("renta", renta, baseRenta, "totalRenta", "fabricaRenta");
    calcularFila("deprec", deprec, baseDeprec, "totalDeprec", "fabricaDeprec");
    calcularFila("servicios", servicios, baseServicios, "totalServicios", "fabricaServicios");
    calcularFila("seguros", seguros, baseSeguros, "totalSeguros", "fabricaSeguros");

    // Totales verticales por columna
    calcularTotalesColumnas();

    //Gran total = suma de la columna "Total" de cada fila
    let granTotalNum = 0;
    const filasTotales = ["totalMPI","totalMOI","totalRenta","totalDeprec","totalServicios","totalSeguros"];
    filasTotales.forEach(id=>{
        const cell = document.getElementById(id);
        granTotalNum += parseFloat(cell?.dataset.val || cell.textContent || "0");
    });

    const granCell = document.getElementById("granTotal");
    granCell.dataset.val = granTotalNum.toFixed(2);
    granCell.textContent = granTotalNum.toFixed(2);
    mostrarProrrateo2();
    
}

// Variables globales para bases
let basesProrrateo2 = {F:1,G:1,H:1,I:1,J:1,K:1};
let basesProrrateo3 = {A:1,B:1,C:1,D:1,E:1};

// Mostrar tabla y formularios al terminar prorrateo 1
function mostrarProrrateo2() {
    document.getElementById("basesProrrateo2").style.display = "block";
    document.getElementById("tablaProrrateo2").style.display = "table";
    document.getElementById("btnProrrateo2").style.display = "block";

    const depts = ["A","B","C","D","E","F","G","H","I","J","K"];
    depts.forEach(d=>{
        const val = parseFloat(document.getElementById("totalCol"+d)?.textContent || 0);
        document.getElementById("saldo"+d).textContent = val.toFixed(2);
    });
    document.getElementById("saldoTotal").textContent = document.getElementById("granTotal").textContent;
    }

    // Guardar bases prorrateo 2
    function guardarBasesProrrateo2() {
    basesProrrateo2.F = parseFloat(document.getElementById("baseF").value) || 1;
    basesProrrateo2.G = parseFloat(document.getElementById("baseG").value) || 1;
    basesProrrateo2.H = parseFloat(document.getElementById("baseH").value) || 1;
    basesProrrateo2.I = parseFloat(document.getElementById("baseI").value) || 1;
    basesProrrateo2.J = parseFloat(document.getElementById("baseJ").value) || 1;
    basesProrrateo2.K = parseFloat(document.getElementById("baseK").value) || 1;
    alert("Bases guardadas correctamente");
    }

    // Ejecutar prorrateo 2
    function ejecutarProrrateo2() {
    const filas = [
        {id:"mantenimiento", dept:"F"},
        {id:"calidad", dept:"G"},
        {id:"almacen", dept:"H"},
        {id:"admin", dept:"I"},
        {id:"seguridad", dept:"J"},
        {id:"direccion", dept:"K"}
    ];
    const depts = ["A","B","C","D","E"];

    filas.forEach(fila=>{
        let saldoInicial = parseFloat(document.getElementById("saldo"+fila.dept).textContent) || 0;
        let base = basesProrrateo2[fila.dept];

        if(fila.dept === "K"){
        const saldoInicialK = saldoInicial;
        const baseK = base;

        depts.forEach(d=>{
            let sumaCol = 0;
            ["saldo"+d,"mantenimiento"+d,"calidad"+d,"almacen"+d,"admin"+d,"seguridad"+d].forEach(id=>{
            const el = document.getElementById(id);
            let val = 0;
            if(el){
                if(el.tagName === "INPUT"){
                val = parseFloat(el.value) || 0;
                } else {
                val = parseFloat(el.textContent.replace(/[()]/g,"")) || 0;
                }
            }
            sumaCol += val;
            });
            const coef = sumaCol / baseK;
            const resultado = saldoInicialK * coef;
            document.getElementById("direccion"+d+"cell").textContent = resultado.toFixed(2);
        });

        const salidaCell = document.getElementById("direccionKcell");
        salidaCell.textContent = "(" + saldoInicialK.toFixed(2) + ")";
        salidaCell.classList.add("negative");
        document.getElementById("direccionTotal").textContent = "0.00";

        } else {
        const coef = saldoInicial / base;
        depts.forEach(d=>{
            const inp = document.getElementById(fila.id+d);
            if(inp){
            const val = parseFloat(inp.value) || 0;
            const resultado = val * coef;
            inp.value = resultado.toFixed(2);
            }
        });
        const salidaCell = document.getElementById(fila.id+fila.dept+"cell");
        salidaCell.textContent = "(" + saldoInicial.toFixed(2) + ")";
        salidaCell.classList.add("negative");
        document.getElementById(fila.id+"Total").textContent = "0.00";
        }
    });

    calcularTotalesColumnas2();
    mostrarCostosFinales();
    }

    // Totales por columna prorrateo 2
    function calcularTotalesColumnas2() {
    const cols = ["A","B","C","D","E"];

    // Función auxiliar: obtiene número desde input o celda
    const getNum = (id) => {
        const el = document.getElementById(id);
        if(!el) return 0;
        if(el.tagName === "INPUT") {
        return parseFloat(el.value) || 0;
        } else {
        // Limpia paréntesis de negativos y espacios
        const t = el.textContent.replace(/[()]/g,"").trim();
        return parseFloat(t) || 0;
        }
    };

    // Suma explícita por columna (incluye saldo inicial + F–J + K)
    cols.forEach(d=>{
        const suma =
        getNum("saldo"+d) +         // saldos iniciales (celda)
        getNum("mantenimiento"+d) + // F (input)
        getNum("calidad"+d) +       // G (input)
        getNum("almacen"+d) +       // H (input)
        getNum("admin"+d) +         // I (input)
        getNum("seguridad"+d) +     // J (input)
        getNum("direccion"+d+"cell"); // K (celda)

        document.getElementById("totalCol2"+d).textContent = suma.toFixed(2);
    });

    // Zeros para F–K
    ["F","G","H","I","J","K"].forEach(d=>{
        document.getElementById("totalCol2"+d).textContent = "0.00";
    });

    // Gran total A–E
    let granTotal = 0;
    cols.forEach(d=>{
        granTotal += parseFloat(document.getElementById("totalCol2"+d).textContent) || 0;
    });
    document.getElementById("granTotal2").textContent = granTotal.toFixed(2);
    }


    // Mostrar tabla de costos finales y cargar C.I
    function mostrarCostosFinales() {
    document.getElementById("tablaCostosFinal").style.display = "block";

    ["A","B","C","D","E"].forEach(d=>{
        const val = parseFloat(document.getElementById("totalCol2"+d)?.textContent || 0);
        document.getElementById("ci"+d).textContent = val.toFixed(2);
    });

    let totalCI = 0;
    ["A","B","C","D","E"].forEach(d=>{
        totalCI += parseFloat(document.getElementById("ci"+d).textContent) || 0;
    });
    document.getElementById("totalCIrow").textContent = totalCI.toFixed(2);
    }

    // Calcular MPD
    function calcularMPD() {
    const totalMPD = parseFloat(document.getElementById("totalMPD").value) || 0;
    let suma = 0;

    ["A","B","C","D","E"].forEach(d=>{
        const porc = parseFloat(document.getElementById("mpdBase"+d).value) || 0;
        const resultado = porc * totalMPD;
        document.getElementById("mpd"+d).textContent = resultado.toFixed(2);
        suma += resultado;
    });

    document.getElementById("totalMPDrow").textContent = suma.toFixed(2);
    }

    // Calcular costos finales
    function calcularCostosFinales() {
    let granTotal = 0;

    ["A","B","C","D","E"].forEach(d=>{
        const mpdVal = parseFloat(document.getElementById("mpd"+d).textContent) || 0;
        const modVal = parseFloat(document.getElementById("mod"+d).value) || 0;
        const ciVal = parseFloat(document.getElementById("ci"+d).textContent) || 0;

        const totalDepto = mpdVal + modVal + ciVal;
        document.getElementById("total"+d).textContent = totalDepto.toFixed(2);
        granTotal += totalDepto;
    });

    document.getElementById("granTotalCostos").textContent = granTotal.toFixed(2);

    let totalMOD = 0;
    ["A","B","C","D","E"].forEach(d=>{
        totalMOD += parseFloat(document.getElementById("mod"+d).value) || 0;
    });
    document.getElementById("totalMODrow").textContent = totalMOD.toFixed(2);
    mostrarCostosUnitarios()
}


function mostrarCostosUnitarios() {
    document.getElementById("tablaCostosUnitarios").style.display = "block";
}

function calcularCostosUnitarios() {
  // Total de costos de la tabla 3
    const totalCostos = parseFloat(document.getElementById("granTotalCostos").textContent) || 0;

  // Unidades por orden
    const u1 = parseFloat(document.getElementById("unidades1").value) || 0;
    const u2 = parseFloat(document.getElementById("unidades2").value) || 0;
    const u3 = parseFloat(document.getElementById("unidades3").value) || 0;

    const totalUnidades = u1 + u2 + u3;
    document.getElementById("totalUnidades").textContent = totalUnidades;

    // Costo unitario
    const costoUnitario = totalUnidades > 0 ? totalCostos / totalUnidades : 0;
    document.getElementById("costoUnitario").textContent = costoUnitario.toFixed(2);

    // Costos por orden
    const c1 = u1 * costoUnitario;
    const c2 = u2 * costoUnitario;
    const c3 = u3 * costoUnitario;

    document.getElementById("costo1").textContent = c1.toFixed(2);
    document.getElementById("costo2").textContent = c2.toFixed(2);
    document.getElementById("costo3").textContent = c3.toFixed(2);

    // Total de costos por orden
    const totalOrdenes = c1 + c2 + c3;
    document.getElementById("totalCostosOrden").textContent = totalOrdenes.toFixed(2);
}





















