/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Grammar } from "../src/grammar";


export class Test {

    public grammar: Grammar;

    constructor() {
        this.grammar = new Grammar();
    }


    public verifyIssues(
        json: any,
        expectedType: string,
        expectedIssues: [string, number][]): void {

        try {
            this.grammar.read(json).as(expectedType);
            fail("Should have thrown an  error!");

        } catch (issues) {
            const expectedCount = expectedIssues.reduce(
                (sum, [_, count]) => sum + count,
                0);
            expect(issues.length).toBe(expectedCount);
            for (const [code, count] of expectedIssues) {
                expect(issues.withCode(code)).toHaveLength(count);
            }
        }
    }
}
