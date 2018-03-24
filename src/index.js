
/*

The main feature of this state container is to let you change the state by just using normal JS dot syntax:

const app = createStore()
app.a.b.c1 = 1

// from the user perspective, 'a' and 'b' are objects that were created on demand
// then when you do
app.a.b.c2 = 2
// it will cause a change to be triggered up the object tree, resulting in a new 'a' and 'b' objects



each node keeps two maps:
child proxies
the child properties that have been set, including objects from proxies

1) you should be able to drill down into a path and it just works:
state.ui.thing.do.that = 2
2) you can deep assign
state.ui.thing = { do: { tahat: 2 }}

an example would be:
appState.ui.example = 'one two'

That would result in first appSate, then appState.ui


Structure:
- if a scalar is assigned to a leaf node, it's value is kept inside the parent proxy
- if a node is unassigned, it is treated as an object.  like createStore().one.two - two is a proxy object and can be assigned to

to do this, you have nodes in a tree.  intermediate nodes use a Proxy

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
random notes:
in Proxy get trap, an array index is passed in as a string, like '0'
would be nice to bulk change for react performance
*/

const DEBUG = false

export function createStore(initialState) {
  return stateNode(0, initialState ? Object.assign({}, initialState) : {}, null, 'root').proxy
}

// a stateNode represents an object in the state that has child intialProperties
// it is simply an object
function stateNode(level, intialProperties, parentNode, name) {
  const fullName = () => {
    return `${name}@d${level}`
  }

  // since you can't inherit from Proxy, there are some odd patterns, but this includes everything needed for statenodes to communicate
  // the .proxy is set down below
  const node = {
    onChange: (propertyName, value) => {
      if (DEBUG) console.log(`${fullName()} onChange for '${propertyName}'`, node.propertyValues)

      if (!node.propertyValues.hasOwnProperty(propertyName)) throw new Error(`Prop ${propertyName} not available`)
      // replace propertyValues with a clone that includes the new property.
      // this allows us to compare states using ===.  this part is critical, and is similar to how reducers reassign state in Redux
      const newValues = Object.assign({}, node.propertyValues)
      newValues[propertyName] = value
      node.propertyValues = newValues

      if (node.listeners && node.listeners.length) {
        if (DEBUG) console.log(`${fullName()} notifying of change on '${propertyName}'`, node.propertyValues)
        node.listeners.forEach(function(listener) { listener() })
      }
      if (parentNode) parentNode.onChange(name, newValues)
    },
    detach: () => {
      parentNode = null // this should be all we need to orphan the branch starting here.  this in essence turns it into a root node detached from the app state
    },
    childStateNodes: {},
    propertyValues: intialProperties,
  }

  // functions exposed to the proxy
  const proxyFunctions = {
    toString: () => '[StateNode]',
    getState: () => node.propertyValues, // the problem here is that you could end up with someone mutating the state.  not good.  maybe have two copies, an internal one and a public one
    subscribe: (callback) => {
      if (node.listeners) {
        node.listeners.push(callback)
      } else {
        node.listeners = [callback]
      }
    }
  }

  // you can't extend Proxy and setting values on it will result in 'get' being called, so leave proxy alone
  // instead, use 'node'
  const proxy = new Proxy({},
    {
      // prop is the name of the property or indexer ('0')
      get: function(target, prop, receiver) {
        if (proxyFunctions.hasOwnProperty(prop)) {
          return proxyFunctions[prop]
        }
        // complex child should come before its value so you can drill down further in the object chain
        if (node.childStateNodes.hasOwnProperty(prop)) {
          return node.childStateNodes[prop].proxy
        }
        // typically scalar values, including null
        if (node.propertyValues.hasOwnProperty(prop)) {
          if (DEBUG) console.log(`${fullName()}['${prop}'] with existing value`)
          return node.propertyValues[prop]
        }
        // property has never been accessed, so assume it's a new proxy
        if (DEBUG) console.log(`${fullName()}['${prop}'] is new state node`)
        const childState = {}
        node.propertyValues[prop] = childState
        const childNode = stateNode(level + 1, childState, node, prop)
        node.childStateNodes[prop] = childNode
        return childNode.proxy
      },

      // TODO: recursively assign objects as statenodes
      set(obj, prop, value) {
        // setting a value will set it on the
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
        if (DEBUG) console.log(`setting ${prop} at level ${level} to ${value}`)
        // if you do const a = app.first.second; const b = a.third; a.third = 12; // then third would have been a proxy first then reassigned as a scalar
        if (node.childStateNodes.hasOwnProperty(prop)) {
          if (DEBUG) console.log('already had child proxy.  deleting it')
          delete node.childStateNodes[prop]
        }
        node.propertyValues[prop] = value // should you use Reflect.set?
        node.onChange(prop, value)

        return true
      },

      has (target, key) {
        return node.propertyValues.hasOwnProperty(key)
      },

      getPrototypeOf(target) {
        return Object.getPrototypeOf(node.propertyValues)
      },

      getOwnPropertyDescriptor(target, prop) {
        return Object.getOwnPropertyDescriptor(node.propertyValues, prop)
      },

      ownKeys (target) {
        return Object.keys(node.propertyValues)
      }
    }
  )

  node.proxy = proxy
  return node
}
