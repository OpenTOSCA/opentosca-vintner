/* eslint-disable */

const technology = require('technology')

module.exports = {
    build: (graph) => {
        return {
            assign: (node) => {
                return [{
                    technology: technology.name()
                }];
            }
        };
    }
};