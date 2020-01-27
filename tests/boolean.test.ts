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


describe("A grammar expecting a boolean should",  () => {

    const tester = new Test();

    test("accept a single boolean value", () => {
        const json = true;
        const value = tester.grammar.read(json).as("boolean");
        expect(value).toBe(json);
    });


    test("report a type error when other value are given", () => {
        tester.verifyIssues(1234, "boolean",
                          [ [ ErrorCode.TYPE_ERROR, 1 ] ]);
    });


    test("apply production rules",  () => {
        const tester = new Test();
        tester.grammar
            .on("boolean")
            .apply(b => !b);

        const input = true;
        const output = tester.grammar.read(input).as("boolean");
        expect(output).toBe(false);
    });

});
