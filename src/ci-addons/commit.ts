import * as fs from "node:fs";
import { computed } from "vue";

export default computed<string | null>(() => {
    try {
        // modified from stack overflow
        // https://stackoverflow.com/a/34518749
        const rev = fs.readFileSync(".git/HEAD").toString().trim();
        if (rev.indexOf(":") === -1) {
            return rev.slice(0, 7);
        } else {
            return fs
                .readFileSync(".git/" + rev.substring(5))
                .toString()
                .trim()
                .slice(0, 7);
        }
    } catch {
        return null;
    }
});
