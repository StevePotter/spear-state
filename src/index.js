
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

export function createStore(initialState) {
  return stateNode(0, initialState ? Object.assign({}, initialState) : {}, null, null, 'root')
}



function stateNode(level, propertyValues, parentProxy, parentInternals, name) {
  const fullName = () => {
    return `${name}@d${level}`
  }

  const internals = {
    onChange: (propertyName) => {
      console.log(`${fullName()} onChange for '${propertyName}'`, propertyValues)
      if (childProxies.hasOwnProperty(propertyName)) {
        // the change occured from within a child proxy
        // to enable === checking in changes, we need to do a few chores
        // change propertyValues reference
        // todo: is this redundant at all and should have an edge case for the root?
        propertyValues = Object.assign({}, propertyValues)
        // change inner child reference.
        propertyValues[propertyName] = Object.assign({}, propertyValues[propertyName])
        console.log(`${fullName()} reassigning state and ${propertyName}`)
      } else if (!parentProxy) {
        console.log('need to change asdfasdf' +propertyName)

      }
      if (internals.subscribeCallback) {
        console.log(`${fullName()} notifying of change on '${propertyName}'`, propertyValues)
        internals.subscribeCallback()
      }
      if (parentInternals) parentInternals.onChange(name)
    }
  }

  const childProxies = {}
  let subscribeCallback

  const externalFunctions = {
    toString: () => '[StateNode]',
    // you could just return `propertyValues`
    getState: () => Object.freeze(Object.assign({},propertyValues)),
    subscribe: (callback) => {
      internals.subscribeCallback = callback // todo: multiple callbacks
    },
    // // changes the ent
    // replace: () => {
    //
    // }
  }
  // you can't extend Proxy unfortunately
  const proxy = new Proxy({},
    {
      // prop is the name of the property or indexer ('0')
      get: function(target, prop, receiver) {
        if (externalFunctions.hasOwnProperty(prop)) {
          return externalFunctions[prop]
        }
        // complex child should come before its value so you can drill down further in the object chain
        if (childProxies.hasOwnProperty(prop)) {
          return childProxies[prop]
        }
        if (propertyValues.hasOwnProperty(prop)) {
          console.log(`${fullName()}['${prop}'] with existing value`)
          return propertyValues[prop]
        }
        //
        console.log(`${fullName()}['${prop}'] is new state node`)
        //` proxy: ' + prop, target);
        const childState = {}
        propertyValues[prop] = childState
        const childProxy = stateNode(level + 1, childState, proxy, internals, prop)
        childProxies[prop] = childProxy
        return childProxy
      },

      set(obj, prop, value) {
        // setting a value will set it on the
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
        console.log(`setting ${prop} at level ${level} to ${value}`)
        propertyValues[prop] = value // should you use Reflect.set?
        // if you do const a = app.first.second; const b = a.third; a.third = 12; // then third would have been a proxy first then reassigned as a scalar
        if (childProxies.hasOwnProperty(prop)) {
          console.log('already had child proxy.  deleting it')
          delete childProxies[prop]
        }
        internals.onChange(prop)

        return true
      }
    }
  )
  return proxy
}
