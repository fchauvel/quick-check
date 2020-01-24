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



describe("A grammar expecting a string should",  () => {

    const tester = new Test();

    test("Accept a single string", () => {
        const json = "this is  a string";

        const text = tester.grammar.read(json).as("string");

        expect(text).toBe(json);
    });


    test("report a type error when other value are given", () => {
        tester.verifyIssues(true, "number",
                          [ [ ErrorCode.TYPE_ERROR, 1 ]]);
    });


    test("apply production rule",  () => {
        const tester = new Test();
        tester.grammar
            .on("string")
            .apply(s => s.toUpperCase());

        const text = "lowercase";
        const output = tester.grammar.read(text).as("string");
        expect(output).toBe(text.toUpperCase());

    });


});
