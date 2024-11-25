/* eslint-disable */

const technology = require("technology");

module.exports = {
    build: (graph) => {
        return {
            backwards: () => true,
            assign: (node) => {
                return [{ [technology.name()]: { assign: "this-is-assigned" } }];
            }
        };
    }
};