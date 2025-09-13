// === Grocery Expiry Tracker Script ===

// Variables to keep track of the item to delete
let itemToDelete = null;

// Delete button clicked — show confirmation modal
function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    fetch(`/delete/${id}`, { method: "POST" })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert("Failed to delete item.");
            }
        })
        .catch(err => console.error(err));
}



// Close the modal without deleting
function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
    itemToDelete = null;
}

// Confirm deletion and remove the row
function confirmDelete() {
    if (itemToDelete !== null) {
        const row = document.querySelector(`tr[data-item-id="${itemToDelete}"]`);
        if (row) {
            row.remove();
        }
        checkEmptyState();
    }
    closeDeleteModal();
}

// Check if table is empty, then show empty state
function checkEmptyState() {
    const tableBody = document.querySelector(".grocery-table tbody");
    const emptyState = document.getElementById("emptyState");
    const tableContainer = document.getElementById("tableContainer");

    if (tableBody && tableBody.rows.length === 0) {
        emptyState.style.display = "flex";
        tableContainer.style.display = "none";
    } else {
        emptyState.style.display = "none";
        tableContainer.style.display = "block";
    }
}

// Floating Action Button Toggle
const mainFab = document.querySelector(".main-fab");
const secondaryFabs = document.querySelectorAll(".secondary-fab");

mainFab.addEventListener("click", () => {
    secondaryFabs.forEach(fab => {
        fab.classList.toggle("fab-visible");
    });
});

// Close modal on ESC key
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeDeleteModal();
    }
});

// Add "Delete Item" button functionality to each row
document.addEventListener("DOMContentLoaded", () => {
    const rows = document.querySelectorAll(".table-row");
    rows.forEach((row, index) => {
        row.setAttribute("data-item-id", index + 1);
    });

    checkEmptyState();
});
