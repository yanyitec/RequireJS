var ModuleStates;
(function (ModuleStates) {
    ModuleStates[ModuleStates["init"] = 0] = "init";
    ModuleStates[ModuleStates["loading"] = 1] = "loading";
    ModuleStates[ModuleStates["loaded"] = 2] = "loaded";
    ModuleStates[ModuleStates["completed"] = 3] = "completed";
    ModuleStates[ModuleStates["error"] = 4] = "error";
})(ModuleStates || (ModuleStates = {}));
(function (global, factory) {
    eval("typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports,global) :\n\ttypeof define === 'function' && define.amd ? define(['exports'], factory) :\n\t(factory(global.require = {},global));");
})(this, function (exports, global) {
    if (!global) {
        try {
            global = window;
        }
        catch (ex) {
            global = {};
        }
    }
    var requirejs = function (modname) {
        var modnames = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            modnames[_i - 1] = arguments[_i];
        }
        var mod_m = requirejs;
        var useApply = false;
        if (typeof modname === "string") {
            modnames.unshift(modname);
            useApply = true;
        }
        else
            modnames = modname;
        var mods = [];
        for (var i = 0, j = modnames.length; i < j; i++) {
            var modname_1 = modnames[i];
            var mod = void 0;
            if (modname_1 === "require")
                mod = requireModule;
            else if (modname_1 === "exports")
                mod = new Module("", define_context ? define_context.exports : "#undefined");
            else if (modname_1 === "global")
                mod = new Module("", global);
            else
                mod = mod_m.ensure(modname_1);
            mods.push(mod);
        }
        return Promise.all(mods, true, useApply);
    };
    var modules = requirejs.$modules = [];
    var prefixes = requirejs.$prefixes = {};
    var each = requirejs.each = function (func) {
        for (var i = 0, j = modules.length; i < j; i++) {
            if (func(modules[i]) === false)
                return requirejs;
        }
        return requirejs;
    };
    var find = requirejs.find = function (name, merge) {
        var module;
        var mergeNames = true;
        var mnames = new ModuleNames(name, function (alias, type, names) {
            if (type === "keys" || type === "prefix") {
                each(function (mod) {
                    if (mod.checkAlias(alias)) {
                        module = mod;
                        mergeNames = false;
                        return false;
                    }
                });
                if (module)
                    return false;
            }
            else if (type === "shortNames") {
                each(function (mod) {
                    if (mod.checkAlias(alias)) {
                        module = mod;
                        return false;
                    }
                });
            }
            else if (type === "names") {
                if (module)
                    return;
                each(function (mod) {
                    if (mod.checkAlias(alias)) {
                        module = mod;
                        mergeNames = names.prefix === undefined;
                        return false;
                    }
                });
                if (module && names.prefix === undefined)
                    return false;
            }
            else if (type == "urls") {
                if (module)
                    return;
                each(function (mod) {
                    if (mod.checkAlias(alias)) {
                        module = mod;
                        return false;
                    }
                });
            }
            else {
                throw new Error("not implements");
            }
        });
        if (module) {
            if (mergeNames && merge) { }
            return module;
        }
        return (merge) ? mnames : undefined;
    };
    requirejs.ensure = function (fullname) {
        var modOrNames = find(fullname, true);
        if (modOrNames.res)
            return modOrNames;
        var mod = new Module(fullname);
        modules[modOrNames.key] = mod;
        setTimeout(function () {
            mod.load();
        }, 0);
        return mod;
    };
    requirejs.config = function (cfg) {
        var prefixs = cfg.prefixes;
        if (prefixs) {
            for (var prefixname in prefixs) {
                var ps = prefixs[prefixname];
                var existed = prefixes[prefixname];
                if (!existed)
                    existed = prefixes[prefixname] = [];
                if (typeof ps === 'string')
                    ps = [ps];
                for (var i = 0, j = ps.length; i < j; i++) {
                    var url = trim(ps[i]);
                    if (!url)
                        continue;
                    if (url[url.length - 1] != '/')
                        url += '/';
                    if (!array_exists(existed, url))
                        existed.push(url);
                }
            }
        }
        if (cfg.bas) {
            requirejs.$bas_url = cfg.bas;
            if (requirejs.$bas_url[requirejs.$bas_url.length - 1] != '/')
                requirejs.$bas_url += '/';
        }
        return requirejs;
    };
    var bas_url;
    var boot_url;
    try {
        var paths = location.pathname.split("/");
        paths.shift();
        paths.pop();
        var scripts = document.getElementsByTagName("script");
        for (var i = 0, j = scripts.length; i < j; i++) {
            var script = scripts[i];
            var requireBoot = trim(script.getAttribute("require-boot"));
            if (!requireBoot)
                continue;
            if (is_url(requireBoot)) {
                var ps = requireBoot.split('/');
                ps.pop();
                bas_url = ps.join('/') + '/';
                boot_url = requireBoot;
            }
            if (requireBoot[0] === '/') {
                var ps = requireBoot.split('/');
                var filename = ps.pop();
                bas_url = location.protocol + "//" + location.hostname + ":" + location.port + ps.join('/') + '/';
                boot_url = bas_url + filename;
            }
            else {
                var ps = requireBoot.split('/');
                var filename = ps.pop();
                for (var m = 0, n = ps.length; m < n; m++) {
                    var pn = ps[i];
                    if (pn == '..')
                        paths.pop();
                    else
                        paths.push(pn);
                }
                bas_url = location.protocol + "//" + location.hostname + ":" + location.port + '/' + paths.join('/') + '/';
                boot_url = bas_url + filename;
            }
        }
        if (!bas_url) {
            var path = paths.join("/");
            bas_url = location.protocol + "//" + location.hostname + ":" + location.port + path;
            if (bas_url[bas_url.length - 1] != '/')
                bas_url += "/";
        }
        requirejs.$bas_url = bas_url;
    }
    catch (ex) {
        console.trace("gen bas_url failed", ex);
        requirejs.$bas_url = '';
    }
    if (boot_url) {
        setTimeout(function () { return requirejs([boot_url]); }, 0);
    }
    var ModuleNames = /** @class */ (function () {
        function ModuleNames(key, onNameParsed, prefixSetting) {
            this.key = (key = trim(key));
            if (onNameParsed && onNameParsed(this.key, "keys", this) === false)
                return;
            var aliases = this.aliases = [key];
            var urls = this.urls = [];
            var at = key.indexOf("@");
            var name;
            if (at >= 0) {
                var shortName = this.shortName = key.substr(0, at);
                if (onNameParsed && onNameParsed(shortName, "shortNames", this) === false)
                    return;
                aliases.push(shortName);
                name = key.substr(at + 1);
            }
            else {
                name = key;
            }
            //aliases.push(nameOrUrl);
            var prefixs = prefixSetting || requirejs.$prefixes;
            if (!is_url(name)) {
                if (prefixs) {
                    for (var prefix in prefixs) {
                        if (name.indexOf(prefix) !== 0)
                            continue;
                        this.prefix = prefix;
                        if (onNameParsed && onNameParsed(name, "prefix", this) === false)
                            return;
                        aliases.push(name);
                        var prefix_urls = prefixs[prefix];
                        for (var i = 0, j = prefix_urls.length; i < j; i++) {
                            var url = prefix_urls[i];
                            if (!url) {
                                console.warn("the url for require.$prefixs[" + prefix + "@" + i + "] is empty.");
                                continue;
                            }
                            url += name.substr(prefix.length);
                            var url1 = url.toLowerCase();
                            var ext = extname(url);
                            if (!ext) {
                                if (onNameParsed && onNameParsed(url1, "names", this) === false)
                                    return;
                                aliases.push(url1);
                                this.name = url1;
                                url += ".js";
                                if (!is_url(url))
                                    url = requirejs.$bas_url + url;
                                if (onNameParsed && onNameParsed(url, "urls", this) === false)
                                    return;
                                urls.push(url);
                            }
                            else {
                                if (!is_url(url))
                                    url = requirejs.$bas_url + url;
                                if (onNameParsed && onNameParsed(url, "urls", this) === false)
                                    return;
                                urls.push(url);
                            }
                        }
                        break;
                    }
                }
            }
            else {
                var url = name;
                var ext = extname(url);
                if (!ext) {
                    if (onNameParsed && onNameParsed(name, "names", this) === false)
                        return;
                    aliases.push(name);
                    this.name = name;
                    url += ".js";
                    if (!is_url(url))
                        url = requirejs.$bas_url + url;
                    if (onNameParsed && onNameParsed(url, "urls", this) === false)
                        return;
                    aliases.push(url);
                    urls.push(url);
                }
                else {
                    if (!is_url(url))
                        url = requirejs.$bas_url + url;
                    if (onNameParsed && onNameParsed(name, "urls", this) === false)
                        return;
                    urls.push(url);
                }
            }
        }
        return ModuleNames;
    }());
    var Module = /** @class */ (function () {
        function Module(name, constValue) {
            var _this = this;
            var names;
            if (name) {
                if (typeof name === "string") {
                    names = new ModuleNames(name);
                }
                this.keys = [names.key];
                this.aliases = names.aliases;
                this.urls = names.urls;
            }
            if (constValue !== undefined) {
                if (constValue === '#undefined')
                    constValue = undefined;
                var promise = Promise.resolve(constValue);
                this.status = ModuleStates.completed;
                promise.promise(this);
            }
            else {
                this.status = ModuleStates.init;
                this._deferred = Promise.deferred();
                this._deferred.done(function (value) {
                    _this.value = value;
                    _this.status = ModuleStates.completed;
                }).fail(function (err) {
                    _this.status = ModuleStates.error;
                });
                this._deferred.promise(this);
            }
        }
        Module.prototype.checkAlias = function (alias) {
            var mod_aliases = this.aliases;
            for (var i = 0, j = mod_aliases.length; i < j; i++) {
                var alias1 = mod_aliases[i];
                if (alias === alias1)
                    return true;
            }
            return false;
        };
        Module.prototype.load = function () {
            var _this = this;
            if (this.status === ModuleStates.completed) {
                this._loading_urls = undefined;
                return this;
            }
            var loading_urls = this._loading_urls;
            if (!loading_urls)
                loading_urls = this._loading_urls = array_clone(this.urls);
            var visitedUrls = [];
            loadModuleRes(loading_urls, "", this, visitedUrls, function (result, error) {
                _this._loading_urls = undefined;
                if (error) {
                    console.error(error);
                    //this._deferred.reject(error);
                }
                else {
                    var ctx = define_context;
                    if (ctx) {
                        ctx.module = _this;
                        ctx.onReady = function (defineResult, dctx) {
                            _this._deferred.resolve(_this.value = defineResult);
                        };
                    }
                    define_context = undefined;
                }
            });
        };
        return Module;
    }());
    var requireModule = new Module("require", requirejs);
    var define_context;
    function define(name, dependences, defination) {
        var modname;
        var deps;
        var nt = typeof name;
        var define_exports = { "__define_exports__": true };
        var dctx = define_context = {
            exports: define_exports,
            modname: modname
        };
        if (nt === "function") {
            defination = name;
            name = undefined;
        }
        else if (nt === "object" && name.length !== undefined && name.push) {
            deps = name;
            defination = dependences;
        }
        requirejs(deps).done(function (values) {
            if (defination) {
                var defineResult = defination.apply(dctx.module || {}, values);
                if (defineResult === undefined) {
                    if (define_exports["default"])
                        defineResult = define_exports["default"];
                }
                if (!defineResult)
                    defineResult = define_exports;
                if (defineResult["default"] === undefined)
                    defineResult["default"] = defineResult;
                if (dctx.onReady)
                    dctx.onReady(defineResult, dctx);
            }
        });
    }
    define.amd = true;
    requirejs.define = define;
    function loadModuleRes(urls, nocache, mod, visitedUrls, callback) {
        var url = urls.shift();
        if (nocache) {
            if (url.indexOf("?") >= 0)
                url += '&';
            else
                url += '?';
            url += "v=" + nocache;
        }
        if (!url)
            callback(undefined, { message: "load failed", urls: visitedUrls });
        loadScript({ url: url }).then(function (res) { return callback({ url: urls, visited: visitedUrls, res: res }); }, function () { return loadModuleRes(urls, nocache, mod, visitedUrls, callback); });
    }
    function loadScript(res) {
        res.elementFactory = function (url) {
            var elem = document.createElement("script");
            elem.type = res["type"] || "text/javascript";
            elem.src = url;
            return elem;
        };
        return loadRes(res);
    }
    var loadRes;
    loadRes = function (res) {
        var elem = res.element = res.elementFactory(res.url);
        var MyPromise = Promise;
        return new MyPromise(function (resolve, reject) {
            if (elem.onreadystatechange !== undefined) {
                elem.onreadystatechange = function () {
                    if (elem.readyState == 4 || elem.readyState == "complete") {
                        resolve(res);
                    }
                };
            }
            else
                elem.onload = function () { return resolve(res); };
            elem.onerror = reject;
            var head = getHead();
            head.appendChild(elem);
        }, 'sync');
    };
    var getHead = function () {
        var head;
        var heads = document.getElementsByTagName("head");
        if (heads && heads.length)
            head = heads[0];
        else if (document.documentElement && document.documentElement.firstChild)
            head = document.documentElement.firstChild;
        else
            head = document.body;
        getHead = function () { return head; };
        return head;
    };
    function array_exists(arr, item) {
        for (var i = 0, j = arr.length; i < j; i++) {
            if (arr[i] === item)
                return true;
        }
        return false;
    }
    function array_clone(arr) {
        var result = [];
        for (var i = 0, j = arr.length; i < j; i++)
            result.push(arr[i]);
        return result;
    }
    function is_url(name) {
        return /^http(s?):\/\//.test(name);
    }
    function extname(url) {
        var dotAt = url.lastIndexOf('.');
        if (dotAt < 0)
            return '';
        var slashAt = url.indexOf('/', dotAt);
        if (slashAt >= 0)
            return '';
        return url.substring(dotAt);
    }
    function trim(text) {
        if (!text)
            return "";
        return text.toString().replace(/(^\s+)|(\s+$)/g, "");
    }
    exports.define = global.define = define;
    exports["default"] = exports.require = global.require = requirejs;
    requirejs["default"] = requirejs;
    return requirejs;
});
