// 属性拦截 
// 在设置新属性的时候 去触发 更新函数（update），更新页面
function defineReactive(obj, key, val) {

  observe(val) // 递归监听

  Object.defineProperty(
    obj,
    key,
    {
      set (newVal) {
        console.log('set', newVal)
        if (val !== newVal) {
          val = newVal

          if (typeof newVal == 'object' ) {
            observe(newVal)
          }
        }
      },
      get () {
        console.log('get', val)
        return val // 需要返回，否则嵌套对象将设置值时会报错 obj2.c.num
      }
    }
  )
}

/**
 * observe 对一个对象响应式处理
 */
function observe(obj) {

  if (typeof obj !== 'object' || obj == null) {
    return
  }

  new Observer(obj)
}

function set(obj, key, val) {
  defineReactive(obj, key, val)
}

// 代理转发
function proxy(vm) {
  Object.keys(vm.$data).forEach( item => {
    Object.defineProperty(vm, item, {
      get () { return vm.$data[item] },
      set (newVal) { vm.$data[item] = newVal }
    })
  })
}

class MyVue {
  constructor(options) {
    this.$options = options
    this.$data = options.data
    this.$methods = options.methods
   
    // 响应化处理
    observe(this.$data)

    // 代理 将 data 数据直接绑定在 vue 实例上, 并且响应化处理
    proxy(this)

    new Compile('#app', this)
  }
}

// 编译
/**
 * 遍历节点
 * 元素节点、文本节点
 */
class Compile {
  constructor(el, vue) {

    this.vue = vue
    this.rootNode = document.querySelector(el)

    if (this.rootNode) {
      this.compile(this.rootNode)
    }
  }

  compile = (node) => {

    if (node.childNodes.length > 0) {
      node.childNodes.forEach(item => {

        console.dir(item, 'this.rootNode')
        if (item.nodeType === 1) {
          this.compileText(item)
        } else if(item.nodeType === 3) {

          let reg = /\{\{(.*)\}\}/g

          if (reg.test(item.textContent)) {
            this.text(item, this.vue[RegExp.$1])
          }
        }

        if (item.childNodes) {
          this.compile(item)
        }
      })
    }

  }

  text(node, val) {
    node.textContent = val
  }

  compileText(node) {
    let attrs = node.attributes
    if (attrs) {
      Array.from(attrs).forEach( item => {

        let attrName = item.name
        let attrVal = item.value
        
        if (this.isDirector(attrName)) {
          let dir

          if (this.isEventDirector(attrName)) {
            dir = attrName.substring(1)
          } else {
            dir = attrName.substring(2)
          }

          console.log('dir',dir)
          this[dir] && this[dir](node, attrVal)
          
        }
      })
    }
  }

  click(node, attrVal) {

    console.log('click') 

    node.addEventListener('click', (e) => {
      this.vue[attrVal](e)
    })
  }



  isDirector(dir) {
    return dir.indexOf('v-') > 0
  }

  isEventDirector(dir) {
    console.log(dir, dir.indexOf('@') > 0)
    return dir.indexOf('@') > 0
  }
}
  

/** 
 * Observer
 * 每一个响应式对象，伴生一个 Observer 实例
 * 作用：判断响应式的对象的类型 Array or Object
 */

class Observer {
  constructor(options) {
    
    // 做判断

    this.walk(options)
  }

  walk(obj) {
    Object.keys(obj).forEach(item => defineReactive(obj, item, obj[item]))
  }
}
