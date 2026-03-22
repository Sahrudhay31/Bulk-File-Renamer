function doGet() {
    return HtmlService.createHtmlOutputFromFile('Index')
        .setTitle('Keyword Bulk Renamer')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function searchFolders(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return { success: false, error: 'Enter a search term' };
    }
    try {
        const query = `mimeType = 'application/vnd.google-apps.folder' and trashed = false and name contains '${searchTerm.trim()}'`;
        const response = Drive.Files.list({
            q: query,
            fields: 'files(id,name)',
            pageSize: 50,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        });
        return { success: true, folders: response.files || [] };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function getFilesInFolder(folderId) {
    try {
        const folder = DriveApp.getFolderById(folderId);
        const files = folder.getFiles();
        const list = [];
        while (files.hasNext()) {
            const f = files.next();
            const name = f.getName();
            const ext = name.includes('.') ? name.split('.').pop() : '';
            list.push({ id: f.getId(), name: name, ext: ext });
        }
        return { success: true, files: list, folderName: folder.getName() };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function performRename(renameList) {
    let count = 0;
    try {
        renameList.forEach(item => {
            if (item.newName) {
                const file = DriveApp.getFileById(item.id);
                if (file.getName() !== item.newName) {
                    file.setName(item.newName);
                    count++;
                }
            }
        });
        return { success: true, renamed: count };
    } catch (e) {
        return { success: false, error: e.message };
    }
}
