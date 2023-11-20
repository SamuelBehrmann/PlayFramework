let activePlayer = 1;


function submitModes() {
    document.getElementById('gamemodeForm').submit();
}

$(document).ajaxStop(function(){
    window.location.reload();
});

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

function dragStart(event) {
    dragged = this;
    var doc = document.createElement('div');

    doc.innerHTML = event.target.querySelectorAll('#card-image')[0].outerHTML;
    doc.setAttribute("style","width:10px");
    
    event.dataTransfer.setDragImage(doc.firstChild, event.target.offsetWidth / 2, event.target.offsetWidth / 2);
    event.dataTransfer.setData('text/plain', event.target.getAttribute('aria-valuenow'));
    this.classList.add('dragging');

    highlightSlots(activePlayer)
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
    console.log(this)
    console.log(dragged)
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
        console.log("placeCard")
        jsRoutes.controllers.HomeController.placeCard().ajax({method: 'POST' ,data: {"fieldIndex": targetIndex, "handSlotIndex": sourceIndex}})
    } else if (isFieldSource && isFieldTarget) {
        console.log("attack")
        jsRoutes.controllers.HomeController.attack().ajax({method: 'POST' ,data: {"inactiveFieldIndex": targetIndex, "activeFieldIndex": sourceIndex}})
    } else {
        console.log("directAttack")
        jsRoutes.controllers.HomeController.directAttack().ajax({method: 'POST' , data: {"activeFieldIndex": sourceIndex}})
    }

    this.classList.remove('drag-over');
}

function highlightSlots(activePlayer) {
    const playerFieldbar = document.querySelector(`.player${activePlayer} .fieldbar`);
    const fieldSlots = playerFieldbar.querySelectorAll('.slot');
    console.log(fieldSlots)
    fieldSlots.forEach((slot, index) => {
        if (index < 5) {
            slot.style.border = '2px solid gold';
        } else {}
    });

}


function switchActivePlayer() {
    if (activePlayer === 1) {
        activePlayer = 2;
    } else {
        activePlayer = 1;
    }
    console.log("Aktiver Spieler: " + activePlayer);
}


$( '#topheader .navbar-nav a' ).on( 'click', function () {
    $( '#topheader .navbar-nav' ).find( 'li.active' ).removeClass( 'active' );
    $( this ).parent( 'li' ).addClass( 'active' );
});

//Karte ziehen
function drawCard() {
    jsRoutes.controllers.HomeController.drawCard().ajax({method: 'POST'});
    window.location.reload();
}

// Deck bei Hover skalieren
const deckElement = document.querySelector('.deckP2Background');
deckElement.addEventListener('mouseover', () => {
    deckElement.style.transform = 'scale(1.1)';
});
deckElement.addEventListener('mouseout', () => {
    deckElement.style.transform = 'scale(1)';
});









