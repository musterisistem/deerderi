
// Global function for Read More button
window.readMoreDescription = function () {
    // Switch to Description tab (index 0)
    if (typeof switchTab === 'function') {
        switchTab(0);
    }
    // Scroll to tabs wrapper
    const tabs = document.querySelector('.product-tabs-wrapper');
    if (tabs) {
        tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
