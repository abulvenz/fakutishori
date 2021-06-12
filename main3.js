import m from "mithril";
import tagl from "tagl-mithril";

// prettier-ignore
const { address, aside, footer, header, h1, h2, h3, h4, h5, h6, hgroup, main, nav, section, article, blockquote, dd, dir, div, dl, dt, figcaption, figure, hr, li, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kdm, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, tt, u, wbr, area, audio, img, map, track, video, embed, iframe, noembed, object, param, picture, source, canvas, noscript, script, del, ins, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr, button, datalist, fieldset, form, formfield, input, label, legend, meter, optgroup, option, output, progress, select, textarea, details, dialog, menu, menuitem, summary, content, element, slot, template } = tagl(m);
const { svg, g, path } = tagl(m);

const N = 5;
let angleOffset = 0;

const range = (n, res = []) => (
    n <= 0 ?
    res :
    range(n - 1, [...res, res.length])
);
const use = (v, fn) => fn(v);
const all = (...f) => f.map((f2) => f2());
const createField = () => use(range(8), (p_) => range(N * N)
    .map(() => p_[Math.trunc(Math.random() * 8)]));

let field = createField();
const coord = (idx) => ({ row: Math.trunc(idx / N), col: idx % N });
const index = ({ row, col }) => row * N + col;
const onBoard = ({ row, col }) => row >= 0 && row < N && col >= 0 && col < N;
/* Direction encoding
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
const walk1 = (start, direction, cb) =>
    use(move(start, direction), nPos =>
        onBoard(nPos) ? [
            cb(index(nPos)),
            walk(nPos, direction, cb)
        ] : null);

const walk2 = (start, direction, cb) =>
    all(() => cb(index(start)),
        () =>
        use(move(start, direction), nPos =>
            onBoard(nPos) ? [
                walk(nPos, direction, cb)
            ] : null));

const walks = [walk1, walk2];
let walk = walk1;


let solution = [];
const selection = [];
const selected = (i) => selection.indexOf(i) >= 0;
const solves = (i) => solution.indexOf(i) >= 0;
const won = () => selection.length === 0;
const toggleSelection = (i) =>
    (selection.indexOf(i) >= 0) ?
    selection.splice(selection.indexOf(i), 1) :
    selection.push(i);

const direction = (i) => field[i];
const walkNSelect = (i) =>
    walk(coord(i), direction(i), toggleSelection);

const flatten = (arr) => (arr || []).reduce((a, v) => a.concat(v), []);

const newGame = () => [
    field = createField(),
    range(100)
    .map(() => Math.trunc(Math.random() * N * N))
    .map(walkNSelect)
];
newGame();
setInterval(() => [won() ? angleOffset += 3 : angleOffset = 0] && m.redraw(), 10);

const arrow = (vnode) => ({
    view: ({ attrs: { rot = 0 } }) =>
        svg({ "height": "40", "width": "40" },
            g({
                    transform: `scale(.5)rotate(${rot*45+angleOffset} 40,40)`,
                    "fill": "none",
                    "stroke": "white",
                    "stroke-width": "6"
                },
                path({ "stroke-linecap": "round", "d": "M5 40 l60 0" }),
                path({ "stroke-linecap": "round", "d": "M75 40 l-20 -10" }),
                path({ "stroke-linecap": "round", "d": "M75 40 l-20 10" })
            )
        )
});

const pushed = (arr = [], e) => {
    const arr2 = arr.map(e => e);
    arr2.push(e);
    return arr2;
};
const removed = (arr = [], idx) => {
    const arr2 = arr.map(e => e);
    arr2.splice(idx, 1);
    return arr2;
};
const empty = (arr = []) => arr.length === 0;
const notIn = (s) => (e) => s.indexOf(e) < 0;
const toggle = (e, arr) => use(
    arr.indexOf(e),
    p => p < 0 ? pushed(arr, e) : removed(arr, p)
);
const clear = (arr = []) => arr.splice(0, arr.length);

let solving = false;

const solve = () => {
    // a -> {b,c}

    if (!solving) return [];

    const determineTriggers = (i) => {
        const res = [];
        walk(coord(i), direction(i), cb => res.push(cb))
        return res;
    };

    const triggers = range(N * N)
        .reduce((acc, i) => {
            acc[i] = determineTriggers(i);
            return acc;
        }, {});

    const triggeredBy = Object.keys(triggers)
        .reduce((acc, v) => {
            triggers[v]
                .forEach(triggered => acc[triggered] = pushed(acc[triggered] || [], +v));
            return acc;
        }, {});

    range(N * N).forEach(o => triggeredBy[o] = triggeredBy[o] || []);

    const r = Object.keys(triggeredBy)
        .filter(e => empty(triggeredBy[e]))
        .map(Number);

    const solutions = [];

    const withTriggers = (w, trigger) => triggers[trigger]
        .reduce((acc, t) => toggle(t, acc), w);

    const solve_ = (w = selection, S = []) => {
        if (empty(w)) {
            solutions.push(S);
        } else {
            triggeredBy[w[0]].filter(e => notIn(S)(e)).forEach(trigger => {
                solve_(withTriggers(w, trigger), pushed(S, trigger));
            });
        }
    };

    solve_();

    if (empty(solutions))
        return [];

    return solutions.reduce((acc, v) => acc.length < v.length ? acc : v);
};

m.mount(document.body, {
    view: (vnode) => div.container(div(h1({
            onclick: () => solving = !solving
        }, "Black Out"),
        div[`${"field"+N}`]({ disabled: !won() },
            field.map((n, i) =>
                div[selected(i) ? "selected" : "not-selected"][solves(i) ? "solves" : "not-solves"].box({
                        onclick: e => all(() => walkNSelect(i), () => solution = solve()),
                    },
                    m(arrow, { rot: n }),

                ))
        ), div(won() ?
            div(h2("You've won."),
                button({ onclick: e => newGame() }, h3("start again"))) :
            div.mt16(h2("Make everything black."))),
        input({ type: 'range', min: 0, max: 1, oninput: e => all(() => walk = walks[+e.target.value], () => clear(selection), newGame) })
    ))
});