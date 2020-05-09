module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_message__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _lib_request_factory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "register", function() { return _lib_request_factory__WEBPACK_IMPORTED_MODULE_1__["register"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "requestFactory", function() { return _lib_request_factory__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "first_screen_name", function() { return _lib_request_factory__WEBPACK_IMPORTED_MODULE_1__["first_screen_name"]; });



let message = new _lib_message__WEBPACK_IMPORTED_MODULE_0__["default"]();
let global_cache = {};
/**
 *
 * @param {页面名字} name
 * @param {页面配置} options
 */
function P(name, options) {
    let methodValidate = ['onPageDataPreloadCallback', 'onPageDataFirstScreenCallback'];
    let methodWrapper = ['onPageDataPreloadCallback', 'onPageDataFirstScreenCallback', 'onPageDataPagingCallback'];
    methodValidate.forEach(val => {
        if (!options[val]) {
            throw new Error(`页面options中缺少 ${val} 方法，请实现`);
        }
    });
    methodWrapper.forEach(val => {
        let former = options[val];
        if (former) {
            options[val] = function () {
                let deltData = former.apply(this, arguments);
                return extend[val].call(this, deltData);
            };
        }
    });
    let requestPageData = options.$requestPageData;
    message.on(`preload:${name}`, () => {
        extend.$onPreload();
    });
    let extend = {
        data: {
            state: '',
        },
        onLoad() {
            let data = this.$take(); // preload的
            let isPreload = true;
            if (!data) {
                if (this.isCacheFirstScreen) {
                    data = this.$getFirstScreen();
                }
                isPreload = false;
            }
            if (data) {
                this.setData({
                    state: data.state
                });
                this.$setOrigin(data.origin);
            }
            // 如果preload失败
            if (!isPreload) {
                this.$requestPageData();
            }
        },
        // 存储数据源，挂载在this上，页面this实例存在的时候调用
        $getOrigin: function () {
            return this._origin;
        },
        $setOrigin: function (origin) {
            this._origin = origin;
        },
        // 获取缓存数据
        $take: function () {
            let data = global_cache[name];
            global_cache[name] = undefined;
            return data;
        },
        $put: function (data) {
            global_cache[name] = data;
        },
        // 首屏数据缓存
        $setFirstScreen: function (data) {
            wx.setStorage({
                key: name,
                data
            });
        },
        $getFirstScreen: function () {
            return wx.getStorageSync(name);
        },
        $onPreload() {
            this.$requestPageData('', true);
        },
        $preload(name) {
            message.emit(`preload:${name}`);
        },
        $retry(extraParam) {
            this.$requestPageData(extraParam);
        },
        // 默认使用first_screen_name这个数据源配置作为首屏，当然用户也可以自己实现$requestPageData去获取自己的数据
        $requestPageData(extraParam, isPreload) {
            (requestPageData || this.$request).call(this, '', extraParam).then(data => {
                let formatted;
                if (isPreload) {
                    formatted = options.onPageDataPreloadCallback(data);
                    if (formatted) {
                        if (formatted.origin && formatted.state) {
                            this.$put(formatted);
                            options.isCacheFirstScreen && this.$setFirstScreen(formatted);
                        }
                    }
                }
                else if (!extraParam) {
                    formatted = this.onPageDataFirstScreenCallback(data);
                    if (formatted) {
                        formatted.origin && this.$setOrigin(formatted.origin);
                        formatted.state && this.setData({
                            state: formatted.state
                        });
                        if (formatted.origin && formatted.state) {
                            this.isCacheFirstScreen && this.$setFirstScreen(formatted);
                        }
                    }
                }
                else {
                    formatted = this.onPageDataPagingCallback(data);
                    if (formatted) {
                        formatted.origin && this.$setOrigin(formatted.origin);
                        formatted.state && this.setData({
                            state: formatted.state
                        });
                    }
                }
            }).catch(err => {
                console.log("[error]", err);
            });
        },
        $request(moduleName, extraParam) {
            return Object(_lib_request_factory__WEBPACK_IMPORTED_MODULE_1__["default"])(name, moduleName, extraParam);
        },
        $paging() {
            let param = this.onBeforePaging();
            this.$requestPageData(param);
        },
        // 重载首屏预加载的数据处理方法
        onPageDataPreloadCallback(data) {
            return data;
        },
        // 重载首屏的数据处理方法
        onPageDataFirstScreenCallback(data) {
            return data;
        },
        // 重载翻页的数据处理方法
        onPageDataPagingCallback(data) {
            return data;
        }
    };
    options.$requestPageData = extend.$requestPageData;
    options.data = Object.assign(Object.assign({}, extend.data), options.data);
    options.onLoad = Wrapper(extend.onLoad, options.onLoad || noop);
    Page(Object.assign(Object.assign({}, extend), options));
}
function Wrapper(before, after) {
    return function () {
        before.apply(this, arguments);
        after.apply(this, arguments);
    };
}
/* harmony default export */ __webpack_exports__["default"] = (P);
 //可以 import {register} ?
function noop() { }


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

function Message() {
    this._evtObjs = {};
    this._outdatedMsgs = {};
}
Message.prototype.on = function (evtType, handler, _once) {
    if (!this._evtObjs[evtType]) {
        this._evtObjs[evtType] = [];
    }
    this._evtObjs[evtType].push({
        handler: handler,
        once: _once
    });
    var that = this;
    return function () {
        that.off(evtType, handler);
    };
};
Message.prototype.wait = function (evtType, handler) {
    if (this._outdatedMsgs[evtType]) {
        handler.apply(null, this._outdatedMsgs[evtType]);
        return noop;
    }
    else {
        // call once
        return this.on(evtType, handler, true);
    }
};
Message.prototype.off = function (evtType, handler) {
    var that = this;
    var types;
    if (evtType) {
        types = [evtType];
    }
    else {
        types = Object.keys(this._evtObjs);
    }
    types.forEach(function (type) {
        if (!handler) {
            // remove all
            that._evtObjs[type] = [];
        }
        else {
            var handlers = that._evtObjs[type] || [], nextHandlers = [];
            handlers.forEach(function (evtObj) {
                if (evtObj.handler !== handler) {
                    nextHandlers.push(evtObj);
                }
            });
            that._evtObjs[type] = nextHandlers;
        }
    });
    return this;
};
Message.prototype.emit = function (evtType) {
    var args = Array.prototype.slice.call(arguments, 1);
    this._outdatedMsgs[evtType] = args;
    var handlers = this._evtObjs[evtType] || [];
    handlers.forEach(function (evtObj) {
        if (evtObj.once && evtObj.called)
            return;
        evtObj.called = true;
        evtObj.handler && evtObj.handler.apply(null, args);
    });
};
Message.prototype.emitAsync = function () {
    var args = arguments;
    var ctx = this;
    setTimeout(function () {
        ctx.emit.apply(ctx, args);
    }, 0);
};
Message.prototype.assign = function (target) {
    var msg = this;
    var fns = ['on', 'off', 'wait', 'emit', 'emitAsync'];
    fns.forEach(function (name) {
        var method = msg[name];
        target[name] = function () {
            return method.apply(msg, arguments);
        };
    });
};
function noop() { }
/**
 *  Global Message Central
 **/
;
(new Message()).assign(Message);
/* harmony default export */ __webpack_exports__["default"] = (Message);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "first_screen_name", function() { return first_screen_name; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "register", function() { return register; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "genDefaultConfig", function() { return genDefaultConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPageConfig", function() { return getPageConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getConfigByName", function() { return getConfigByName; });
let dataCache = {};
let dataConfig;
const first_screen_name = 'FIRST_SCREEN_NAME'; // 首屏配置名称
function register(config) {
    dataConfig = config;
}
/* harmony default export */ __webpack_exports__["default"] = ((name, moduleName, extraParam) => {
    let config = getConfigByName(name, moduleName);
    if (!config) {
        throw new Error(`缺少名字为${name}模块名为${moduleName}的数据源配置`);
    }
    let def = genDefaultConfig();
    let url = config.url;
    let p = config.fixBefore && config.fixBefore(extraParam);
    let promise;
    if (p && p.then) {
        promise = p;
    }
    else {
        promise = Promise.resolve(p);
    }
    return promise.then(param => {
        param = Object.assign(Object.assign({}, def.fixBefore(extraParam)), param);
        let fixAfter = function (data) {
            let res;
            // 如果开发者有提供fixAfter，那就开发者决定是否走到onError，否则框架只会看返回的http错误码来决定
            if (config.fixAfter) {
                let deltData = config.fixAfter(data, param, url);
                res = deltData && deltData[0] ? deltData : def.fixAfter(deltData[1] || data, param, url);
            }
            else if (data && code2xx3xx(data.statusCode)) {
                res = def.fixAfter(data, param, url);
            }
            else {
                res = [data, null];
            }
            return res;
        };
        let onError = function (err) {
            let deltError;
            if (config.onError) {
                deltError = config.onError(err, param, url);
            }
            return def.onError(deltError || err, param, url);
        };
        return new Promise((resolve, reject) => {
            console.log("request param", param);
            let options = Object.assign(Object.assign({ url }, param), { success(res) {
                    console.log("wx.request success", res);
                    let fixedRes = fixAfter(res);
                    if (fixedRes && fixedRes[0]) {
                        options.fail(fixedRes[0]);
                    }
                    else {
                        resolve(fixedRes);
                    }
                },
                fail(err) {
                    console.log("wx.request fail", err);
                    let res = onError(err);
                    resolve(res);
                } });
            // @ts-ignore
            wx.request(options);
        });
    });
});
function code2xx3xx(code) {
    return code >= 200 && code < 400;
}
function genDefaultConfig() {
    return {
        fixBefore(param) {
            // requestParam
            return Object.assign({ data: {}, header: { 'content-type': 'application/json' }, method: 'GET', dataType: 'json', responseType: 'text' }, param);
        },
        fixAfter(data, requestParam, url) {
            let key = genDefaultCacheKey(requestParam, url);
            //持久化缓存
            if (requestParam.isPersistent) {
                // @ts-ignore
                wx.setStorage({
                    key,
                    data
                });
            }
            else {
                dataCache[key] = data;
            }
            return [null, data];
        },
        onError(err, requestParam, url) {
            let key = genDefaultCacheKey(requestParam, url);
            let data = requestParam.isPersistent ? wx.getStorageSync(key) : dataCache[key];
            console.log("【onError 】", data ? `hit cache` : `no cache`, data, err);
            return [data ? null : err, data];
        }
    };
}
function genDefaultCacheKey(param, url) {
    return param.key || `${url}_${JSON.stringify(param)}`;
}
function getPageConfig(name) {
    return dataConfig[name];
}
function getConfigByName(name, moduleName) {
    return getPageConfig(name)[moduleName || first_screen_name];
}


/***/ })
/******/ ]);