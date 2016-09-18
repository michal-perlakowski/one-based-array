import OneBasedArray from '../build/index.js'
import chai from 'chai'
import iterator from 'chai-iterator'
chai.use(iterator)
import things from 'chai-things'
chai.use(things)
import sinon from 'sinon'
const expect = chai.expect

describe('OneBasedArray', () => {
  let arr
  beforeEach(() => {
    arr = new OneBasedArray('a', 'b', 'c')
  })
  describe('basic functionality', () => {
    it('should be an instance of OneBasedArray', () => {
      expect(arr).to.be.an.instanceof(OneBasedArray)
    })
  })
  describe('proxy handlers', () => {
    describe('get', () => {
      it('should return property with n - 1 index for every number n', () => {
        expect([arr[1], arr[2], arr[3]]).to.deep.equal(['a', 'b', 'c'])
      })
      it('should return correct length', () => {
        expect(arr.length).to.equal(3)
      })
      it('should return undefined for properties which don\'t exist', () => {
        expect([arr[-1], arr[0], arr[4], arr.nonexistent]).to.all.equal(undefined)
      })
      it('should work with symbols', () => {
        expect(arr[Symbol.iterator]).to.exist
        expect(arr[Symbol()]).to.be.undefined
      })
    })
    describe('set', () => {
      it('should assign a value to a new property', () => {
        arr[4] = 'd'
        expect(arr[4]).to.equal('d')
      })
      it('should overwrite existing properties', () => {
        arr[1] = 'A'
        expect(arr[1]).to.equal('A')
      })
      it('should work with symbols', () => {
        arr[Symbol.for('test')] = 'symbol'
        expect(arr[Symbol.for('test')]).to.equal('symbol')
      })
    })
    describe('has', () => {
      it('should return true if the array has that key', () => {
        expect([1 in arr, 2 in arr, 3 in arr]).to.all.equal(true)
      })
      it('should return false if the array doesn\'t have that key', () => {
        expect([-1 in arr, 0 in arr, 4 in arr, 'nonexistent' in arr]).to.all.equal(false)
      })
      it('should work with symbols', () => {
        expect(Symbol.iterator in arr).to.be.true
      })
    })
    describe('deleteProperty', () => {
      it('should delete properties', () => {
        Reflect.deleteProperty(arr, 2)
        expect(arr[2]).to.be.undefined
      })
      it('should return false for unconfigurable properties', () => {
        Reflect.defineProperty(arr, 'unconfigurable', {configurable: false, enumerable: false, value: true})
        expect(Reflect.deleteProperty(arr, 'unconfigurable')).to.be.false
        expect(arr.unconfigurable).to.be.true
      })
      it('should work with symbols', () => {
        arr[Symbol.for('test')] = true
        Reflect.deleteProperty(arr, Symbol.for('test'))
        expect(arr[Symbol.for('test')]).to.be.undefined
      })
    })
    describe('ownKeys', () => {
      it('should return all properties of arr', () => {
        expect(Object.getOwnPropertyNames(arr)).to.deep.equal(['1', '2', '3', 'length'])
      })
      it('should return all symbols of arr', () => {
        arr[Symbol.for('test')] = true
        expect(Object.getOwnPropertySymbols(arr)).to.deep.equal([Symbol.for('test')])
      })
    })
    describe('getOwnPropertyDescriptor', () => {
      it('should return a property descriptor for an existing property', () => {
        expect(Reflect.getOwnPropertyDescriptor(arr, '1')).to.deep.equal({
          value: 'a'
         ,writable: true
         ,enumerable: true
         ,configurable: true
        })
      })
      it('should return undefined for a nonexistent property', () => {
        expect(Reflect.getOwnPropertyDescriptor(arr, 'nonexistent')).to.be.undefined
      })
    })
  })
  describe('Symbol.iterator', () => {
    it('should iterate over all elements', () => {
      expect(arr).to.iterate.over(['a', 'b', 'c'])
    })
  })
  describe('Array methods', () => {
    describe('concat', () => {
      it('should concat OneBasedArray object with a regular array', () => {
        expect(arr.concat(['d', 'e', 'f'])).to.deep.equal(new OneBasedArray('a', 'b', 'c', 'd', 'e', 'f'))
      })
      it('should concat OneBasedArray object with another OneBasedArray object', () => {
        expect(arr.concat(new OneBasedArray('d', 'e', 'f'))).to.deep.equal(new OneBasedArray('a', 'b', 'c', 'd', 'e', 'f'))
      })
      it('should concat OneBasedArray with non-array elements', () => {
        expect(arr.concat(true, null, 42, 'd', Symbol.for('test'), {})).to.deep.equal(
          new OneBasedArray('a', 'b', 'c', true, null, 42, 'd', Symbol.for('test'), {})
        )
      })
    })
    describe('includes', () => {
      it('should return true if it includes that element', () => {
        expect([arr.includes('a'), arr.includes('b'), arr.includes('c')]).to.all.equal(true)
      })
      it('should return false if it doesn\'t include that element', () => {
        expect(arr.includes('nonexistent')).to.be.false
      })
      it('should search the array from fromIndex parameter', () => {
        expect(arr.includes('a', 1)).to.be.true
        expect(arr.includes('a', 2)).to.be.false
        expect(arr.includes('a', -3)).to.be.true
        expect(arr.includes('a', -2)).to.be.false
      })
    })
    describe('join', () => {
      it('should return joined array with chosen separator', () => {
        expect(arr.join()).to.equal('a,b,c')
        expect(arr.join(';')).to.equal('a;b;c')
      })
    })
    describe('slice', () => {
      it('should return a copy of array when called without parameters', () => {
        expect(arr.slice()).to.deep.equal(arr)
      })
      it('should return a portion of array starting with specified index', () => {
        expect(arr.slice(2)).to.deep.equal(new OneBasedArray('b', 'c'))
        expect(arr.slice(-1)).to.deep.equal(new OneBasedArray('c'))
      })
      it('should return a portion of array ending with specified index', () => {
        expect(arr.slice(1, 3)).to.deep.equal(new OneBasedArray('a', 'b'))
        expect(arr.slice(1, -2)).to.deep.equal(new OneBasedArray('a'))
      })
    })
    describe('toString, toLocaleString', () => {
      it('should return joined array', () => {
        expect(arr.toString()).to.equal(arr.join())
        expect(arr.toLocaleString()).to.equal(arr.join())
      })
      it('should return empty string for empty array', () => {
        expect(new OneBasedArray().toString()).to.equal('')
        expect(new OneBasedArray().toLocaleString()).to.equal('')
      })
    })
    describe('indexOf', () => {
      it('should return the index of an element if it exists', () => {
        expect(arr.indexOf('a')).to.equal(1)
        expect(arr.indexOf('b')).to.equal(2)
        expect(arr.indexOf('c')).to.equal(3)
      })
      it('should return -1 if the element doesn\'t exist', () => {
        expect(arr.indexOf('nonexistent')).to.equal(-1)
      })
      it('should start searching from the index specified as the second parameter', () => {
        expect(arr.indexOf('b', 2)).to.equal(2)
        expect(arr.indexOf('b', 3)).to.equal(-1)
        expect(arr.indexOf('a', -3)).to.equal(1)
        expect(arr.indexOf('a', -2)).to.equal(-1)
      })
    })
    describe('lastIndexOf', () => {
      beforeEach(() => {
        arr = new OneBasedArray('a', 'b', 'a', 'b')
      })
      it('should return the last index of an element if it exists', () => {
        expect(arr.lastIndexOf('a')).to.equal(3)
        expect(arr.lastIndexOf('b')).to.equal(4)
      })
      it('should return -1 if the element doesn\'t exist', () => {
        expect(arr.lastIndexOf('nonexistent')).to.equal(-1)
      })
      it('should start searching backwards from the index specified as the second parameter', () => {
        expect(arr.lastIndexOf('b', 4)).to.equal(4)
        expect(arr.lastIndexOf('b', 3)).to.equal(2)
        expect(arr.lastIndexOf('a', -4)).to.equal(1)
      })
    })
    describe('copyWithin', () => {
      it('should copy the array to the target index', () => {
        expect(arr.copyWithin(2)).to.deep.equal(new OneBasedArray('a', 'a', 'b'))
      })
      it('should count the target from end, if negative', () => {
        expect(arr.copyWithin(-1)).to.deep.equal(new OneBasedArray('a', 'b', 'a'))
      })
      it('should start copying from the start index', () => {
        expect(arr.copyWithin(3, 2)).to.deep.equal(new OneBasedArray('a', 'b', 'b'))
      })
      it('should count the start index from end, if negative', () => {
        expect(arr.copyWithin(3, -2)).to.deep.equal(new OneBasedArray('a', 'b', 'b'))
      })
      it('should end coping at the end index', () => {
        expect(arr.copyWithin(3, 1, 2)).to.deep.equal(new OneBasedArray('a', 'b', 'a'))
      })
      it('should count the end index from end, if negative', () => {
        expect(arr.copyWithin(2, 1, -1)).to.deep.equal(new OneBasedArray('a', 'a', 'b'))
      })
    })
    describe('fill', () => {
      it('should fill the array with the specified value', () => {
        expect(arr.fill('d')).to.deep.equal(new OneBasedArray('d', 'd', 'd'))
      })
      it('should start filling from the start index', () => {
        expect(arr.fill('d', 2)).to.deep.equal(new OneBasedArray('a', 'd', 'd'))
      })
      it('should count the start index from end, if negative', () => {
        expect(arr.fill('d', -1)).to.deep.equal(new OneBasedArray('a', 'b', 'd'))
      })
      it('should end filling at the end index', () => {
        expect(arr.fill('d', 1, 3)).to.deep.equal(new OneBasedArray('d', 'd', 'c'))
      })
      it('should count the end index from end, if negative', () => {
        expect(arr.fill('d', 2, -1)).to.deep.equal(new OneBasedArray('a', 'd', 'c'))
      })
    })
    describe('pop', () => {
      it('should remove the last element from the array', () => {
        arr.pop()
        expect(arr).to.deep.equal(new OneBasedArray('a', 'b'))
      })
      it('should return the removed element', () => {
        expect(arr.pop()).to.equal('c')
      })
      it('should return undefined when the array is empty', () => {
        expect(new OneBasedArray().pop()).to.be.undefined
      })
    })
    describe('push', () => {
      it('should add one or more elements to the end of the array', () => {
        arr.push('d')
        expect(arr).to.deep.equal(new OneBasedArray('a', 'b', 'c', 'd'))
        arr.push('e', 'f')
        expect(arr).to.deep.equal(new OneBasedArray('a', 'b', 'c', 'd', 'e', 'f'))
      })
      it('should return the new length of the array', () => {
        expect(arr.push('d')).to.equal(4)
        expect(arr.push('e', 'f')).to.equal(6)
      })
    })
    describe('reverse', () => {
      it('should reverse the array', () => {
        arr.reverse()
        expect(arr).to.deep.equal(new OneBasedArray('c', 'b', 'a'))
      })
      it('should return the reversed array', () => {
        expect(arr.reverse()).to.deep.equal(arr)
      })
    })
    describe('shift', () => {
      it('should remove the first element from the array', () => {
        arr.shift()
        expect(arr).to.deep.equal(new OneBasedArray('b', 'c'))
      })
      it('should return the removed element', () => {
        expect(arr.shift()).to.equal('a')
      })
      it('should return undefined when the array is empty', () => {
        expect(new OneBasedArray().shift()).to.be.undefined
      })
    })
    describe('unshift', () => {
      it('should add one or more elements to the beginning of the array', () => {
        arr.unshift('z')
        expect(arr).to.deep.equal(new OneBasedArray('z', 'a', 'b', 'c'))
        arr.unshift('x', 'y')
        expect(arr).to.deep.equal(new OneBasedArray('x', 'y', 'z', 'a', 'b', 'c'))
      })
      it('should return the new length of the array', () => {
        expect(arr.unshift('z')).to.equal(4)
        expect(arr.unshift('x', 'y')).to.equal(6)
      })
    })
    describe('sort', () => {
      it('should sort the array by Unicode code point value when no sorting function is provided', () => {
        arr = new OneBasedArray('b', 'c', 'a')
        arr.sort()
        expect(arr).to.deep.equal(new OneBasedArray('a', 'b', 'c'))
      })
      it('should sort by the provided sorting function', () => {
        arr = new OneBasedArray('battery', 'horse', 'staple', 'correct')
        const order = ['correct', 'horse', 'battery', 'staple']
        arr.sort((a, b) => order[b] - order[a])
      })
      it('should return the sorted array', () => {
        expect(new OneBasedArray('b', 'c', 'a').sort()).to.deep.equal(new OneBasedArray('a', 'b', 'c'))
      })
    })
    describe('splice', () => {
      it('should remove the specified amount of element from the array, starting with the specified index', () => {
        arr.splice(2, 1)
        expect(arr).to.deep.equal(new OneBasedArray('a', 'c'))
      })
      it('should return an array containing the removed elements', () => {
        expect(arr.splice(1, 2)).to.deep.equal(new OneBasedArray('a', 'b'))
      })
      it('should add the specified elements at the start index', () => {
        arr.splice(2, 1, 'B')
        expect(arr).to.deep.equal(new OneBasedArray('a', 'B', 'c'))
      })
      it('should count the start index from end, if negative', () => {
        arr.splice(-2, 2)
        expect(arr).to.deep.equal(new OneBasedArray('a'))
      })
    })
    describe('forEach, every, some, find, findIndex, filter, map', () => {
      it('should execute the function once for each element with this value equal to the provided thisArg', () => {
        for (const method of ['forEach', 'every', 'some', 'find', 'findIndex', 'filter', 'map']) {
          const stub = sinon.stub().returns(method === 'every')
               ,thisArg = {}
          arr[method](stub, thisArg)
          expect(stub.alwaysCalledOn(thisArg)).to.be.true
          expect(stub.args).to.deep.equal([
            ['a', 1, arr]
           ,['b', 2, arr]
           ,['c', 3, arr]
          ])
        }
      })
    })
    describe('filter', () => {
      it('should return the filtered array', () => {
        expect(arr.filter(x => x === 'a' || x === 'b')).to.deep.equal(new OneBasedArray('a', 'b'))
      })
    })
    describe('findIndex', () => {
      it('should return the index of the element, if found', () => {
        expect(arr.findIndex(x => x === 'a')).to.equal(1)
        expect(arr.findIndex(x => x === 'b')).to.equal(2)
        expect(arr.findIndex(x => x === 'c')).to.equal(3)
      })
      it('should return -1 otherwise', () => {
        expect(arr.findIndex(x => x === 'd')).to.equal(-1)
      })
    })
    describe('reduce, reduceRight', () => {
      it('should execute the callback function with appropriate arguments', () => {
        const stub = sinon.stub().returns('')
        arr.reduce(stub)
        arr.reduceRight(stub)
        expect(stub.args).to.deep.equal([
          ['a', 'b', 2, arr]
         ,['', 'c', 3, arr]
         ,['c', 'b', 2, arr]
         ,['', 'a', 1, arr]
        ])
      })
      it('should start counting current index from 1 when initial value is provided', () => {
        const stub = sinon.stub().returns('')
        arr = new OneBasedArray('b')
        arr.reduce(stub, 'a')
        arr.reduceRight(stub, 'a')
        expect(stub.args).to.deep.equal([
          ['a', 'b', 1, arr]
         ,['a', 'b', 1, arr]
        ])
      })
    })
    describe('keys, values, entries', () => {
      it('should return appropriate iterator object', () => {
        expect(arr.keys()).to.iterate.over([1, 2, 3])
        expect(arr.values()).to.iterate.over(['a', 'b', 'c'])
        expect(arr.entries()).to.deep.iterate.over([[1, 'a'], [2, 'b'], [3, 'c']])
      })
    })
  })
})
