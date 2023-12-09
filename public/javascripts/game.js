
var websocket;
var clientId;

function getImageEndpoint(imgId) { return "https://art.hearthstonejson.com/v1/render/latest/deDE/512x/" + imgId + ".png" };

function exitGame() {
    jsRoutes.controllers.HomeController.exitGame().ajax({ method: 'GET' }).done(
        (_) => {
            sessionStorage.removeItem('visited');
            preloadCards();
            window.location.href = '/';
        }
    );
}

function registerListeners() {
    const cards = document.querySelectorAll('.card');
    const slots = document.querySelectorAll('.slot');
    const chars = document.querySelectorAll('.char')
    let dragged;

    // Event Listeners für das ziehbare Element
    cards.forEach(card => {
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });

    // Event Listeners für die Dropzone
    slots.forEach(slot => {
        slot.addEventListener('dragenter', dragEnter);
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('dragleave', dragLeave);
        slot.addEventListener('drop', drop);
    });

    chars.forEach(char => {
        char.addEventListener('dragenter', dragEnter);
        char.addEventListener('dragleave', dragLeave);
        char.addEventListener('dragover', dragOver);
        char.addEventListener('drop', drop);
    });

    const deckElement = document.querySelector('.deckP2Background');
    deckElement.addEventListener('mouseover', () => {
        deckElement.style.transform = 'scale(1.1)';
    });
    deckElement.addEventListener('mouseout', () => {
        deckElement.style.transform = 'scale(1)';
    });
}

function dragStart(event) {
    dragged = this;
    var doc = document.createElement('div');

    doc.innerHTML = event.target.querySelectorAll('#card-image')[0].outerHTML;
    doc.setAttribute("style", "width:10px");

    event.dataTransfer.setDragImage(doc.firstChild, event.target.offsetWidth / 2, event.target.offsetWidth / 2);
    event.dataTransfer.setData('text/plain', event.target.getAttribute('aria-valuenow'));
    this.classList.add('dragging');
}

function dragEnd() {
    this.classList.remove('dragging');
}

function dragEnter(event) {
    event.preventDefault();
    this.classList.add('drag-over');
}

function dragOver(event) {
    event.preventDefault();
}

function dragLeave() {
    this.classList.remove('drag-over');
}

function undo() {
    websocket.send(`{
        "type": "undo"
    }`)
}

function redo() {
    websocket.send(`{
        "type": "redo"
    }`)
}

function endTurn() {
    websocket.send(`{
        "type": "endTurn"
    }`)
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    var sourceIndex = dragged.getAttribute('aria-valuenow');
    var targetIndex = this.getAttribute('aria-valuenow')

    var currentElement = dragged;

    var isHandSource = false;
    var isFieldSource = false;
    var isFieldTarget = false;
    var isPlayerTarget = false;

    while (currentElement !== null) {
        if (currentElement.classList && currentElement.classList.contains('hand-active')) {
            isHandSource = true;
            break;
        } else if (currentElement.classList && currentElement.classList.contains('fieldbar')) {
            isFieldSource = true;
        }
        currentElement = currentElement.parentElement;
    }

    currentElement = event.target;
    while (currentElement !== null) {
        if (currentElement.classList && currentElement.classList.contains('fieldbar')) {
            isFieldTarget = true;
            break;
        } else if (currentElement.classList && currentElement.classList.contains('char')) {
            isPlayerTarget = true;
            break;
        }
        currentElement = currentElement.parentElement;
    }

    if (isHandSource) {
        websocket.send(`{
            "type": "placeCard",
            "data": {"fieldIndex": ${targetIndex}, "handSlotIndex": ${sourceIndex}}
        }`)
    } else if (isFieldSource && isFieldTarget) {
        websocket.send(`{
            "type": "attack",
            "data": { "inactiveFieldIndex": ${targetIndex}, "activeFieldIndex": ${sourceIndex} }
        }`)
    } else {
        websocket.send(`{
            "type": "directAttack",
            "data": { "activeFieldIndex": ${sourceIndex} }
        }`)
    }

    this.classList.remove('drag-over');
}

function updateGame(ids) {
    jsRoutes.controllers.HomeController.game()
        .ajax({
            method: 'POST',
            data: {
                "id": sessionStorage.getItem("clientId"),
            },
            success: data => {
                const parser = new DOMParser()
                const $remoteDocument = parser.parseFromString(data, "text/html")
                ids.concat(['#msg']).forEach(id =>{
                    updateId(id, $remoteDocument)
                }
                );
                registerListeners()
            },
        });
}

function updateId(id, $remoteDoc) {
    const $target = $remoteDoc.querySelector(id);
    const $source = $(id)[0];
    $source.parentNode.replaceChild($target, $source);
}

$('#topheader .navbar-nav a').on('click', function () {
    $('#topheader .navbar-nav').find('li.active').removeClass('active');
    $(this).parent('li').addClass('active');
});

function drawCard() {
    websocket.send(`{
        "type": "drawCard"
    }`)
}

function calculateGameAspectRatio() {
    if (typeof window.sessionStorage !== "undefined" && !sessionStorage.getItem('gameAspectRatio')) {
        var img = new Image();
        img.onload = function () {
            sessionStorage.setItem('gameAspectRatio', this.width / this.height);
        };
        img.src = "./assets/images/Content/background.png";
    }
    handleResize();
}

function handleResize() {
    var gameContainer = document.getElementById("gamecontainer");
    screenAsRa = window.innerWidth / window.innerHeight;
    var gameAspectRatio = sessionStorage.getItem('gameAspectRatio');
    if (screenAsRa > gameAspectRatio) {
        gameContainer.style.width = window.innerHeight * gameAspectRatio + "px";
        gameContainer.style.maxWidthwidth = window.innerHeight * gameAspectRatio + "px";
        gameContainer.style.height = window.innerHeight + "px";
        gameContainer.style.maxHeight = window.innerHeight + "px";
        document.getElementById("center").style.flexDirection = "row";
    } else {
        gameContainer.style.width = window.innerWidth + "px";
        gameContainer.style.maxWidthwidth = window.innerWidth + "px";
        gameContainer.style.height = window.innerWidth / gameAspectRatio + "px";
        gameContainer.style.maxHeight = window.innerWidth / gameAspectRatio + "px";
        document.getElementById("center").style.flexDirection = "column";
    }
}

function connectWebSocket() {
    websocket = new WebSocket("ws://localhost:9000/websocket");
    websocket.setTimeout

    websocket.onopen = function (event) {
        console.log("Connected to Websocket");
    }

    websocket.onclose = function () {
        jsRoutes.controllers.HomeController.disconnect().ajax({
            method: 'POST',
            data: {"id": sessionStorage.getItem("clientId")}
        })
        console.log('Connection with Websocket Closed!');
    };

    websocket.onerror = function (error) {
        console.log('Error in Websocket Occured: ' + error);
    };

    websocket.onmessage = function (msg) {
        if (typeof msg.data === "string") {
            let data = JSON.parse(msg.data);
            if (data.hasOwnProperty("id") && !sessionStorage.getItem('clientId')) {
                sessionStorage.setItem('clientId', data.id);
            } else {
                updateGame(data.ids)
            }
        }
    };
}

function preloadCards() {
    if (typeof window.sessionStorage !== "undefined" && !sessionStorage.getItem('visited')) {
        $.ajax(jsRoutes.controllers.HomeController.getCards()).done(
            (response) => {
                var values = response.split(",");
                values.forEach(id => {
                    new Image().src = getImageEndpoint(id);
                });
                sessionStorage.setItem('visited', true);
            }
        );
    }
}

$(window).on('resize', handleResize);

function init() {
    connectWebSocket();
    registerListeners();
    calculateGameAspectRatio();
    preloadCards();
}

$(window).ready(init);







