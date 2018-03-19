
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


function stateNode(level, intialProperties, parentInternals, name) {
  const fullName = () => {
    return `${name}@d${level}`
  }

  // since you can't inherit from Proxy, there are some odd patterns, but this includes everything needed for statenodes to communicate
  // the .proxy is set down below
  const internals = {
    onChange: (propertyName) => {
      if (DEBUG) console.log(`${fullName()} onChange for '${propertyName}'`, internals.propertyValues)
      if (internals.childStateNodes.hasOwnProperty(propertyName)) {
        // the change occured from within a child proxy
        // to enable === checking in changes, we need to do a few chores
        // change propertyValues reference
        // todo: is this redundant at all and should have an edge case for the root?
        internals.propertyValues = Object.assign({}, internals.propertyValues)
        // change inner child reference.
        internals.propertyValues[propertyName] = Object.assign({}, internals.propertyValues[propertyName])
        if (DEBUG) console.log(`${fullName()} reassigning state and ${propertyName}`)
      } else if (!parentInternals) {
        if (DEBUG) console.log('need to change asdfasdf' +propertyName)
      }
      if (internals.listeners && internals.listeners.length) {
        if (DEBUG) console.log(`${fullName()} notifying of change on '${propertyName}'`, internals.propertyValues)
        internals.listeners.forEach(function(listener) { listener() })
      }
      if (parentInternals) parentInternals.onChange(name)
    },
    detach: () => {
      parentInternals = null // this should be all we need to orphan the branch starting here.  this in essence turns it into a root node detached from the app state
    },
    childStateNodes: {},
    propertyValues: intialProperties,
  }

  const externalFunctions = {
    toString: () => '[StateNode]',
    // you could just return `propertyValues`
    getState: () => Object.freeze(Object.assign({},internals.propertyValues)),
    subscribe: (callback) => {
      if (internals.listeners) {
        internals.listeners.push(callback)
      } else {
        internals.listeners = [callback]
      }
    },
    replace: (newState) => {
      // TODO: ensure newState is an object

      if (internals.childStateNodes) {
        Object.values(internals.childStateNodes).forEach((child) => child.internals.detach())
        internals.childStateNodes = {}
      }
      internals.propertyValues = {}
      for(const key in newState) {
        internals.proxy[key] = newState[key]
      }
    }
  }

  // you can't extend Proxy unfortunately
  // TODO: should you make the
  const proxy = new Proxy({},
    {
      // prop is the name of the property or indexer ('0')
      get: function(target, prop, receiver) {
        const ptempdeleteme = parentInternals
        const nametempdeleteme = name
        if (externalFunctions.hasOwnProperty(prop)) {
          return externalFunctions[prop]
        }
        // complex child should come before its value so you can drill down further in the object chain
        if (internals.childStateNodes.hasOwnProperty(prop)) {
          return internals.childStateNodes[prop].proxy
        }
        // typically scalar values, including null
        if (internals.propertyValues.hasOwnProperty(prop)) {
          if (DEBUG) console.log(`${fullName()}['${prop}'] with existing value`)
          return internals.propertyValues[prop]
        }
        // property has never been accessed, so assume it's a new proxy
        if (DEBUG) console.log(`${fullName()}['${prop}'] is new state node`)
        const childState = {}
        internals.propertyValues[prop] = childState
        const childNode = stateNode(level + 1, childState, internals, prop)
        internals.childStateNodes[prop] = childNode
        return childNode.proxy
      },

      // TODO: recursively assign objects as statenodes
      set(obj, prop, value) {
        // setting a value will set it on the
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
        if (DEBUG) console.log(`setting ${prop} at level ${level} to ${value}`)
        internals.propertyValues[prop] = value // should you use Reflect.set?
        // if you do const a = app.first.second; const b = a.third; a.third = 12; // then third would have been a proxy first then reassigned as a scalar
        if (internals.childStateNodes.hasOwnProperty(prop)) {
          if (DEBUG) console.log('already had child proxy.  deleting it')
          delete internals.childStateNodes[prop]
        }
        internals.onChange(prop)

        return true
      }
    }
  )
  internals.proxy = proxy
  return internals
}
