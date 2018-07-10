/**
 * Name : RequireJS
 * Author : yiy
 * Description : umd 的一个实现
 *
 *
 */
declare var Promise: Function;
/**
 * require的配置
 *
 * @export
 * @interface IRequireConfig
 */
interface IRequireConfig {
    prefixes?: {
        [name: string]: string | string[];
    };
    bas: string;
}
/**
 * 一个require 等同用模块管理器
 *
 * @export
 * @interface IRequire
 */
interface IRequire {
    (modname: string | string[], ...modnames: string[]): IPromise;
    /**
     * 配置该模块
     *
     * @param {IRequireConfig} config
     * @returns {IRequire}
     * @memberof IRequire
     */
    config(config?: IRequireConfig): IRequire;
    /**
     * 查找模块
     *
     * @param {string} key
     * @returns {Module}
     * @memberof IRequire
     */
    each(filter: (mod: IModule) => boolean): IRequire;
    find(fullname: string, mergeNames?: boolean): IModule | IModuleNames;
    /**
     * 根据key总是获取一个模块
     * 如果没有，就在当前模块创建一个
     *
     * @param {string} key
     * @returns {Module}
     * @memberof IRequire
     */
    ensure(key: string): IModule;
    /**
     * 发布版本号
     * 用来接在 url的后面，避免浏览器cache
     * 如果该值为 '#dev'
     * 则总是当前时间
     * @type {string}
     * @memberof IRequire
     */
    release_version: string;
    define: Function;
    $prefixes: {
        [key: string]: string | string[];
    };
    $modules: IModule[];
    $bas_url: string;
}
declare enum ModuleStates {
    init = 0,
    loading = 1,
    loaded = 2,
    completed = 3,
    error = 4
}
interface IModule extends IPromise {
    /**
         * 模块状态
         *
         * @type {ModuleStates}
         * @memberof Module
         */
    status: ModuleStates;
    /**
     * 当加载完成后
     *
     * @type {IRes}
     * @memberof Module
     */
    res: IRes;
    aliveUrl: string;
    keys: string[];
    /**
     * 模块名
     *
     * @type {string}
     * @memberof Module
     */
    aliases: string[];
    urls: string[];
    checkAlias(alias: string): boolean;
    load(): IModule;
}
interface IModuleNames {
    key: string;
    shortName: string;
    name: string;
    prefix: string;
    aliases: string[];
    urls: string[];
}
interface IDefineContext {
    module?: IModule;
    exports?: any;
    onReady?: Function;
    modname?: string;
}
interface IRes {
    url?: string;
    elementFactory?: (url: string) => HTMLElement;
    element?: HTMLElement;
    [key: string]: any;
}
