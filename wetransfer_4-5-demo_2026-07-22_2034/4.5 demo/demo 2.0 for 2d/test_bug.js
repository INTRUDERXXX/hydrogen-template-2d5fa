const fs = require('fs');

global.document = {
    addEventListener: () => { },
    getElementById: (id) => {
        if (id === 'select-material' || id === 'select-countertop') return { value: 100 };
        if (id === 'blueprint-svg' || id === 'objects-group' || id === 'room-boundary') return {
            innerHTML: '',
            appendChild: () => { },
            setAttribute: () => { },
            addEventListener: () => { },
            getBoundingClientRect: () => ({ width: 800, height: 600 })
        };
        return { innerText: '', value: 100, addEventListener: () => { }, style: {} };
    },
    createElementNS: () => ({
        setAttribute: () => { },
        appendChild: () => { },
        addEventListener: () => { },
        querySelector: () => null,
        remove: () => { },
        children: [{}]
    })
};
global.window = { addEventListener: () => { }, dispatchEvent: () => { } };
global.localStorage = { getItem: () => "[]", setItem: () => { } };
global.THREE = {
    Scene: class { add() { } remove() { } },
    PerspectiveCamera: class { position = { set: () => { } } },
    WebGLRenderer: class { setSize() { } domElement = {}; shadowMap = { enabled: false } },
    OrbitControls: class { target = { set: () => { } } },
    AmbientLight: class { },
    DirectionalLight: class { position = { set: () => { } }; shadow = { mapSize: {} } },
    Color: class { },
    Group: class { add() { } position = { set: () => { } }; rotation = { y: 0 } },
    PlaneGeometry: class { },
    MeshStandardMaterial: class { },
    Mesh: class { position = { set: () => { } }; rotation = { x: 0 } },
    BoxGeometry: class { }
};
global.requestAnimationFrame = () => { };

const code = fs.readFileSync('ytcodedemo2.0.js', 'utf8');
try {
    eval(code);
    drawBlueprint();
    addObject('tvbox');
    render3DScene();
    console.log("SUCCESS");
} catch (e) {
    console.error("ERROR:");
    console.error(e);
}
