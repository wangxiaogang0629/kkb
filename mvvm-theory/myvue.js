/**
 * vue 数据渲染、双向数据绑定实现原理
 * 
 * 通过匹配 {{ }} 中间的 key, 将 key 的数据渲染至元素
 * 通过监听 input 事件，在 change 的时候将数据更新至 vue-data， 然后通过 proxy 属性拦截，在属性值变化时更新视图数据
 * 继承 EventTarget 对象，发布由 vue-data 属性值创建的自定义事件
 * 
 * hasOwnProperty(property)     检测元素是否存在某一属性
 * childNodes
 * attributes
 * nodeType                     判断节点
 * RegExp.$1                    $1 正则匹配的第一个字符
 */
class Vue extends EventTarget{
  constructor(props) {
    super()
    this.props = props
    this.data = props.data
    this.el = document.querySelector(props.el)
    this.createElement(this.el)
    this.observer()
  }

  observer() {

    this.data = new Proxy(this.data, {
      set: (traget, property, value) => {

        let event = new CustomEvent(property, {
          detail: value
        })
        this.dispatchEvent(event) // 自定义事件 发布
        return Reflect.set(...arguments)
      }
    })
  }


  createElement(el) {
    let { data } = this;
    let childs = el.childNodes;

    [...childs].forEach(element => { // ...
      
      if (element.nodeType === 3) {
        console.log('文本节点')

        let text = element.textContent
        let reg = /\{\{\s*([^\s\{\}]+)\s*\}\}/g

        if (reg.test(text)) {
          let $1 = RegExp.$1
          element.textContent = text.replace(reg, data[$1])

          this.addEventListener($1, e => { // 监听自定义事件
            element.textContent = text.replace(reg, e.detail)
          })
        }

      } else if (element.nodeType === 1) {
        console.log('元素节点')

        let attrs = element.attributes
        if (attrs.hasOwnProperty('v-model')) {
          
          let keyName = attrs['v-model'].value
          element.value = this.data[keyName]

          element.addEventListener('input', e => {
            this.data[keyName] = e.target.value
          })
        }

        this.createElement(element)
      }

    });

  }
}