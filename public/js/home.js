
function toggleFilter(id) {
    // Hide all filter dropdowns except the one clicked
    document.querySelectorAll('.filter-dropdown').forEach(el => {
        if (el.id !== id) el.style.display = 'none';
    });
    // Toggle the clicked filter
    const filter = document.getElementById(id);
    if (filter.style.display === 'block') {
        filter.style.display = 'none';
    } else {
        filter.style.display = 'block';
    }
}