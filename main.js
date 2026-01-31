// --- Cấu hình toàn cục ---
const API_URL = 'https://api.escuelajs.co/api/v1/products';
let allProducts = []; // Chứa toàn bộ dữ liệu gốc
let filteredProducts = []; // Chứa dữ liệu sau khi search/sort
let currentPage = 1;
let rowsPerPage = 5;
let sortDirection = {
    title: 'asc', // hoặc 'desc'
    price: 'asc'
};

// --- 1. Hàm getall dashboard (Fetch API) ---
async function getAllProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        allProducts = data;
        filteredProducts = [...allProducts]; // Ban đầu chưa lọc gì cả
        
        renderTable();
        console.log("Đã tải dữ liệu thành công");
    } catch (error) {
        console.error("Lỗi khi tải API:", error);
    }
}

// --- 2. Hàm Render (Hiển thị bảng) ---
function renderTable() {
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = ''; // Xóa dữ liệu cũ

    // Tính toán phân trang
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const itemsToDisplay = filteredProducts.slice(startIndex, endIndex);

    itemsToDisplay.forEach(product => {
        // Xử lý hình ảnh (API này đôi khi trả về mảng chuỗi hình ảnh dạng JSON string, cần clean)
        let imageUrl = product.images[0];
        if (typeof imageUrl === 'string' && imageUrl.startsWith('["')) {
             try { imageUrl = JSON.parse(imageUrl)[0]; } catch(e){}
        }

        const row = `
            <tr>
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>$${product.price}</td>
                <td>
                    <img src="${imageUrl}" alt="${product.title}" class="product-img" onerror="this.src='https://via.placeholder.com/100'">
                </td>
                <td>
                    <div class="desc-content">${product.description}</div>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });

    // Cập nhật thông tin trang
    document.getElementById('pageInfo').innerText = `Trang ${currentPage} / ${Math.ceil(filteredProducts.length / rowsPerPage)}`;
    
    // Disable nút nếu ở trang đầu/cuối
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= Math.ceil(filteredProducts.length / rowsPerPage);
}

// --- 3. Chức năng Tìm kiếm (OnChange) ---
document.getElementById('searchInput').addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase();
    
    // Lọc dữ liệu từ mảng gốc
    filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(keyword)
    );

    currentPage = 1; // Reset về trang 1 khi tìm kiếm
    renderTable();
});

// --- 4. Chức năng Phân trang (5, 10, 20) ---
document.getElementById('rowsPerPage').addEventListener('change', function(e) {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1; // Reset về trang 1
    renderTable();
});

function changePage(step) {
    currentPage += step;
    renderTable();
}

// --- 5. Chức năng Sắp xếp (Sort) ---
function handleSort(column) {
    // Đảo ngược chiều sắp xếp hiện tại
    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    
    filteredProducts.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (column === 'title') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return sortDirection[column] === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection[column] === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable();
}

// Khởi chạy ứng dụng
getAllProducts();