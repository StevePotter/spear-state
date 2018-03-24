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
