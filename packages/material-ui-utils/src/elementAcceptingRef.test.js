/* eslint-disable react/prefer-stateless-function */
import { expect } from 'chai';
import * as PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import elementAcceptingRef from './elementAcceptingRef';

describe('elementAcceptingRef', () => {
  function checkPropType(element, required = false) {
    PropTypes.checkPropTypes(
      { children: required ? elementAcceptingRef.isRequired : elementAcceptingRef },
      { children: element },
      'props',
      'DummyComponent',
    );
  }

  beforeEach(() => {
    PropTypes.resetWarningCache();
  });

  describe('acceptance when not required', () => {
    let rootNode;

    function assertPass(element, options = {}) {
      const { shouldMount = true } = options;

      function testAct() {
        checkPropType(element);
        if (shouldMount) {
          ReactDOM.render(
            <React.Suspense fallback={<p />}>
              {React.cloneElement(element, { ref: React.createRef() })}
            </React.Suspense>,
            rootNode,
          );
        }
      }

      expect(testAct).not.toErrorDev();
    }

    before(() => {
      rootNode = document.createElement('div');
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(rootNode);
    });

    it('accepts nully values', () => {
      assertPass(undefined, { shouldMount: false });
      assertPass(null, { shouldMount: false });
    });

    it('accepts host components', () => {
      assertPass(<div />);
    });

    it('class components', () => {
      class Component extends React.Component {
        render() {
          return null;
        }
      }

      assertPass(<Component />);
    });

    it('accepts pure class components', () => {
      class Component extends React.PureComponent {
        render() {
          return null;
        }
      }

      assertPass(<Component />);
    });

    it('accepts forwardRef', () => {
      const Component = React.forwardRef(() => null);

      assertPass(<Component />);
    });

    it('accepts memo', () => {
      const Component = React.memo('div');

      assertPass(<Component />);
    });

    it('accepts lazy', () => {
      const Component = React.lazy(() =>
        Promise.resolve({ default: (props) => <div {...props} /> }),
      );

      // should actually fail when mounting since the ref is forwarded to a function component
      // but since this happens in a promise our consoleErrorMock doesn't catch it properly
      assertPass(<Component />);
    });

    it('technically allows other exotics like strict mode', () => {
      assertPass(<React.StrictMode />);
    });

    // undesired behavior
    it('accepts Fragment', () => {
      assertPass(<React.Fragment />);
    });
  });

  describe('rejections', () => {
    function assertFail(Component, hint) {
      expect(() => {
        checkPropType(Component);
      }).toErrorDev(
        'Invalid props `children` supplied to `DummyComponent`. ' +
          `Expected an element that can hold a ref. ${hint}`,
      );
    }

    it('rejects undefined values when required', () => {
      expect(() => {
        checkPropType(undefined, true);
      }).toErrorDev('marked as required');
    });

    it('rejects null values when required', () => {
      expect(() => {
        checkPropType(null, true);
      }).toErrorDev('marked as required');
    });

    it('rejects function components', () => {
      const Component = () => null;

      assertFail(
        <Component />,
        'Did you accidentally use a plain function component for an element instead?',
      );
    });
  });
});
