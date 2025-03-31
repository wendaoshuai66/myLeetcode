见MDN


Function.prototype.myBind = function (context) {
    let args = Array.prototype.slice.call(arguments, 1)
    let fn = this;
    let result = function (parmes) {
        return fn.apply(new.target ? this : context, [].concat(args, parmes))
    }
    result.prototype = Object.create(fn.prototype);
    return result;
}