// ===== MENU MANAGEMENT =====
function renderMenuManagement(container) {
    if (!state.menuItems) state.menuItems = [];
    container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Menü Yönetimi</h3>
                    <p style="color: #666; font-size: 13px; margin-top: 8px;">Site header menüsünü buradan yönetin.</p>
                    <button class="btn btn-primary" style="margin-top: 10px;" onclick="window.showMenuItemModal()">
                        <i class="fa-solid fa-plus"></i> Yeni Menü Ekle
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Sıra</th>
                                    <th>Başlık</th>
                                    <th>URL</th>
                                    <th>Aktif</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody id="menu-sortable-list">
                                ${state.menuItems.sort((a, b) => a.order - b.order).map(item => `
                                    <tr data-id="${item.id}">
                                        <td>${item.order + 1}</td>
                                        <td><strong>${item.title}</strong></td>
                                        <td><a href="${item.url}" target="_blank">${item.url}</a></td>
                                        <td>${item.active ? '<span class="badge badge-success">Evet</span>' : '<span class="badge badge-danger">Hayır</span>'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="window.showMenuItemModal('${item.id}')">
                                                <i class="fa-solid fa-pen"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="window.deleteMenuItem('${item.id}')">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

    // Make menus sortable
    const sortableList = document.getElementById('menu-sortable-list');
    if (sortableList) {
        new Sortable(sortableList, {
            animation: 150,
            onEnd: function (evt) {
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;

                const [movedItem] = state.menuItems.splice(oldIndex, 1);
                state.menuItems.splice(newIndex, 0, movedItem);

                // Update order property for all items
                state.menuItems.forEach((item, index) => {
                    item.order = index;
                });

                saveData();
                renderView('settings-menu');
                showToast('Menü sırası güncellendi.');
            },
        });
    }
}

window.deleteMenuItem = function (id) {
    if (confirm('Bu menü öğesini silmek istediğinize emin misiniz?')) {
        state.menuItems = state.menuItems.filter(item => item.id != id);
        // Re-assign order after deletion
        state.menuItems.forEach((item, index) => {
            item.order = index;
        });
        saveData();
        renderView('settings-menu');
        showToast('Menü öğesi başarıyla silindi.');
    }
};

window.showMenuItemModal = function (id = null) {
    const menuItem = id ? state.menuItems.find(m => m.id == id) : null;
    const modal = document.getElementById('admin-modal');
    const formArea = document.getElementById('modal-form-area');
    const title = document.getElementById('modal-title');

    title.textContent = menuItem ? 'Menü Öğesini Düzenle' : 'Yeni Menü Öğesi Ekle';

    formArea.innerHTML = `
            <form id="menu-form">
                <div class="form-group">
                    <label>Başlık</label>
                    <input type="text" name="title" class="form-control" value="${menuItem ? menuItem.title : ''}" placeholder="Örn: İletişim" required>
                </div>
                <div class="form-group">
                    <label>URL (Link)</label>
                    <input type="text" name="url" class="form-control" value="${menuItem ? menuItem.url : ''}" placeholder="Örn: /iletisim veya https://example.com" required>
                </div>
                <div class="form-group form-check">
                    <input type="checkbox" name="active" class="form-check-input" id="menu-active" ${menuItem && menuItem.active ? 'checked' : ''}>
                    <label class="form-check-label" for="menu-active">Aktif</label>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button type="submit" class="btn btn-primary">Kaydet</button>
                </div>
            </form>
        `;

    modal.style.display = 'flex';

    document.getElementById('menu-form').onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const menuData = {
            id: menuItem ? menuItem.id : Date.now(),
            title: formData.get('title'),
            url: formData.get('url'),
            active: formData.get('active') === 'on',
            order: menuItem ? menuItem.order : state.menuItems.length
        };

        if (menuItem) {
            const idx = state.menuItems.findIndex(m => m.id == menuItem.id);
            if (idx > -1) state.menuItems[idx] = menuData;
        } else {
            state.menuItems.push(menuData);
        }

        saveData();
        modal.style.display = 'none';
        renderView('settings-menu');
        showToast('Menü öğesi kaydedildi.');
    };
};
