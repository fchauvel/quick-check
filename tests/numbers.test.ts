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
