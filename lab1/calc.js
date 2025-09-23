var operator_list = ['/', '+', '*', '-'];
var operators = [], numbers = [];
function calc(expression) {
    if ((expression != '') && (expression.indexOf('  ') == -1)) {
        var units = expression.replace('(', '').replace(')', '').split(' ');
        for (var index = 0; index < units.length; index++) {
            if (operator_list.indexOf(units[index]) != -1) {
                operators.push(units[index]);
            }
            else if (!isNaN(Number(units[index]))) {
                numbers.push(Number(units[index]));
            }
            else {
                return "\u0412\u0432\u0435\u0434\u0435\u043D \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440: ".concat(units[index], " . \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u0435\u0440\u0435\u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u0435.");
            }
        }
        console.log(operators);
        console.log(numbers);
        while (operators.length != 0 && numbers.length != 0) {
            var firstNumber = void 0, secondNumber = void 0;
            secondNumber = Number(numbers.pop());
            firstNumber = Number(numbers.pop());
            switch (operators.pop()) {
                case '-':
                    numbers.push(firstNumber - secondNumber);
                    break;
                case '+':
                    numbers.push(firstNumber + secondNumber);
                    break;
                case '/':
                    if (secondNumber != 0) {
                        numbers.push(firstNumber / secondNumber);
                    }
                    else {
                        return "Недопустимое деление на 0";
                    }
                    break;
                case '*':
                    numbers.push(firstNumber * secondNumber);
                    break;
            }
        }
        if (numbers.length == 1) {
            return Number(numbers[0]);
        }
        else {
            return "Перепроверьте количество числовых операндов.";
        }
    }
    else {
        return "Введите непустое выражение, в котором в качестве разделителя исполузуется одинарный пробел.";
    }
}
var expression = '- -5.24 (+ 5.26 3)';
console.log(calc(expression));
