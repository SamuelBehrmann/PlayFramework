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
    console.log(`hand:  / field: ${event.target.getAttribute('aria-valuenow')}`);
    jsRoutes.controllers.HomeController.placeCard().ajax({method: 'POST' ,data: {"fieldIndex": event.target.getAttribute('aria-valuenow'), "handSlotIndex": dragged.getAttribute('aria-valuenow')}})

    this.classList.remove('drag-over');

}

// document.addEventListener('DOMContentLoaded', function() {
//     var img = new Image();
//     img.onload = function(){
//         var gameContainer = document.getElementById("gamecontainer");
//         gameContainer.style.width = this.width + "px";
//         gameContainer.style.maxWidthwidth = this.width+ "px";
//         gameContainer.style.height = this.height+ "px";
//         gameContainer.style.maxHeight = this.height+ "px";
//         console.log("Workin")

//     };
//     img.src = "./assets/images/Content/background.png";
    
//   });

