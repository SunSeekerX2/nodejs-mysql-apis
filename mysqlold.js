/*
*  name: node.js操作mysql数据库查询模块
*  author: SunSeekerX
*  time： 2019年3月17日11点39分
* */

const mysql = require('mysql'),
    config = require('./config')
    pool = mysql.createPool( config.mysqlConfig )//创建连接池

// 基本查询
exports.query = function (sqlObj) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err){
                return reject(err)
            }
            connection.query(sqlObj.sql, sqlObj.params, (error, result) => {
                if (error){
                    reject(error)
                } else {
                    resolve(result)
                }
                connection.release()
            })
        })
    })
}

// 开启事物查询
exports.transaction = function (sqlArr) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if(err){
                return reject(err)
            }
            connection.beginTransaction( (err) =>{
                if(err){
                    reject(err)
                }
                for(let i = 0; i < sqlArr.length; i++){
                    connection.query( sqlArr[i].sql, sqlArr[i].params, (err, result) =>{
                        if(err){
                            connection.rollback(() => { reject(err)} )
                        }
                    })
                }
                connection.commit(err => {
                    if(err) {
                        connection.rollback(() => {
                            reject(err)
                        })
                    }
                })
                // 事务执行成功，释放连接
                resolve('Transaction compolete')
                pool.releaseConnection(connection)
            })
        })
    })
}
