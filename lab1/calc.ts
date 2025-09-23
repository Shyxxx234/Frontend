const operator_list: string[] = ['/', '+', '*', '-'];
let operators: string[] = [], numbers: number[] = [];

function calc(expression: string): Number | String {
    if ((expression != '') && (expression.indexOf('  ') == -1)) {
        let units: string[] = expression.replace('(', '').replace(')', '').split(' ');

        for (let index: number = 0; index < units.length; index++) {
            if (operator_list.indexOf(units[index]) != -1) {
                operators.push(units[index]);
            } else if (!isNaN(Number(units[index]))) {
                numbers.push(Number(units[index]));
            } else {
                return `Введен неизвестный оператор: ${units[index]} . Пожалуйста, перепроверьте выражение.`;
            }
        }
        console.log(operators);
        console.log(numbers);
        while (operators.length != 0 && numbers.length != 0) {
            let firstNumber: number, secondNumber: number;
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
                        numbers.push(firstNumber / secondNumber)
                    } else {
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
        } else {
            return "Перепроверьте количество числовых операндов.";
        }
    } else {
        return "Введите непустое выражение, в котором в качестве разделителя исполузуется одинарный пробел.";
    }
}
const expression: string = '- -5.24 (+ 5.26 3)';

console.log(calc(expression));