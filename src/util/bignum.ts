/**
 * @module
 */
// Import Decimal and numberUtils from a different file to globally change which big num library gets used
// This way switching out big number libraries just needs to happen here, not every file that needs big numbers
import type { DecimalSource as RawDecimalSource } from "lib/break_eternity";
import Decimal from "lib/break_eternity"; // @ts-expect-error: changing setting in tsconfig.json requires changing other settings
import * as numberUtils from "util/break_eternity.tsx";
import { JSX } from "vue/jsx-runtime";

export const {
    exponentialFormat,
    commaFormat,
    regularFormat,
    format,
    formatWhole,
    formatTime,
    toPlaces,
    formatSmall,
    invertOOM
} = numberUtils;

export type DecimalSource = RawDecimalSource;

declare global {
    /** Augment the window object so the big num functions can be accessed from the console. */
    interface Window {
        Decimal: typeof Decimal;
        exponentialFormat: (num: DecimalSource, precision: number, mantissa: boolean) => string;
        commaFormat: (num: DecimalSource, precision: number) => string;
        regularFormat: (num: DecimalSource, precision: number) => string;
        format: (num: DecimalSource, precision?: number, small?: boolean) => string | JSX.Element;
        formatWhole: (num: DecimalSource) => string | JSX.Element;
        formatTime: (s: number) => string | JSX.Element;
        toPlaces: (
            x: DecimalSource,
            precision: number,
            maxAccepted: DecimalSource
        ) => string | JSX.Element;
        formatSmall: (x: DecimalSource, precision?: number) => string | JSX.Element;
        invertOOM: (x: DecimalSource) => Decimal;
    }
}
window.Decimal = Decimal;
window.exponentialFormat = exponentialFormat;
window.commaFormat = commaFormat;
window.regularFormat = regularFormat;
window.format = format;
window.formatWhole = formatWhole;
window.formatTime = formatTime;
window.toPlaces = toPlaces;
window.formatSmall = formatSmall;
window.invertOOM = invertOOM;

export default Decimal;
