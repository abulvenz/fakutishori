const text = 'also das war es, was gefehlt hat. Hier könnte noch so vieles stehen.';

const range = (S, N, r = []) => S === N ? r : range(S + (N > S ? 1 : -1), N, [...r, S]);
const use = (v, fn) => fn(v);

const logistic = (x, r) => r * x * (1 - x);

const key = (N, x = .4) => range(0, N).map(i => x = logistic(x, 3.58)).map(e => e * 1000000).map(e => Math.trunc(e) % 255)

const chunk = (arr, n) => use(arr.map(e => e), copy => {
    let r = [];
    while (copy.length)
        r.push(copy.splice(0, n));
    return r;
});

const toInt = s => range(0, s.length)
    .map(i => s.charCodeAt(i));

const toHex = n => n.map(e => use(e.toString(16), s => (s.length === 1 ? '0' : '') + s)).join('');

const fromHex = n => chunk(n.split(''), 2)
    .map(e => e.join(''))
    .map(e => parseInt(e, 16))
    .map(e => String.fromCharCode(e))
    .join('');

const encrypt = (text = '', keyFn = key) => toHex(use(keyFn(text.length),
    k => toInt(text).map((e, i) => e ^ k[i])));

const decrypt = (cypher = '', keyFn = key) =>
    use(keyFn(cypher.length * 2),
        k => toInt(fromHex(cypher))
        .map((e, i) => e ^ k[i])
        .map(e => String.fromCharCode(e)).join(''));

let cypher = encrypt(text, key);

console.log(cypher)
console.log(text)
console.log(decrypt(cypher, key))