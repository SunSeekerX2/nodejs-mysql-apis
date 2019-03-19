# 描述

- 这是一个`node.js`操作mysql数据库的一个工具模块，但作为一个node.js新手参考网上的代码进行了封装但`node.js`网上的教程大多参差不齐，对于初学者有着很大的困难
- 关于事务操作的封装有着很严重的bug
- 单条语句执行没有问题

``` javascript
mysql.query({sql: 'select * from `user`'})
            .then(data =>{
                res.json({code: code.global.success, msg: 'ok', data: data})
            })
```



我想执行这样的操作，循环查询，如果sqlArr中有一条语句执行失败就回滚，返回执行的结果，但无奈异步这方面实在是欠缺，百度，Google了很多依然还是不能理解和解决，实际上第一条和第三条语句执行成功了，（表中age设置了不能为空）

``` javascript
const sqlArr = [
            {sql: 'INSERT INTO `user` (name,age) VALUES (?,?)', params: ['libai', 1]},
            {sql: 'INSERT INTO `user` (name,age) VALUES (?,?)', params: ['hanxin',null]},
            {sql: 'INSERT INTO `user` (name,age) VALUES (?,?)', params: ['libai', 2]},
        ]
        mysql.transaction(sqlArr)
            .then(data => {
                res.json({code: code.global.success, msg: 'ok', data: data})
            }, err =>{
                res.json({code: code.global.fail, msg: 'fail', data: err})
            })
```

