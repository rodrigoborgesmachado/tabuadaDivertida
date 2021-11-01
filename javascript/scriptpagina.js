function topo(){
	parent.scroll(0,0);
}

$(document).ready(function () {
    // Add smooth scrolling to all links in navbar + footer link
    $(".navbar a, footer a[href='#ClinicaJonasGabriela']").on('click', function (event) {
        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            // Store hash
            var hash = this.hash;

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 900, function () {

                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        } // End if
    });

    $(window).scroll(function () {
        $(".slideanim").each(function () {
            var pos = $(this).offset().top;

            var winTop = $(window).scrollTop();
            if (pos < winTop + 600) {
                $(this).addClass("slide");
            }
        });
    });
})

function CriarContas(total, maximo){
    var lista = new Array();
    
    for(i = 0; i< total;i++){
        var num1 = 0;
        while(num1 == 0 || num1 == 1){
            num1 = Math.floor(Math.random() * maximo);
        }
        
        lista.push(num1);
    }
    
    return lista;
};

function EnviarRequisicaoPOST(nome, tempo, acertos, tipo){
    var xhr = new XMLHttpRequest();

    if (tipo == 'M'){
        tipo = 'MULTIPLICAÇÃO';
    }
    else if (tipo == 'D'){
        tipo = 'DIVISÃO';
    }
    else if (tipo == 'S'){
        tipo = 'SOMA';
    }
    else if (tipo == 'SU'){
        tipo = 'SUBTRAÇÃO';
    }

    var dados = JSON.stringify({nome, tempo, acertos, tipo});

    xhr.open("POST", "http://tabuadadivertida.sunsalesystem.com.br/PHP/InsereResultado.php");
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener("load", function() {
        var erroAjax = document.querySelector("#erro-ajax");
        if (xhr.status == 200) {
            //sucesso!
        } else {
            alert('Não foi possível inserir seu jogo :(! Ele não será apresentado no ranking');
            //erro!
        }
    }
    );

    xhr.send(dados);
}

function BuscaLista(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://tabuadadivertida.sunsalesystem.com.br/PHP/GetResultados.php", false);
    xhr.send(null);

    if(xhr.status === 200){
        return JSON.parse(xhr.responseText);
    }
    else{
        return null;
    }
}

//teste

const listaImagens = ['images/1.jpeg',
                      'images/2.jpeg',
                      'images/3.jpeg',
                      'images/4.jpeg',
                      'images/5.jpeg',
                      'images/6.jpeg',
                      'images/7.jpeg',
                      'images/8.jpeg',
                      'images/9.jpeg',
                      'images/10.jpeg',
                      'images/11.jpeg',
                      'images/12.jpeg',
                      'images/13.jpeg',
                      'images/14.jpeg',
                      'images/15.jpeg',
                      'images/16.jpeg',
                      'images/17.jpeg',
                      'images/18.jpeg',
                      'images/19.jpeg',
                      'images/20.jpeg',
                      'images/21.jpeg',
                      'images/22.jpeg',
                      'images/23.jpeg',
                      'images/24.jpeg',
                      'images/25.jpeg',
                      'images/26.jpeg',
                      'images/27.jpeg',
                      'images/28.jpeg',
                      'images/29.jpeg',
                      'images/30.jpeg',
                    ];