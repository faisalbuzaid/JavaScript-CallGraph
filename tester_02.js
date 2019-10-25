// global variables
var global_val1 = 0;
var global_val2 = 0;

// main flow
func_one();
console.log(global_val2);

// functions
function func_one(){
    var func_one_local_val = 1;
    global_val1 = 1;
    func_one_local_val = func_two(2, 3);
    global_val2 = func_one_local_val;
    return;
}

function func_two(func_two_1st_arg, func_two_2nd_arg){
    var func_two_local_val = 0;
    func_two_local_val = func_three(func_two_1st_arg, func_two_2nd_arg);
    return func_two_local_val;

    function func_three(func_three_1st_arg, func_three_2nd_arg){
        return func_three_1st_arg + func_three_2nd_arg;
    }
}

var x = (function () {
    return 52;
}());

