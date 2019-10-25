# The function declaration (function statement)

## The function declaration (引数なし)
```javascript
function func0_no_arg(){
    return 1;
}
```
```json
{
    "type": "FunctionDeclaration",
    "id": {
        "type": "Identifier",
        "name": "func0_no_arg"
    },
    "params": [],
    "body": {
        "type": "BlockStatement",
        "body": [
            {
                "type": "ReturnStatement",
                "argument": {
                    "type": "Literal",
                    "value": 1,
                    "raw": "1"
                }
            }
        ]
    },
    "generator": false,
    "expression": false,
    "async": false
}
```

## The function declaration (引数あり)

```javascript
function func1_2_args(arg1, arg2){
    return arg1 + arg2;
}
```

**Point**  
`params` property に、  
`[{"type":??, "name":??}, {"type":??, "name":??} , ...}]`  
のように、配列として定義される  

```json
{
    "type": "FunctionDeclaration",
    "id": {
        "type": "Identifier",
        "name": "func1_2_args"
    },
    "params": [
        {
            "type": "Identifier",
            "name": "arg1"
        },
        {
            "type": "Identifier",
            "name": "arg2"
        }
    ],
    "body": {
        "type": "BlockStatement",
        "body": [
            {
                "type": "ReturnStatement",
                "argument": {
                    "type": "BinaryExpression",
                    "operator": "+",
                    "left": {
                        "type": "Identifier",
                        "name": "arg1"
                    },
                    "right": {
                        "type": "Identifier",
                        "name": "arg2"
                    }
                }
            }
        ]
    },
    "generator": false,
    "expression": false,
    "async": false
}
```

# The function expression (function expression)

でもその前に、  
変数宣言と変数初期化

## 変数宣言
```javascript
var x;
```
**Point**  
`init` property が `null` となる  
```json
{
    "type": "VariableDeclaration",
    "declarations": [
        {
            "type": "VariableDeclarator",
            "id": {
                "type": "Identifier",
                "name": "x"
            },
            "init": null
        }
    ],
    "kind": "var"
}
```

## 変数宣言 & 初期化
```javascript
var x = 1;
```
**Point**  
`init` property に代入する値が定義される  
```json
{
    "type": "VariableDeclaration",
    "declarations": [
        {
            "type": "VariableDeclarator",
            "id": {
                "type": "Identifier",
                "name": "x"
            },
            "init": {
                "type": "Literal",
                "value": 1,
                "raw": "1"
            }
        }
    ],
    "kind": "var"
}
```

## The function expression (関数名定義あり)

```javascript
var var_with_name = function func_with_name(){
    return 'str';
};
```
**Point**  
`init` property に、  
 `{"type": "FunctionExpression", ....}` として定義される。  
 `type` 以外の property (`id`, `params` など)の定義方法は `The function declaration (引数なし)` と同じ。  

```json
{
    "type": "VariableDeclaration",
    "declarations": [
        {
            "type": "VariableDeclarator",
            "id": {
                "type": "Identifier",
                "name": "var_with_name"
            },
            "init": {
                "type": "FunctionExpression",
                "id": {
                    "type": "Identifier",
                    "name": "func_with_name"
                },
                "params": [],
                "body": {
                    "type": "BlockStatement",
                    "body": [
                        {
                            "type": "ReturnStatement",
                            "argument": {
                                "type": "Literal",
                                "value": "str",
                                "raw": "'str'"
                            }
                        }
                    ]
                },
                "generator": false,
                "expression": false,
                "async": false
            }
        }
    ],
    "kind": "var"
}
```
## The function expression (関数名定義なし)
```javascript
var var_anonymous = function(){
    return 'str';
};
```
**Point**  
`"id": null`となる
```json
{
    "type": "VariableDeclaration",
    "declarations": [
        {
            "type": "VariableDeclarator",
            "id": {
                "type": "Identifier",
                "name": "var_anonymous"
            },
            "init": {
                "type": "FunctionExpression",
                "id": null,
                "params": [],
                "body": {
                    "type": "BlockStatement",
                    "body": [
                        {
                            "type": "ReturnStatement",
                            "argument": {
                                "type": "Literal",
                                "value": "str",
                                "raw": "'str'"
                            }
                        }
                    ]
                },
                "generator": false,
                "expression": false,
                "async": false
            }
        }
    ],
    "kind": "var"
}
```

## Call back

でもその前に、  
関数コール

```javascript
function func0_no_arg(){
    return 1;
}
func0_no_arg();
```
**Point**  
関数コール部分 `func0_no_arg();` は `CallExpression` と見なされ、  
`callee` property にコールされる関数が示される。
```json
{
    "type": "FunctionDeclaration",
    "id": {
        "type": "Identifier",
        "name": "func0_no_arg"
    },
    "params": [],
    "body": {
        "type": "BlockStatement",
        "body": [
            {
                "type": "ReturnStatement",
                "argument": {
                    "type": "Literal",
                    "value": 1,
                    "raw": "1"
                }
            }
        ]
    },
    "generator": false,
    "expression": false,
    "async": false
},
{
    "type": "ExpressionStatement",
    "expression": {
        "type": "CallExpression",
        "callee": {
            "type": "Identifier",
            "name": "func0_no_arg"
        },
        "arguments": []
    }
}
```

### 関数を引数に直接定義して関数コール(関数名あり)

```javascript
function do_by_callback(func_callback){
    func_callback('do something');
}
do_by_callback(function do_log(do_by_this){
    console.log(do_by_this);
});
```
**Point**  
`do_by_callback` 関数をコールする部分(CallExpression) の `arguments` property に  
関数式(FunctionExpression) が入る。  

```json
{
    "type": "FunctionDeclaration",
    "id": {
        "type": "Identifier",
        "name": "do_by_callback"
    },
    "params": [
        {
            "type": "Identifier",
            "name": "func_callback"
        }
    ],
    "body": {
        "type": "BlockStatement",
        "body": [
            {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "func_callback"
                    },
                    "arguments": [
                        {
                            "type": "Literal",
                            "value": "do something",
                            "raw": "'do something'"
                        }
                    ]
                }
            }
        ]
    },
    "generator": false,
    "expression": false,
    "async": false
},
{
    "type": "ExpressionStatement",
    "expression": {
        "type": "CallExpression",
        "callee": {
            "type": "Identifier",
            "name": "do_by_callback"
        },
        "arguments": [
            {
                "type": "FunctionExpression",
                "id": {
                    "type": "Identifier",
                    "name": "do_log"
                },
                "params": [
                    {
                        "type": "Identifier",
                        "name": "do_by_this"
                    }
                ],
                "body": {
                    "type": "BlockStatement",
                    "body": [
                        {
                            "type": "ExpressionStatement",
                            "expression": {
                                "type": "CallExpression",
                                "callee": {
                                    "type": "MemberExpression",
                                    "computed": false,
                                    "object": {
                                        "type": "Identifier",
                                        "name": "console"
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": "log"
                                    }
                                },
                                "arguments": [
                                    {
                                        "type": "Identifier",
                                        "name": "do_by_this"
                                    }
                                ]
                            }
                        }
                    ]
                },
                "generator": false,
                "expression": false,
                "async": false
            }
        ]
    }
}
```

### 関数を引数に直接定義して関数コール(関数名なし)
```javascript
function do_by_callback(func_callback){
    func_callback('do something');
}
do_by_callback(function(do_by_this){
    console.log(do_by_this);
});
```
**Point**  
`関数を引数に直接定義して関数コール(関数名なし)` したときの  
関数式(FunctionExpression)の `id` property が `null` になるだけ。  
※AST出力結果は省略  

### 関数を引数に指定して関数コール

```javascript
function do_by_callback(func_callback){
    func_callback('do something');
}

function do_log(do_by_this){
    console.log(do_by_this);
}

do_by_callback(do_log);
```
**Point**  
1. コールする `do_by_callback(do_log);` では、`do_log` は単なる identifier。  
     
さらに、  

2. コールされる`do_by_callback` 関数から見ると、引数で指定された `func_callback` は単なる identifier。  
   
なので、  
`do_by_callback(do_log);` の実行でどの関数がコールされるかを静的に解析する為には、  
`1.` で指定した `do_log` という identifier が示す実態と、  
`2.` で指定された `func_callback` identifier が示す実態を結びつける  

```json
{
    "type": "FunctionDeclaration",
    "id": {
        "type": "Identifier",
        "name": "do_by_callback"
    },
    "params": [
        {
            "type": "Identifier",
            "name": "func_callback"
        }
    ],
    "body": {
        "type": "BlockStatement",
        "body": [
            {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "func_callback"
                    },
                    "arguments": [
                        {
                            "type": "Literal",
                            "value": "do something",
                            "raw": "'do something'"
                        }
                    ]
                }
            }
        ]
    },
    "generator": false,
    "expression": false,
    "async": false
},
{
    "type": "FunctionDeclaration",
    "id": {
        "type": "Identifier",
        "name": "do_log"
    },
    "params": [
        {
            "type": "Identifier",
            "name": "do_by_this"
        }
    ],
    "body": {
        "type": "BlockStatement",
        "body": [
            {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "console"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "log"
                        }
                    },
                    "arguments": [
                        {
                            "type": "Identifier",
                            "name": "do_by_this"
                        }
                    ]
                }
            }
        ]
    },
    "generator": false,
    "expression": false,
    "async": false
},
{
    "type": "ExpressionStatement",
    "expression": {
        "type": "CallExpression",
        "callee": {
            "type": "Identifier",
            "name": "do_by_callback"
        },
        "arguments": [
            {
                "type": "Identifier",
                "name": "do_log"
            }
        ]
    }
}
```

### 関数が代入された変数を、引数に指定して関数コール

```javascript
function do_by_callback(func_callback){
    func_callback('do something');
}

var func_calllee = function do_log(do_by_this){
    console.log(do_by_this);
}

do_by_callback(func_calllee);
```
**Point**  
コールする `do_by_callback(func_calllee);` と、  
コールされる `function do_by_callback(func_callback){` は、  
`関数を引数に指定して関数コール` したときと、何ら変わらない。  
```json
{
    "type": "FunctionDeclaration",
    "id": {
        "type": "Identifier",
        "name": "do_by_callback"
    },
    "params": [
        {
            "type": "Identifier",
            "name": "func_callback"
        }
    ],
    "body": {
        "type": "BlockStatement",
        "body": [
            {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "func_callback"
                    },
                    "arguments": [
                        {
                            "type": "Literal",
                            "value": "do something",
                            "raw": "'do something'"
                        }
                    ]
                }
            }
        ]
    },
    "generator": false,
    "expression": false,
    "async": false
},
{
    "type": "VariableDeclaration",
    "declarations": [
        {
            "type": "VariableDeclarator",
            "id": {
                "type": "Identifier",
                "name": "func_calllee"
            },
            "init": {
                "type": "FunctionExpression",
                "id": {
                    "type": "Identifier",
                    "name": "do_log"
                },
                "params": [
                    {
                        "type": "Identifier",
                        "name": "do_by_this"
                    }
                ],
                "body": {
                    "type": "BlockStatement",
                    "body": [
                        {
                            "type": "ExpressionStatement",
                            "expression": {
                                "type": "CallExpression",
                                "callee": {
                                    "type": "MemberExpression",
                                    "computed": false,
                                    "object": {
                                        "type": "Identifier",
                                        "name": "console"
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": "log"
                                    }
                                },
                                "arguments": [
                                    {
                                        "type": "Identifier",
                                        "name": "do_by_this"
                                    }
                                ]
                            }
                        }
                    ]
                },
                "generator": false,
                "expression": false,
                "async": false
            }
        }
    ],
    "kind": "var"
},
{
    "type": "ExpressionStatement",
    "expression": {
        "type": "CallExpression",
        "callee": {
            "type": "Identifier",
            "name": "do_by_callback"
        },
        "arguments": [
            {
                "type": "Identifier",
                "name": "func_calllee"
            }
        ]
    }
}
```

## Method //todo ここから

### new しない場合

### new する場合
```
var instatiated = new clsfunc_a();
function clsfunc_a(){
    this.method1 = function(){console.log('str');}
}
instatiated.method1;
```

### prototype を使った方法 //todo 動かない
```
var instatiated = new clsfunc_a();
function clsfunc_a(){
    
}
instatiated.prototype.method1 = function(){console.log('str');}
instatiated.method1;
```

### prototype chain //todo ここまで

## IIFE (Immediately Invoked Function Expression; 即時実行関数式) 

### 関数名定義あり

```javascript
(function func_with_name(){
  console.log('func_with_name() in IIFE');
})();
```
**Point**  
CallExpression の `callee` property に、`FunctionExpression` が入る
```json
{
    "type": "ExpressionStatement",
    "expression": {
        "type": "CallExpression",
        "callee": {
            "type": "FunctionExpression",
            "id": {
                "type": "Identifier",
                "name": "func_with_name"
            },
            "params": [],
            "body": {
                "type": "BlockStatement",
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                    "type": "Identifier",
                                    "name": "console"
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "log"
                                }
                            },
                            "arguments": [
                                {
                                    "type": "Literal",
                                    "value": "func_with_name() in IIFE",
                                    "raw": "'func_with_name() in IIFE'"
                                }
                            ]
                        }
                    }
                ]
            },
            "generator": false,
            "expression": false,
            "async": false
        },
        "arguments": []
    }
}
```

### 関数名定義なし

```javascript
(function(){
    console.log('func_with_name() in IIFE');
  })();
```
**Point**  
`関数名定義あり`の時に比べ、  
FunctionExpression の `id` property が `nuul` になるだけ。  
※ AST は省略

# The generator function declaration (function* statement)

->Not compatible

# The generator function expression (function* expression)

->Not compatible

# The arrow function expression (=>)

->Not compatible

# The Function constructor

->Not compatible

# The GeneratorFunction constructor

->Not compatible

# Function parameters

## Default parameters

->Not compatible

## Rest parameters

->Not compatible

# The arguments object

->Not compatible

# Getter and setter functions

->Not compatible
