"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("./errorHandler");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            });
            req.body = parsed.body;
            req.params = parsed.params;
            req.query = parsed.query;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const message = error.errors.map((e) => e.message).join(", ");
                return next(new errorHandler_1.APIError(message, 400, "VALIDATION_ERROR"));
            }
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.js.map