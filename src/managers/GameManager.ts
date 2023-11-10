import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_materials_pbrSpecularGlossiness";
import "@babylonjs/loaders/glTF/2.0/Extensions/KHR_draco_mesh_compression";

import {
  Engine,
  Scene,
  Color3,
  Color4,
  DirectionalLight,
  HemisphericLight,
  Vector3,
  AbstractMesh,
  FreeCamera,
  MeshBuilder,
  StandardMaterial,
} from "@babylonjs/core";
import { Noise } from "@src/perlin/Noise";
//import "../js/dynamicTerrain.js";

export class GameManager {
  // babylon
  public canvas: HTMLCanvasElement;
  public engine: Engine;
  public scene: Scene;

  constructor() {
    this.canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  }

  public async Init() {
    await this.initScene();
    await this.initEnvironment();
    await this.initDynamicTerrain();

    window.onresize = () => {
      this.engine.resize();
    };

    this.render();
  }

  private async initScene() {
    this.engine = new Engine(this.canvas, true, {
      adaptToDeviceRatio: true,
    });

    this.scene = new Scene(this.engine);
    const camera = new FreeCamera("camera", new Vector3(0, 1, -5), this.scene);
    camera.attachControl();
  }

  private async initEnvironment() {
    // sky
    this.scene.clearColor = new Color4(255, 255, 255, 1);

    // ambient light
    const ambientLight = new HemisphericLight(
      "light1",
      new Vector3(0, 1, 0),
      this.scene
    );
    ambientLight.intensity = 1;
    ambientLight.groundColor = new Color3(0.13, 0.13, 0.13);
    ambientLight.specular = Color3.Black();

    // fog
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogStart = 60.0;
    this.scene.fogEnd = 120.0;
    this.scene.fogColor = new Color3(0.9, 0.9, 0.85);

    // directional light
    const light = new DirectionalLight(
      "DirectionalLight",
      new Vector3(-1, -2, -1),
      this.scene
    );
    light.position = new Vector3(100, 100, 100);
    light.radius = 0.27;
    light.intensity = 2.5;
    light.autoCalcShadowZBounds = true;
  }

  private async initDynamicTerrain() {
    const mapSubX = 1000; // point number on X axis
    const mapSubZ = 800; // point number on Z axis
    const seed = 0.3; // seed
    const noiseScale = 0.03; // noise frequency
    const elevationScale = 6.0;
    const noise = new Noise();
    noise.seed(seed);
    const mapData = new Float32Array(mapSubX * mapSubZ * 3);

    const paths = []; // array for the ribbon model
    for (let l = 0; l < mapSubZ; l++) {
      const path = []; // only for the ribbon
      for (var w = 0; w < mapSubX; w++) {
        const x = (w - mapSubX * 0.5) * 2.0;
        const z = (l - mapSubZ * 0.5) * 2.0;
        let y = noise.simplex2(x * noiseScale, z * noiseScale);
        y *= (0.5 + y) * y * elevationScale; // let's increase a bit the noise computed altitude

        mapData[3 * (l * mapSubX + w)] = x;
        mapData[3 * (l * mapSubX + w) + 1] = y;
        mapData[3 * (l * mapSubX + w) + 2] = z;

        path.push(new Vector3(x, y, z));
      }
      paths.push(path);
    }

    const map = MeshBuilder.CreateRibbon(
      "m",
      { pathArray: paths, sideOrientation: 2 },
      this.scene
    );
    map.position.y = -1.0;
    const mapMaterial = new StandardMaterial("mm", this.scene);
    map.material = mapMaterial;
  }

  private render() {
    this.engine.runRenderLoop(() => {
      if (this.scene) {
        this.scene.render();
      }
    });
  }
}
