/**
 * Name : Promise/A+
 * Author : yiy
 * Description : Promise 实现 遵循promise/A+规范
 *
 * Promise/A+规范原文:
 *  https://promisesaplus.com/#notes
 *
 * Promise/A+规范译文:
 *  https://malcolmyu.github.io/2015/06/12/Promises-A-Plus/#note-4
 *
 * 参考资料:
 *  https://www.jianshu.com/p/459a856c476f
 */
export declare enum PromiseStates {
    padding = 0,
    fullfilled = 1,
    rejected = 2
}
/**
 * 是一个定义了 then 方法的对象或函数，也被称作“拥有 then 方法”；
 *
 * @export
 * @interface IThenable
 */
export interface IThenable {
    then: (onFullfilled: (value: any, param?: any) => void, onRejected?: (reason: any, param?: any) => void) => IThenable;
}
/**
 * promise 是一个拥有 then 方法的对象或函数，其行为符合本规范；
 * 本实现
 * @export
 * @interface IPromise
 * @extends {IThenable} 拥有then 方法
 */
export interface IPromise extends IThenable {
    done: (onFullfilled: (value: any, param?: any) => void, param?: any) => IPromise;
    fail: (onRejected: (value: any, param?: any) => void, param?: any) => IPromise;
    promise(target?: any): IPromise;
}
export interface IResolvable {
    resolve: (value?: any) => IResolvable;
    reject: (value?: any) => IResolvable;
    fullfillable: (target?: any) => IResolvable;
}
export interface IDeferred extends IPromise, IResolvable {
}
export interface IExecution {
    func: (value?: any, param?: any) => void;
    param?: any;
}
/**
 * 核心的Promise类
 * 符合PromiseA+规范
 *
 * @export
 * @class PromiseA
 * @implements {IPromise}
 */
export default class PromiseA implements IPromise {
    /**
     * promise的状态
     *
     * @private
     * @type {PromiseStates}
     * @memberof PromiseA
     */
    private __promise_status;
    private __promise_value;
    private __promise_reason;
    private __promise_onFullfilleds;
    private __promise_onRejecteds;
    constructor(executor: (resolve: (value?: any) => void, reject: (reason?: any) => void) => void);
    then: (onFullfilled: (value: any, param?: any) => void, onRejected?: (reason: any, param?: any) => void) => IThenable;
    done: (onFullfilled: (value: any, param?: any) => void, param?: any) => IPromise;
    fail: (onRejected: (value: any, param?: any) => void, param?: any) => IPromise;
    promise: (target?: any) => IPromise;
    /**
     *
     * 返回一个fullfilled状态的promise,其值为参数
     * @static
     * @param {*} value
     * @returns {IPromise}
     * @memberof PromiseA
     */
    static resolve(value: any): IPromise;
    /**
     * 返回一个rejected状态的promise,其reason为参数值
     *
     * @static
     * @param {*} reason
     * @returns {IPromise}
     * @memberof PromiseA
     */
    static reject(reason: any): IPromise;
    /**
     * 所有参数的promise都resolve了，promise才resolve
     *
     * 用法1：
     * let tasks = [promise,{},(resolve,reject)=>resolve(1)];
     * PromiseA.all(tasks);
     * 用法2：
     * PromiseA.all(promise,{},(resolve,reject)=>resolve(1));
     *
     * 两种用法效果相同
     * @static
     * @param {*} [_arg] 1 如果是函数，就当作Promise的executor构建Promise；2 如果是Promise，直接检查状态;3 其他的当作 ResolvedPromise去传递
     * @returns {IPromise}
     * @memberof PromiseA
     */
    static all(_arg?: any): IPromise;
    /**
     * 只要其中一个resolve了，整个promise就resolve
     * 参数用法参见 all
     *
     * @static
     * @param {*} [_arg]
     * @returns {IPromise}
     * @memberof PromiseA
     */
    static race(_arg?: any): IPromise;
    static deferred(): IDeferred;
}
/**
 * 延迟对象
 * 基于Promise实现Deferred的
 * Deferred和Promise的关系
 * - Deferred 拥有 Promise
 * - Deferred 具备对 Promise的状态进行操作的特权方法（resolve reject）
 *
 * 参考jQuery.Deferred
 * url: http://api.jquery.com/category/deferred-object/
 *
 * @export
 * @class Deferred
 * @extends {PromiseA}
 * @implements {IDeferred}
 */
export declare class Deferred extends PromiseA implements IDeferred {
    constructor();
    resolve: (value?: any) => IResolvable;
    reject: (value?: any) => IResolvable;
    fullfillable(target?: any): IResolvable;
    deferred(target?: any): IDeferred;
}
