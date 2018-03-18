## Spear State - The Easiest State Container

Redux, Mobx, and other state containers are great.  But often they make my brain hurt.  Too much boilerplate and too many concepts.  Of course I want atomic state changes, Redux integration, and immutable state.  But I don't want to 'dispatch actions' and other nonsense to get it done.  I just want to set properties on an object.  

This project, which I call Spear State, is a proof of concept for a state container with the simplest possible API.  Under the hood it uses a little JS magic, but you don't need to worry about that.

THIS IS A WORK IN PROGRESS AND NOT FOR PRODUCTION USE!  It's just a weekend project for now.

## API
```
import { createStore } from 'spear-state'

const appState = createStore()
appState.ui.tab = 'home' // note 'ui' is created automatically from magic
appState.user.name 'Jelly Fish'

```

then, in React, you use a middleware to connect your state container to your components.
If you use react-redux, this should be familiar

```
const mapAppState = (appState) => ({
  tab: appState.ui.tab,
  changeTab: (tab) => { appState.ui.tab = tab }
})
```


### TODO
- **merge:** merge an object into an existing state like `appState.ui.merge({ tabs: { home: 'home' }})`
- **replace:** replace the entire state with a new one `appState.replace({ ui: { tabs: { home: 'home' }}})`
- **transaction**: avoid multiple state change notifications via `appState.transaction(() => {
  appState.ui.tab = 'home'; appState.ui.page = 'main')
  }
`

### License
The MIT License (MIT)

Copyright (c) 2018 Stephen Potter

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
