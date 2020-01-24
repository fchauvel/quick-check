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
import { anArrayOf } from "../src/dsl";
import { ErrorCode } from "../src/issues";


describe("A grammar expecting an array should", () => {

    const tester = new Test();
    tester.grammar.define("array-of-number")
        .as(anArrayOf("number"));

    test("Accept arrays of element", () => {
        const json = [1, 2, 3, 4, 5];
        const values = tester.grammar.read(json).as("array-of-number");
        expect(values).toHaveLength(json.length);
        for(const [index, value] of json.entries()) {
            expect(values[index]).toBe(json[index]);
        }
    });


    test("Detect type errors when it does not get an array", () => {
        const json = true;
        tester.verifyIssues(json, "array-of-number",
                            [ [ ErrorCode.TYPE_ERROR, 1 ] ]);
    });


    test("Report type error if the array contains other types", () => {
        const json = [1, 2, true, 3, 4, "bonjour" ];
        tester.verifyIssues(json, "array-of-number",
                            [ [ ErrorCode.TYPE_ERROR, 2 ] ]);
    });


    test("modify arrays accordingly",  () => {
        const tester = new Test();
        tester.grammar.define("list-of-number")
            .as(anArrayOf("number"));
        tester.grammar
            .on("list-of-number")
            .apply(a => a.reverse());

        const input = [1, 2, 3];
        const output = tester.grammar.read(input).as("list-of-number");
        expect(output).toStrictEqual([3, 2, 1]);
    });


});