"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeQueryValue = sanitizeQueryValue;
exports.sanitizeQueryParams = sanitizeQueryParams;
function sanitizeQueryValue(value) {
    if (value === "undefined" || value === "null" || value === "") {
        return undefined;
    }
    return value;
}
function sanitizeQueryParams(params) {
    const cleaned = {};
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "" && value !== "undefined") {
            cleaned[key] = value;
        }
    }
    return cleaned;
}
//# sourceMappingURL=query.util.js.map