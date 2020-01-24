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
import { eitherOf } from "../src/dsl";
import { ErrorCode } from "../src/issues";


describe("A grammar with a union of string and number should", () => {

    const tester = new Test();
    tester.grammar.define("union")
        .as(eitherOf("string", "number"));

    test("accept string values", () => {
        const jsonString = "some string value";
        const value = tester.grammar.read(jsonString).as("union");
        expect(value).toBe(jsonString);
    });

    test("accept number values", () => {
        const jsonNumber = 123.54;
        const value = tester.grammar.read(jsonNumber).as("union");
        expect(value).toBe(jsonNumber);
    });

    test("raise a type error for every other type", () => {
        const jsonBoolean = true;
        tester.verifyIssues(jsonBoolean, "union",
                            [ [ ErrorCode.NO_MATCHING_TYPE, 1 ]]);
    });

});
