import { z } from "zod";
export declare const STKPushSchema: z.ZodObject<{
    phoneNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phoneNumber: string;
}, {
    phoneNumber: string;
}>;
export declare const CallbackSchema: z.ZodObject<{
    Body: z.ZodObject<{
        stkCallback: z.ZodObject<{
            checkoutRequestId: z.ZodString;
            resultCode: z.ZodNumber;
            resultDesc: z.ZodString;
            callbackMetadata: z.ZodOptional<z.ZodObject<{
                item: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodNull]>;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    value: string | number | null;
                }, {
                    name: string;
                    value: string | number | null;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                item: {
                    name: string;
                    value: string | number | null;
                }[];
            }, {
                item: {
                    name: string;
                    value: string | number | null;
                }[];
            }>>;
        }, "strip", z.ZodTypeAny, {
            checkoutRequestId: string;
            resultCode: number;
            resultDesc: string;
            callbackMetadata?: {
                item: {
                    name: string;
                    value: string | number | null;
                }[];
            } | undefined;
        }, {
            checkoutRequestId: string;
            resultCode: number;
            resultDesc: string;
            callbackMetadata?: {
                item: {
                    name: string;
                    value: string | number | null;
                }[];
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        stkCallback: {
            checkoutRequestId: string;
            resultCode: number;
            resultDesc: string;
            callbackMetadata?: {
                item: {
                    name: string;
                    value: string | number | null;
                }[];
            } | undefined;
        };
    }, {
        stkCallback: {
            checkoutRequestId: string;
            resultCode: number;
            resultDesc: string;
            callbackMetadata?: {
                item: {
                    name: string;
                    value: string | number | null;
                }[];
            } | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    Body: {
        stkCallback: {
            checkoutRequestId: string;
            resultCode: number;
            resultDesc: string;
            callbackMetadata?: {
                item: {
                    name: string;
                    value: string | number | null;
                }[];
            } | undefined;
        };
    };
}, {
    Body: {
        stkCallback: {
            checkoutRequestId: string;
            resultCode: number;
            resultDesc: string;
            callbackMetadata?: {
                item: {
                    name: string;
                    value: string | number | null;
                }[];
            } | undefined;
        };
    };
}>;
//# sourceMappingURL=payment.schema.d.ts.map