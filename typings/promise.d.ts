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
/**
 * 是一个定义了 then 方法的对象或函数，也被称作“拥有 then 方法”；
 *
 * @export
 * @interface IThenable
 */
interface IThenable {
    then: (onFullfilled: (value: any, param?: any) => void, onRejected?: (reason: any, param?: any) => void) => IThenable;
}
/**
 * promise 是一个拥有 then 方法的对象或函数，其行为符合本规范；
 * 本实现
 * @export
 * @interface IPromise
 * @extends {IThenable} 拥有then 方法
 */
interface IPromise extends IThenable {
    done: (onFullfilled: (value: any, param?: any) => void, param?: any) => IPromise;
    fail: (onRejected: (value: any, param?: any) => void, param?: any) => IPromise;
    promise(target?: any): IPromise;
}
interface IResolvable {
    resolve: (value?: any) => IResolvable;
    reject: (value?: any) => IResolvable;
    fullfillable: (target?: any) => IResolvable;
}
interface IDeferred extends IPromise, IResolvable {
}
interface IExecution {
    func: (value?: any, param?: any) => void;
    param?: any;
}
