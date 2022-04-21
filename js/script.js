




    //Definimos todas las variables del proceso para poder jugar con ellas
    //Tiempo de refresco
    msRefresco=2000;
    //Salidas
    //Les pongo una 'b' por delante para diferenciar (manías), ya que son booleanas
    var bLuz_verde;
    var bLuz_roja;
    var bZumbador;
    var bValvula;
    var bMotor_avanza;
    var bMotor_retrocede;
    //Entradas
    var bP_marcha;
    var bP_Paro;
    var bFC1_inicio;
    var bFC2_carga;
    var bFC3_descarga;
    //Estados (str porque es un String / n porque es un entero)
    var nEstado;  
    var nContadorCiclos;
    //Temporizadores
    var tCarga;
    var tDescarga;
    //Carga asíncrona
    var nTimer;
    //Algunos elementos del DOM que me vendrán bien
    var pilotoVerdeOFF = document.createElement("img");
    pilotoVerdeOFF.setAttribute("src","./img/pilotoOFF.JPG");
    var pilotoRojoOFF = document.createElement("img");
    pilotoRojoOFF.setAttribute("src","./img/pilotoOFF.JPG");
    var PilotoVerdeON = document.createElement("img");
    PilotoVerdeON.setAttribute("src","./img/pilotoVerdeOn.JPG");
    var PilotoRojoON = document.createElement("img");
    PilotoRojoON.setAttribute("src","./img/pilotoRojoOn.JPG");
    var imgFC1;
    var imgFC2;
    var imgFC3;
    var btnMarcha;
    var prBarraProgreso;
    
    //Cargo los datos por otro lado para poder pintar tranquilamente desde el segundo 0
    pedirDatosActualizadosServer();    

    //Cuando cargue la página, que se vaya refrescando ...
    window.addEventListener('load', (event) => {
        pedirDatosActualizadosServer();   
        nTimer = setInterval(function(){
            pedirDatosActualizadosServer();
        },msRefresco);

        //Botón para acción manual del formulario
        let sendBtn = document.getElementById("btnSend");
        sendBtn.addEventListener("click", (event) => {
            sendPOST(document.getElementById('form01'));
            });
        
        //Cargo los finales de carrera y les añado listener para accionamiento
        imgFC1=document.querySelector("#tdFC1 img");
        addEventListener2FC(imgFC1);        
        imgFC2=document.querySelector("#tdFC2 img");
        addEventListener2FC(imgFC2); 
        imgFC3=document.querySelector("#tdFC3 img");
        addEventListener2FC(imgFC3); 

        //Preparo la barra de progreso para carga y descarga
        prBarraProgreso = document.querySelector("#spBarra progress");

        //Preparo el botón de marcha:
        btnMarcha = document.querySelector(".btnMarcha");
        btnMarcha.addEventListener( "click", e => {
            //let data = new FormData();
            //data.append('P_marcha', '1');
            document.querySelector("#marchaON").submit();
        } );
     });   

     function addEventListener2FC( imgFC ){
        imgFC.addEventListener("click", e=>{
            imgFC.setAttribute("src","./img/finalCarreraON.png");
            imgFC.closest("form").submit();
        });
     }

     function pedirDatosActualizadosServer(){
        fetch("api.html")
        .then((response) => response.json())
        .then((json) => {
        console.log(json);
        cargarDatosActualizados(json);
        pintarEstado();        
        }).catch((error) => {
          console.log(error);
        }).finally(() => {
            //Por si quiero hacer algo tenga éxito o no la respuesta del servidor
        });  

     }
     function cargarDatosActualizados( jsonObj ){
        nEstado = parseInt(jsonObj['Estado']);
        nContadorCiclos = parseInt(jsonObj['ContadorCiclos']);
        //Temporizadores
        tCarga = parseInt(jsonObj['tCarga']);
        tDescarga = parseInt(jsonObj['tDescarga']);
        //Otra forma:
        //nEstado = `${jsonObj.Estado}`;
        //Salidas
        bLuz_verde = jsonObj['Luz_verde']=="1"?true:false;
        bLuz_roja = jsonObj['Luz_roja']=="1"?true:false;
        bZumbador = jsonObj['Zumbador']=="1"?true:false;
        bValvula = jsonObj['Valvula']=="1"?true:false;
        bMotor_avanza = jsonObj['Motor_avanza']=="1"?true:false;
        bMotor_retrocede = jsonObj['Motor_retrocede']=="1"?true:false;
        //Entradas
        bP_marcha = jsonObj['P_marcha']=="1"?true:false;
        bP_Paro = jsonObj['P_Paro']=="1"?true:false;
        bFC1_inicio = jsonObj['FC1_inicio']=="1"?true:false;
        bFC2_carga = jsonObj['FC2_carga']=="1"?true:false;
        bFC3_descarga = jsonObj['FC3_descarga']=="1"?true:false;    
        
     }
     
     function pintarEstado(){
         let strEstado = "";
        switch(nEstado) {
        case 0:
            //En posición inicial
            document.querySelector("#tdVagoneta0 img").hidden=false;
            document.querySelector("#tdRetroceso1 img").hidden=true;
            document.querySelector("#tdRetroceso2 img").hidden=true;
            imgFC1.setAttribute("src",(bFC1_inicio?"./img/finalCarreraON.png":"./img/finalCarreraOFF.png"));
            strEstado = "EN POSICIÓN INICIAL"; 
            break;
        case 1:
            //En avance a carga
            document.querySelector("#tdVagoneta0 img").hidden=true;
            document.querySelector("#tdAvance1 img").hidden=false;
            imgFC1.setAttribute("src","./img/finalCarreraOFF.png");
            strEstado = "AVANCE A CARGA";
            break;
        case 2:
            //Cargando
            document.querySelector("#mp3Sirena").play();
            document.querySelector("#tdVagoneta2 img").hidden=false;
            document.querySelector("#tdGrano img").hidden=false;              
            document.querySelector("#tdAvance1 img").hidden=true;     
            imgFC2.setAttribute("src",(bFC2_carga?"./img/finalCarreraON.png":"./img/finalCarreraOFF.png"));    
            strEstado = "CARGANDO ... "; 
            prBarraProgreso.hidden = false;
            prBarraProgreso.setAttribute("value",Math.round(tCarga/100).toString());
            break;
        case 3:
            //En avance a descarga
            document.querySelector("#mp3Sirena").pause();
            document.querySelector("#tdVagoneta2 img").hidden=true;
            document.querySelector("#tdGrano img").hidden=true;
            document.querySelector("#tdAvance3 img").hidden=false;
            imgFC2.setAttribute("src","./img/finalCarreraOFF.png");
            prBarraProgreso.hidden = true;
            strEstado = "AVANCE A DESCARGA"
            break;
        case 4:
            //Descargando
            document.querySelector("#mp3Sirena").play();
            document.querySelector("#tdVagoneta4 img").hidden=false;
            document.querySelector("#tdAvance3 img").hidden=true;
            imgFC3.setAttribute("src",(bFC3_descarga?"./img/finalCarreraON.png":"./img/finalCarreraOFF.png"));
            strEstado = "DESCARGANDO";             
            prBarraProgreso.hidden = false;
            prBarraProgreso.setAttribute("value",Math.round(tDescarga/100).toString());
            break;
        case 5:
            //En retroceso a inicio
            document.querySelector("#mp3Sirena").pause();
            document.querySelector("#tdVagoneta4 img").hidden=true;
            document.querySelector("#tdRetroceso1 img").hidden=false;
            document.querySelector("#tdRetroceso2 img").hidden=false;
            imgFC3.setAttribute("src","./img/finalCarreraOFF.png");
            prBarraProgreso.hidden = true;
            strEstado = "RETROCESO A INICIO";
            break;
        default:
          console.log("Estado inválido: " + nEstado);  
        }
        //Luces
        let dvPilotoVerde = document.querySelector("#pilotoVerde");
        let dvPilotoRojo = document.querySelector("#pilotoRojo");
        if(bLuz_verde){
            dvPilotoVerde.children[0].remove();
            dvPilotoVerde.append(PilotoVerdeON);
        } else {
            dvPilotoVerde.children[0].remove();
            dvPilotoVerde.append(pilotoVerdeOFF);
        }
        if(bLuz_roja){
            dvPilotoRojo.children[0].remove();
            dvPilotoRojo.append(PilotoRojoON);
        } else {
            dvPilotoRojo.children[0].remove();
            dvPilotoRojo.append(pilotoRojoOFF);
        }
        //Cabecera con estado y ciclos:
        document.querySelector("#spContadorCiclos").innerHTML = nContadorCiclos;
        document.querySelector("#spEstado").innerHTML = strEstado;
    }
       
    

      function sendPOST( form ){   
        const data = new FormData(form);       
          /*Si necesitáramos crear el data a mano:
        const data = new FormData();
          data.append('empresa', 'DesarrolloWeb.com');
          data.append('CIF', 'ESB00001111');
          data.append('formacion_profesional', 'EscuelaIT'); */
          curURL = window.location.href;
          fetch(curURL, {
          method: 'POST',
          body: data
          })
          .then(function(response) {
          if(response.ok) {              
              return response.text()
          } else {
              throw "Error en la llamada Ajax";
          }
              })
              .then(function(texto) {
              console.log(texto);
              })
              .catch(function(err) {
              console.log(err);
              });
          }