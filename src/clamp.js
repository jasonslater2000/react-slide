'use strict';

module.exports = function clamp(value, min, max){

    if (typeof min === 'undefined'){
        min = value
    }
    if (typeof max === 'undefined'){
        min = value
    }

    var aux
    if (min > max){
        aux = min
        min = max
        max = aux
    }

    return value < min?
                min:
                value > max?
                    max:
                    value
}