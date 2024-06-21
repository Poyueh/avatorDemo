import {FBXModelUtil} from "./FBXModelUtil";
import {RenderStage} from "./RenderStage";
import {MODEL_LIST} from "./MODEL_LIST";
import {TEXTURE_LIST} from "./TEXTURE_LIST";
import {MODEL_TYPE} from "./MODEL_TYPE";
import {TEXTURE_TYPE} from "./TEXTURE_TYPE";
import {PART_TEXTURE} from "./PART_TEXTURE";
import {RES_ROOT_PATH} from "./RES_ROOT_PATH";

/**
 * Avatar 主邏輯
 */
export class AvatarExecutor {
    _renderStage = null;
    _fbxModelUtil = null;
    _model = null;
    _avatarData = null;

    /**
     *
     * @param avatarData
     */
    constructor(avatarData) {
        this._fbxModelUtil = new FBXModelUtil();
        this._renderStage = new RenderStage(window.innerWidth, window.innerHeight);
        this._avatarData = avatarData;
    }

    /**
     * 初始化
     * @returns {Promise<void>}
     */
    async init() {
        this._fbxModelUtil.setRootPath(RES_ROOT_PATH);
        await this._createMainModel();
        await this._updateMainModel();
    }
    /**
     * 使 3D 系統動作
     */
    animate(){
        this._renderStage.render();
        this._fbxModelUtil.playAnimation(this._model);
        Object.values(MODEL_TYPE).forEach((type) => {
            if (!this._model[type]) {
                // console.warn(`${type} is no exist!`);
                return;
            }
            this._fbxModelUtil.playAnimation(this._model[type]);
        })
        window.requestAnimationFrame(this.animate.bind(this));
    }

    /**
     * 設置背景顏色
     * @param hex {number} 十六進位色碼
     */
    setSceneBackgroundColor(hex) {
        this._renderStage.setSceneBackgroundColor(hex);
    }

    /**
     * 換臉貼圖
     * @param type {string} 種類
     * @param texture {string|number} 貼圖
     */
    async changeFace(type, texture) {
        this.setAvatarData(type, texture);
        await this._updateFace();
    }

    /**
     * 更換膚色
     * @param skinColor {number}
     * @returns {Promise<void>}
     */
    async changeSkin(skinColor) {
        this.setAvatarData(TEXTURE_TYPE.SKIN, skinColor);
        await this._updateSkinExceptFace();
        await this._updateFace();
    }

    /**
     * 置換主模型部位
     * @param type {string} 種類
     * @param name {string} 檔名
     * @returns {Promise<void>}
     */
    async changeModel(type, name) {
        this.setAvatarData(type, name);
        await this._updateModel(this._model, type, name);
    }

    /**
     * 移除主模型部位模型
     * @param type 種類
     */
    removeModel(type) {
        this.setAvatarData(type, "");
        this._fbxModelUtil.hideModel(this._model, type);
    }

    /**
     * 移除主模型部位貼圖
     * @param type 種類
     */
    async removeTexture(type) {
        this.setAvatarData(type, "");
        await this._updateFace();
    }

    /**
     * 設定 Avatar data
     * @param part {string} 部位
     * @param component {string|number} 部位資源
     */
    setAvatarData(part, component) {
        this._avatarData[part] = component;
    }

    /**
     * 創建主模型
     * @returns {Promise<void>}
     * @private
     */
    async _createMainModel() {
        this._model = await this._fbxModelUtil.createModel(MODEL_LIST.MAIN_MODEL, true);
        this._fbxModelUtil.setModelScale(.3, .3, .3, this._model);
        await this._updateSkinExceptFace();
        await this._updateFace();
        this._renderStage.getScene().add(this._model);
        this._fbxModelUtil.resetAnimationAction(this._model);
        this._fbxModelUtil.setAnimation(this._model, 0, true);
    }

    /**
     * 更新主模型部位
     * @param model {object} 主模型
     * @param type {string} 種類
     * @param name {string} 素材名稱
     * @returns {Promise<void>}
     * @private
     */
    async _updateModel(model, type, name) {
        const fbx = await this._fbxModelUtil.createModel(name, true, type);
        await this._updatePartModelSkin(fbx, type);
        this._fbxModelUtil.changeModel(model, fbx, type);
        this._fbxModelUtil.resetAnimationAction(model);
        this._resetAnimations();
    }

    /**
     * 重置所有部位動畫
     * @private
     */
    _resetAnimations(){
        Object.values(MODEL_TYPE).forEach((partName) => {
            if (!this._model[partName]) {
                // console.warn(`${partName} is no exist!`);
                return;
            }
            this._fbxModelUtil.resetAnimationAction(this._model[partName]);
            this._fbxModelUtil.setAnimation(this._model[partName], 0, true);
            this._fbxModelUtil.setAnimation(this._model, 0, true);
        })
    }

    /**
     * 更新部位模型皮膚
     * @param partModel {Object} 模型
     * @param type {string} 種類
     * @returns {Promise<void>}
     * @private
     */
    async _updatePartModelSkin(partModel, type) {
        if (type === MODEL_TYPE.HAND) {
            const skin = await this._createSkinTexture();
            await this._fbxModelUtil.changeTexture(partModel, PART_TEXTURE.HAND, skin);
        }
        if (type === MODEL_TYPE.HEAD) {
            const texture = await this._createFaceTexture();
            await this._fbxModelUtil.changeTexture(partModel, PART_TEXTURE.HEAD, texture);
        }
    }

    /**
     * 依照 AvatarData 更新主模型造型
     * @returns {Promise<void>}
     * @private
     */
    async _updateMainModel() {
        let typeList = [];
        Object.values(MODEL_TYPE).forEach((type) => typeList.push(type));
        for (let type of typeList) {
            if (!this._avatarData[type]) return;
            await this._updateModel(this._model, type, this._avatarData[type]);
        }
    }

    /**
     * 更新除了臉部的膚色
     * @returns {Promise<void>}
     * @private
     */
    async _updateSkinExceptFace() {
        const skin = await this._createSkinTexture();
        await this._fbxModelUtil.changeTexture(this._model, PART_TEXTURE.EAR, skin);
        await this._fbxModelUtil.changeTexture(this._model, PART_TEXTURE.BODY, skin);
        await this._fbxModelUtil.changeTexture(this._model, PART_TEXTURE.HAND, skin);
    }

    /**
     * 更新臉部
     * @returns {Promise<void>}
     */
    async _updateFace() {
        const texture = await this._createFaceTexture();
        await this._fbxModelUtil.changeTexture(this._model, PART_TEXTURE.HEAD, texture);
    }

    /**
     * 創建整張臉的貼圖
     * @returns {Promise<CanvasTexture>} 整張臉貼圖
     * @private
     */
    async _createFaceTexture() {
        const skin = await this._createSkinTexture();
        const eyes = await this._fbxModelUtil.createTexture(this._avatarData.eyes, TEXTURE_TYPE.EYES);
        const mouth = await this._fbxModelUtil.createTexture(this._avatarData.mouth, TEXTURE_TYPE.MOUTH);
        const face = await this._fbxModelUtil.createTexture(this._avatarData.face, TEXTURE_TYPE.FACE);
        return this._fbxModelUtil.mergeTexture(skin, eyes, mouth, face);
    }

    /**
     * 創建皮膚貼圖
     * @returns {Promise<CanvasTexture>} 皮膚貼圖
     * @private
     */
    async _createSkinTexture() {
        const skinBasis = await this._fbxModelUtil.createTexture(TEXTURE_LIST.SKIN, TEXTURE_TYPE.SKIN);
        return this._fbxModelUtil.changeTextureColor(skinBasis, this._avatarData.skin);
    }
}