import * as THREE from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {LIGHT_SETTING} from "./LIGHT_SETTING";
import {SHADOW_SETTING} from "./SHADOW_SETTING";
import {ShadowParam} from "./ShadowParam";

/**
 * 渲染模型舞台
 */
export class RenderStage {
    _scene = null;
    _camera = null;
    _renderer = null;
    _controls = null;
    _renderWidth = null;
    _renderHeight = null;
    _hemisphereLight = null;
    _directionalLight = null;

    /**
     * constructor
     * @param renderWidth {number} 渲染模型的畫面寬度
     * @param renderHeight {number} 渲染模型的畫面高度
     */
    constructor(renderWidth, renderHeight) {
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 100);
        this._camera.position.set(0.8, 0.8, 1.8);
        this._renderer = new THREE.WebGLRenderer({alpha: true, depthTest: true});
        this._renderer.shadowMap.enabled = true;
        this.setRenderSize(renderWidth, renderHeight);
        this._initLight();
        this._controls = new OrbitControls(this._camera, this._renderer.domElement);
        this._controls.target.set(0, .65, 0);
        const container = document.getElementById('three')
        container.appendChild(this._renderer.domElement);
    }

    _initLight() {
        const hemisphere = LIGHT_SETTING.HEMISPHERE;
        const directional = LIGHT_SETTING.DIRECTIONAL;
        this._hemisphereLight = new THREE.HemisphereLight(hemisphere.SKY_COLOR, hemisphere.GROUND_COLOR, hemisphere.INTENSITY);
        this._directionalLight = new THREE.DirectionalLight(directional.COLOR, directional.INTENSITY);
        this.setHemisphereLightPos(hemisphere.POSITION.X, hemisphere.POSITION.Y, hemisphere.POSITION.Z);
        this.setDirectionalLightPos(directional.POSITION.X, directional.POSITION.Y, directional.POSITION.Z);
        const shadowParam = new ShadowParam();
        const shadowParamList = [];
        Object.values(SHADOW_SETTING).forEach((param) => shadowParamList.push(param));
        Object.keys(shadowParam).forEach((key, idx) => {
            shadowParam[key] = shadowParamList[idx];
        });
        this.setShadow(shadowParam);
        this._scene.add(this._hemisphereLight);
        this._scene.add(this._directionalLight);
    }

    /**
     * 設置半球光位置
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    setHemisphereLightPos(x, y, z) {
        this._hemisphereLight.position.set(x, y, z);
    }

    /**
     * 設置半球光顏色
     * @param skyColor {number} 天空
     * @param groundColor {number} 地面
     * @param intensity {number} 強度
     */
    setHemisphereLight(skyColor, groundColor, intensity) {
        this._hemisphereLight.color.set(skyColor);// skyColor = Light.color
        this._hemisphereLight.groundColor = new THREE.Color(groundColor);
        this._hemisphereLight.intensity = intensity;
    }

    /**
     * 設置平行光
     * @param color {number} 顏色
     * @param intensity {number} 強度
     */
    setDirectionalLight(color, intensity) {
        this._directionalLight.color.set(color);
        this._directionalLight.intensity = intensity;
    }

    /**
     * 設置平行光位置
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    setDirectionalLightPos(x, y, z) {
        this._directionalLight.position.set(x, y, z);
    }

    /**
     * 設定影子參數
     * @param param {ShadowParam} 影子參數物件
     */
    setShadow(param) {
        this._directionalLight.castShadow = param.castShadow;
        this._directionalLight.shadow.mapSize.width = param.mapSizeWidth;
        this._directionalLight.shadow.mapSize.height = param.mapSizeHeight;
        this._directionalLight.shadow.radius = param.radius;
        this._directionalLight.shadow.bias = param.bias;
        this._directionalLight.shadow.camera.top = param.cameraTop;
        this._directionalLight.shadow.camera.bottom = param.cameraBottom;
        this._directionalLight.shadow.camera.left = param.cameraLeft;
        this._directionalLight.shadow.camera.right = param.cameraRight;
        this._directionalLight.shadow.camera.near = param.cameraNear;
        this._directionalLight.shadow.camera.far = param.cameraFar;
        this._directionalLight.shadow.camera.updateProjectionMatrix();
    }

    /**
     * 設置背景顏色
     * @param hex {number} 十六進位色碼
     */
    setSceneBackgroundColor(hex) {
        this._renderer.alpha = true;
        this._scene.background = new THREE.Color(hex);
    }

    /**
     * 獲取場景物件
     * @returns {Scene|undefined}
     */
    getScene() {
        if (!this._scene) {
            console.error("No scene is created");
            return;
        }
        return this._scene;
    }

    /**
     * 設置渲染畫面的尺寸
     * @param renderWidth {number} 渲染模型的畫面寬度
     * @param renderHeight {number} 渲染模型的畫面高度
     */
    setRenderSize(renderWidth, renderHeight) {
        if (!this._renderer) {
            console.error("No renderer is created");
            return;
        }
        this._renderWidth = renderWidth;
        this._renderHeight = renderHeight;
        this._renderer.setSize(this._renderWidth, this._renderHeight);
    }

    /**
     * 設相機位置
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    setCameraPosition(x, y, z) {
        if (!this._camera) {
            console.error("No camera is created");
            return;
        }
        this._camera.position.set(x, y, z)
    }

    /**
     * 設置3D軌道控制器位置
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    setControlsTarget(x, y, z) {
        if (!this._controls) {
            console.error("No controls is created");
            return;
        }
        this._controls.target.set(x, y, z);
    }

    /**
     * 渲染畫面
     */
    render() {
        if (!this._controls || !this._renderer) {
            console.info("No controls or renderer is created")
            return;
        }
        this._controls.update();
        this._camera.updateProjectionMatrix();
        this._renderer.render(this._scene, this._camera);
    }

    /**
     * 渲染畫面自適應
     * @private
     */
    resize() {
        this._renderer.setSize(this._renderWidth, this._renderHeight);
        this._renderer.render(this._scene, this._camera);
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
    }
}