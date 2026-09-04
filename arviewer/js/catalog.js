let allImages = [];
let filteredImages = [];
let currentPage = 1;
const itemsPerPage = 10;

const imageGrid = document.getElementById('imageGrid');
const searchInput = document.getElementById('searchInput');
const pagination = document.getElementById('pagination');

async function loadImages() {
    try {
        const response = await fetch('images.json');
        allImages = await response.json();
        filteredImages = [...allImages];
        renderGrid();
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function renderGrid() {
    imageGrid.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredImages.slice(start, end);

    pageItems.forEach(img => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <img src="${img.file}" alt="${img.name}">
            <h3>${img.name}</h3>
        `;
        card.onclick = () => showQRCode(img.name, img.file);
        imageGrid.appendChild(card);
    });

    renderPagination();
}

function renderPagination() {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(filteredImages.length / itemsPerPage);

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; renderGrid(); };
    
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; renderGrid(); };

    pagination.appendChild(prevBtn);
    pagination.appendChild(nextBtn);
}

searchInput.oninput = (e) => {
    const term = e.target.value.toLowerCase();
    filteredImages = allImages.filter(img => img.name.toLowerCase().includes(term));
    currentPage = 1;
    renderGrid();
};

window.onload = loadImages;