import m from 'mithril';
import tagl from 'tagl-mithril';

// prettier-ignore
const { address, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, article, blockquote, dd, dir, div, dl, dt, figcaption, figure, hr, li, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kdm, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, tt, u, wbr, area, audio, img, map, track, video, embed, iframe, noembed, object, param, picture, source, canvas, noscript, script, del, ins, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, button, datalist, fieldset, form, formfield, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, content, element, slot, template } = tagl(m);

let initial = [
    [1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 1],
    [3, 4, 5, 6, 1, 2],
    [4, 5, 6, 1, 2, 3],
    [5, 6, 1, 2, 3, 4],
    [6, 1, 2, 3, 4, 5],
];

const range = (S, N, r = []) => S === N ? r : range(S + (N > S ? 1 : -1), N, [...r, S]);
const use = (v, fn) => fn(v);
const swap = (arr, i, j) => use(arr[i], old_i => (arr[i] = arr[j]) && (arr[j] = old_i));

const swaprows = swap;
const swapcolumns = (field, i, j) => field.forEach(row => swap(row, i, j));

const print = field => console.log(field.map(e => e.join(",")).join("\n"));

// range(0, 1000).forEach(i => {
//     swaprows(initial, Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6));
//     swapcolumns(initial, Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6));
// })


const createMatrix = (NumberOfRows, NumberOfColumns, f) =>
    range(0, NumberOfRows).map(ridx => range(0, NumberOfColumns).map(cidx => f(ridx, cidx)));


initial = createMatrix(6, 6, (r, c) => (r + c) % 6 + 1);

print(initial)

const selection = {
    rowidx: [],
    colidx: []
};

const selectRow = ridx => {
    selection.rowidx.push(ridx);
    if (selection.rowidx.length === 2) {
        swaprows(initial, selection.rowidx[0], selection.rowidx[1])
        selection.rowidx = [];
    }
};

const selectColumn = ridx => {
    selection.colidx.push(ridx);
    if (selection.colidx.length === 2) {
        swapcolumns(initial, selection.colidx[0], selection.colidx[1])
        selection.colidx = [];
    }
};

const rowSelected = i => selection.rowidx.indexOf(i) >= 0;
const colSelected = i => selection.colidx.indexOf(i) >= 0;

m.mount(document.body, {
    view: vnode => [div.banner(
            h1('Fakushitori'),
        ),
        div.wrapper(
            div.board(
                initial.map((row, ridx) => [row.map(element =>
                    div.box(element)
                ), div.checker[rowSelected(ridx) ?
                    'selected' : '']({ onclick: e => selectRow(ridx) })]),

                range(0, 6).map(cidx => div.checker[colSelected(cidx) ?
                    'selected' : '']({ onclick: e => selectColumn(cidx) }))


            ))
    ]
})