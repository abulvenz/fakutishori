import m from "mithril";
import tagl from "tagl-mithril";

// prettier-ignore
const { address, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, article, blockquote, dd, dir, div, dl, dt, figcaption, figure, hr, li, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kdm, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, tt, u, wbr, area, audio, img, map, track, video, embed, iframe, noembed, object, param, picture, source, canvas, noscript, script, del, ins, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, button, datalist, fieldset, form, formfield, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, content, element, slot, template } = tagl(m);

const N = 5;

const range = (n, res = []) => (
    n <= 0 ?
    res :
    range(n - 1, [...res, res.length])
);

const field = range(N * N).map(() => range(8)[Math.trunc(Math.random() * 8)]);
const coord = (idx) => ({ row: Math.trunc(idx / N), col: idx % N });
const index = ({ row, col }) => row * N + col;
const onBoard = ({ row, col }) => row >= 0 && row < N && col >= 0 && col < N;

/*
0->right       row . 0 col + 1
1->down right  row + 1 col + 1
2->down        row + 1 col . 0
3->down left   row + 1 col - 1
4->left        row . 0 col - 1
5->up left     row - 1 col - 1
6->up          row - 1 col . 0
7->up right    row - 1 col + 1
*/
const move = ({ row, col }, direction) => ({
    row: (direction < 4 ? 1 : -1) *
        (direction % 4 === 0 ? 0 : 1) + row,
    col: (direction < 2 || direction > 6 ? 1 : -1) *
        (direction === 2 || direction === 6 ? 0 : 1) + col
});

const use = (v, fn) => fn(v);
const walk = (start, direction, cb) =>
    use(move(start, direction), nPos =>
        onBoard(nPos) ? [
            cb(index(nPos)),
            walk(nPos, direction, cb)
        ] : null);

const selection = [];
const selected = (i) => selection.indexOf(i) >= 0;

const toggleSelection = (i) =>
    (selection.indexOf(i) >= 0) ?
    selection.splice(selection.indexOf(i), 1) :
    selection.push(i);

const direction = (i) => field[i];

const walkNSelect = (i) => use(
    coord(i),
    p => walk(p, direction(i), toggleSelection)
);

const arrow = (vnode) => ({
    view: ({ attrs: { rot = 0 } }) =>
        m("svg", { "height": "80", "width": "80" },
            m("g", {
                    transform: `rotate(${rot*45} 40,40)`,
                    "fill": "none",
                    "stroke": "white",
                    "stroke-width": "6"
                },
                m("path", { "stroke-linecap": "round", "d": "M5 40 l60 0" }),
                m("path", { "stroke-linecap": "round", "d": "M75 40 l-20 -10" }),
                m("path", { "stroke-linecap": "round", "d": "M75 40 l-20 10" })
            )
        )
});

range(1000)
    .map(() => Math.trunc(Math.random() * N * N))
    .map(walkNSelect);

m.mount(document.body, {
    view: (vnode) => div.container(div(), div(h1("Black Out")), div(), div(), div.field(
        field.map((n, i) =>
            div[selected(i) ? "selected" : ""].box({
                    onclick: e => [
                        walkNSelect(i),

                    ]
                },
                m(arrow, { rot: n })
            ))
    ))
});