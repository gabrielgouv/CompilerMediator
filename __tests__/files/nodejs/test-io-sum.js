var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('', (n1) => {
    let sum = Number(n1);
    rl.question('', (n2) => {
        sum += Number(n2);
        console.log(sum);
        rl.close();
    });
    rl.close();
});
