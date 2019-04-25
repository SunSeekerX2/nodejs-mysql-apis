/*
*  @name：node.js操作mysql数据库模块
*  @author：SunSeekerX
*  @time：2019年4月25日13点55分
* */

const mysql = require('mysql'),
	config = require('../../config/config'),
	pool = mysql.createPool(config.mysqlConfig)

module.exports = {
	// 基本查询
	query: async function (sqlObj) {
		return new Promise((resolve, reject) => {
			pool.getConnection((err, connection) => { // 从连接池获取连接
				if (err) {return reject(err)} // 获取连接失败，返回错误
				connection.query(sqlObj.sql, sqlObj.params, (error, result) => {
					connection.release() // 释放连接
					error ? reject(error) : resolve(result) // 查询结果
				})
			})
		})
	},

	// 开启事物查询
	transaction: async function (sqlArr) {
		return new Promise((resolve, reject) => {
			pool.getConnection((poolError, connection) => { // 从连接池获取连接
				if (poolError) { // 获取连接失败，返回错误
					return reject(poolError)
				}
				connection.beginTransaction(async err => { // 开始事务
					if (err) {return reject(err)} // 获取连接失败，返回错误
					let result = [],	// 结果集
						errInfo = null	//错误对象
					for (let i = 0; i < sqlArr.length; i++) { // 循环查询
						try {
							result.push(await new Promise((resolve, reject) => { // 将查询结果放进结果集
								connection.query(sqlArr[i].sql, sqlArr[i].params, (err, result) => { // 查询
									err ? reject(err) : resolve(result)
								})
							}))
						} catch (e) { // sql语句执行出错，跳出循环，不继续执行
							errInfo = e
							break
						}
					}
					pool.releaseConnection(connection) // 释放链接
					if (errInfo) {
						connection.rollback(() => { // 有数据条目执行失败, 回滚代码
							reject(errInfo)
						})
					} else {
						connection.commit(err => { // 语句全部执行成功，commit提交
							err ? reject(err) : resolve(result)
						})
					}
				})
			})
		})
	}
}
