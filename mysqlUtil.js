/*
*  name：node.js操作mysql数据库模块
*  author：SunSeekerX
*  time：2019年3月19日23点04分
* */
const mysql = require('mysql'),
	pool = mysql.createPool({//创建连接池
		host: 'localhost',//数据库链接
		port: 3306,//端口
		database: 'mysqltest',//数据库
		user: 'root',//用户名
		password: '12345678900',//密码
		acquireTimeout: 15000, // 连接超时时间
		connectionLimit: 64, // 最大连接数
		waitForConnections: true, // 超过最大连接时排队
		queueLimit: 0, // 排队最大数量(0 代表不做限制)
		multipleStatements: false, // 是否允许执行多条语句
	})

// 基本查询
exports.query = function(sqlObj) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {// 从连接池获取连接
			if (err) { return reject(err) }// 获取连接失败，返回错误
			connection.query(sqlObj.sql, sqlObj.params, (error, result) => {
				connection.release() //释放连接
				error ? reject(error) : resolve(result) //查询结果
			})
		})
	})
}

// 开启事物查询
exports.transaction = function(sqlArr) {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {// 从连接池获取连接
			connection.beginTransaction(async err => {//开始事务
				if (err) { return reject(err) }// 获取连接失败，返回错误
				let result = [],// 结果集
					errInfo = null//错误对象
				for (let i = 0; i < sqlArr.length; i++) {// 循环查询
					try {
						result.push(await new Promise((resolve, reject) => {//将查询结果放进结果集
							connection.query(sqlArr[i].sql, sqlArr[i].params, (err, result) => {//查询
								err ? reject(err) : resolve(result)
							})
						}))
					} catch (e) { // sql语句执行出错，跳出循环，不继续执行
						errInfo = e
						break
					}
				}
				pool.releaseConnection(connection)// 释放链接
				if (errInfo) {
					connection.rollback(() => {//有数据条目执行失败, 回滚代码
						reject(errInfo)
					})
				} else {
					connection.commit(err => {// 语句全部执行成功，commit提交
						err ? reject(err) : resolve(result)
					})
				}
			})
		})
	})
}
