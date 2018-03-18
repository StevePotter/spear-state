
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

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

Structure:
- if a scalar is assigned to a leaf node, it's value is kept inside the parent proxy
- if a node is unassigned, it is treated as an object.  like createStore().one.two - two is a proxy object and can be assigned to
- console.log is not working because the object returned
- ideall

to do this, you have nodes in a tree.  intermediate nodes use a Proxy

{
   first: {
    __info: {}

  }

}


*/


export function createStore(initialState) {
  return stateNode(0, initialState || {}, null, 'root')
}



function stateNode(level, baseState, parentProxy, name) {
  const childProxies = {}
  const builtInFunctions = {
    toString: () => '[StateNode]',
    getState: () => baseState
  }
  const fullName = () => {
    return `${root}@d${level}`
  }
  // you can't extend Proxy unfortunately
  const proxy = new Proxy(baseState,
    {
      // prop is the name of the property or indexer ('0')
      get: function(target, prop, receiver) {
        if (builtInFunctions.hasOwnProperty(prop)) {
          return builtInFunctions[prop]
        }
        // complex child should come before its value so you can drill down further in the object chain
        if (childProxies.hasOwnProperty(prop)) {
          return childProxies[prop]
        }
        if (baseState.hasOwnProperty(prop)) {
          console.log(`${fullName()}['${prop}'] with existing value`)
          return baseState[prop]
        }
        //
        console.log(`${fullName()}['${prop}'] is new state node`)
        //` proxy: ' + prop, target);
        const childState = {}
        baseState[prop] = childState
        const childProxy = stateNode(level + 1, childState, proxy, prop)
        childProxies[prop] = childProxy
        return childProxy
      },

      set(obj, prop, value) {
        // setting a value will set it on the
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
        console.log(`setting ${prop} at level ${level} to ${value}`)
        baseState[prop] = value // should you use Reflect.set?
        // if you do const a = app.first.second; const b = a.third; a.third = 12; // then third would have been a proxy first then reassigned as a scalar
        if (childProxies.hasOwnProperty(prop)) {
          console.log('already had child proxy.  deleting it')
          delete childProxies[prop]
        }
        return true
      }
    }
  )
  // proxy.toString = Function.prototype.toString.bind('hi')
  // proxy.zzz = 3
  return proxy
}

//
// function getChild(parent, prop) {
//   return new Proxy(parent,
//     {
//       // prop is the name of the property or indexer ('0')
//       get: function(target, prop, receiver) {
//
//         console.log('child proxy: ' + prop, target);
//         return getChild(target, prop)
//       }
//     }
//   )
// }
