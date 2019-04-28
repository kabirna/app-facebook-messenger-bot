//Habiitar el modo estricto
'use strict'

//Inluir los paquetes de nodejs que instalamos previamente
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const access_token = "EAAJdsQ8XKicBAISvwzukv2DUHfvPOZBIg7MSXHTsXbVgZCPGZBUZCZAJWhqwnWTvuSCE55DUllSXo0qratGa9oE8P1xMiGCm3yWSHALbtH3TUVUOp7N6zVbc3xdBYfFDhjbdQPUfZBvwwvrv6ECqkpO81lBeZBVQlBUBOAXSouSlkYe0dCqZC0ehzrNYfjifgTwZD";

//Creamos una constante llamada 'app' que extienda de express
const app = express();

//Configurar un puerto por defecto
app.set('port', 5000);

//Para que nuestro servidor entienda la configuración que va a recibir por medio de la API de Facebook 
//tenemos que añadir una nueva configuración
app.use(bodyParser.json());

//Creamos una ruta principal donde va a estar nuestro servidor
app.get('/', function (req, response) {
    response.send("Hola Mundo!");
})

//Añadir nuestro webhook con el cual vamos a verificar con un Token la asignación que tendrá
//nuestra API de Facebook con nuestro código en nuestro servidor con Express
app.get('/webhook', function (req, response) {
    if (req.query['hub.verify_token'] === 'pugpizza_token') {
        console.log("el token es valido");
        response.send(req.query['hub.challenge']);
    } else {
        response.send("Pug Pizza no tienes permisos.");
    }
})

//Saber lo que el usuario nos manda desde messenger
app.post('/webhook', function (req, response) {
    const webhook_event = req.body.entry[0];
    if (webhook_event.messaging) {
        webhook_event.messaging.forEach(event => {
            //console.log(event);
            //handleMessage(event);
            handleEvent(event.sender.id ,event);
        })
    }
    response.sendStatus(200);
})

//Funciones para manejar los eventos recibidos
function handleEvent(senderId, event) {
    if(event.message) {
        handleMessage(senderId, event.message);
    } else if (event.postback) {
        handlePostback(senderId, event.postback.payload);
    }
}
//Funcion para enviar acciones al usuario (Simular que estamos escribiendo)
function senderActions(senderId) {
    const messageData = {
        "recipient" : {
            "id": senderId
        },
        "sender_action":"typing_on"
    }    
    callSendApi(messageData);
}

function handleMessage(senderId, event) {
    if(event.text) {
        //defaultMessage(senderId);
        //messageImage(senderId);
        //contactSupport(senderId);
        //showLocations(senderId);
        //receipt(senderId);
        getLocation(senderId);
    } else if(event.attachments) {
        handleAttachments(senderId, event);
    }
}

function defaultMessage(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "text": "Hola soy un bot de messenger, y te invito a utilizar nuestro menu",
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": "Quieres una Pizza?",
                    "payload": "PIZZAS_PAYLOAD"
                },
                {
                    "content_type": "text",
                    "title": "Acerca de",
                    "payload": "ABOUT_PAYLOAD"
                }
            ]
        }
    }
    senderActions(senderId);
    callSendApi(messageData);
}

//Funcion para manejar los Payloads recibidos
function handlePostback(senderId, payload) {
    console.log(payload);
    switch(payload) {
        case "GET_STARTED_PUGPIZZA":
            console.log(payload);
        break;
        case "PIZZAS_PAYLOAD":
            showPizzas(senderId);
        break;
        case "PEPPERONI_PAYLOAD":
            sizePizza(senderId);
        break;
        case "BBQ_PAYLOAD":
            sizePizza(senderId);
        break;
    }
}

//Funcion para manejar los adjuntos (attachments)
function handleAttachments(senderId, event) {
    let attachment_type = event.attachments[0].type;
    switch(attachment_type) {
        case "image":
            console.log(attachment_type);
        break;
        case "video":
            console.log(attachment_type);
        break;
        case 'audio':
            console.log(attachment_type);
        break;
        case 'file': 
            console.log(attachment_type);
        break;
        case 'location':
            console.log(JSON.stringify(event));
        break;
    }
}

//Funcion para mandar una respuesta al usuario
function callSendApi(response) {
    request({
            "uri": "https://graph.facebook.com/v3.2/me/messages",
            "qs": {
                "access_token": access_token
            },
            "method": "POST",
            "json": response
        },
        function (err) {
            if (err) {
                console.log("Ha ocurrido un error");
            } else {
                console.log("Mensaje enviado");
            }
        }
    )
}

function showPizzas(senderId) {
    const messageData = {
        "recipient": {
            "id":senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements" : [
                        {
                            "title":"Pepperoni",
                            "subtitle":"Con todo el sabor del pepperoni",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Elegir Pepperoni",
                                    "payload": "PEPPERONI_PAYLOAD"
                                }
                            ]
                        },
                        {
                            "title":"Pollo BBQ",
                            "subtitle":"Con todo el sabor del pollo BBQ",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Elegir Pollo BBQ",
                                    "payload": "BBQ_PAYLOAD"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}


// Funcion para mostrar el tamano de las pizza que quiere ordenar
function sizePizza(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            attachment: {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "large",
                    "elements": [
                        {
                            "title": "Individual",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle":"Porcion individual",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Elegir individual",
                                    "payload": "PERSONAL_SIZE_PAYLOAD"
                                }
                            ]
                        },
                        {
                            "title": "Mediana",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle":"Porcion mediana",
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Elegir mediana",
                                    "payload": "MEDIUM_SIZE_PAYLOAD"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}

//Funcion que permite enviar una imagen al usuario
function messageImage(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            attachment: {
                "type": "image",
                "payload": {
                    "url": "https://media.giphy.com/media/1dOIvm5ynwYolB2Xlh/giphy.gif"
                }
            }
        }
    }
    callSendApi(messageData);
}

//Funcion para que el usuario se contacte con nosotros
function contactSupport(senderId) {
    const messageData = {
        "recipient": {
            "id":senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Hola este es el canal de soporte, quieres llamarnos?",
                    "buttons": [{
                        "type": "phone_number",
                        "title": "Llamar a un asesor",
                        "payload": "+522282929998"
                    }]

                }
            }
        }
    }
    callSendApi(messageData);
}

//Funcion para un webview dentro del messenger, en este caso mostraremos un mapa
function showLocations(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "large",
                    "elements": [
                        {
                            "title": "Sucursal Mexico",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle": "Direccion bonita #555",
                            "buttons": [
                                {
                                    "title": "Ver en el mapa",
                                    "type": "web_url",
                                    "url": "https://goo.gl/maps/GCCpWmZep1t",
                                    "webview_height_ratio": "full"
                                }
                            ]
                        },
                        {
                            "title": "Sucursal Colombia",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle": "Direccion muy lejana #333",
                            "buttons": [
                                {
                                    "title": "Ver en el mapa",
                                    "type": "web_url",
                                    "url": "https://goo.gl/maps/GCCpWmZep1t",
                                    "webview_height_ratio": "tall"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}

//Función para generar un recibo de pago
function receipt(senderId) {
   const messageData = {
       "recipient": {
           "id": senderId
       },
       "message": {
           "attachment": {
               "type": "template",
               "payload": {
                   "template_type": "receipt",
                   "recipient_name": "User Name",
                   "order_number": "1212120",
                   "currency": "MXN",
                   "payment_method": "Efectivo",
                   "order_url": "https://platzi.com/order/123",
                   "timestamp": "123123123",
                   "address": {
                       "street_1": "platzi hq",
                       "street_2": "none",
                       "city": "Mexico",
                       "postal_code": "54654",
                       "state": "Mexico",
                       "country": "Mexico"
                   },
                   "summary": {
                        "subtotal": 12.00,
                        "shipping_cost": 2.00,
                        "total_tax": 1.00,
                        "total_cost": 15.00
                   },
                   "adjustments": [
                       {
                            "name": "Descuento frecuente",
                            "amount": 1.00
                       }
                   ],
                   "elements": [
                       {
                           "title": "Pizza Pepperonni",
                           "subtitle": "La mejor pizza de Pepperonni",
                           "quantity": 1,
                           "price": 10,
                           "currency": "MXN",
                           "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                       },
                       {
                            "title": "Bebida",
                            "subtitle": "Jugo de tamarindo",
                            "quantity": 1,
                            "price": 2,
                            "currency": "MXN",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                        }
                    ]                   
               }
           }
       }
   }
   callSendApi(messageData);
}

//Función para obtener la ubicación del usuario
function getLocation(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "text": "Ahora puedes proporcionarnos tu ubicacion",
            "quick_replies": [{
                "content_type": "location"
            }]
        }
    }
    callSendApi(messageData);
}




//Creamos un mensaje para saber si esta funcionando nuestra aplicación
app.listen(app.get('port'), function () {
    console.log("Nuestro servidor esta funcionando en el puerto: ", app.get('port'));
})