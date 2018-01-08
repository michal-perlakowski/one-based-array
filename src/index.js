const disableHandlersList = new WeakSet();

const mapIterator = f => iterator => ({
  next() {
    const next = iterator.next();
    return {
      value: next.done ? undefined : f(next.value),
      done: next.done,
    };
  },
  [Symbol.iterator]() {
    return this;
  },
});

const convertMethod = (method, target) => {
  const decrementIfPositive = number => (number > 0 ? number - 1 : number);
  const transformArgsMap = {
    concat: (...args) => args.map(x => (x instanceof target.constructor ? Array.from(x) : x)),
    includes: (searchElement, fromIndex = 1) => [searchElement, decrementIfPositive(fromIndex)],
    slice: (begin, end) => [decrementIfPositive(begin), decrementIfPositive(end)],
    indexOf: (searchElement, fromIndex = 1) => [searchElement, decrementIfPositive(fromIndex)],
    lastIndexOf: (searchElement, fromIndex = Infinity) =>
      [searchElement, decrementIfPositive(fromIndex)],
    copyWithin: (...args) => args.map(decrementIfPositive),
    fill: (value, start = 1, end = target.length + 1) =>
      [value, decrementIfPositive(start), decrementIfPositive(end)],
    splice: (start, ...rest) => [decrementIfPositive(start), ...rest],
    reduce: (callback, ...rest) => [(a, b, i, array) =>
      callback(a, b, i + 1, Reflect.construct(target.constructor, array)),
    ...rest],
  };
  transformArgsMap.reduceRight = transformArgsMap.reduce;
  const callbackList = ['forEach', 'every', 'some', 'find', 'filter', 'findIndex', 'map'];
  const convertReturnedValueList = ['concat', 'slice', 'copyWithin', 'fill', 'reverse', 'sort', 'splice', 'filter', 'map'];
  const indexOfList = ['indexOf', 'lastIndexOf', 'findIndex'];
  const generators = {
    keys: mapIterator(i => i + 1),
    entries: mapIterator(([i, x]) => [i + 1, x]),
  };
  return (...args) => {
    disableHandlersList.add(target);

    let transformedArgs = args;
    if (Object.prototype.hasOwnProperty.call(transformArgsMap, method)) {
      transformedArgs = transformArgsMap[method](...args);
    } else if (callbackList.includes(method)) {
      transformedArgs = [(currentValue, index, array) => Reflect.apply(
        args[0], args[1],
        [currentValue, index + 1, Reflect.construct(target.constructor, array)],
      )];
    }

    let result = Reflect.apply(target[method], target, transformedArgs);
    if (convertReturnedValueList.includes(method)) {
      result = Reflect.construct(target.constructor, Array.from(result));
    } else if (indexOfList.includes(method)) {
      result = result === -1 ? result : result + 1;
    } else if (Object.prototype.hasOwnProperty.call(generators, method)) {
      result = generators[method](result);
    }

    disableHandlersList.delete(target);

    return result;
  };
};
export default class OneBasedArray extends Array {
  constructor(...args) {
    super(...args);

    const convertHelper = (property, back = false) => {
      if (typeof property === 'symbol') return property;
      const parsed = parseInt(property, 10);
      const maxArrayLength = 4294967295;
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)
      && parsed >= 0 && parsed <= maxArrayLength) {
        return back ? String(parsed + 1) : parsed - 1;
      }
      return property;
    };
    const convertProperty = property => convertHelper(property);
    const convertBack = property => convertHelper(property, true);

    return new Proxy(this, {
      get(target, property, receiver) {
        const methodList = ['concat', 'includes', 'join', 'slice', 'toString', 'toLocaleString', 'indexOf', 'lastIndexOf',
          'copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'unshift', 'sort', 'splice', 'forEach', 'every', 'some',
          'find', 'filter', 'findIndex', 'map', 'reduce', 'reduceRight', 'keys', 'values', 'entries'];
        return methodList.includes(property)
          ? convertMethod(property, target)
          : Reflect.get(target, convertProperty(property), receiver);
      },
      set(target, property, value, receiver) {
        disableHandlersList.add(target);
        const result = Reflect.set(target, convertProperty(property), value, receiver);
        disableHandlersList.delete(target);
        return result;
      },
      has(target, property) {
        return Reflect.has(target, convertProperty(property));
      },
      deleteProperty(target, property) {
        return Reflect.deleteProperty(target, convertProperty(property));
      },
      ownKeys(target) {
        return Reflect.ownKeys(target).map(convertBack);
      },
      getOwnPropertyDescriptor(target, property) {
        const prop = disableHandlersList.has(target) ? property : convertProperty(property);
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
    });
  }
  values() {
    return mapIterator((([, x]) => x))(this.entries());
  }
  [Symbol.iterator]() {
    return this.values();
  }
}
