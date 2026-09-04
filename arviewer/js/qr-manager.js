const modal = document.getElementById('qrModal');
const closeBtn = document.querySelector('.close-button');
const qrContainer = document.getElementById('qrcode');
const qrTitle = document.getElementById('qrTitle');

function showQRCode(name, filePath) {
    qrTitle.innerText = name;
    qrContainer.innerHTML = '';
    
    // Dynamically calculate the absolute path for the AR viewer
    // This ensures it works correctly on GitHub Pages regardless of subdirectory
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const arViewPath = directory + '/ar-view.html';
    
    // Create the full absolute URL
    const arLink = window.location.origin + arViewPath + '?img=' + encodeURIComponent(filePath);
    
    console.log('Generating QR for:', arLink);

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