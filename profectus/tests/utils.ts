import Decimal, { DecimalSource, format } from "util/bignum";
import { Mock, expect, vi } from "vitest";

interface CustomMatchers<R = unknown> {
    compare_tolerance(expected: DecimalSource, tolerance?: number): R;
    toLogError(): R;
}

declare module "vitest" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Assertion extends CustomMatchers {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
