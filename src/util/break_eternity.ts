import projInfo from "data/projInfo.json";
import settings from "game/settings";
import type { DecimalSource } from "lib/break_eternity";
import Decimal from "lib/break_eternity";

export default Decimal;

const decimalOne = new Decimal(1);

export function exponentialFormat(num: DecimalSource, precision: number, mantissa = true): string {
    let e = Decimal.log10(num).floor();
    let m = Decimal.div(num, Decimal.pow(10, e));
    if (m.toStringWithDecimalPlaces(precision) === "10") {
        m = decimalOne;
        e = e.add(1);
    }
    const eString = e.gte(1e9)
        ? format(e, Math.max(Math.max(precision, 3), projInfo.defaultDecimalsShown))
        : e.gte(10000)
        ? commaFormat(e, 0)
        : e.toStringWithDecimalPlaces(0);
    if (mantissa) {
        return m.toStringWithDecimalPlaces(precision) + "e" + eString;
    } else {
        return "e" + eString;
    }
}

export function commaFormat(num: DecimalSource, precision: number): string {
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

export function regularFormat(num: DecimalSource, precision: number): string {
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

const nearOne = new Decimal(0.98);
const zero = new Decimal(0);

const defaultNotationThresholds: Decimal[][] = [
    [new Decimal(1e4), new Decimal(1e9), new Decimal("1e1000"), new Decimal("1e9")],
    [new Decimal(1e4), new Decimal(1e306), new Decimal("1e10000"), new Decimal("1e4")],
    [new Decimal(1e4), new Decimal(1e9), new Decimal(1e9), new Decimal("1e9")],
    [new Decimal(1e4), new Decimal(1e36), new Decimal("1e1000"), new Decimal("1e6")],
    [new Decimal(1e4), new Decimal(1e9), new Decimal(1e60), new Decimal("1e9")]
];

export function format(num: DecimalSource, precision?: number, small?: boolean): string {
    if (precision == null) precision = projInfo.defaultDecimalsShown;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    small = small ?? projInfo.defaultShowSmall;
    num = new Decimal(num);
    if (isNaN(num.sign) || isNaN(num.layer) || isNaN(num.mag)) {
        return "NaN";
    }
    if (num.sign < 0) {
        return "-" + format(num.neg(), precision);
    }
    if (num.mag === Number.POSITIVE_INFINITY) {
        return "Infinity";
    }
    if (num.gte(defaultNotationThresholds[settings.notation][2])) {
        return formatLog(num, precision);
    }
    if (num.gte(defaultNotationThresholds[settings.notation][1])) {
        return formatSci(num, precision);
    }
    if (num.gte(defaultNotationThresholds[settings.notation][3])) {
        return formatStan(num, precision);
    }
    if (num.gte(defaultNotationThresholds[settings.notation][0])) {
        return commaFormat(num, 0);
    }
    return regularFormat(num, precision);
    console.log("Number formatting error occured!!");
    return "ERROR";
}

export function formatLog(num: DecimalSource, precision = 2): string {
    const e = Decimal.log10(num);
    return (
        "e" +
        e
            .mul(10 ** precision)
            .trunc()
            .div(10 ** precision)
            .toStringWithDecimalPlaces(precision)
    );
}

export function formatSci(num: DecimalSource, precision = 2): string {
    const e = Decimal.log10(num).floor();
    num = Decimal.div(num, Decimal.pow(10, e));
    num = num
        .mul(10 ** precision)
        .trunc()
        .div(10 ** precision);
    return num.toStringWithDecimalPlaces(precision) + "e" + e.toStringWithDecimalPlaces(0);
}

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
export function formatStan(num: DecimalSource, precision = 2): string {
    const e = Decimal.log(num, 1000).floor().toNumber() - 1;
    num = Decimal.div(num, Decimal.pow(1000, e + 1));
    num = num
        .mul(10 ** precision)
        .trunc()
        .div(10 ** precision);
    return (
        num.toStringWithDecimalPlaces(precision - num.log10().floor().toNumber()) +
        " " +
        standardSuffixes[e]
    );
}

export function formatWhole(num: DecimalSource): string {
    num = new Decimal(num);
    if (num.sign < 0) {
        return "-" + formatWhole(num.neg());
    }
    if (num.gte(1e4)) {
        return format(num);
    }
    if (num.lte(nearOne) && !num.eq(zero)) {
        return format(num);
    }
    return format(num, 0);
}

export function formatTime(seconds: DecimalSource): string {
    if (Decimal.lt(seconds, 0)) {
        return "-" + formatTime(Decimal.neg(seconds));
    }
    if (Decimal.gt(seconds, 2 ** 51)) {
        // integer precision limit
        return format(Decimal.div(seconds, 31536000)) + "y";
    }
    seconds = new Decimal(seconds).toNumber();
    if (seconds < 60) {
        return format(seconds) + "s";
    } else if (seconds < 3600) {
        return formatWhole(Math.floor(seconds / 60)) + "m " + format(seconds % 60) + "s";
    } else if (seconds < 86400) {
        return (
            formatWhole(Math.floor(seconds / 3600)) +
            "h " +
            formatWhole(Math.floor(seconds / 60) % 60) +
            "m " +
            formatWhole(seconds % 60) +
            "s"
        );
    } else if (seconds < 31536000) {
        return (
            formatWhole(Math.floor(seconds / 84600) % 365) +
            "d " +
            formatWhole(Math.floor(seconds / 3600) % 24) +
            "h " +
            formatWhole(Math.floor(seconds / 60) % 60) +
            "m"
        );
    } else {
        return (
            formatWhole(Math.floor(seconds / 31536000)) +
            "y " +
            formatWhole(Math.floor(seconds / 84600) % 365) +
            "d " +
            formatWhole(Math.floor(seconds / 3600) % 24) +
            "h"
        );
    }
}

export function toPlaces(x: DecimalSource, precision: number, maxAccepted: DecimalSource): string {
    x = new Decimal(x);
    let result = x.toStringWithDecimalPlaces(precision);
    if (new Decimal(result).gte(maxAccepted)) {
        result = Decimal.sub(maxAccepted, Math.pow(0.1, precision)).toStringWithDecimalPlaces(
            precision
        );
    }
    return result;
}

// Will also display very small numbers
export function formatSmall(x: DecimalSource, precision?: number): string {
    return format(x, precision, true);
}

export function invertOOM(x: DecimalSource): Decimal {
    let e = Decimal.log10(x).ceil();
    const m = Decimal.div(x, Decimal.pow(10, e));
    e = e.neg();
    x = new Decimal(10).pow(e).times(m);

    return x;
}
