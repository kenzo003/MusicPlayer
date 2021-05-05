function random(min, max) {
    if (this.isArray(min)) {
        return min[~~(Math.random() * min.length)];
    }
    if (!this.isNumber(max)) {
        max = min || 1, min = 0;
    }
    return min + Math.random() * (max - min);
}

/*
* Проверка на массив
*/
function isArray(object) {
    return Object.prototype.toString.call(object) == '[object Array]';
}

/*
* Проверка на число
*/
function isNumber(object) {
    return typeof object == 'number';
}