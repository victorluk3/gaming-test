var arma = document.getElementById('arma')

var content = document.getElementById('content')

content.addEventListener('mousemove', function(e){
    // console.log('arma move', e)

    arma.setAttribute('style', 'position: absolute; top:500px; left:'+(parseFloat(e.clientX)-25)+'px')
})

content.addEventListener('mousedown', function(e){
    console.log('disparo', e)
    setTimeout(function(){
        let id = parseInt(Math.random()*1000) + '-' + parseInt(Math.random()*1000) + '-' + parseInt(Math.random()*1000)
        const node = document.createElement("div");
        node.setAttribute("id", id)
        node.setAttribute("class", "bala")
        let x = e.clientX - 6;
        let y = e.clientY - 6;
        node.setAttribute("style", "position:fixed; top:500px; left: "+x+"px")
        content.append(node)
        efectoDisparo(id, x, y)
    }, 100)

})

function efectoDisparo(id, x, y) {

    let yStart = 500
    let node = document.getElementById(id)
    let timer = setInterval(function(){
        
        node.setAttribute('style', 'position:fixed; width: 10px; height: 10px; top:'+(yStart)+'px; left:'+(x+1) + 'px')
        yStart -= 10;
        if(yStart <= y) {
            content.removeChild(document.getElementById(id))
            clearInterval(timer)
            return
        }
    }, 5)

    // setTimeout(function(){
    //     node.setAttribute('style', 'position:fixed; width: 8px; height: 8px; top:'+(y+1)+'px; left:'+(x+1) + 'px')
    // }, 50)

    // setTimeout(function(){
    //     node.setAttribute('style', 'position:fixed; width: 6px; height: 6px; top:'+(y+2)+'px; left:'+(x+2) + 'px')
    // }, 100)

    // setTimeout(function(){
    //     node.setAttribute('style', 'position:fixed; width: 4px; height: 4px; top:'+(y+3)+'px; left:'+(x+3) + 'px')
    // }, 150)

    // setTimeout(function(){
    //     node.setAttribute('style', 'position:fixed; width: 2px; height: 2px; top:'+(y+4)+'px; left:'+(x+4) + 'px')
    // }, 200)
    


    // setTimeout(function(){
    //     content.removeChild(document.getElementById(id))
    // }, 200)
    
}