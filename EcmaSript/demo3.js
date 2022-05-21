function Car(color) {
    this.color = color;
}

function BWM(...agrs) {
    Car.apply(this, agrs)
}

BWM.prototype = Object.create(Car.prototype, {
    constructor: {
        value: Car,
        writable: false,
    }
})

var staticKeys = Object.entries(Car);
for (var i = 0; i < staticKeys.length; i++) {
    var key = staticKeys[i][0];
    var val = staticKeys[i][1];
    BWM[key] = val;
}

// function inhert(sup, supers) {
//     const prototype = Object.create(supers.prototype)
//     prototype.constructor = sup;
//     sup.prototype = prototype;
// }

// inhert(BWM, Car)

// const bwm = new BWM('red');
// console.log(bwm)

// class Car {
//     constructor(color) {
//         this.color = color;
//     }
// }

// class BWM extends Car {
//     constructor(color) {
//         super(color)
//     }
// }


const bwm = new BWM('red');
console.log(bwm)