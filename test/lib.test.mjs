import assert from 'node:assert'
import {describe, it} from 'node:test'
import {base64ToBytes, bytesToBase64} from '../src/lib.mjs'

describe('Url-encoded compression lib', () => {
    it('Encodes base64, simple strings', () => {
        const str = 'Hello world'
        const str64 = bytesToBase64(new TextEncoder().encode(str))
        const decodedBytes = base64ToBytes(str64)
        const decoded = new TextDecoder().decode(decodedBytes)
        assert.equal(decoded, str)
    })
})
