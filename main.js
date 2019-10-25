//<settings>----------------------------------------------------------------------

//パース対象ファイルは 1st argment(= process.argv[2] に指定される事とする)
var argnum_of_target_file_path = 2;

//パース対象ファイルの encoding
var encoding_of_target_file = "utf-8";

//パース時に生成された AST object をファイル出力するかどうか
var bl_enable_output_AST_obj_as_JSON_file = true;

//パース時に生成された AST object をファイル出力する場合の、ファイル名 suffix
var str_suffix_of_stringified_AST_obj_file_name = "_ast";

//---------------------------------------------------------------------</settings>

// load module
var mod_fs = require('fs');
var mod_path = require('path');
var mod_esprima = require('esprima');
var mod_estraverse = require('estraverse');

//Argment check
if(process.argv.length <= argnum_of_target_file_path){ //パース対象ファイル指定が無い場合
    console.error("To parsing file is not specified.");
    return; //終了
}

//File open and read as text
var str_js_code = mod_fs.readFileSync(
    process.argv[argnum_of_target_file_path], // to open file path
    {
        encoding: encoding_of_target_file
    }
);

//Parse JavaScript code using esprima
var obj_AST_of_js_code = mod_esprima.parseScript(str_js_code); // get AST(Abstract Syntax Tree) object

if(bl_enable_output_AST_obj_as_JSON_file){ //パース時に生成された AST object をファイル出力する設定の場合
    
    //ファイル出力先 path 生成
    var str_dir_of_target_file = mod_path.dirname(process.argv[argnum_of_target_file_path]); //パース指定対象ファイルの格納ディレクトリ取得
    var str_no_ext_file_name_of_target_file = mod_path.basename(process.argv[argnum_of_target_file_path], mod_path.extname(process.argv[argnum_of_target_file_path])); //パース指定対象ファイル拡張子抜きファイル名の取得
    var str_fullpath_of_stringified_AST_obj_file =
        str_dir_of_target_file + '\\' +
        str_no_ext_file_name_of_target_file +
        str_suffix_of_stringified_AST_obj_file_name +
        ".json"
    ;

    //ファイル出力
    mod_fs.writeFile(
        str_fullpath_of_stringified_AST_obj_file, // 出力ファイルパス
        JSON.stringify(obj_AST_of_js_code, null, '    '), // 出力内容('    '(スペース4つ)で indent 整形した AST object を指定)
        function(err){ //ファイル出力中にエラーが発生した場合の callback function
            if(err){
                throw err;
            }
        }
    );
}

console.log("# Adding scope info");

// TraversedObj_HoistedDeclarations
//     このスコープに属する変数それぞれに対する、
//     その変数定義をを表す AST node
        
//         VariableDeclarator    - `var` キーワードを使用した変数宣言
//         AssignmentExpression  - 変数代入
//         FunctionDeclaration   - 関数宣言
//         Identifier            - 関数の引数定義(デフォルト定義なし)
//         AssignmentPattern     - 関数の引数定義(デフォルト定義あり)
        

// TraversedObj_ClosurePieces
//     TraversedObj_HoistedDeclarations[] の要素と実態を結びつける宣言を表す AST node

//         VariableDeclarator    - `var` キーワードを使用した変数宣言
//         AssignmentExpression  - 変数代入
//         CallExpression        - 関数コール
//         ReturnStatement       - 返却

(function () {
    var arr_depth_stack = [];

    mod_estraverse.traverse(
        obj_AST_of_js_code,
        {
            enter: function(obj_current_node, obj_parent_node) {

                func_updateDepthStack(obj_current_node, obj_parent_node, arr_depth_stack); // 現在の node の位置を arr_depth_stack[] に保存
                // func_printDepthStack(arr_depth_stack, 'type', '/') //デバッグ表示

                var bool_is_scope_node = false;
                
                switch(obj_current_node.type){
                    case 'Program':
                    case 'FunctionExpression':
                    case 'FunctionDeclaration':
                    {
                        bool_is_scope_node = true;
                    }
                    case 'VariableDeclarator':
                    case 'AssignmentExpression':
                    case 'CallExpression':
                    case 'ReturnStatement':
                    {
                        if(bool_is_scope_node){
                            if((typeof obj_current_node.TraversedObj_HoistedDeclarations) == 'undefined'){
                                obj_current_node.TraversedObj_HoistedDeclarations = [];
                                obj_current_node.TraversedObj_NestedFunctions = [];
                                obj_current_node.TraversedObj_ClosurePieces = [];
                                obj_current_node.TraversedObj_Returns = [];
                            }

                            // 関数宣言の場合は、引数の宣言を表す AST node を TraversedObj_HoistedDeclarations に登録する
                            if( typeof (obj_current_node.params)  != 'undefined'){
                                for (var num_idxOfParams = 0 ; num_idxOfParams < obj_current_node.params.length ; num_idxOfParams++){
                                    var obj_param = obj_current_node.params[num_idxOfParams];
                                    obj_param.TraversedObj_Closures = [];
                                    obj_current_node.TraversedObj_HoistedDeclarations.push(obj_param);

                                    if(obj_param.type == 'AssignmentPattern'){ //デフォルト値宣言をしている場合
                                        obj_current_node.TraversedObj_ClosurePieces.push(obj_param);
                                    }
                                }
                            }
                        }
                        
                        var obj_parent_function = null;
                        for(var i = arr_depth_stack.length-2 ; i >= 0 ; i--){
                            switch(arr_depth_stack[i].type){
                                case 'Program':
                                case 'FunctionExpression':
                                case 'FunctionDeclaration':
                                {
                                    obj_parent_function = arr_depth_stack[i];

                                    // <registering hoisted info>------------------------------------------------------
                                    switch(obj_current_node.type){
                                        case 'VariableDeclarator':
                                        {
                                            obj_current_node.TraversedObj_Closures = [];
                                            arr_depth_stack[i].TraversedObj_HoistedDeclarations.push(obj_current_node);
                                            arr_depth_stack[i].TraversedObj_ClosurePieces.push(obj_current_node);
                                            break;
                                        }
                                        case 'FunctionExpression':
                                        {
                                            arr_depth_stack[i].TraversedObj_NestedFunctions.push(obj_current_node);
                                            break;
                                        }
                                        case 'FunctionDeclaration':
                                        {
                                            arr_depth_stack[i].TraversedObj_HoistedDeclarations.push(obj_current_node);
                                            arr_depth_stack[i].TraversedObj_NestedFunctions.push(obj_current_node);
                                            break;
                                        }
                                        case 'AssignmentExpression':
                                        case 'CallExpression':
                                        case 'ReturnStatement':
                                        {
                                            arr_depth_stack[i].TraversedObj_ClosurePieces.push(obj_current_node);
                                            break;
                                        }
                                        default:
                                        {
                                            //nothing to do
                                            break;
                                        }
                                    }
                                    // -----------------------------------------------------</registering hoisted info>

                                    i = 0; //break `for` statement
                                    break;
                                }
                                default:
                                {
                                    //nothing to do
                                    break;
                                }
                            }
                        }
                        
                        if(bool_is_scope_node){
                            obj_current_node.TraversedObj_ParentFunction = obj_parent_function;
                        }

                        break;
                    }
                    default:
                    {
                        //nothing to do
                        break;
                    }
                }
            }
        }
    );

    // note  
    // この時点で、スコープを形成する各 AST node の TraversedObj_HoistedDeclarations[] には、以下が登録されている  
    //
    //  - `VariableDeclarator`   -> `var` キーワードを使用した変数宣言  
    //  - `FunctionDeclaration`  -> 関数宣言  
    //  - `Identifier`           -> 関数の引数定義(デフォルト定義なし)  
    //  - `AssignmentPattern`    -> 関数の引数定義(デフォルト定義あり)  
    //
    // `AssignmentExpression` で代入される変数は、上記で登録されたいづれかの変数に対する代入を表す。  
    // しかし、`var` キーワードを使用せずに宣言した変数に対する `AssignmentExpression` の場合は、
    // 代入される変数が上記に登録されていない。  
    // 代入される変数の宣言は ECMA Script の仕様上グローバル変数とみなされるので、 
    // グローバルスコープを形成する AST node (最上位の node) に、  
    // この `AssignmentExpression` を TraversedObj_HoistedDeclarations[] に登録する

    arr_depth_stack = [];

    mod_estraverse.traverse(
        obj_AST_of_js_code,
        {
            enter: function(obj_current_node, obj_parent_node) {

                func_updateDepthStack(obj_current_node, obj_parent_node, arr_depth_stack); // 現在の node の位置を arr_depth_stack[] に保存
                // func_printDepthStack(arr_depth_stack, 'type', '/') //デバッグ表示

                switch(obj_current_node.type){
                    case 'Program':
                    case 'FunctionExpression':
                    case 'FunctionDeclaration':
                    {

                        for(var i = 0 ; i < obj_current_node.TraversedObj_ClosurePieces.length ; i++){
                            var obj_closurePiece = obj_current_node.TraversedObj_ClosurePieces[i];
                            //console.log("  TraversedObj_ClosurePieces[" + String(i) + "].type: " + obj_closurePiece.type);
                            
                            switch(obj_closurePiece.type){
                                case 'AssignmentExpression':
                                {
                                    switch(obj_closurePiece.left.type){
                                        case 'Identifier':
                                        {
                                            var obj_found = findHoistedDeclaration(obj_closurePiece.left.name, obj_current_node);
                                            if(typeof obj_found == 'undefined'){
                                                obj_closurePiece.TraversedObj_Closures = [];
                                                arr_depth_stack[0].TraversedObj_HoistedDeclarations.push(obj_closurePiece);
                                            }
                                            break;
                                        }
                                        //todo
                                        // `Identifier` 以外の場合(`CallExpression`等)に対応できない
                                        default:
                                        {
                                            //nothing to do
                                            break;
                                        }
                                    }
                                    break;
                                }
                                default:
                                {
                                    //nothing to do
                                    break;
                                }
                            }
                        }
                    }
                    default:
                    {
                        //nothing to do
                        break;
                    }
                }
            }
        }
    );
}());

//
// TraversedObj_HoistedDeclarations[] の要素に対して 
//
console.log("\n# Closurings");

(function () {

    var arr_depth_stack = [];

    mod_estraverse.traverse(
        obj_AST_of_js_code,
        {
            enter: function(obj_current_node, obj_parent_node) {

                func_updateDepthStack(obj_current_node, obj_parent_node, arr_depth_stack); // 現在の node の位置を arr_depth_stack[] に保存
                // func_printDepthStack(arr_depth_stack, 'type', '/') //デバッグ表示

                switch(obj_current_node.type){
                    case 'Program':
                    case 'FunctionExpression':
                    case 'FunctionDeclaration':
                    {
                        for(var i = 0 ; i < obj_current_node.TraversedObj_ClosurePieces.length ; i++){
                            var obj_closurePiece = obj_current_node.TraversedObj_ClosurePieces[i];
                            // console.log("  TraversedObj_ClosurePieces[" + String(i) + "].type: " + obj_closurePiece.type);
                            
                            switch(obj_closurePiece.type){
                                case 'VariableDeclarator':
                                {
                                    obj_closurePiece.TraversedObj_Closures.push(obj_closurePiece.init);
                                    break;
                                }
                                case 'AssignmentPattern':
                                case 'AssignmentExpression':
                                {
                                    switch(obj_closurePiece.left.type){
                                        case 'Identifier':
                                        {
                                            var obj_found = findHoistedDeclaration(obj_closurePiece.left.name, obj_current_node);
                                            obj_found.TraversedObj_Closures.push(obj_closurePiece.right);
                                            break;
                                        }
                                        //todo
                                        // `Identifier` 以外の場合(`CallExpression`等)に対応できない
                                        default:
                                        {
                                            console.warn("Unkown type `" + obj_closurePiece.left.type + '` was specified as left of `AssignmentExpression`.');
                                            break;
                                        }
                                    }
                                    break;
                                }
                                case 'CallExpression':
                                {
                                    var obj_found = findHoistedDeclaration(obj_closurePiece.callee.name, obj_current_node);
                                    var obj_foundFunctions = findFunctions(obj_found, obj_current_node);

                                    //callee の 引数への assignment を closure として登録
                                    for(var num_idxOfCallees = 0 ; num_idxOfCallees < obj_foundFunctions.length ; num_idxOfCallees++){
                                        var obj_calleeFunction = obj_foundFunctions[num_idxOfCallees];
                                        
                                        for(var num_idxOfParams = 0 ; num_idxOfParams < obj_calleeFunction.params.length ; num_idxOfParams++){

                                            if(obj_closurePiece.arguments.length <= num_idxOfParams){ // caller の引数指定数をオーバーした場合
                                                break;
                                            }

                                            var obj_paramOfCallee = obj_calleeFunction.params[num_idxOfParams];
                                            var obj_argOfCaller = obj_closurePiece.arguments[num_idxOfParams];

                                            obj_paramOfCallee.TraversedObj_Closures.push(obj_argOfCaller); // caller の引数指定を closure として追加
                                        }

                                        // obj_found.TraversedObj_Closures = obj_found.TraversedObj_Closures.concat(obj_calleeFunction.TraversedObj_Returns); //todo ここではまだ早い
                                    }

                                    
                                    // console.log('    obj_closurePiece.callee.name:' + obj_closurePiece.callee.name);
                                    // console.log('    obj_foundFunctions.length:' + obj_foundFunctions.length);
                                    // for(var j = 0 ; j < obj_foundFunctions.length ; j++){
                                    //     var str_funcName = '';
                                    //     if(obj_foundFunctions[j].id === null){
                                    //         str_funcName = '(anonymous)';
                                    //     }else{
                                    //         str_funcName = obj_foundFunctions[j].id.name;
                                    //     }
                                    //     console.log('    obj_foundFunctions[' + j + ']:' + str_funcName);
                                    // }

                                    break;
                                }
                                case 'ReturnStatement':
                                {
                                    obj_current_node.TraversedObj_Returns.push(obj_closurePiece.argument);
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    default:
                    {
                        //nothing to do
                        break;
                    }
                }
            }
        }
    );

    arr_depth_stack = [];

    mod_estraverse.traverse(
        obj_AST_of_js_code,
        {
            enter: function(obj_current_node, obj_parent_node) {

                func_updateDepthStack(obj_current_node, obj_parent_node, arr_depth_stack); // 現在の node の位置を arr_depth_stack[] に保存
                // func_printDepthStack(arr_depth_stack, 'type', '/') //デバッグ表示

                switch(obj_current_node.type){
                    case 'Program':
                    case 'FunctionExpression':
                    case 'FunctionDeclaration':
                    {
                        for(var i = 0 ; i < obj_current_node.TraversedObj_ClosurePieces.length ; i++){
                            var obj_closurePiece = obj_current_node.TraversedObj_ClosurePieces[i];
                            // console.log("  TraversedObj_ClosurePieces[" + String(i) + "].type: " + obj_closurePiece.type);
                            
                            switch(obj_closurePiece.type){
                                case 'CallExpression':
                                {
                                    var obj_found = findHoistedDeclaration(obj_closurePiece.callee.name, obj_current_node);
                                    var obj_foundFunctions = findFunctions(obj_found, obj_current_node);

                                    
                                    for(var num_idxOfCallees = 0 ; num_idxOfCallees < obj_foundFunctions.length ; num_idxOfCallees++){
                                        var obj_calleeFunction = obj_foundFunctions[num_idxOfCallees];
                                        
                                        if(
                                            (obj_found.type != 'FunctionDeclaration') &&
                                            (obj_found.type != 'FunctionExpression')
                                        ){
                                            obj_found.TraversedObj_Closures = obj_found.TraversedObj_Closures.concat(obj_calleeFunction.TraversedObj_Returns);
                                        }
                                    }

                                    
                                    console.log('    obj_closurePiece.callee.name:' + obj_closurePiece.callee.name);
                                    console.log('    obj_foundFunctions.length:' + obj_foundFunctions.length);
                                    for(var j = 0 ; j < obj_foundFunctions.length ; j++){
                                        var str_funcName = '';
                                        if(obj_foundFunctions[j].id === null){
                                            str_funcName = '(anonymous)';
                                        }else{
                                            str_funcName = obj_foundFunctions[j].id.name;
                                        }
                                        console.log('    obj_foundFunctions[' + j + ']:' + str_funcName);
                                    }

                                    break;
                                }
                            }
                        }
                        break;
                    }
                    default:
                    {
                        //nothing to do
                        break;
                    }
                }
            }
        }
    );

}());

//
// identifier を表す文字列から、スコープ中最も近い TraversedObj_HoistedDeclarations[] の要素を返す
// 見つからない場合は undefined を返す
//
function findHoistedDeclaration(str_identifier, obj_startScopeNode){
    var obj_found;

    for(var j = 0 ; j < obj_startScopeNode.TraversedObj_HoistedDeclarations.length ; j++){
        
        var obj_hoistedDeclaration = obj_startScopeNode.TraversedObj_HoistedDeclarations[j];

        var str_name;

        switch(obj_hoistedDeclaration.type){
            case 'VariableDeclarator':
            case 'FunctionDeclaration':
            {
                str_name = obj_hoistedDeclaration.id.name;
                break;
            }
            case 'Identifier':
            {
                str_name = obj_hoistedDeclaration.name;
                break;
            }
            case 'AssignmentPattern':
            case 'AssignmentExpression':
            {
                str_name = obj_hoistedDeclaration.left.name;
                break;
            }
            default:
            {
                //nothing to do
                break;
            }
        }

        if(str_name == str_identifier){ //検索ヒットの場合
            obj_found = obj_hoistedDeclaration;
            break;
        }
        
    }
    if(typeof obj_found == 'undefined'){
        if(
            obj_startScopeNode.type == 'FunctionExpression' ||
            obj_startScopeNode.type == 'FunctionDeclaration'
        ){
            if(obj_startScopeNode.id.name == str_identifier){ //再帰コールの場合
                obj_found = obj_startScopeNode;
            
            }else{ //再帰コールではない場合
                obj_found = findHoistedDeclaration(str_identifier, obj_startScopeNode.TraversedObj_ParentFunction); //1つ上のスコープを検索
            }
        }
    }
    return obj_found;
}


//
// TraversedObj_HoistedDeclarations[] の要素が指し示す関数実態リストを返す
//
function findFunctions(obj_hoistedDealaration, obj_currentScopeNode){

    var obj_toRetFunctions = [];

    switch(obj_hoistedDealaration.type){
        case 'VariableDeclarator':
        case 'Identifier':
        case 'AssignmentPattern':
        case 'AssignmentExpression':
        {
            for(var j = 0 ; j < obj_hoistedDealaration.TraversedObj_Closures.length ; j++){
                var obj_closure = obj_hoistedDealaration.TraversedObj_Closures[j];
    
                if(obj_closure !== null){
                    switch(obj_closure.type){
                        case 'FunctionExpression':
                        {
                            obj_toRetFunctions.push(obj_closure);
                            break;
                        }
                        case 'Identifier':
                        {
                            var obj_found = findHoistedDeclaration(obj_closure.name, obj_currentScopeNode);
                            var obj_foundFunctions = findFunctions(obj_found, obj_currentScopeNode);
                            if(obj_foundFunctions.length > 0){
                                obj_toRetFunctions = obj_toRetFunctions.concat(obj_foundFunctions);
                            }
                            break;
                        }
                        case 'CallExpression':
                        {
                            var obj_found = findHoistedDeclaration(obj_closure.callee.name, obj_currentScopeNode);
                            var obj_foundFunctions = findFunctions(obj_found, obj_currentScopeNode);

                            for(var num_i = 0 ; num_i < obj_foundFunctions.length ; num_i++){
                                var list_returns = obj_foundFunctions[num_i].TraversedObj_Returns;
                                for(var num_r = 0 ; num_r < list_returns.length ; list_returns++){
                                    var str_searchByTthis;
                                    switch(list_returns[num_r].type){
                                        case 'Identifier':
                                        {
                                            str_searchByTthis = list_returns[num_r].name;
                                            break;
                                        }
                                        case 'CallExpression':
                                        {
                                            str_searchByTthis = list_returns[num_r].callee.name;
                                            break;
                                        }
                                        default:
                                        {
                                            console.warn("Unkown type");
                                            break;
                                        }
                                    }
                                    var obj_foundL2 = findHoistedDeclaration(str_searchByTthis, obj_foundFunctions[num_i]);
                                    var obj_foundFunctionsL2 = findFunctions(obj_foundL2, obj_foundFunctions[num_i]);
                                    obj_toRetFunctions = obj_toRetFunctions.concat(obj_foundFunctionsL2);
                                }
                            }
                            break;   
                        }
                        default:
                        {
                            //nothing to do
                            break;
                        }
                    }
                }
            }
            break;
        }
        case 'FunctionDeclaration':
        {
            obj_toRetFunctions.push(obj_hoistedDealaration);
        }
        default:
        {
            //nothing to do
            break;
        }
    }
    
    return obj_toRetFunctions;
}

//
// AST の深さを表すスタック配列を update する
//
function func_updateDepthStack(obj_currentNode, obj_parentNode, obj_depthStack){
    
    if(typeof obj_parentNode == 'object'){
        var num_idxOfDepthStack;
        for(num_idxOfDepthStack = (obj_depthStack.length - 1) ; num_idxOfDepthStack >= 0 ; num_idxOfDepthStack--){
            if(obj_depthStack[num_idxOfDepthStack] == obj_parentNode){
                break;
            }
        }

        if(num_idxOfDepthStack < (obj_depthStack.length - 1)){
            obj_depthStack.splice(num_idxOfDepthStack+1, obj_depthStack.length-(num_idxOfDepthStack+1));
        }
    }
    obj_depthStack.push(obj_currentNode);

}

//
// AST の深さを表すスタック配列を表示する
//
function func_printDepthStack(obj_depthStack, str_attr, str_delimiter = '/'){
    
    var str_to_view = "";
    var num_depth = 0;
    if(num_depth < obj_depthStack.length){
        str_to_view += obj_depthStack[num_depth][str_attr];
    }
    for(num_depth = 1 ; num_depth < obj_depthStack.length ; num_depth ++){
        str_to_view += str_delimiter + obj_depthStack[num_depth][str_attr];
    }
    console.log(str_to_view);
}

console.log("done");
