/**
 * Widgets are holders of elements
 * and other Widgets
 */
class Widget {
  locator = null;
  constructor(locator = null) {
    if (locator) {
      this.locator = locator;
    }
  }
  locate() {
    if (this.parent && this.parent.locator) {
      // first locate references View, second cypress
      return this.parent.locate().locate(this.locator);
    } else {
      return cy.locate(this.locator);
    }
  }
  nested(it, ...args) {
    if (it instanceof Widget) {
      // already instanciated object
      it.parent = this;
      return it;
    } else {
      // instanciate it
      const inst = new it(...args);
      inst.parent = this;
      return inst;
    }
  }
}

export { Widget };
