import m from 'mithril';
import tagl from 'tagl-mithril';
import games from './games';

const { min, max } = Math;
const { keys, assign } = Object;
const { h1, div, small, button, p, pre, input } = tagl(m);

const range = (S, N) => {
    const r = [];
    for (let i = S; i < N; i++) r.push(i);
    return r;
}
const flatMap = (arr, fn = e => e) => arr.reduce((acc, e) => acc.concat(fn(e)), []);
const use = (v, fn) => fn(v);
const indicies = (arr, predicate) => arr.map((e, idx) => predicate(e) ? idx : undefined).filter(e => e !== undefined)
const next = (current, array) => use(array.indexOf(current), index => array[(index + 1) % array.length]);
const propArray = obj => keys(obj).map(k => obj[k]);
const isEven = idx => idx % 2 === 0;

const FieldSize = 6;
const ElementNumber = 2 * FieldSize - 1;


const classes = Object.freeze({
    input: 'box',
    horizontal: 'horizontal',
    vertical: 'vertical',
    empty: 'empty'
});

const comparisons = Object.freeze({
    less: 'lt',
    greater: 'gt',
    none: 'none',
});

const comparisonFns = Object.freeze({
    [comparisons.less]: (a, b) => a < b,
    [comparisons.greater]: (a, b) => a > b,
})

const nextChevron = chevron => use(
    propArray(comparisons),
    chevronValues => next(chevron, chevronValues)
);

/**
 * I | I | I | I
 * -   -   -   -
 * I | I | I | I
 * -   -   -   -
 * I | I | I | I
 * -   -   -   -
 * I | I | I | I
 */
const field = range(0, ElementNumber).map(rowIdx =>
    isEven(rowIdx) ?
    range(0, ElementNumber)
    .map(colIdx => isEven(colIdx) ? {
        cls: classes.input,
        value: 0
    } : {
        cls: classes.horizontal,
        comparison: comparisons.none,
        left: { row: rowIdx, col: colIdx - 1 },
        right: { row: rowIdx, col: colIdx + 1 }
    }) :
    range(0, ElementNumber)
    .map(colIdx => isEven(colIdx) ? {
        cls: classes.vertical,
        comparison: comparisons.none,
        left: { row: rowIdx - 1, col: colIdx },
        right: { row: rowIdx + 1, col: colIdx }
    } : {
        cls: classes.empty
    })
);

const value = ({ row, col }) =>
    field[row][col].value;

const checkElement = element =>
    element.comparison === comparisons.none ?
    '' :
    use(value(element.left), vl =>
        use(value(element.right), vr =>
            vl < 1 || vr < 1 ? '' :
            comparisonFns[element.comparison](
                value(element.left),
                value(element.right)
            ) ? '' : 'invalid'
        )
    );

const rowValues = row => range(0, FieldSize).map(col => value({ row, col }));

const distinct = arr => arr.reduce((acc, v) =>
    use(acc[v], (value = 0) => acc[v] = ++value))

const checkRow = r => 0;
const checkRows = () => range(0, FieldSize).every(checkRow);

const chevronClasses = element => {
    if (element.comparison === comparisons.none) {
        return 'none';
    } else if (element.cls === classes.vertical && element.comparison === comparisons.less) {
        return 'chevron.up';
    } else if (element.cls === classes.vertical && element.comparison === comparisons.greater) {
        return 'chevron.down';
    } else if (element.cls === classes.horizontal && element.comparison === comparisons.less) {
        return 'chevron.left';
    } else if (element.cls === classes.horizontal && element.comparison === comparisons.greater) {
        return 'chevron.right';
    }
    console.log('undefined', element)
    return '';
};

m.mount(document.body, {
    view: vnode => [
        div.banner(
            h1('Fakushitori'),
        ),
        div.wrapper(
            div.board(
                field.map(
                    row =>
                    row.map(element =>
                        element.cls === classes.input ?
                        div[element.cls](input({
                            oninput: e => element.value = use(Number(e.target.value), n => n > FieldSize ? FieldSize : n < 1 ? 1 : n)
                        }, element.value)) :
                        element.comparison ?
                        div[chevronClasses(element)][checkElement(element)]({
                            onclick: e => element.comparison = nextChevron(element.comparison)
                        }) :
                        div.empty()
                    )
                ),
            )
        ),
    ]
});