import projInfo from "data/projInfo.json";
import type { DecimalSource } from "lib/break_eternity";
import Decimal from "lib/break_eternity";
import { JSX } from "vue/jsx-runtime";

const decimalOne = new Decimal(1);
const nearOne = new Decimal(0.98);
const zero = new Decimal(0);

const thresholds = [
    new Decimal(1),
    new Decimal(1e3),
    new Decimal(1e6),
    new Decimal(1e9),
    new Decimal(1e12),
    new Decimal(1e33),
    new Decimal(1e100),
    new Decimal(1e303),
    new Decimal("1e1000")
];

// IMPORTANT!!
// DO NOT ACCESS PLAYER SETTINGS FROM IMPORTED `settings` (this causes errors - idk why)
// INSTEAD ACCESS SETTINGS FROM GLOBALLY ACCESSABLE `window.settings`

/**
 * Formats an inputted number, taking the notation options from `window.settings`.
 * @param {DecimalSource} num The value to format
 * @param {number} precision Amount of digits to include past the decimal point
 * @param {boolean | undefined} small Whether or not format small numbers accurately or return `0`
 * @returns {JSX.Element} Formatted version of num
 */
export function format(
    num: DecimalSource,
    precision?: number,
    small?: boolean,
    stringy: string | JSX.Element = <></>
): typeof stringy {
    if (precision == null) precision = projInfo.defaultDecimalsShown;
    const str: boolean = stringy === "" ? true : false;
    if (precision < 0) {
        precision = 0;
    }
    if (window.settings.insanePrecision) {
        precision *= window.settings.precisionBonus / 2 + 1;
    }
    if (window.settings.blindNumbers) {
        return str ? "" : <></>;
    }
    if (window.settings.yesnoNumbers) {
        return str ? Decimal.neq(num, 0) ? "YES" : "NO" : <>{Decimal.neq(num, 0) ? "YES" : "NO"}</>;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    small = small ?? projInfo.defaultShowSmall;
    num = new Decimal(num);
    if (isNaN(num.sign) || isNaN(num.layer) || isNaN(num.mag)) {
        return str ? "NaN" : <>NaN</>;
    }
    // Might become a parameter?
    if (num.sign < 0) {
        return str ? (
            "-" + stringyFormat(num.neg(), precision)
        ) : (
            <>-{format(num.neg(), precision)}</>
        );
    }
    if (num.mag === Number.POSITIVE_INFINITY) {
        return str ? "Infinity" : <>Infinity</>;
    }
    // slog format could go here
    if (num.gte(thresholds[window.settings.logarithmicThreshold])) {
        return str ? (
            window.settings.infinityNumbers ? (
                stringyFormatInf(num, precision)
            ) : (
                stringyFormatLog(num, precision)
            )
        ) : window.settings.infinityNumbers ? (
            <>{formatInf(num, precision)}</>
        ) : (
            <>{formatLog(num, precision)}</>
        );
    }
    if (num.gte(thresholds[window.settings.scientificThreshold])) {
        return str ? stringyFormatSci(num, precision) : <>{formatSci(num, precision)}</>;
    }
    if (num.gte(thresholds[window.settings.standardThreshold])) {
        return str ? (
            window.settings.letterNumbers ? (
                formatLet(num, precision)
            ) : (
                stringyFormatStan(num, precision)
            )
        ) : window.settings.letterNumbers ? (
            <>{formatLet(num, precision)}</>
        ) : (
            <>{formatStan(num, precision)}</>
        );
    }
    if (num.gte(10000)) {
        return str ? formatCom(num, 0) : <>{formatCom(num, 0)}</>;
    }
    return str ? formatReg(num, precision) : <>{formatReg(num, precision)}</>;
}

export function stringyFormat(num: DecimalSource, precision?: number, small?: boolean): string {
    return format(num, precision, small, "").toString();
}

// Will also display very small numbers
export function formatSmall(x: DecimalSource, precision?: number): JSX.Element {
    return <>{format(x, precision, true)}</>;
}

export function stringyFormatSmall(x: DecimalSource, precision?: number): string {
    return stringyFormat(x, precision, true);
}

export function formatWhole(num: DecimalSource): JSX.Element {
    num = new Decimal(num);
    if (num.sign < 0) {
        return <>-{formatWhole(num.neg())}</>;
    }
    if (num.gte(1e9)) {
        return <>{format(num)}</>;
    }
    if (num.lte(nearOne) && !num.eq(zero)) {
        return <>{format(num)}</>;
    }
    return <>{format(num, 0)}</>;
}

export function stringyFormatWhole(num: DecimalSource): string {
    num = new Decimal(num);
    if (num.sign < 0) {
        return "-" + stringyFormatWhole(num.neg());
    }
    if (num.gte(1e9)) {
        return stringyFormat(num);
    }
    if (num.lte(nearOne) && !num.eq(zero)) {
        return stringyFormat(num);
    }
    return stringyFormat(num, 0);
}

export function formatTime(sec: DecimalSource, precise: boolean = false): JSX.Element {
    if (window.settings.blindNumbers) {
        return <></>;
    }
    if (window.settings.yesnoNumbers) {
        return Decimal.neq(sec, 0) ? <>YES</> : <>NO</>;
    }
    if (Decimal.lt(sec, 0)) {
        return <>-{formatTime(Decimal.neg(sec))}</>;
    }
    if (Decimal.gt(sec, 2 ** 51)) {
        // integer precision limit
        return <>{format(Decimal.div(sec, 31536000))}y</>;
    }
    sec = new Decimal(sec).toNumber();
    if (sec < 60) {
        return <>{format(sec)}s</>;
    } else if (sec < 3600) {
        if (precise) {
            return (
                <>
                    {formatWhole(Math.floor(sec / 60))}:{sec % 60 < 10 ? "0" : ""}
                    {format(sec % 60)}
                </>
            );
        }
        return (
            <>
                {formatWhole(Math.floor(sec / 60))}m&nbsp;{format(sec % 60)}s
            </>
        );
    } else if (sec < 86400) {
        if (precise) {
            return (
                <>
                    {formatWhole(Math.floor(sec / 3600))}:{(sec / 60) % 60 < 10 ? "0" : ""}
                    {formatWhole(Math.floor(sec / 60) % 60)}:{sec % 60 < 10 ? "0" : ""}
                    {format(sec % 60)}
                </>
            );
        }
        return (
            <>
                {formatWhole(Math.floor(sec / 3600))}h&nbsp;{formatWhole(Math.floor(sec / 60) % 60)}
                m&nbsp;{formatWhole(sec % 60)}s
            </>
        );
    } else if (sec < 31536000) {
        if (precise) {
            return (
                <>
                    {formatWhole(Math.floor(sec / 84600) % 365)}d&nbsp;
                    {(sec / 3600) % 24 < 10 ? "0" : ""}
                    {formatWhole(Math.floor(sec / 3600) % 24)}:{(sec / 60) % 60 < 10 ? "0" : ""}
                    {formatWhole(Math.floor(sec / 60) % 60)}:{sec % 60 < 10 ? "0" : ""}
                    {format(sec % 60)}
                </>
            );
        }
        return (
            <>
                {formatWhole(Math.floor(sec / 84600) % 365)}d&nbsp;
                {formatWhole(Math.floor(sec / 3600) % 24)}h&nbsp;
                {formatWhole(Math.floor(sec / 60) % 60)}m
            </>
        );
    } else {
        if (precise) {
            return (
                <>
                    {formatWhole(Math.floor(sec / 31536000))}y&nbsp;
                    {(sec / 84600) % 365 < 100 ? "0" : ""}
                    {(sec / 84600) % 365 < 10 ? "0" : ""}
                    {formatWhole(Math.floor(sec / 84600) % 365)}d&nbsp;
                    {(sec / 3600) % 24 < 10 ? "0" : ""}
                    {formatWhole(Math.floor(sec / 3600) % 24)}:{(sec / 60) % 60 < 10 ? "0" : ""}
                    {formatWhole(Math.floor(sec / 60) % 60)}:{sec % 60 < 10 ? "0" : ""}
                    {format(sec % 60)}
                </>
            );
        }
        return (
            <>
                {formatWhole(Math.floor(sec / 31536000))}y&nbsp;
                {formatWhole(Math.floor(sec / 84600) % 365)}d&nbsp;
                {formatWhole(Math.floor(sec / 3600) % 24)}h
            </>
        );
    }
}

export function formatLog(num: DecimalSource, precision: number = 2): JSX.Element {
    const e = Decimal.log10(num);
    return (
        <>
            e
            {format(
                e
                    .mul(10 ** precision)
                    .trunc()
                    .div(10 ** precision)
            )}
        </>
    );
}

export function stringyFormatLog(num: DecimalSource, precision: number = 2): string {
    const e = Decimal.log10(num);
    return (
        "e" +
        stringyFormat(
            e
                .mul(10 ** precision)
                .trunc()
                .div(10 ** precision)
        )
    );
}

export function formatInf(
    num: DecimalSource,
    precision: number = 2,
    base: DecimalSource = Number.POSITIVE_INFINITY
): JSX.Element {
    const e = Decimal.log(num, base);
    return (
        <>
            {format(
                e
                    .mul(10 ** precision)
                    .trunc()
                    .div(10 ** precision)
            )}
            ∞
        </>
    );
}

export function stringyFormatInf(
    num: DecimalSource,
    precision: number = 2,
    base: DecimalSource = Number.POSITIVE_INFINITY
): string {
    const e = Decimal.log(num, base);
    return (
        format(
            e
                .mul(10 ** precision)
                .trunc()
                .div(10 ** precision)
        ) + "∞"
    );
}

export function formatSci(num: DecimalSource, precision: number = 2): JSX.Element {
    let e = Decimal.log10(num).floor();
    if (window.settings.engineering) {
        e = e.div(3);
        precision -= e.mul(3).sub(e.floor().mul(3)).toNumber();
        e = e.floor().mul(3);
    }
    num = Decimal.div(num, Decimal.pow(10, e));
    num = num
        .mul(10 ** precision)
        .trunc()
        .div(10 ** precision);
    return (
        <>
            {num.toStringWithDecimalPlaces(precision)}e{formatWhole(e)}
        </>
    );
}

export function stringyFormatSci(num: DecimalSource, precision: number = 2): string {
    let e = Decimal.log10(num).floor();
    if (window.settings.engineering) {
        e = e.div(3);
        precision -= e.mul(3).sub(e.floor().mul(3)).toNumber();
        e = e.floor().mul(3);
    }
    num = Decimal.div(num, Decimal.pow(10, e));
    num = num
        .mul(10 ** precision)
        .trunc()
        .div(10 ** precision);
    return num.toStringWithDecimalPlaces(precision) + "e" + stringyFormatWhole(e);
}

// Certified eslint moment
const standardSuffixes = [
    "K",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
    "UDc",
    "DDc",
    "TDc",
    "QaDc",
    "QiDc",
    "SxDc",
    "SpDc",
    "OcDc",
    "NoDc",
    "Vg",
    "UVg",
    "DVg",
    "TVg",
    "QaVg",
    "QiVg",
    "SxVg",
    "SpVg",
    "OcVg",
    "NoVg",
    "Tg",
    "UTg",
    "DTg",
    "TTg",
    "QaTg",
    "QiTg",
    "SxTg",
    "SpTg",
    "OcTg",
    "NoTg",
    "Qg",
    "UQg",
    "DQg",
    "TQg",
    "QaQg",
    "QiQg",
    "SxQg",
    "SpQg",
    "OcQg",
    "NoQg",
    "Qt",
    "UQt",
    "DQt",
    "TQt",
    "QaQt",
    "QiQt",
    "SxQt",
    "SpQt",
    "OcQt",
    "NoQt",
    "Se",
    "USe",
    "DSe",
    "TSe",
    "QaSe",
    "QiSe",
    "SxSe",
    "SpSe",
    "OcSe",
    "NoSe",
    "Sg",
    "USg",
    "DSg",
    "TSg",
    "QaSg",
    "QiSg",
    "SxSg",
    "SpSg",
    "OcSg",
    "NoSg",
    "Og",
    "UOg",
    "DOg",
    "TOg",
    "QaOg",
    "QiOg",
    "SxOg",
    "SpOg",
    "OcOg",
    "NoOg",
    "Nn",
    "UNn",
    "DNn",
    "TNn",
    "QaNn",
    "QiNn",
    "SxNn",
    "SpNn",
    "OcNn",
    "NoNn",
    "Ce",
    "UCe"
];
// TODO: remove the string part of this
export function formatStan(num: DecimalSource, precision: number = 2): string | JSX.Element {
    if (Decimal.gte(num, Decimal.pow(1000, standardSuffixes.length))) {
        return formatSci(num, precision);
    }
    const e = Decimal.log(num, 1000).floor().toNumber() - 1;
    num = Decimal.div(num, Decimal.pow(1000, e + 1));
    num = num
        .mul(10 ** (precision - num.log10().floor().toNumber() + 1))
        .trunc()
        .div(10 ** (precision - num.log10().floor().toNumber() + 1));
    return (
        num.toStringWithDecimalPlaces(precision - num.log10().floor().toNumber() + 1) +
        " " +
        standardSuffixes[e]
    );
}

export function stringyFormatStan(num: DecimalSource, precision: number = 2): string {
    if (Decimal.gte(num, Decimal.pow(1000, standardSuffixes.length))) {
        return stringyFormatSci(num, precision);
    }
    const e = Decimal.log(num, 1000).floor().toNumber() - 1;
    num = Decimal.div(num, Decimal.pow(1000, e + 1));
    num = num
        .mul(10 ** (precision - num.log10().floor().toNumber() + 1))
        .trunc()
        .div(10 ** (precision - num.log10().floor().toNumber() + 1));
    return (
        num.toStringWithDecimalPlaces(precision - num.log10().floor().toNumber() + 1) +
        " " +
        standardSuffixes[e]
    );
}

// TODO: make this return JSX.Element, and add stringyFormatLet()
export function formatLet(
    num: DecimalSource,
    precision: number = 2,
    letters: string[] = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z"
    ],
    base: DecimalSource = 1000
): string {
    letters = window.settings.letters.length < 2 ? letters : Array.from(window.settings.letters);
    const e = Decimal.log(num, base).floor().toNumber();
    let suffix = "";
    let _num = e;
    while (_num > 0) {
        suffix = letters[(_num - 1) % letters.length] + suffix;
        _num = Math.floor((_num - 1) / letters.length);
    }
    num = Decimal.div(num, Decimal.pow(base, e));
    num = num
        .mul(10 ** (precision - num.log10().floor().toNumber() + 1))
        .trunc()
        .div(10 ** (precision - num.log10().floor().toNumber() + 1));
    return (
        num.toStringWithDecimalPlaces(precision - num.log10().floor().toNumber() + 1) + " " + suffix
    );
}

export function formatExp(num: DecimalSource, precision: number, mantissa = true): string {
    let e = Decimal.log10(num).floor();
    let m = Decimal.div(num, Decimal.pow(10, e));
    if (m.toStringWithDecimalPlaces(precision) === "10") {
        m = decimalOne;
        e = e.add(1);
    }
    const eString = e.gte(1e9)
        ? format(e, Math.max(Math.max(precision, 3), projInfo.defaultDecimalsShown))
        : e.gte(10000)
          ? formatCom(e, 0)
          : e.toStringWithDecimalPlaces(0);
    if (mantissa) {
        return m.toStringWithDecimalPlaces(precision) + "e" + eString;
    } else {
        return "e" + eString;
    }
}

export function formatCom(num: DecimalSource, precision: number): string {
    if (num == null) {
        return "NaN";
    }
    num = new Decimal(num);
    if (num.mag < 0.001) {
        return (0).toFixed(precision);
    }
    const init = num.toStringWithDecimalPlaces(precision);
    const portions = init.split(".");
    portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    if (portions.length === 1) return portions[0];
    return portions[0] + "." + portions[1];
}

export function formatReg(num: DecimalSource, precision: number): string {
    if (num == null) {
        return "NaN";
    }
    num = new Decimal(num);
    if (num.mag < 0.0001) {
        return (0).toFixed(precision);
    }
    if (num.mag < 0.1 && precision !== 0) {
        precision = Math.max(
            Math.max(precision, num.log10().negate().ceil().toNumber()),
            projInfo.defaultDecimalsShown
        );
    }
    return num.toStringWithDecimalPlaces(precision);
}

export function toPlaces(x: DecimalSource, precision: number, maxAccepted: DecimalSource): string {
    x = new Decimal(x);
    let result = x.toStringWithDecimalPlaces(precision);
    if (x.gte(maxAccepted)) {
        result = Decimal.sub(maxAccepted, Math.pow(0.1, precision)).toStringWithDecimalPlaces(
            precision
        );
    }
    return result;
}

export function invertOOM(x: DecimalSource): Decimal {
    let e = Decimal.log10(x).ceil();
    const m = Decimal.div(x, Decimal.pow(10, e));
    e = e.neg();
    x = new Decimal(10).pow(e).times(m);

    return x;
}
