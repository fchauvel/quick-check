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
import { aString } from "../src/dsl";
import { ErrorCode } from "../src/issues";



describe("A grammar expecting a string",  () => {

    const tester = new Test();

    test("should accept a single string", () => {
        const json = "this is  a string";

        const text = tester.grammar.read(json).as("string");

        expect(text).toBe(json);
    });


    test("report a type error when other value are given", () => {
        tester.verifyIssues(true, "number",
                          [ [ ErrorCode.TYPE_ERROR, 1 ]]);
    });


    describe("given a pattern is defined", () =>  {

        tester.grammar
            .define("task name")
            .as(aString()
                .thatMatches(/(T|WP)\s*(\d+)(\.(\d+))*/g));

        test("accept strings that fit the pattern", () => {
            const value = tester.grammar.read("WP 1.2").as("task name");
            expect(value).toBe("WP 1.2");
        });

        test("detect strings that do not fit the pattern", () => {
            tester.verifyIssues(
                "Hello World!",
                "task name",
                [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);
        });

    });

    test("report string that should not be empty", () => {
        const tester = new Test();
        tester.grammar.define("a-non-empty-string")
            .as(aString().nonEmpty());

        tester.verifyIssues(
            "",
            "a-non-empty-string",
            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);
    });


    test("report strings that should start with a given prefix", () => {
        const tester = new Test();
        tester.grammar.define("with-prefix")
            .as(aString().startingWith("start"));

        tester.verifyIssues(
            "bonjour",
            "with-prefix",
            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar
                .read("start something here")
                .as("with-prefix");
        }).not.toThrow()
    });


    test("report strings that should end with a given suffix", () => {
        const tester = new Test();
        tester.grammar.define("with-suffix")
            .as(aString().endingWith("end"));

        tester.verifyIssues(
            "bonjour",
            "with-suffix",
            [ [ ErrorCode.VALIDATION_ERROR, 1 ] ]);

        expect(() => {
            tester.grammar
                .read("do something at the end")
                .as("with-suffix");
        }).not.toThrow()
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
