const modal = document.getElementById('qrModal');
const closeBtn = document.querySelector('.close-button');
const qrContainer = document.getElementById('qrcode');
const qrTitle = document.getElementById('qrTitle');

// Base URL provided by the user
const BASE_URL = 'https://psrochapro.github.io/public/arviewer';

function showQRCode(name, filePath) {
    qrTitle.innerText = name;
    qrContainer.innerHTML = '';
    
    // Construct the AR link
    const arLink = `${BASE_URL}/ar-view.html?img=${encodeURIComponent(filePath)}`;
    
    new QRCode(qrContainer, {
        text: arLink,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    modal.style.display = 'block';
}

closeBtn.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};