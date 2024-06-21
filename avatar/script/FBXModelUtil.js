import {FBXLoader} from "three/addons/loaders/FBXLoader.js";
import * as THREE from 'three';
import {Group} from "three";

/**
 * FBX 模型工具
 */
export class FBXModelUtil {
    _rootPath = "";
    _textureType = "png";
    _clock = null;

    constructor() {
        this._clock = new THREE.Clock();
    }

    /**
     * 設定素材根目錄路徑
     * @param path {string} 路徑
     */
    setRootPath(path) {
        this._rootPath = path;
    }

    /**
     * 創建模型
     * @param name {string} 素材名稱
     * @param isDoubleSide {boolean} 是否雙面渲染
     * @param partName {string} 部位名稱
     * @returns {Promise<object>} 模型
     */
    async createModel(name, isDoubleSide, partName = "") {
        const fbxLoader = new FBXLoader();
        return new Promise((resolve, reject) => {
            const partDirectory = partName ? `${partName}/` : "";
            const resPath = `${this._rootPath}/${partDirectory}${name}.fbx`
            fbxLoader.load(resPath,
                (obj) => {
                    this._setMeshShader(obj);
                    obj.resName = name;
                    resolve(obj);
                },
                (xhr) => {
                    // 讀取進度之後有要做讀取進度顯示能用
                    // console.info((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    reject(error);
                    console.error(`resource path: ${this._rootPath}/${partDirectory}${name}.fbx is error: ${error}`);
                })
        })
    }

    /**
     * 設置模型渲染
     * @param model {object} 模型
     * @param isTransparent {boolean} 是否要開啟透明
     * @param isShadow {boolean} 是否要投射物體的影子
     * @param isDoubleSide {boolean} 是否雙面渲染
     * @param shininess {number} 高光強度
     * @private
     */
    _setMeshShader(model, isTransparent = true, isShadow = true, isDoubleSide = true, shininess = 0) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = isShadow;
                child.receiveShadow = isShadow;
            }
            if (child.material) {
                child.material.normalMapType = THREE.TangentSpaceNormalMap;
                child.material.shininess = shininess;
                child.material.transparent = isTransparent;
                child.material.side = isDoubleSide ? THREE.DoubleSide : THREE.FrontSide;
            }
        })
    }

    /**
     * 置換部位並且加入子項
     * @param mainModel {object} 主體模型
     * @param partModel {object} 部位模型
     * @param type {string} 種類
     */
    changeModel(mainModel, partModel, type) {
        mainModel.traverse((child) => {
            if (child.name === type) {
                mainModel.remove(child);
                partModel.name = type;
                mainModel[type] = partModel;
                mainModel.add(partModel);
            }
        });
    }

    /**
     * 隱藏部位
     * @param mainModel {object} 主體模型
     * @param type {string} 種類
     */
    hideModel(mainModel, type) {
        mainModel.traverse((child) => {
            if (child.name === type) {
                child.visible = false;
            }
        });
    }

    /**
     * 設定動畫
     * @param model {object} 模型
     * @param index {number} 動畫索引目錄
     * @param isLoop {boolean} 是否循環播放
     * @param timeScale {number} 是否循環播放
     */
    // TODO 未來要切換動畫這支可能要調整(看美術3D動畫做法)
    setAnimation(model, index, isLoop, timeScale = 1) {
        if (!model) {
            console.info("No model");
            return;
        }

        if (model.animations.length === 0) {
            console.error(`${model.resName} no animations`);
            return;
        }

        model.mixer = model.mixer ? model.mixer : new THREE.AnimationMixer(model);
        const AnimationAction = model.mixer.clipAction(model.animations[index]);
        AnimationAction.timeScale = timeScale;
        AnimationAction.loop = isLoop ? THREE.LoopPingPong : THREE.LoopOnce;
        model.mixer.setTime(0)
        AnimationAction.play();
    }

    /**
     * 播放動畫
     * @param model {object} 模型
     * @param delta {number} 幀與幀之間的時間
     */
    playAnimation(model,delta = 0.01) {
        if (!model) {
            console.error("No model");
            return;
        }
        if (model.mixer) model.mixer.update(delta);
    }

    /**
     * 重置動畫
     * @param model {object} 模型
     */
    resetAnimationAction(model) {
        console.log("resetAnimationAction: ",model)
        if (!model) {
            console.info("No model");
            return;
        }
        if (model.mixer) model.mixer.setTime(0);
    }

    /**
     * 設定模型大小
     * @param x {number}
     * @param y {number}
     * @param z {number}
     * @param model {object} 模型
     */
    setModelScale(x, y, z, model) {
        model.scale.set(x, y, z);
    }

    /**
     * 創建貼圖
     * @param name {string} 貼圖名稱
     * @param type {string} 貼圖分類
     * @returns {Promise<CanvasTexture>}
     */
    async createTexture(name, type = "") {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        return new Promise((resolve, reject) => {
            if (!name) {
                resolve(new THREE.CanvasTexture(canvas));
                return;
            }
            const image = new Image();
            const partPath = type ? `${type}/` : "";
            image.src = `${this._rootPath}/${partPath}${name}.${this._textureType}`;
            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                const canvasTexture = new THREE.CanvasTexture(canvas);
                canvasTexture.encoding = THREE.sRGBEncoding;
                canvas.remove();
                resolve(canvasTexture);
            }
        })
    }

    /**
     * 更換貼圖顏色(將有像素的範圍就變成指定的顏色)
     * @param texture {CanvasTexture} 貼圖
     * @param color {number} 16進位色碼
     * @returns {CanvasTexture} 貼圖
     */
    changeTextureColor(texture, color) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = texture.image.width;
        canvas.height = texture.image.height;

        // 将原始贴图绘制到画布上
        ctx.drawImage(texture.image, 0, 0);

        // 获取画布的像素数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const newColor = new THREE.Color(color);
        // 遍历像素并改变颜色
        for (let i = 0; i < data.length; i += 4) {
            // 如果像素不是透明的，将其颜色更改为新颜色
            if (data[i + 3] > 0) {
                data[i] = newColor.r * 255;
                data[i + 1] = newColor.g * 255;
                data[i + 2] = newColor.b * 255;
            }
        }

        // 将更改后的像素数据放回画布
        ctx.putImageData(imageData, 0, 0);

        // 返回修改后的贴图
        const newTexture = new THREE.CanvasTexture(canvas);
        newTexture.encoding = THREE.sRGBEncoding;
        canvas.remove();
        return newTexture;
    }

    /**
     * 合成貼圖
     * @param textures {CanvasTexture} 要合成的貼圖們...
     * @returns {CanvasTexture} 最終合成圖
     */
    mergeTexture(...textures) {
        let maxWidth = 0;
        let maxHeight = 0;

        textures.forEach((texture) => {
            maxWidth = Math.max(maxWidth, texture.image.width);
            maxHeight = Math.max(maxHeight, texture.image.height);
        });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = maxWidth;
        canvas.height = maxHeight;
        textures.forEach((texture) => {
            ctx.drawImage(texture.image, 0, 0, texture.image.width, texture.image.height);
        });
        const canvasTexture = new THREE.CanvasTexture(canvas);
        canvasTexture.encoding = THREE.sRGBEncoding;
        return canvasTexture;
    }

    /**
     * 置換部位貼圖
     * @param model {object} 模型
     * @param type {string} 種類
     * @param texture {CanvasTexture}
     */
    changeTexture(model, type, texture) {
        model.traverse((child) => {
            const modelType = this._parseTypeName(child.name);
            if (modelType === type && child instanceof THREE.SkinnedMesh) {
                this._updateTexture(child, type, texture);
                return;
            }
        });
    }

    /**
     * 更新部位貼圖
     * 置換過模型的部位會從 SkinnedMesh 變成 Group 因為新部位模型包含了rig
     * 所以要再遍歷一次模型去置換貼圖
     * @param model {object} 主體模型
     * @param type {string} 種類
     * @param texture {CanvasTexture}
     */
    _updateTexture(model, type, texture) {
        if (model instanceof Group) {
            model.traverse((child) => {
                const modelType = this._parseTypeName(child.name);
                if (modelType === type && child instanceof THREE.SkinnedMesh && child.material) {
                    this._updateTexture(child, type, texture);
                    return;
                }
            });
        } else {
            model.material.map = texture;
            model.material.needsUpdate = true;
        }
    }

    /**
     * 解析模型名稱
     * 用於準確知道此模型的種類
     * @param childName
     * @returns {string}
     * @private
     */
    _parseTypeName(childName) {
        const typeNameSplit = childName.split("_");
        return typeNameSplit[0];
    }
}