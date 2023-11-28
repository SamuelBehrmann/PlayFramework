
function getImageEndpoint(imgId)  {return "https://art.hearthstonejson.com/v1/render/latest/deDE/512x/" + imgId + ".png"};

function submitModes() {
    document.getElementById('gamemodeForm').submit();
}

function exitGame() {
    jsRoutes.controllers.HomeController.exitGame().ajax({method: 'GET'}).done(
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
}

function dragStart(event) {
    dragged = this;
    var doc = document.createElement('div');

    doc.innerHTML = event.target.querySelectorAll('#card-image')[0].outerHTML;
    doc.setAttribute("style","width:10px");
    
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

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    var sourceIndex = dragged.getAttribute('aria-valuenow');
    var targetIndex = this.getAttribute('aria-valuenow')

    var currentElement = dragged;

    var isHandSource = false;
    var isFieldSource= false;
    var isFieldTarget = false;
    var isPlayerTarget = false;

    while (currentElement !== null) {
        if (currentElement.classList && currentElement.classList.contains('hand-active')) {
            isHandSource = true;
            break;  
        } else if (currentElement.classList && currentElement.classList.contains('fieldbar')){
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
        jsRoutes.controllers.HomeController.placeCard().ajax(
            {
                method: 'POST' ,
                data: {"fieldIndex": targetIndex, "handSlotIndex": sourceIndex},
                success: (data) => {
                    for (let index = 0; index < data.fieldbar.cardarea.row.length; index++) {
                        if ( data.fieldbar.cardarea.row[index].card != "none") {
                            $("#field" + index).html('<div class="card card-size" aria-valuenow="'+ index +'"> <div class="card-size"> <img src="' + getImageEndpoint(data.fieldbar.cardarea.row[index].card.id) + '" id="card-image"> </div>')
                        }
                    }
                    var handHtml = '';
                    for (let index = 0; index < data.gamebar.hand.length; index++) {
                        handHtml += '<div class="card card-size" draggable="true" id="hand' + index + '" aria-valuenow="' + index + '"> <div class="card-face"><div class="card-size"> <img src="' + getImageEndpoint(data.gamebar.hand[index].card.id) + '" id="card-image"> </div> </div> </div>'
                    }
                    $(".hand-active").html(handHtml);
                    registerListeners();
                } 
            }
        )
    } else if (isFieldSource && isFieldTarget) {
        jsRoutes.controllers.HomeController.attack().ajax(
            {
                method: 'POST' ,
                data: {"inactiveFieldIndex": targetIndex, "activeFieldIndex": sourceIndex},
                success: (_) => window.location.reload()
            }
        )
    } else {
        jsRoutes.controllers.HomeController.directAttack().ajax(
            {
                method: 'POST' ,
                data: {"activeFieldIndex": sourceIndex},
                success: (_) => window.location.reload()
            },
        )
    }

    this.classList.remove('drag-over');
}

$( '#topheader .navbar-nav a' ).on( 'click', function () {
    $( '#topheader .navbar-nav' ).find( 'li.active' ).removeClass( 'active' );
    $( this ).parent( 'li' ).addClass( 'active' );
});

//Karte ziehen
function drawCard() {
    jsRoutes.controllers.HomeController.drawCard().ajax(
        {
            method: 'POST',
            success: (_) => window.location.reload()
        }
    );
}

// Deck bei Hover skalieren
const deckElement = document.querySelector('.deckP2Background');
deckElement.addEventListener('mouseover', () => {
    deckElement.style.transform = 'scale(1.1)';
});
deckElement.addEventListener('mouseout', () => {
    deckElement.style.transform = 'scale(1)';
});


function calculateGameAspectRatio() {
    if(typeof window.sessionStorage !== "undefined" && !sessionStorage.getItem('gameAspectRatio')) {
        var img = new Image();
        img.onload = function(){
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

    function preloadCards() {
        if(typeof window.sessionStorage !== "undefined" && !sessionStorage.getItem('visited')) {
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
        registerListeners();
        calculateGameAspectRatio()
        preloadCards();
    }

$(window).ready(init);







