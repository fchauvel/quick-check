/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Test } from "./commons";
import { anInteger } from "../src/dsl";
import { ErrorCode } from "../src/issues";


describe("A grammar expecting a number should",  () => {

    const tester = new Test();

    test("accept a single number", () => {
        const json = 123;

        const number = tester.grammar.read(json).as("integer");

        expect(number).toBe(json);
    });


    test("reject floating-point values", () => {
        tester.verifyIssues(123.456, "integer",
                          [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);
    });


    test("reject number that should be even", () => {
        const tester = new Test();
        tester.grammar.define("even-number")
            .as(anInteger().even());

        tester.verifyIssues(3, "even-number",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar.read(2).as("even-number");
        }).not.toThrow();
    });

    test("reject an integer that should be odd", () => {
        const tester = new Test();
        tester.grammar.define("odd-number")
            .as(anInteger().odd());

        tester.verifyIssues(2, "odd-number",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar.read(3).as("odd-number");
        }).not.toThrow();
    });


    test("reject an integer that should be a multiple", () => {
        const tester = new Test();
        tester.grammar.define("multiple")
            .as(anInteger().multipleOf(2));

        tester.verifyIssues(3, "multiple",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar.read(2).as("multiple");
            tester.grammar.read(4).as("multiple");
            tester.grammar.read(6).as("multiple");
        }).not.toThrow();
    });


    test("reject an integer that should be a power", () => {
        const tester = new Test();
        tester.grammar.define("power")
            .as(anInteger().powerOf(2));

        tester.verifyIssues(127, "power",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar.read(128).as("power");
            tester.grammar.read(512).as("power");
            tester.grammar.read(1024).as("power");
        }).not.toThrow();
    });

});
