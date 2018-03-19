import chai, { expect } from 'chai'
import spies from 'chai-spies'
import { createStore } from '../src'
chai.use(spies)

/*
tests to cover:
- setting a property to null or undefined
- setting a property to a complex object
- handling array.  do we just treat those
- subscribe to changes
- handle delete operator (or don't)

*/

describe('getState', () => {

  it('setting properties works', () => {
    const app = createStore()
    expect(app.getState()).to.eql({})

    app.a1.b1 = 4
    app.a2 = 'hi'
    app.a3 = null
    // verify via getState
    expect(app.getState()).to.eql({
      a1: { b1: 4 },
      a2: 'hi',
      a3: null,
    })
    // verify via property accessors
    expect(app.a1.b1).to.equal(4)
    expect(app.a2).to.equal('hi')
    expect(app.a3).to.equal(null)
  })

  it('you can reassign an autobject to a scalar value', () => {
    const app = createStore()
    const a = app.first.second
    const b = a.third // third is now an autobject
    a.third = 'third'

    expect(app.first.second.third).to.equal('third')
  })

  it('subscribe works', () => {
    const app = createStore()

    app.a1.b1.c1 = 4
    const stateBefore = app.getState()
    // closest object makes change notification
    const subscribeToRootChange = chai.spy(() => {})
    app.subscribe(subscribeToRootChange)
    const subscribeToLeafChange = chai.spy(() => {})
    app.a1.subscribe(subscribeToLeafChange)
    app.a1.b1.c1 = 5
    const stateAfter = app.getState()

    expect(subscribeToLeafChange).to.have.been.called()
    expect(subscribeToRootChange).to.have.been.called()

    expect(stateBefore.a1).not.to.equal(stateAfter.a1)
    //expect(app.getState()).to.eql({ a1: { b1: 4 }})
  })


    //
    // const three = app.first.second.third // should this be undefined or a Proxy
    // app.first.d4 = []
    // // currently three will be a proxy object
    // const f = three.four
    // three.four = 53
    // three.four = 12
    // console.log(JSON.stringify(app.getState()))
    //console.log(app.first.second.third.four.)
    //s.first.second.third = 55
    //const r = s.first.second.third
    /*
    node level 0 get 'first'
node level 1 get 'second'
setting third at level 2 to 55
*/
    //expect(55).to.equal(55);
//  });
//   it('should work', () => {
//     const app = createStore({ bbb: true })
//     //const result = s.first.second
//
//     const a = app.bbb
//     expect(a).to.equal(true)
//
//     const three = app.first.second.third // should this be undefined or a Proxy
//     app.first.d4 = []
//     // currently three will be a proxy object
//     const f = three.four
//     three.four = 53
//     three.four = 12
//     console.log(JSON.stringify(app.getState()))
//     //console.log(app.first.second.third.four.)
//     //s.first.second.third = 55
//     //const r = s.first.second.third
//     /*
//     node level 0 get 'first'
// node level 1 get 'second'
// setting third at level 2 to 55
// */
//     //expect(55).to.equal(55);
//   });
});
