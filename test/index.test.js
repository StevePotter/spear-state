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
    const a = app.first.second.third = 123
    app.first.second = 555

    expect(app.first.second).to.equal(555)
  })

  it('reassigning properties mutates relevant state objects', () => {
    const app = createStore()

    app.a1.b1.prop1 = 'hi'
    app.a1.b2.prop2 = true
    app.a2.b3 = 23
    app.a3.b4 = 'yo yo'

    const state1 = app.getState()

    // change a1, a1.b2, and a1.b2.prop2
    app.a1.b2.prop2 = false
    const state2 = app.getState()

    // change a2, a2.newField
    app.a2.newField = 'another'
    const state3 = app.getState()
    const state4 = app.getState()

    expect(state1.a2).to.equal(state2.a2)
    expect(state1.a1.b1).to.equal(state2.a1.b1)
    expect(state1.a3).to.equal(state2.a3)
    expect(state2.a3).to.equal(state3.a3)
    expect(state3).to.equal(state4)

    // a1, b2, and prop2 changed
    expect(state1.a1).not.to.equal(state2.a1)
    expect(state1.a1.b2).not.to.equal(state2.a1.b2)
    expect(state2.a2).not.to.equal(state3.a2)
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

  it('keys works', () => {
    const app = createStore()

    app.a1.b1.c1 = 4

    const keys = Object.keys(app)
    for(const i in app) {
      console.log('key', i)
    }
    expect(keys.length).to.equal(1)
    console.log('keeez', keys)
  })

})

// describe('replace', () => {
//   const store = createStore()
//
// })
