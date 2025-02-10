import * as THREE from "../node_modules/three/build/three.module.js";
import { OrbitControls } from './../node_modules/three/examples/jsm/controls/OrbitControls.js';

class visualizer
{
    // logic object
    simulation;

    // for rendering
    glRenderer;
    scene;
    camera; controls;
    axesHelper;
    ambientLight;
    directionalLight;
    textureCube;

    // materials for different fluids
    instances = [];

    constructor( simulation )
    {
        this.simulation = simulation;
        
        // GL renderer
        this.glRenderer = new THREE.WebGLRenderer();
        this.glRenderer.shadowMap.enabled = true;
        this.glRenderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap
        this.glRenderer.setSize(window.innerWidth, innerHeight);
        this.glRenderer.antialias = true;
        document.body.appendChild(this.glRenderer.domElement);
        
        // scene and related things
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.05,
            1000
        );
        this.camera.position.set(2, 2, 10);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.controls = new OrbitControls(this.camera, this.glRenderer.domElement);
        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);

        // lights
        this.ambientLight = new THREE.AmbientLight(0x444444);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 512; // default
        this.directionalLight.shadow.mapSize.height = 512; // default
        this.directionalLight.shadow.camera.near = 0.5; // default
        this.directionalLight.shadow.camera.far = 500; // default

        this.scene.add(this.ambientLight);
        this.scene.add(this.directionalLight);

        // sky textures
        let loader = new THREE.CubeTextureLoader();
        loader.setPath('textures/SkyStd/');
        this.textureCube = loader.load(['posx.bmp', 'negx.bmp', 
                                        'posy.bmp', 'negy.bmp',
                                        'posz.bmp', 'negz.bmp']);

        // bound box
        let boxGeom = new THREE.BoxGeometry(sim.boundSize.x, sim.boundSize.y, sim.boundSize.z);
        let boxMaterial = new THREE.MeshPhongMaterial({color: 0x8c8c8c, emissive: 0x082126, specular: 0x5c6a6a, shininess: 38.9,
                                                        transparent: true, opacity: 0.5, wireframe: true, envMap: this.textureCube});
        let cube = new THREE.Mesh(boxGeom, boxMaterial);
        this.scene.add(cube);
        this.scene.background = this.textureCube;

    }

    render(  )
    {
        // init other objects
        for (let fl of this.simulation.fluids)
        {
            let geom = new THREE.SphereGeometry(fl.r, 15, 15);
            let material = new THREE.MeshStandardMaterial({color: fl.color, envMap: this.textureCube});
            let inst = new THREE.InstancedMesh(geom, material, fl.particleCounter);
            inst.castShadow = true;
            inst.receiveShadow = true;
            this.instances.push(inst);
            this.scene.add(inst);
        }

        // create borders visualization
        for (let bd of this.simulation.borders)
        {
            let geometry = new THREE.BufferGeometry(); 
            let vetrtices = [];
            let indices = [];
            
            let material = new THREE.MeshPhongMaterial({color: 0x8c8c8c, emissive: 0x082126, specular: 0x9c6a6a, shininess: 38.9,
                transparent: true, opacity: 0.5, wireframe: false, envMap: this.textureCube});

            bd.createIndicesAndVertices(indices, vetrtices);

            geometry.setIndex(indices);
            geometry.setAttribute('position', 
            new THREE.BufferAttribute(new Float32Array(vetrtices), 3));
            let mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        }

        // animation
        this.glRenderer.setAnimationLoop(( currentTime ) =>
        {
            // update logic component of simulation
            this.simulation.update(currentTime);

            for (let part of this.simulation.parts)
            {
                let matrix = new THREE.Matrix4();
                matrix.set(1, 0, 0, part.pos.x,     0, 1, 0, part.pos.y,      0, 0, 1, part.pos.z,    0, 0, 0, 1);                
                this.instances[part.fluid.id].setMatrixAt(part.idInFluid, matrix);
            }
            for (let inst of this.instances)
                inst.instanceMatrix.needsUpdate = true;

            this.glRenderer.render(this.scene, this.camera);
        });
    }

};

console.log("all right");
    
let sim = new simulation();
let half_size = new vec3(6, 10, 6);
sim.createCellSystem(half_size.mulN(-1), half_size.mulN(2));
console.log(sim.cellSystem);

let fluid = sim.createFluid();

let r = 0.1780377;
let size = 10;
let additional = 25;

for (let x = 0; x < size + additional; x++)
    for (let y = 0; y < 4; y++)
        for (let z = 0; z < size + additional; z++)    
            sim.createParticle(fluid, (new vec3(x * r, y * r, z * r)).add((new vec3(3, -9, 3)).mulN(-size * r/ 2)));

let s = half_size.x;            

let h1 = 0.7;
let h2 = 0.45;
let b = 0.2;
sim.createBorder([new vec3(-s, half_size.y * h1, -s), 
                  new vec3(s, half_size.y * h1, -s),
                  new vec3(s * b, half_size.y * h2, -s * b),
                  new vec3(-s * b, half_size.y * h2, -s * b)]);

sim.createBorder([new vec3(-s, half_size.y * h1, s), 
                new vec3(s, half_size.y * h1, s),
                new vec3(s * b, half_size.y * h2, s * b),
                new vec3(-s * b, half_size.y * h2, s * b)]);
  
sim.createBorder([new vec3(-s, half_size.y * h1, -s), 
                new vec3(-s, half_size.y * h1, s),
                new vec3(-s * b, half_size.y * h2, s * b),
                new vec3(-s * b, half_size.y * h2, -s * b)]);
      
sim.createBorder([new vec3(s, half_size.y * h1, -s), 
                new vec3(s, half_size.y * h1, s),
                new vec3(s * b, half_size.y * h2, s * b),
                new vec3(s * b, half_size.y * h2, -s * b)]);
             
let h3 = 0.0;                                
sim.createBorder([new vec3(-s / 3,  half_size.y * h3, s), 
                  new vec3(s,       half_size.y * (h2*2 + h3) / 3, s),
                  new vec3(s,       half_size.y * (h2*2 + h3) / 3, -s),
                  new vec3(-s / 3,      half_size.y * h3, -s)]);

let h4 = -0.3;                  
sim.createBorder([new vec3(-s,  half_size.y * (h4 - 0), s), 
                  new vec3(s,       half_size.y * h4, -s),
                  new vec3(-s,      half_size.y * (h3 + h4) / 2, -s)]);



let rnd = new visualizer(sim);

rnd.render();