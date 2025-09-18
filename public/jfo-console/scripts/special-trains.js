// special-trains.js - Logic for Special Trains tab

function onTrainNumberChange(value) {
    console.log("Special Train Number changed:", value);
    // TODO: implement normalization or auto-fill logic
}

function onTrainTypeChange() {
    const pilotingNote = document.getElementById('pilotingNote');
    const selected = document.querySelector('input[name="trainTypeOperation"]:checked');
    if (selected && selected.value === 'piloting') {
        pilotingNote.style.display = 'block';
    } else {
        pilotingNote.style.display = 'none';
    }
}

function calculateTimes() {
    console.log("Recalculating times for special train form...");
    // TODO: implement auto-calculated fields (duration, hours, etc.)
}

function addSpecialTrain(event) {
    event.preventDefault();
    console.log("Submitting special train form...");

    const form = document.getElementById('specialTrainForm');
    const formData = new FormData(form);
    const trainData = Object.fromEntries(formData.entries());

    console.log("🚂 New Special Train Data:", trainData);
    showToast(`✅ Special Train ${trainData.trainNumber} added successfully`, 'success');

    form.reset();
    onTrainTypeChange();
}
