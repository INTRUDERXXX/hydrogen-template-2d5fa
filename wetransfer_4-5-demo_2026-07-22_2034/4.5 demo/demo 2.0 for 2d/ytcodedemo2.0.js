/**
 ill find better more real svg  
 */

// --- ye ---
let roomSettings = {
    width: 600,  // Room width 
    depth: 450   // Room depth 
};

let placedObjects = [
    { id: 1, type: 'table', name: 'Pine Table', x: 200, y: 150, width: 120, depth: 80, rotation: 0 },
    { id: 2, type: 'chair', name: 'Study Chair', x: 200, y: 220, width: 50, depth: 50, rotation: 180 },
    { id: 3, type: 'cabinet', name: 'Main Wardrobe', x: 450, y: 100, width: 150, depth: 60, rotation: 0 }
];

let selectedObjectId = null;

// Drag and drop 
let isDragging = false;
let draggedObjectId = null;
let dragStartX = 0;
let dragStartY = 0;
let objectStartX = 0;
let objectStartY = 0;

// scaling
let canvasScale = 1.0;
let canvasOffsetX = 0;
let canvasOffsetY = 0;


window.addEventListener('DOMContentLoaded', () => {

    const inputRoomW = document.getElementById('input-room-width');
    const inputRoomD = document.getElementById('input-room-depth');

    inputRoomW.addEventListener('input', () => {
        roomSettings.width = parseInt(inputRoomW.value);
        document.getElementById('txt-room-width').innerText = `${roomSettings.width} cm`;
        // items after room size decrease
        placedObjects.forEach(obj => {
            obj.x = Math.min(obj.x, roomSettings.width - obj.width / 2 - 10);
            obj.x = Math.max(obj.x, obj.width / 2 + 10);
        });
        drawBlueprint();
    });

    inputRoomD.addEventListener('input', () => {
        roomSettings.depth = parseInt(inputRoomD.value);
        document.getElementById('txt-room-depth').innerText = `${roomSettings.depth} cm`;
        // Constrain items
        placedObjects.forEach(obj => {
            obj.y = Math.min(obj.y, roomSettings.depth - obj.depth / 2 - 10);
            obj.y = Math.max(obj.y, obj.depth / 2 + 10);
        });
        drawBlueprint();
    });


    const inputItemW = document.getElementById('input-item-width');
    const inputItemD = document.getElementById('input-item-depth');
    const inputItemR = document.getElementById('input-item-rotation');

    inputItemW.addEventListener('input', () => {
        if (!selectedObjectId) return;
        const currentItem = placedObjects.find(o => o.id === selectedObjectId);
        if (currentItem) {
            currentItem.width = parseInt(inputItemW.value);
            document.getElementById('txt-item-width').innerText = `${currentItem.width} cm`;
            drawBlueprint();
        }
    });

    inputItemD.addEventListener('input', () => {
        if (!selectedObjectId) return;
        const currentItem = placedObjects.find(o => o.id === selectedObjectId);
        if (currentItem) {
            currentItem.depth = parseInt(inputItemD.value);
            document.getElementById('txt-item-depth').innerText = `${currentItem.depth} cm`;
            drawBlueprint();
        }
    });

    inputItemR.addEventListener('input', () => {
        if (!selectedObjectId) return;
        const currentItem = placedObjects.find(o => o.id === selectedObjectId);
        if (currentItem) {
            currentItem.rotation = parseInt(inputItemR.value);
            document.getElementById('txt-item-rotation').innerText = `${currentItem.rotation}°`;
            drawBlueprint();
        }
    });

    // 3.canvas event for dragging
    const svgCanvas = document.getElementById('blueprint-svg');
    svgCanvas.addEventListener('mousemove', handleMouseMove);
    svgCanvas.addEventListener('mouseup', handleMouseUp);
    svgCanvas.addEventListener('mouseleave', handleMouseUp);

    // Touch event support for smooth mobile dragging
    svgCanvas.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault(); // Prevent body scrolling while dragging
            const touch = e.touches[0];
            handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }, { passive: false });
    svgCanvas.addEventListener('touchend', handleMouseUp);
    svgCanvas.addEventListener('touchcancel', handleMouseUp);


    drawBlueprint();
});

// ---  BLUEPRINT ---
function drawBlueprint() {
    const svgCanvas = document.getElementById('blueprint-svg');
    const objectsGroup = document.getElementById('objects-group');
    const roomRect = document.getElementById('room-boundary');

    // Clear but keep defs
    objectsGroup.innerHTML = '';

    // Canvas dimensions (800x600 in viewBox)
    const viewW = 800;
    const viewH = 600;
    const padding = 50;

    // Calculate scale factor: fit room into (viewW - 100) x (viewH - 100)
    const maxW = viewW - (padding * 2);
    const maxH = viewH - (padding * 2);

    canvasScale = Math.min(maxW / roomSettings.width, maxH / roomSettings.depth);

    // Center the room workspace on the SVG area
    canvasOffsetX = (viewW - roomSettings.width * canvasScale) / 2;
    canvasOffsetY = (viewH - roomSettings.depth * canvasScale) / 2;

    // Update Room boundary rectangle
    roomRect.setAttribute('x', canvasOffsetX);
    roomRect.setAttribute('y', canvasOffsetY);
    roomRect.setAttribute('width', roomSettings.width * canvasScale);
    roomRect.setAttribute('height', roomSettings.depth * canvasScale);

    // Render placed objects
    placedObjects.forEach((obj) => {
        const itemG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        itemG.setAttribute('id', `svg-obj-${obj.id}`);

        // Coordinates in SVG pixels
        const pxX = canvasOffsetX + obj.x * canvasScale;
        const pxY = canvasOffsetY + obj.y * canvasScale;
        const pxW = obj.width * canvasScale;
        const pxD = obj.depth * canvasScale;

        // Apply translation and rotation
        itemG.setAttribute('transform', `translate(${pxX}, ${pxY}) rotate(${obj.rotation})`);
        itemG.setAttribute('style', 'cursor: move;');

        // Invisible touch padding rect overlay underneath the element to support dragging from any angle
        const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        hitArea.setAttribute('x', -pxW / 2 - 12);
        hitArea.setAttribute('y', -pxD / 2 - 12);
        hitArea.setAttribute('width', pxW + 24);
        hitArea.setAttribute('height', pxD + 24);
        hitArea.setAttribute('fill', 'rgba(0,0,0,0)');
        hitArea.setAttribute('pointer-events', 'all');
        hitArea.setAttribute('style', 'cursor: move;');
        itemG.appendChild(hitArea);

        // When clicking/touching, select the object and prepare for drag
        itemG.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            selectObject(obj.id);
            startDrag(obj.id, e);
        });

        itemG.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            e.preventDefault(); // Prevent scrolling during drag
            selectObject(obj.id);
            const touch = e.touches[0];
            startDrag(obj.id, { clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });

        // Shape
        const shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', -pxW / 2);
        shape.setAttribute('y', -pxD / 2);
        shape.setAttribute('width', pxW);
        shape.setAttribute('height', pxD);
        shape.setAttribute('rx', 4);
        shape.setAttribute('ry', 4);

        // Colors & outline
        shape.setAttribute('stroke', 'var(--dark-charcoal)'); shape.setAttribute('stroke-opacity', '0.6');
        shape.setAttribute('stroke-width', 1);
        shape.setAttribute('filter', 'url(#shadow)');

        if (obj.id === selectedObjectId) {
            shape.setAttribute('fill', '#ffffff'); // Clean white highlight for selected item
            shape.setAttribute('stroke', 'var(--accent-gold)');
            shape.setAttribute('stroke-width', 2);
        } else {
            shape.setAttribute('fill', getFurnitureColor(obj.type));
        }

        itemG.appendChild(shape);

        // Stylized interior detail 
        addBlueprintDetails(itemG, obj.type, pxW, pxD);

        // TEX inside object
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'central');
        label.setAttribute('fill', 'var(--dark-charcoal)');
        label.setAttribute('font-size', Math.max(9, 10 * canvasScale) + 'px');
        label.setAttribute('font-family', 'var(--font-mono)');
        label.setAttribute('pointer-events', 'none'); // Do not block mouse drag
        label.textContent = `${obj.name} (${obj.width}x${obj.depth})`;
        itemG.appendChild(label);

        // Highlight selection outer dashed box
        if (obj.id === selectedObjectId) {
            const selectOutline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            selectOutline.setAttribute('x', -pxW / 2 - 4);
            selectOutline.setAttribute('y', -pxD / 2 - 4);
            selectOutline.setAttribute('width', pxW + 8);
            selectOutline.setAttribute('height', pxD + 8);
            selectOutline.setAttribute('rx', 6);
            selectOutline.setAttribute('ry', 6);
            selectOutline.setAttribute('fill', 'none');
            selectOutline.setAttribute('stroke', 'var(--accent-gold)');
            selectOutline.setAttribute('stroke-dasharray', '3,3');
            selectOutline.setAttribute('stroke-width', 1.5);
            selectOutline.setAttribute('pointer-events', 'none');
            itemG.appendChild(selectOutline);
        }

        objectsGroup.appendChild(itemG);
    });

    // Update quote on any layout change
    if (typeof calculateQuote === 'function') {
        calculateQuote();
    }

    // Refresh 3D if active
    if (typeof render3DScene === 'function' && window.currentViewMode === '3d') {
        render3DScene();
    }
}

// Helper colors 
function getFurnitureColor(type) {
    switch (type) {
        case 'table': return '#FDFDFD'; // Clean CAD
        case 'chair': return '#F9F9F9'; // Clean CAD
        case 'cabinet': return '#F0F0F0'; // Clean CAD
        case 'shelving': return '#F4F4F4'; // Clean CAD
        case 'tvbox': return '#EAEAEA';
        default: return '#e0e0e0';
    }
}

// Draw internal details so objects look like floor plan drawings
function addBlueprintDetails(group, type, w, d) {
    const strokeCol = '#2A2A2A';

    if (type === 'table') {
        // Draw diagonal cross to represent tabletop
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', -w / 2 + 6); line1.setAttribute('y1', -d / 2 + 6);
        line1.setAttribute('x2', w / 2 - 6); line1.setAttribute('y2', d / 2 - 6);
        line1.setAttribute('stroke', strokeCol); line1.setAttribute('stroke-dasharray', '2,4');
        group.appendChild(line1);

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', w / 2 - 6); line2.setAttribute('y1', -d / 2 + 6);
        line2.setAttribute('x2', -w / 2 + 6); line2.setAttribute('y2', d / 2 - 6);
        line2.setAttribute('stroke', strokeCol); line2.setAttribute('stroke-dasharray', '2,4');
        group.appendChild(line2);
    }
    else if (type === 'chair') {
        // Draw backrest representation
        const backrest = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        backrest.setAttribute('x', -w / 2 + 4);
        backrest.setAttribute('y', -d / 2 + 2);
        backrest.setAttribute('width', w - 8);
        backrest.setAttribute('height', 8);
        backrest.setAttribute('fill', '#D7B78A');
        backrest.setAttribute('stroke', strokeCol);
        group.appendChild(backrest);
    }
    else if (type === 'cabinet') {
        // Draw door swings representation
        const divid = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        divid.setAttribute('x1', 0); divid.setAttribute('y1', -d / 2);
        divid.setAttribute('x2', 0); divid.setAttribute('y2', d / 2);
        divid.setAttribute('stroke', strokeCol);
        group.appendChild(divid);

        // Drawer handles mock
        const handle1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        handle1.setAttribute('x1', -6); handle1.setAttribute('y1', d / 2 - 4);
        handle1.setAttribute('x2', -2); handle1.setAttribute('y2', d / 2 - 4);
        handle1.setAttribute('stroke', '#D7B78A'); handle1.setAttribute('stroke-width', 2);
        group.appendChild(handle1);

        const handle2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        handle2.setAttribute('x1', 2); handle2.setAttribute('y1', d / 2 - 4);
        handle2.setAttribute('x2', 6); handle2.setAttribute('y2', d / 2 - 4);
        handle2.setAttribute('stroke', '#D7B78A'); handle2.setAttribute('stroke-width', 2);
        group.appendChild(handle2);
    }
    else if (type === 'shelving') {

        for (let offset = -w / 3; offset <= w / 3 + 1; offset += w / 3) {
            if (offset === 0) continue;
            const divider = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            divider.setAttribute('x1', offset); divider.setAttribute('y1', -d / 2);
            divider.setAttribute('x2', offset); divider.setAttribute('y2', d / 2);
            divider.setAttribute('stroke', strokeCol); divider.setAttribute('stroke-width', 1);
            group.appendChild(divider);
        }
    }
    else if (type === 'tvbox') {
        const tvScr = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const screenW = Math.max(w - 20, 5);
        const screenD = Math.max(d * 0.15, 4);
        tvScr.setAttribute('x', -screenW / 2);
        tvScr.setAttribute('y', -d / 2 + (d * 0.1));
        tvScr.setAttribute('width', screenW);
        tvScr.setAttribute('height', screenD);
        tvScr.setAttribute('fill', '#2A2A2A');
        group.appendChild(tvScr);
    }
}

// --- ITEM SELECTION & PROPERTY UPDATES ---
function findMainShapeRect(groupElement) {
    if (!groupElement) return null;

    if (typeof groupElement.getElementsByTagName === 'function') {
        const rects = groupElement.getElementsByTagName('rect');
        for (let i = 0; i < rects.length; i++) {
            const fill = rects[i].getAttribute('fill');
            const dash = rects[i].getAttribute('stroke-dasharray');
            if (fill !== 'rgba(0,0,0,0)' && !dash) {
                return rects[i];
            }
        }
    }

    const children = Array.isArray(groupElement.children) ? groupElement.children : [];
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child || typeof child.getAttribute !== 'function') continue;
        const fill = child.getAttribute('fill');
        const dash = child.getAttribute('stroke-dasharray');
        if (fill !== 'rgba(0,0,0,0)' && !dash) {
            return child;
        }
    }

    return children[1] || null;
}

function updateSVGSelection(oldId, newId) {
    if (oldId) {
        const oldG = document.getElementById(`svg-obj-${oldId}`);
        if (oldG) {
            const shapeRect = findMainShapeRect(oldG);
            if (shapeRect) {
                const obj = placedObjects.find(o => o.id === oldId);
                const type = obj ? obj.type : '';
                shapeRect.setAttribute('fill', getFurnitureColor(type));
                shapeRect.setAttribute('stroke', 'var(--dark-charcoal)');
                shapeRect.setAttribute('stroke-opacity', '0.6');
                shapeRect.setAttribute('stroke-width', '1');
            }
            if (typeof oldG.querySelector === 'function') {
                const outline = oldG.querySelector('rect[stroke-dasharray]');
                if (outline && typeof outline.remove === 'function') {
                    outline.remove();
                }
            }
        }
    }

    if (newId) {
        const newG = document.getElementById(`svg-obj-${newId}`);
        if (newG) {
            const shapeRect = findMainShapeRect(newG);
            if (shapeRect) {
                shapeRect.setAttribute('fill', '#ffffff');
                shapeRect.setAttribute('stroke', 'var(--accent-gold)');
                shapeRect.setAttribute('stroke-width', '2');
            }
            const obj = placedObjects.find(o => o.id === newId);
            if (obj) {
                const hasOutline = typeof newG.querySelector === 'function' && !!newG.querySelector('rect[stroke-dasharray]');
                if (!hasOutline && typeof newG.appendChild === 'function') {
                    const pxW = obj.width * canvasScale;
                    const pxD = obj.depth * canvasScale;
                    const selectOutline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    selectOutline.setAttribute('x', -pxW / 2 - 4);
                    selectOutline.setAttribute('y', -pxD / 2 - 4);
                    selectOutline.setAttribute('width', pxW + 8);
                    selectOutline.setAttribute('height', pxD + 8);
                    selectOutline.setAttribute('rx', 6);
                    selectOutline.setAttribute('ry', 6);
                    selectOutline.setAttribute('fill', 'none');
                    selectOutline.setAttribute('stroke', 'var(--accent-gold)');
                    selectOutline.setAttribute('stroke-dasharray', '3,3');
                    selectOutline.setAttribute('stroke-width', 1.5);
                    selectOutline.setAttribute('pointer-events', 'none');
                    newG.appendChild(selectOutline);
                }
            }
        }
    }
}

function selectObject(id) {
    if (selectedObjectId === id) return;
    const oldSelectedId = selectedObjectId;
    selectedObjectId = id;
    const obj = placedObjects.find(o => o.id === id);

    if (obj) {
        // Show inspector panel
        document.getElementById('inspector-group').style.display = 'block';
        document.getElementById('inspector-placeholder').style.display = 'none';

        // stats to sidebar inputs
        document.getElementById('inspector-title').innerText = `${obj.name} (${obj.type.toUpperCase()})`;

        const inputItemW = document.getElementById('input-item-width');
        const inputItemD = document.getElementById('input-item-depth');
        const inputItemR = document.getElementById('input-item-rotation');

        // Configure min/max depending on type
        if (obj.type === 'chair') {
            inputItemW.min = 35; inputItemW.max = 75;
            inputItemD.min = 35; inputItemD.max = 75;
        } else {
            inputItemW.min = 50; inputItemW.max = 240;
            inputItemD.min = 30; inputItemD.max = 160;
        }

        inputItemW.value = obj.width;
        inputItemD.value = obj.depth;
        inputItemR.value = obj.rotation;

        document.getElementById('txt-item-width').innerText = `${obj.width} cm`;
        document.getElementById('txt-item-depth').innerText = `${obj.depth} cm`;
        document.getElementById('txt-item-rotation').innerText = `${obj.rotation}°`;
    }

    updateSVGSelection(oldSelectedId, id);

    // Refresh 3D if active
    if (typeof render3DScene === 'function' && window.currentViewMode === '3d') {
        render3DScene();
    }
}

function clearSelection() {
    if (selectedObjectId === null) return;
    const oldSelectedId = selectedObjectId;
    selectedObjectId = null;
    document.getElementById('inspector-group').style.display = 'none';
    document.getElementById('inspector-placeholder').style.display = 'block';

    updateSVGSelection(oldSelectedId, null);

    // Refresh 3D if active
    if (typeof render3DScene === 'function' && window.currentViewMode === '3d') {
        render3DScene();
    }
}

function getLoggedInUser() {
    return localStorage.getItem('loggedInUser') || 'Guest';
}

function getPlannerProfile() {
    const name = document.getElementById('planner-name')?.value.trim() || '';
    const surname = document.getElementById('planner-surname')?.value.trim() || '';
    const email = document.getElementById('planner-email')?.value.trim() || '';

    return { name, surname, email };
}

function updatePlannerSaveHelper() {
    const helper = document.getElementById('planner-save-helper');
    if (!helper) return;

    const { name, surname, email } = getPlannerProfile();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const missingProfile = !name || !surname || !validEmail;

    helper.style.color = missingProfile ? '#d9534f' : 'var(--pencil-gray)';
    helper.style.fontWeight = 'bold';
}

function isValidPlannerProfile() {
    const { name, surname, email } = getPlannerProfile();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    updatePlannerSaveHelper();

    if (!name || !surname || !validEmail) {
        window.alert('Please fill in your name, surname, and a valid email address before saving.');
        return false;
    }

    return true;
}

function getInteractionLog() {
    try {
        return JSON.parse(localStorage.getItem('dashboardInteractions') || '[]');
    } catch (e) {
        return [];
    }
}

function saveInteractionLog(entries) {
    localStorage.setItem('dashboardInteractions', JSON.stringify(entries));
}

function getStoredBlueprintSnapshots() {
    try {
        return JSON.parse(localStorage.getItem('savedBlueprintSnapshots') || '[]');
    } catch (e) {
        return [];
    }
}

function saveStoredBlueprintSnapshots(entries) {
    localStorage.setItem('savedBlueprintSnapshots', JSON.stringify(entries));
}

function serializeBlueprintSvg() {
    const svgCanvas = document.getElementById('blueprint-svg');
    if (!svgCanvas) return '';

    const clone = svgCanvas.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('viewBox', '0 0 800 600');
    clone.setAttribute('width', '100%');
    clone.setAttribute('height', '100%');
    return clone.outerHTML;
}

function saveBlueprintSnapshot() {
    if (!isValidPlannerProfile()) return false;

    const svgMarkup = serializeBlueprintSvg();
    if (!svgMarkup) return false;

    const { name, surname, email } = getPlannerProfile();
    const lighting = document.getElementById('select-lighting')?.value || window.currentLighting || 'no-lighting';
    const snapshots = getStoredBlueprintSnapshots();
    snapshots.unshift({
        user: `${name} ${surname}`,
        email,
        lighting,
        time: new Date().toISOString(),
        room: {
            width: roomSettings.width,
            depth: roomSettings.depth
        },
        objectCount: placedObjects.length,
        svg: svgMarkup
    });

    if (snapshots.length > 12) snapshots.length = 12;
    saveStoredBlueprintSnapshots(snapshots);
    recordInteraction('Save blueprint', `Saved planner snapshot for ${name} ${surname} (${placedObjects.length} items)`);
    return true;
}

function recordInteraction(action, detail) {
    const user = getLoggedInUser();
    const interactions = getInteractionLog();
    interactions.unshift({
        user,
        action,
        detail,
        time: new Date().toISOString()
    });
    if (interactions.length > 30) interactions.length = 30;
    saveInteractionLog(interactions);
    window.dispatchEvent(new Event('interactionUpdated'));
}

// (ADD, DELETE, ROTATE) ---
function addObject(type) {
    const nextId = placedObjects.length > 0 ? Math.max(...placedObjects.map(o => o.id)) + 1 : 1;
    let newObj = {
        id: nextId,
        type: type,
        x: roomSettings.width / 2,
        y: roomSettings.depth / 2,
        rotation: 0
    };

    switch (type) {
        case 'table':
            newObj.name = `Table #${nextId}`;
            newObj.width = 120;
            newObj.depth = 80;
            break;
        case 'chair':
            newObj.name = `Chair #${nextId}`;
            newObj.width = 50;
            newObj.depth = 50;
            break;
        case 'cabinet':
            newObj.name = `Cabinet #${nextId}`;
            newObj.width = 100;
            newObj.depth = 60;
            break;
        case 'shelving':
            newObj.name = `Shelves #${nextId}`;
            newObj.width = 120;
            newObj.depth = 40;
            break;
        case 'tvbox':
            newObj.name = `TV Box / Stand #${nextId}`;
            newObj.width = 160;
            newObj.depth = 45;
            break;
    }

    placedObjects.push(newObj);
    drawBlueprint();
    selectObject(newObj.id);
    recordInteraction('Add object', `Added ${newObj.name} (${type})`);
}

function deleteCurrent() {
    if (!selectedObjectId) return;
    const obj = placedObjects.find(o => o.id === selectedObjectId);
    placedObjects = placedObjects.filter(o => o.id !== selectedObjectId);
    clearSelection();
    drawBlueprint();
    if (obj) {
        recordInteraction('Delete object', `Deleted ${obj.name}`);
    }
}

function rotateCurrent() {
    if (!selectedObjectId) return;
    const obj = placedObjects.find(o => o.id === selectedObjectId);
    if (obj) {
        obj.rotation = (obj.rotation + 90) % 360;
        document.getElementById('input-item-rotation').value = obj.rotation;
        document.getElementById('txt-item-rotation').innerText = `${obj.rotation}°`;
        drawBlueprint();
        recordInteraction('Rotate object', `Rotated ${obj.name} to ${obj.rotation}°`);
    }
}

function startDrag(id, event) {
    const obj = placedObjects.find(o => o.id === id);
    if (!obj) return;

    isDragging = true;
    draggedObjectId = id;

    // Get mouse initial coordinates
    dragStartX = event.clientX;
    dragStartY = event.clientY;

    // Get current item coordinates
    objectStartX = obj.x;
    objectStartY = obj.y;
}

function handleMouseMove(event) {
    if (!isDragging || draggedObjectId === null) return;

    const obj = placedObjects.find(o => o.id === draggedObjectId);
    if (!obj) return;

    const svgCanvas = document.getElementById('blueprint-svg');
    const rect = svgCanvas.getBoundingClientRect();
    const viewW = 800; // viewBox width
    const screenToSvgRatio = viewW / rect.width;

    const deltaX = (event.clientX - dragStartX) * screenToSvgRatio;
    const deltaY = (event.clientY - dragStartY) * screenToSvgRatio;

    const movedCmX = deltaX / canvasScale;
    const movedCmY = deltaY / canvasScale;

    // Set new coords
    let targetX = objectStartX + movedCmX;
    let targetY = objectStartY + movedCmY;

    // Boundary constraint keep center within the room
    const paddingX = obj.width / 2;
    const paddingY = obj.depth / 2;

    targetX = Math.max(paddingX, Math.min(roomSettings.width - paddingX, targetX));
    targetY = Math.max(paddingY, Math.min(roomSettings.depth - paddingY, targetY));

    // Update object location
    obj.x = Math.round(targetX);
    obj.y = Math.round(targetY);

    // Update transform in-place directly on the DOM element to prevent
    // recreation and disruption of active touch event handlers on mobile screens.
    const element = document.getElementById(`svg-obj-${draggedObjectId}`);
    if (element) {
        const pxX = canvasOffsetX + obj.x * canvasScale;
        const pxY = canvasOffsetY + obj.y * canvasScale;
        element.setAttribute('transform', `translate(${pxX}, ${pxY}) rotate(${obj.rotation})`);
    } else {
        drawBlueprint();
    }
}

function handleMouseUp() {
    if (isDragging) {
        isDragging = false;
        draggedObjectId = null;
        drawBlueprint(); // Redraw once release is registered to update label, prices, and 3D details
    }
}

// --- QUOTE LOGIC ---
function calculateQuote() {
    // Quote capability has been removed.
}

// --- 3D VIRTUAL ENGINE ---
window.currentViewMode = '2d';
let scene3D, camera3D, renderer3D, controls3D;
let threeInitialized = false;
let roomGroup3D;

function toggleViewMode(mode) {
    window.currentViewMode = mode;
    document.getElementById('btn-2d').classList.remove('active');
    document.getElementById('btn-3d').classList.remove('active');
    document.getElementById('btn-' + mode).classList.add('active');

    if (mode === '2d') {
        document.getElementById('viewer-2d').style.display = 'block';
        document.getElementById('viewer-3d').style.display = 'none';

    } else {
        document.getElementById('viewer-2d').style.display = 'none';
        document.getElementById('viewer-3d').style.display = 'block';

        if (!threeInitialized) {
            init3D();
        }
        render3DScene();
    }
}

function init3D() {
    const container = document.getElementById('viewer-3d');

    // Scene setup
    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color('#f0f0f0');

    // Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    camera3D = new THREE.PerspectiveCamera(60, aspect, 1, 10000);
    // Position camera dynamically based on room size
    camera3D.position.set(roomSettings.width / 2, 600, roomSettings.depth + 400);

    // Renderer setup
    renderer3D = new THREE.WebGLRenderer({ antialias: true });
    renderer3D.setSize(container.clientWidth, container.clientHeight);
    renderer3D.shadowMap.enabled = true;
    container.appendChild(renderer3D.domElement);

    // Controls
    controls3D = new THREE.OrbitControls(camera3D, renderer3D.domElement);
    controls3D.enableDamping = true;
    controls3D.dampingFactor = 0.05;
    controls3D.target.set(roomSettings.width / 2, 0, roomSettings.depth / 2);

    // Lighting
    window.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene3D.add(window.ambientLight);

    window.dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    window.dirLight.position.set(roomSettings.width, 1000, roomSettings.depth);
    window.dirLight.castShadow = true;
    window.dirLight.shadow.mapSize.width = 2048;
    window.dirLight.shadow.mapSize.height = 2048;
    scene3D.add(window.dirLight);

    // Dynamic resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera3D.aspect = container.clientWidth / container.clientHeight;
        camera3D.updateProjectionMatrix();
        renderer3D.setSize(container.clientWidth, container.clientHeight);
    });

    threeInitialized = true;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        if (controls3D) controls3D.update();
        if (renderer3D && scene3D && camera3D) renderer3D.render(scene3D, camera3D);
    }
    animate();
}

function getBaseMaterialColor() {
    // Default to a premium walnut/wood brown color
    return 0x8c5b35;
}

function getCountertopColor() {
    // Default to a dark elegant stone or charcoal look
    return 0x1A1A1A;
}

function render3DScene() {
    if (!threeInitialized) return;

    // Lighting updates
    if (window.ambientLight && window.dirLight) {
        if (window.currentLighting === 'optional-lighting') {
            window.ambientLight.intensity = 1.0;
            window.dirLight.intensity = 0.9;
        } else {
            window.ambientLight.intensity = 0.5;
            window.dirLight.intensity = 0.3;
        }
    }

    // Remove existing room elements
    if (roomGroup3D) {
        scene3D.remove(roomGroup3D);
    }

    roomGroup3D = new THREE.Group();

    // 1. Draw the floor
    const floorGeo = new THREE.PlaneGeometry(roomSettings.width, roomSettings.depth);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.9, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(roomSettings.width / 2, 0, roomSettings.depth / 2);
    floor.receiveShadow = true;
    roomGroup3D.add(floor);

    // 2. Draw walls (transparent for demo)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xD5B99F, transparent: true, opacity: 0.15 });
    const wallHeight = 250; // 2.5m ceiling

    // Back wall
    const backWallGeo = new THREE.BoxGeometry(roomSettings.width, wallHeight, 10);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(roomSettings.width / 2, wallHeight / 2, 0);
    roomGroup3D.add(backWall);

    // Left wall
    const leftWallGeo = new THREE.BoxGeometry(10, wallHeight, roomSettings.depth);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(0, wallHeight / 2, roomSettings.depth / 2);
    roomGroup3D.add(leftWall);

    // 3. Render Objects
    const baseColor = getBaseMaterialColor();
    const counterColor = getCountertopColor();

    const woodMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.7, metalness: 0.1 });
    const counterMat = new THREE.MeshStandardMaterial({ color: counterColor, roughness: 0.3, metalness: 0.5 });
    const highlightMat = new THREE.MeshStandardMaterial({ color: 0xD7B78A, emissive: 0x2A1A05, roughness: 0.2, metalness: 0.6 }); // Highlight for selected

    placedObjects.forEach(obj => {
        const objGroup = new THREE.Group();
        const isSelected = (obj.id === selectedObjectId);
        const priMat = isSelected ? highlightMat : woodMat;

        if (obj.type === 'table') {
            // Table top
            const top = new THREE.Mesh(new THREE.BoxGeometry(obj.width, 5, obj.depth), isSelected ? highlightMat : counterMat);
            top.position.y = 75;
            top.castShadow = true;
            objGroup.add(top);

            // Legs
            const legGeo = new THREE.BoxGeometry(5, 75, 5);
            for (let dx of [-1, 1]) {
                for (let dz of [-1, 1]) {
                    const leg = new THREE.Mesh(legGeo, priMat);
                    leg.position.set(dx * (obj.width / 2 - 5), 37.5, dz * (obj.depth / 2 - 5));
                    leg.castShadow = true;
                    objGroup.add(leg);
                }
            }
        }
        else if (obj.type === 'chair') {
            const seat = new THREE.Mesh(new THREE.BoxGeometry(obj.width, 5, obj.depth), priMat);
            seat.position.y = 45;
            seat.castShadow = true;
            objGroup.add(seat);

            const backGeo = new THREE.BoxGeometry(obj.width, 45, 5);
            const back = new THREE.Mesh(backGeo, priMat);
            back.position.set(0, 67.5, -obj.depth / 2 + 2.5);
            back.castShadow = true;
            objGroup.add(back);

            const legGeo = new THREE.BoxGeometry(4, 45, 4);
            for (let dx of [-1, 1]) {
                for (let dz of [-1, 1]) {
                    const leg = new THREE.Mesh(legGeo, priMat);
                    leg.position.set(dx * (obj.width / 2 - 4), 22.5, dz * (obj.depth / 2 - 4));
                    objGroup.add(leg);
                }
            }
        }
        else if (obj.type === 'cabinet') {
            const cab = new THREE.Mesh(new THREE.BoxGeometry(obj.width, 90, obj.depth), priMat);
            cab.position.y = 45;
            cab.castShadow = true;
            objGroup.add(cab);

            const count = new THREE.Mesh(new THREE.BoxGeometry(obj.width + 2, 4, obj.depth + 2), isSelected ? highlightMat : counterMat);
            count.position.y = 92;
            count.castShadow = true;
            objGroup.add(count);
        }
        else if (obj.type === 'shelving') {
            const sWidth = obj.width;
            const sDepth = obj.depth;
            const sHeight = 200;

            // Frame
            const sideGeo = new THREE.BoxGeometry(2, sHeight, sDepth);
            const leftSide = new THREE.Mesh(sideGeo, priMat);
            leftSide.position.set(-sWidth / 2, sHeight / 2, 0);
            leftSide.castShadow = true;
            objGroup.add(leftSide);

            const rightSide = new THREE.Mesh(sideGeo, priMat);
            rightSide.position.set(sWidth / 2, sHeight / 2, 0);
            rightSide.castShadow = true;
            objGroup.add(rightSide);

            // Shelves
            const shelfGeo = new THREE.BoxGeometry(sWidth, 2, sDepth);
            for (let sy = 10; sy < sHeight; sy += 40) {
                const shelf = new THREE.Mesh(shelfGeo, priMat);
                shelf.position.y = sy;
                shelf.castShadow = true;
                objGroup.add(shelf);
            }
        }
        else if (obj.type === 'tvbox') {
            const standHeight = 45;
            const stand = new THREE.Mesh(new THREE.BoxGeometry(obj.width, standHeight, obj.depth), priMat);
            stand.position.y = standHeight / 2;
            stand.castShadow = true;
            objGroup.add(stand);

            const tvW = Math.max(obj.width - 20, 40);
            const tvH = 70;
            const tvMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
            const tv = new THREE.Mesh(new THREE.BoxGeometry(tvW, tvH, 5), isSelected ? highlightMat : tvMat);
            tv.position.set(0, standHeight + tvH / 2 + 5, -obj.depth / 2 + 10);
            tv.castShadow = true;
            objGroup.add(tv);
        }

        // Position and rotate the group
        objGroup.position.set(obj.x, 0, obj.y);
        // Note: 2D svg rotation is around Z axis clockwise. 
        // Threejs Y axis rotation is counter-clockwise.
        objGroup.rotation.y = -obj.rotation * (Math.PI / 180);

        roomGroup3D.add(objGroup);
    });

    scene3D.add(roomGroup3D);
    controls3D.target.set(roomSettings.width / 2, 0, roomSettings.depth / 2);
}
