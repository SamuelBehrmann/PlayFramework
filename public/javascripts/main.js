function submitModes() {
    document.getElementById('gamemodeForm').submit();
}

$(document).ajaxStop(function(){
    window.location.reload();
});

const cards = document.querySelectorAll('.card');
const slots = document.querySelectorAll('.slot');
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
        } else {
            isPlayerTarget = true;
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
    }

    this.classList.remove('drag-over');
}

$( '#topheader .navbar-nav a' ).on( 'click', function () {
    $( '#topheader .navbar-nav' ).find( 'li.active' ).removeClass( 'active' );
    $( this ).parent( 'li' ).addClass( 'active' );
});
