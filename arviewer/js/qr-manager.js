const modal = document.getElementById('qrModal');
const closeBtn = document.querySelector('.close-button');
const qrContainer = document.getElementById('qrcode');
const qrTitle = document.getElementById('qrTitle');

function showQRCode(name, filePath) {
    qrTitle.innerText = name;
    qrContainer.innerHTML = '';
    
<<<<<<< HEAD
    // Calculate the absolute path for the AR viewer
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const arViewPath = directory + '/ar-view.html';
=======
    // Dynamically calculate the absolute path for the AR viewer
    // This ensures it works correctly on GitHub Pages regardless of subdirectory
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const arViewPath = directory + '/ar-view.html';
>>>>>>> 9b5c74ddd4ded121001b63787b7f5c788f441937
    
<<<<<<< HEAD
    // Create the full absolute URL
    // We pass the filename so ar-handler can find it in its local /images folder
    const fileNameOnly = filePath.split('/').pop();
    const arLink = window.location.origin + arViewPath + '?img=' + encodeURIComponent(fileNameOnly);
    
=======
    // Create the full absolute URL
    const arLink = window.location.origin + arViewPath + '?img=' + encodeURIComponent(filePath);
    
    console.log('Generating QR for:', arLink);

>>>>>>> 9b5c74ddd4ded121001b63787b7f5c788f441937
    new QRCode(qrContainer, {
        text: arLink,
        width: 180,
        height: 180,
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