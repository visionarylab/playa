import { flow } from 'lodash';
import React, { ReactElement } from 'React';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-test-backend';
import { shallow, render, mount } from 'enzyme';

const rendererMap: { [key: string] : Function} = {
  'shallow': shallow,
  'render': render,
  'mount': mount
};

export enum Renderers {
  shallow = 'shallow',
  render = 'render',
  mount = 'mount',
}

export enum Wrappers {
  Router = 'Router',
  Provider = 'Provider',
  DndProvider = 'DndProvider'
}

// increment based on test fails
const defaultStore = {
  covers: {
    allById: {}
  }
};


const routerWrapper = function(element: ReactElement) {
  return <MemoryRouter>{element}</MemoryRouter>;
}

const providerWrapper = function(element: ReactElement, store: object = defaultStore) {
  const mockedStore = configureMockStore()(store);
  return <Provider store={mockedStore}>{element}</Provider>;
}

const dndProviderWrapper = function(element: ReactElement) {
  return <DndProvider backend={Backend}>{element}</DndProvider>;
}

const wrapperMap: { [key: string] : (...args: any[]) => any} = {
  'Router': routerWrapper,
  'Provider': providerWrapper,
  'DndProvider': dndProviderWrapper
};

export function wrap(renderer: Renderers, ...wrappers: Wrappers[]): Function {
  return (...args: any[]) => rendererMap[renderer](flow(
    wrappers.map(w => wrapperMap[w])
  )(...args));
}

export const shallowInRouter =
  (element: ReactElement) => wrap(Renderers.shallow, Wrappers.Router)(element);
export const renderInRouter =
  (element: ReactElement) => wrap(Renderers.render, Wrappers.Router)(element);
export const mountInRouter =
  (element: ReactElement) => wrap(Renderers.mount, Wrappers.Router)(element);

export const shallowInProvider =
  (element: ReactElement, store: any = {}) => wrap(Renderers.shallow, Wrappers.Provider)(element, store);
export const renderInProvider =
  (element: ReactElement, store: any = {}) => wrap(Renderers.render, Wrappers.Provider)(element, store);
export const mountInProvider =
  (element: ReactElement, store: any = {}) => wrap(Renderers.mount, Wrappers.Provider)(element, store);

export const shallowInDnDProvider =
  (element: ReactElement) => wrap(Renderers.shallow, Wrappers.DndProvider)(element);
export const renderInDnDProvider =
  (element: ReactElement) => wrap(Renderers.render, Wrappers.DndProvider)(element);
export const mountInDnDProvider =
  (element: ReactElement) => wrap(Renderers.mount, Wrappers.DndProvider)(element);

export const shallowInAll = wrap(
  Renderers.shallow,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);

export const renderInAll = wrap(
  Renderers.render,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);

export const mountInAll = wrap(
  Renderers.mount,
  Wrappers.Provider,
  Wrappers.Router,
  Wrappers.DndProvider
);

export const mockRouter = function({
  routeParams = { _id: '1' },
  routeMatch = { url: '/'},
  location = { pathname: '/', search: '' }
}) {
  jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useParams: () => routeParams,
    useRouteMatch: () => routeMatch,
    useLocation: () => location
  }));
}
