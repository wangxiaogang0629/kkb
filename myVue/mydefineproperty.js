/**
 *  MVVM
 * 三要素：数据响应式、模版引擎及其渲染
 * 数据响应式：Object.defineProperty
 */

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

// demo1
// let obj1 = {}
// defineReactive(obj1, 'a', 10) // 对单个属性进行监听拦截
// obj1.a
// obj1.a = 100


/**
 * observe 对一个对象响应式处理
 */
function observe(obj) {

  if (typeof obj !== 'object' || obj == null) {
    return
  }

  Object.keys(obj).forEach(item => defineReactive(obj, item, obj[item]))
}

// demo2
let obj2 = { a: 2, b: 3, c: { num: 4 } }
observe(obj2)
//demo:
// obj2.a
// obj2.a = 200
// obj2.b
// obj2.b = 300

//demo: 对象嵌套 递归处理响应式
// obj2.c.num = 400

//demo: 设置的新值为对象  将设置的新值响应式处理
// obj2.c = { num: 500 } // 需要对新赋值的对象也进行响应式处理
// obj2.c.num

//demo: 设置新属性 需要将新属性响应式处理 模拟 vue set
// obj2.d = { num: 600 } // 无法设置响应式数据、也需要使用 defineReactive 进行数据设置
// obj2.d
// obj2.d.num

function set(obj, key, val) {
  defineReactive(obj, key, val)
}

set(obj2, 'd', { num: 600 })
obj2.d.num


