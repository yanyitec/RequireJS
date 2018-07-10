

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
interface IThenable{
    then:(onFullfilled:(value:any,param?:any)=>void,onRejected?:(reason:any,param?:any)=>void)=>IThenable;
}


/**
 * promise 是一个拥有 then 方法的对象或函数，其行为符合本规范；
 * 本实现
 * @export
 * @interface IPromise
 * @extends {IThenable} 拥有then 方法
 */
interface IPromise extends IThenable{
    done:(onFullfilled:(value:any,param?:any)=>void,param?:any)=>IPromise;
    fail:(onRejected:(value:any,param?:any)=>void,param?:any)=>IPromise;
    promise(target?:any):IPromise;
}



interface IResolvable{
    resolve:(value?:any)=>IResolvable;
    reject:(value?:any)=>IResolvable;
    fullfillable:(target?:any)=>IResolvable;
}

interface IDeferred extends IPromise,IResolvable{
    
}

interface IExecution{
    func:(value?:any,param?:any)=>void;
    param?:any;
}

(function(global,factory){
    eval(`typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports,global) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory(global.exports = {},global));`);
})(this,(exports,global)=>{
if(!global){  try{global = window;}catch(ex){global={}}}

enum PromiseStates{
    padding,
    fullfilled,
    rejected
}
/**
 * 核心的Promise类
 * 符合PromiseA+规范
 *
 * @export
 * @class PromiseA
 * @implements {IPromise}
 */
class PromiseA implements IPromise{

    /**
     * promise的状态
     *
     * @private
     * @type {PromiseStates}
     * @memberof PromiseA
     */
    private __promise_status:PromiseStates;
    private __promise_value:any;
    private __promise_reason:any;
    private __promise_fullfill_sync:boolean;

    private __promise_onFullfilleds:IExecution[];
    private __promise_onRejecteds:IExecution[];
    private __promise_useApply?:boolean;
    constructor(executor:(resolve:(value?:any)=>void,reject:(reason?:any)=>void)=>void,sync?:boolean|string,useApply?:boolean|string){
        //if(executor===null)return;
        const promise = this;
        promise.__promise_fullfill_sync = sync===true || sync==="sync";
        promise.__promise_useApply = useApply===true || useApply==="apply";
        promise.__promise_status = PromiseStates.padding;
        let promiseThen = promise.then = function(onFullfilled:(value:any,param?:any)=>void,onRejected?:(reason:any,param?:any)=>void):PromiseA{
            if(promise.__promise_status!==PromiseStates.padding){
                fullfillPromise(promise.__promise_status,promise.__promise_value,this,promise.__promise_fullfill_sync);
                return this.then(onFullfilled,onRejected);
            }
            if(typeof onFullfilled==="function"){
                (promise.__promise_onFullfilleds || (promise.__promise_onFullfilleds=[])).push({func:onFullfilled});
            }
            if(typeof onRejected==="function"){
                (promise.__promise_onRejecteds || (promise.__promise_onRejecteds=[])).push({func:onRejected});
            }
            return promise;
        }
        let promiseDone = promise.done = function(onFullfilled:(value:any,param?:any)=>void,param?:any):PromiseA{
            if(promise.__promise_status!==PromiseStates.padding){
                fullfillPromise(promise.__promise_status,promise.__promise_value,this,promise.__promise_fullfill_sync);
                return this.done(onFullfilled);
            }

            if(typeof onFullfilled==="function"){
                (promise.__promise_onFullfilleds || (promise.__promise_onFullfilleds=[])).push({func:onFullfilled,param});
            }
            
            return promise;
        }
        let promiseFail = promise.fail = function(onRejected:(value:any,param?:any)=>void,param?:any):PromiseA{
            if(promise.__promise_status!==PromiseStates.padding){
                fullfillPromise(promise.__promise_status,promise.__promise_value,this,promise.__promise_fullfill_sync);
                return this.fail(onRejected);
            }
            if(typeof onRejected==="function"){
                (promise.__promise_onRejecteds || (promise.__promise_onRejecteds=[])).push({func:onRejected,param});
            }
            return promise;
        }
        let promisePromise = promise.promise = function(target?:any):IPromise{
            if(target===this)return this;
            target || (target={});
            
            target.then = promiseThen;
            target.done = promiseDone;
            target.fail = promiseFail;
            target.promise = promisePromise;
            return target;
        }
        

        function resolvePromise(value?:any,isSync?:boolean):any{
            // 2.3.2.4.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, 
            //              the first call takes precedence, and any further calls are ignored.
            // 如果已经完成，再次调用resolve就直接返回。不做任何操作
            if(promise.__promise_status !== PromiseStates.padding) {
                //console.warn("promise resolved/rejected more than once.",promise,this);
                return promise;
            }
            // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
            // resolve自己会循环引用，直接拒绝
            if(value===promise) {
                return rejectPromise(new TypeError('不能resolve自己'));
                
            }
            
            // 2.3.2 If x is a promise, adopt its state [3.4]
            // 如果返回的是一个PromiseA对象
            // 其实跟后面的Thenable检查一样
            // 应该跟thenable一样，做错误检查
            if(true || value instanceof PromiseA){
                //let that = value as PromiseA;
                //that.then( resolvePromise, rejectPromise);
                //return promise;
                // 规范文档是错误的，无论是否fullfilled/reject，都要解析里面的参数
                // Promise不应该出现在resolve函数的参数中

                // 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
                // 2.3.2.3 If/when x is rejected, reject promise with the same reason.
                // 如果已经有结果，用相同的结果/错误传递下去
                //if(that.__promise_status === PromiseStates.fullfilled){
                //    return executeFullfill(PromiseStates.fullfilled,that.__promise_value);
                //}else if(that.__promise_status === PromiseStates.rejected){
                //    return executeFullfill(PromiseStates.rejected,that.__promise_reason);
                //}else {
                    // 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
                //    that.then( resolvePromise, rejectPromise);
                //    return;
                //}
            }
            let called :boolean = false;
            //如果要解析的值是对象/函数
            if(typeof value ==="object" || typeof value==="function"){
                try{
                    //thenable检查
                    //// 2.3.3.2 If retrieving the property x.then results in a thrown exception e, 
                    //   reject promise with e as the reason.
                    let then :any = value.then;
                    // 2.3.3.3 If then is a function, call it with x as this,
                    //          first argument resolvePromise, and second argument rejectPromise
                    if(typeof then ==="function"){
                        then.call(value,
                            (thenValue) => {
                                if(called)return ;called = true;
                                resolvePromise(thenValue);
                            },(thenReason)=>{
                                if(called)return ;called = true;
                                rejectPromise(thenReason);
                            }
                        );
                        return promise;
                    }
                }catch(ex){
                    if(called)return ;called = true;
                    rejectPromise(ex);
                }
                
            }
            return executeFullfill(PromiseStates.fullfilled,value,isSync);
        }
        function rejectPromise(reason?:any,isSync?:boolean):any{
            if(promise.__promise_status !== PromiseStates.padding) {
                //console.warn("promise rejected/resolved more than once.",promise,this);
                return promise;
            }
            return executeFullfill(PromiseStates.rejected,reason,isSync===undefined?promise.__promise_fullfill_sync:isSync);
        }

        function executeFullfill(status:PromiseStates,value:any,sync:boolean):PromiseA{
            
            // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, 
            //           or multiple calls to the same argument are made, 
            //           the first call takes precedence, and any further calls are ignored.
            if(promise.__promise_status!==PromiseStates.padding)   return promise;
            
            promise.__promise_status = status;
            if(status==PromiseStates.fullfilled)  promise.__promise_value = value;
            else promise.__promise_reason = value;

            let exec = function(){
                let executions:IExecution[] = status===PromiseStates.fullfilled
                    ? promise.__promise_onFullfilleds
                    : promise.__promise_onRejecteds;
                
                if(executions) {
                    let execution:IExecution;
                    let useApply :boolean = promise.__promise_useApply===true;
                    while(execution = executions.shift()){
                        if(useApply || execution.param==='#useApply'){
                            execution.func.apply(promise,value);
                        }else execution.func.call(promise,value,execution.param);
                    }  
                }
                fullfillPromise(status,value,promise,sync);
            };
            if(promise.__promise_fullfill_sync = sync) exec();else _async(exec,0);
            return promise;
        }
        if(executor){
            try{
                executor(resolvePromise,rejectPromise);
            }catch(ex){
                rejectPromise(ex);
            }
        }
        
    }
    then:(onFullfilled:(value:any,param?:any)=>void,onRejected?:(reason:any,param?:any)=>void)=>IThenable;
    done:(onFullfilled:(value:any,param?:any)=>void,param?:any)=>IPromise;
    fail:(onRejected:(value:any,param?:any)=>void,param?:any)=>IPromise;
    promise:(target?:any)=>IPromise;


    /**
     *
     * 返回一个fullfilled状态的promise,其值为参数
     * @static
     * @param {*} value
     * @returns {IPromise}
     * @memberof PromiseA
     */
    static resolve(value:any,sync?:boolean|string,useApply?:boolean|string):IPromise{
        let promise = new PromiseA(null,sync,useApply);
        fullfillPromise(promise.__promise_status=PromiseStates.fullfilled,promise.__promise_value=value,promise,sync===true||sync==='sync');
        return promise;
    }


    /**
     * 返回一个rejected状态的promise,其reason为参数值
     *
     * @static
     * @param {*} reason
     * @returns {IPromise}
     * @memberof PromiseA
     */
    static reject(reason:any,sync?:boolean|string,useApply?:boolean|string):IPromise{
        let promise = new PromiseA(null,sync,useApply);
        fullfillPromise(promise.__promise_status=PromiseStates.rejected,promise.__promise_reason=reason,promise,sync===true||sync==='sync');
        return promise;
    }


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
    static all(_arg?:any,_sync?:boolean|string,_useApply?:boolean|string):IPromise{
        let arg:any[] = [];
        let sync:boolean|string;
        let useApply:boolean|string;
        if(arguments.length===1 && typeof _arg==="object" && _arg.length!==undefined){
            arg = _arg;
            sync = _sync;
            useApply = _useApply;
        }else {
            arg = Array.prototype.slice.call(arguments);
            useApply=true;
        }
        if(arg.length==0)return PromiseA.resolve([]);
        return new PromiseA((resolve,reject)=>{
            let results=[];
            let taskcount = arg.length +1;
            function done(value:any,i:number){
                if(i!==undefined)results[i] = value;
                taskcount-=1;
                if(taskcount===0) resolve(results);
            }
            
            
            for(let i = 0,j=arg.length;i<j;i++)((item,i)=>{
                let t = typeof item;
                let p :IThenable;
                if(t==="function"){
                    p = new PromiseA(item);
                }else if(item && item.then && typeof item.then ==='function'){
                    p = item;
                }else {
                    p = PromiseA.resolve(item);
                }
                p.then((value)=>done(value,i),reject);
            })(arg[i],i);
            done(undefined,undefined);
        },sync,useApply);

    }

    /**
     * 只要其中一个resolve了，整个promise就resolve
     * 参数用法参见 all
     *
     * @static
     * @param {*} [_arg]
     * @returns {IPromise}
     * @memberof PromiseA
     */
    static race(_arg?:any,_sync?:boolean|string,_useApply?:boolean|string):IPromise{
        let arg:any[] = [];
        let sync:boolean|string;
        let useApply:boolean|string;
        if(arguments.length===1 && typeof _arg==="object" && _arg.length!==undefined){
            arg = _arg;
            sync = _sync;
            useApply = _useApply;
        }else {
            arg = Array.prototype.slice.call(arguments);
            useApply=true;
        }
        if(arg.length==0)return PromiseA.resolve([],sync,useApply);

        return new PromiseA((resolve,reject)=>{
            for(let i = 0,j=arg.length;i<j;i++)((item,i)=>{
                let t = typeof item;
                let p :IThenable;
                if(t==="function"){
                    p = new PromiseA(item);
                }else if(item && item.then && typeof item.then ==='function'){
                    p = item;
                }else {
                    p = PromiseA.resolve(item);
                }
                p.then(resolve,reject);
            })(arg[i],i);
        },sync,useApply);

    }
    static deferred(sync?:boolean|string,useApply?:boolean|string):IDeferred{
        return new Deferred(sync,useApply);
    }

    static Promise:PromiseA = PromiseA as any;
    static Deferred:Deferred;
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
class Deferred extends PromiseA implements IDeferred{
    constructor(sync?:boolean|string,useApply?:boolean|string){
        let defferredResolve:(value?:any)=>IResolvable;
        let defferredReject:(value?:any)=>IResolvable;

        super((resolve:(value?:any)=>any,reject:(value?:any)=>any)=>{
            defferredResolve= this.resolve = resolve ;
            defferredReject = this.reject = reject;
        },sync,useApply);
        
    }
    resolve:(value?:any)=>IResolvable;
    reject:(value?:any)=>IResolvable;
    fullfillable(target?:any) : IResolvable{
        if(target===this)return this;
        target || (target={});
        target.resolve = this.resolve;
        target.reject = this.reject;
        target.fullfillable = this.fullfillable;
        return this;
    }
    deferred(target?:any):IDeferred{
        if(target===this)return this;
        if(target instanceof Deferred)
        target || (target={});
        target.deferred = this.deferred;
        target.resolve = this.resolve;
        target.reject = this.reject;
        target.fullfillable = this.fullfillable;
        target.then = this.then;
        target.done = this.done;
        target.fail = this.fail;
        target.promise = this.promise;

        return target;
    }
}
PromiseA.Deferred = Deferred as any;


// 获取异步函数
// 如果有setImmediate，就用setImmediate
// 否则，使用 setTimeout
let _async:(call:Function,delay?:number)=>void;
if(typeof setImmediate==="function") _async = setImmediate;
else _async = setTimeout;



/**
 * 把Promise变成fullfilled状态(并不给promise的status,value,reason赋值)
 * 主要是重写then,done,fail
 * onFullfilled,onRejected不再进入等待队列，
 * 而是直接丢给_async去执行
 *
 * @param {PromiseStates} status
 * @param {*} value
 * @param {PromiseA} promise
 * @returns {PromiseA}
 */
function fullfillPromise(status:PromiseStates,value:any,promise:PromiseA,sync:boolean):PromiseA{
    (promise as any).__promise_onFullfilleds = (promise as any).__promise_onRejecteds=undefined;
    //根据状态改变相关成员
    if(status== PromiseStates.fullfilled){
        promise.then = function(onFullfilled:(value:any,param?:any)=>void,onRejected?:(reason:any,param?:any)=>void):PromiseA{
            sync?onFullfilled.call(promise,value) : _async(()=>onFullfilled.call(promise,value),0);
            return promise;
        }
        promise.done = function(onFullfilled:(value:any,param?:any)=>void,param?:any):PromiseA{
            sync?onFullfilled.call(promise,value) : _async(()=>onFullfilled.call(promise,value),0);
            return promise;
        }
        promise.fail = function(onRejected:(reason:any,param?:any)=>void,param?:any):PromiseA{
            return promise;
        }
    }else {
        promise.then = function(onFullfilled:(value:any,param?:any)=>void,onRejected?:(reason:any,param?:any)=>void):PromiseA{
            sync?onRejected.call(promise,value): _async(()=>onRejected.call(promise,value),0);
            return promise;
        }
        promise.done = function(onFullfilled:(value:any,param?:any)=>void,param?:any):PromiseA{
            return promise;
        }
        promise.fail = function(onRejected:(reason:any,param?:any)=>void,param?:any):PromiseA{
            sync?onRejected.call(promise,value): _async(()=>onRejected.call(promise,value),0);
            return promise;
        }
    } 
    return promise;
}  

exports.PromiseA = exports.Promise = global.PromiseA = global.Promise = PromiseA;
//if(!global.Promise) global.Promise = PromiseA;
exports.Deferred = global.Deferred = Deferred;
return exports.default= (PromiseA as any).Promise = (PromiseA as any).PromiseA = PromiseA;
});

