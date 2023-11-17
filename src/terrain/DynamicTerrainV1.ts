import { Camera, Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

export class DynamicTerrainV1 {
  name: string;
  private _terrainSub: number;
  private _mapData: number[] | Float32Array;
  private _mapSubX: number;
  private _mapSubZ: number;
  private _scene: Scene;

  private _terrain: Mesh;
  private _terrainCamera: Camera;
  private _terrainSizeX: number;
  private _terrainSizeZ: number;
  private _terrainHalfSizeX: number;
  private _terrainHalfSizeZ: number;
  private _averageSubSizeX: number;
  private _averageSubSizeZ: number;
  private _mapSizeX: number;
  private _mapSizeZ: number;

  constructor(
    name: string,
    options: {
      terrainSub?: number;
      mapData?: number[] | Float32Array;
      mapSubX?: number;
      mapSubZ?: number;
      camera?: Camera;
    },
    scene: Scene
  ) {
    this.name = name;
    this._terrainSub = options.terrainSub;
    this._mapData = options.mapData;
    this._mapSubX = options.mapSubX;
    this._mapSubZ = options.mapSubZ;
    this._scene = scene;
    this._terrainCamera = options.camera || scene.activeCamera;

    this._averageSubSizeX = 0.0;
    this._averageSubSizeZ = 0.0;
    this._terrainSizeX = 0.0;
    this._terrainSizeZ = 0.0;
    this._terrainHalfSizeX = 0.0;
    this._terrainHalfSizeZ = 0.0;
    this._mapSizeX = 0.0;
    this._mapSizeZ = 0.0;

    // create ribbon
    let index = 0;
    let posIndex = 0;
    let terrainPath;
    let y = 0.0;
    const terrainData = [];
    for (let j = 0; j <= this._terrainSub; j++) {
      terrainPath = [];
      for (let i = 0; i <= this._terrainSub; i++) {
        index =
          this._mod(j * 3, this._mapSubZ) * this._mapSubX +
          this._mod(i * 3, this._mapSubX);
        posIndex = index * 3;
        y = this._mapData[posIndex + 1];
        terrainPath.push(new Vector3(i, y, j));
      }
      terrainData.push(terrainPath);
    }
    this._mapSizeX = Math.abs(
      this._mapData[(this._mapSubX - 1) * 3] - this._mapData[0]
    );
    this._mapSizeZ = Math.abs(
      this._mapData[(this._mapSubZ - 1) * this._mapSubX * 3 + 2] -
        this._mapData[2]
    );
    this._averageSubSizeX = this._mapSizeX / this._mapSubX;
    this._averageSubSizeZ = this._mapSizeZ / this._mapSubZ;

    const ribbonOptions = {
      pathArray: terrainData,
      sideOrientation: Mesh.BACKSIDE,
      updatable: true,
    };
    this._terrain = MeshBuilder.CreateRibbon(
      "terrain",
      ribbonOptions,
      this._scene
    );

    this.update(true);

    this._terrain.position.x =
      this._terrainCamera.globalPosition.x - this._terrainHalfSizeX;
    this._terrain.position.z =
      this._terrainCamera.globalPosition.z - this._terrainHalfSizeZ;
  }

  update(force: boolean): DynamicTerrainV1 {
    const updateForced = force ? true : false;
    const updateSize = updateForced; // must the terrain size be updated ?
    if (updateSize) {
      this._updateTerrain(updateSize);
    }

    return this;
  }

  private _updateTerrain(updateSize: boolean) {
    if (updateSize) {
      this.updateTerrainSize();
    }
  }

  updateTerrainSize(): DynamicTerrainV1 {
    let remainder = this._terrainSub;
    let tsx = 0.0;
    let tsz = 0.0;
    const averageSubSizeX = this._averageSubSizeX;
    const averageSubSizeZ = this._averageSubSizeZ;
    tsx += remainder * averageSubSizeX;
    tsz += remainder * averageSubSizeZ;
    this._terrainSizeX = tsx;
    this._terrainSizeZ = tsz;
    this._terrainHalfSizeX = tsx * 0.5;
    this._terrainHalfSizeZ = tsz * 0.5;
    return this;
  }

  // private modulo, for dealing with negative indexes
  private _mod(a, b) {
    return ((a % b) + b) % b;
  }

  get mesh(): Mesh {
    return this._terrain;
  }
}
