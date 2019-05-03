const inflight = require('./inflight')

describe('inflight()', () => {
  it('calls a single doFly()', async () => {
    const doFly = jest.fn()
    await inflight('unique-key', doFly)
    expect(doFly).toHaveBeenCalled()
  })

  it('calls multiple doFly()', async () => {
    const req = jest.fn((key) => {
      return inflight(key, () => {
        return new Promise(resolve => {
          setTimeout(resolve(key), 50)
        })
      })
    })

    const result = await Promise.all([
      req('hello'),
      req('hello'),
    ])
    expect(result).toEqual(['hello', 'hello'])
  })

  it('calls doFly() only once if it is in progress', async () => {
    let calls = 0
    const req = jest.fn((key) => {
      return inflight(key, () => {
        return new Promise(resolve => {
          calls++
          setTimeout(resolve(42), 10000)
        })
      })
    })

    const result = await Promise.all([
      req('hello'),
      req('hello'),
    ])
    expect(result).toEqual([42, 42])
    expect(calls).toEqual(1)
  })
  
  it('calls doFly() again after it is settled', async () => {
    let calls = 0
    const req = jest.fn((key) => {
      return inflight(key, () => {
        return new Promise(resolve => {
          calls++
          setTimeout(resolve(calls + 100), 10000)
        })
      })
    })

    const firstResult = await req('hello')
    expect(firstResult).toEqual(101)
    const secondResult = await req('hello')
    expect(secondResult).toEqual(102)
  })

  it('can handle `unique` that is a promise', async () => {
    const doFly = jest.fn()
    await inflight(Promise.resolve('unique-key'), doFly)
    expect(doFly).toHaveBeenCalled()
  })

  it('can handle `unique` that is an array', async () => {
    const doFly = jest.fn()
    await inflight(Promise.resolve(['unique', 'key']), doFly)
    expect(doFly).toHaveBeenCalled()
  })
  
  it('can handle `unique` that is an array of promises', async () => {
    const doFly = jest.fn()
    await inflight([Promise.resolve('unique'), Promise.resolve('key')], doFly)
    expect(doFly).toHaveBeenCalled()
  })
})