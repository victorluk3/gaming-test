var objetivosFila1 = []
var objetivosFila2 = []
var objetivos = []
var columnas = 3
var filas = 3

function generar(){
    objetivosFila1 = []
    objetivosFila2 = []
    objetivos = []

    // primera fila
    for(let i=0;i<columnas;i++)
        objetivosFila1.push({acierto: Math.random()*100 > 50 })
    
    // segunda fila
    for(let i=0;i<columnas;i++)
        objetivosFila2.push({acierto: Math.random()*100 > 50 })

    for(let f=0; f<filas; f++){
        let arr = []
        for(let c=0;c<columnas;c++) {
            arr.push({acierto: Math.random()*100 > 50 })
        }
        objetivos.push(arr)
    }

    //generar los objetivos en el DOM
    let div = document.getElementById('objetivos')

    let tabla = '<table align="center">'
    for(let f=0;f<objetivos.length;f++){
        tabla += '<tr>'
        for(let i=0; i<objetivos[f].length; i++) {
            let id= 'img'+f+'-'+i
            let src = objetivos[f][i].acierto ? "img/pato.png" :  "img/perro.png"
            let img = `<div onclick="presionado('${id}', ${objetivos[f][i].acierto})" class="target" ><img  width="100px" height="100px" src='${src}' id="${id}" /></div>` 
            tabla += '<td>'+  img  +'</td>'
        }
        tabla += '</tr>'
    }

    tabla += '</table>'

    div.innerHTML = tabla

}

generar()


function presionado(id, acierto) {
    //se espera un poco, para esperar que la bala desaparesca y hacer el cambio de imagen
    setTimeout(function(){
        document.getElementById(id).setAttribute('src', acierto ? 'img/acierto.png' : 'img/error.png')
    },300)
    
}