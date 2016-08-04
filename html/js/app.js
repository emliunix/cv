(function(global) {
    /* translater */

    global.translate = function translate(jsobj) {
        if (typeof jsobj === "object") {
            if (Array.isArray(jsobj)) { // its an object
                return jsobj.map(translate)
            }
            return translateObj(jsobj)
        }
        return jsobj
    }

    function objTryGet(obj, prop, defVal) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return obj[prop]
        } else {
            return defVal
        }
    }

    function translateObj(obj) {
        var newobj = Object.create(null)
        for (var k of Object.keys(obj)) {
            newobj[objTryGet(mapping, k, k)] = obj[k]
        }
    }

    var mapping = {
        "web": "Web",
        "name": "姓名",
        "misc": "其他",
        "e-mail": "邮箱",
        "skills": "技能",
        "gender": "性别",
        "age": "年龄",
        "programming": "编程语言",
        "phone": "联系电话",
        "personalData": "个人信息",
        "residence": "居住地",
        "education": "教育经历"
    }
})(this);

/* templateloader */
(function(global) {
    function getTemplate(name, url, tag) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest()
            xhr.open("get", url)
            xhr.onload = (e) => {
                resolve({ name, value: xhr.responseText, tag })
            }
            xhr.onerror = (e) => {
                reject(e)
            }
            xhr.send()
        })
    }
    global.loadTemplates = function loadTemplates(Vue, configs) {
        return new Promise(function(res, rej) {
            Promise.all(configs.map(({name, path, config}) => getTemplate(name, path, config)))
            .then(function(templs) {
                templs.forEach(({name, value, tag}) => {
                    tag.template = value
                    Vue.component(name, tag)
                }, this)
                res()
            })
        })
    }
})(this);

/**
 * App logic
 */

(function(global){
    var Vue = global.Vue
    var components = [
        {
            name: "Resume",
            config: {
                props: [ "sidebar", "sections"]
            }
        },{
            name: "Sidebar",
            config: {
                props: ["avatarsrc", "basic", "extra"]
            }
        },{
            name: "Avatar",
            config: {
                props: ["imgsrc"]
            }
        },{
            name: "BasicInfo",
            config: {
                props: ["name", "phone", "email", "github"],
                methods: {
                    githubUrl: function(github) {
                        var result = /github:\/\/(.*)/.exec(github)
                        if (result && result[1]) {
                            return "http://github.com/" + result[1]
                        }
                        return "#"
                    }
                }
            }
        },{
            name: "ExtraInfo",
            config: {
                props: ["data"]
            }
        },{
            name: "Info",
            config: {
                props: ["title", "type", "data", "level"],
                computed: {
                    "display": function() {
                        if(this.type === "prop") {
                            return this.data
                        } else if(this.type === "list") {
                            return this.data.map(function(item){
                                return '<span class="info-list-item">' + item + '</span>'
                            }).join("")
                        } else {
                            return void 0;
                        }
                    }
                }
            }
        },{
            name: "HistorySection",
            config: {
                props: ["title", "items"]
            }
        },{
            name: "Item",
            config: {
                props: ["date", "main", "sub", "note"]
            }
        },{
            name: "TextSection",
            config: {
                props: ["title", "text"]
            }
        },
    ]

    components.forEach(function(c) {
        c.path = "./templates/" + c.name + ".html"
    })

    function setup(data) {
        var app = global.app = new Vue({
            el: "#app",
            data: data
        })
    }

    global.loadTemplates(Vue, components)
        .then(function () {
            var xhr = new XMLHttpRequest()
            xhr.open("get", "./data.json")
            xhr.onload = function (e) {
                var data = JSON.parse(e.target.responseText)
                setup(data)
            }
            xhr.send()
        })
})(this);