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
import { aNumber } from "../src/dsl";
import { ErrorCode } from "../src/issues";


describe("A grammar expecting a number should",  () => {

    const tester = new Test();

    test("Accept a single number", () => {
        const json = 123.34;

        const number = tester.grammar.read(json).as("number");

        expect(number).toBe(json);
    });


    test("report a type error when other value are given", () => {
        tester.verifyIssues(true, "string",
                          [ [ ErrorCode.TYPE_ERROR, 1 ] ]);
    });

    test("report violation of the 'strictlyAbove' constraint", () => {
        const tester = new Test();
        tester.grammar.define("test-number")
            .as(aNumber().strictlyAbove(10));

        tester.verifyIssues(10, "test-number",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        tester.verifyIssues(9, "test-number",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar.read(11).as("test-number");
        }).not.toThrow();

    });


    test("report violation of the 'aboveOrEqualTo' constraint", () => {
        const tester = new Test();
        tester.grammar.define("test-number")
            .as(aNumber().aboveOrEqualTo(10));

        tester.verifyIssues(9, "test-number",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar.read(10).as("test-number");
        }).not.toThrow();

    });


    test("report violation of the 'strictlyBelow' constraint", () => {
        const tester = new Test();
        tester.grammar.define("test-number")
            .as(aNumber().strictlyBelow(10));

        tester.verifyIssues(10, "test-number",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar.read(9).as("test-number");
        }).not.toThrow();

    });


    test("report violation of the 'belowOrEqualTo' constraint", () => {
        const tester = new Test();
        tester.grammar.define("test-number")
            .as(aNumber().belowOrEqualTo(10));

        tester.verifyIssues(11, "test-number",
                            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar.read(10).as("test-number");
        }).not.toThrow();

    });


    test("apply attached production rule",  () => {
        const tester = new Test();
        tester.grammar
            .on("number")
            .apply(n => n + 1);


        const text = 125;
        const output = tester.grammar.read(text).as("number");
        expect(output).toBe(126);
    });



});
