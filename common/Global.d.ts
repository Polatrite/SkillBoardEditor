import { Loader } from "pixi.js";

declare module "*.png" {
    const value: string
    export default value
}

declare global {
    interface Window {
        assetLoader: Loader
    }
}