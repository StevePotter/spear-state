import { expect } from 'chai'
import { createStore } from '../src'

/*
tests to cover:
- setting a property to null or undefined
- setting a property to a complex object
- handling array.  do we just treat those
- subscribe to changes
*/

describe('getState', () => {
  it('should work', () => {
    const app = createStore()
    expect(app.getState()).to.eql({})

    app.a1.b1 = 4
    expect(app.a1.b1).to.equal(4)
    const stateBefore = app.getState()

    expect(app.getState()).to.eql({ a1: { b1: 4 }})



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
  });
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
