const conn = require('../configs/database')

function getQuantity(x, username) {
    return new Promise(resolve => {
        conn.query(`SELECT quantity FROM cart WHERE product_id = '${x}' AND username = '${username}'`, (err, data) => {
            if (err) throw err;
            resolve(data[0])
        })
    })
}
function checkExist(x) {
    return new Promise(resolve => {
        conn.query(`SELECT id FROM product WHERE id = '${x}'`, (err, data) => {
            if (err) throw err;
            resolve(data[0])
        })
    })
}
function getCartList(username) {
    return new Promise(resolve => {
        conn.query(`SELECT product_id, quantity FROM cart WHERE username = '${username}'`, (err, data) => {
            if (err) throw err;
            resolve(data)
        })
    })
}
function getHistoryList(username, x) {
    return new Promise(resolve => {
        conn.query(`SELECT * FROM history WHERE username = '${username}' AND product_id = '${x}'`, (err, data) => {
            if (err) throw err;
            resolve(data[0])
        })
    })
}
function checkStock(id, qty) {
    return new Promise(resolve => {
        conn.query(`SELECT stock FROM product WHERE id = '${id}'`, (err, data) => {
            if (err) throw err;
            if (data[0].stock - qty >= 0) {
                console.log(data[0].stock - qty);
                resolve(data[0].stock - qty)
            } else {
                resolve(false)
            }
        })
    })
}

module.exports = {
    getCart: (username, page, sort) => {
        if (!page) {
            limit = ""
        } else {
            limit = ' LIMIT ' + ((page * 5) - 5) + ', 5'
        }
        if (!sort) {
            order = 'product_id'
        } else {
            order = sort
        }
        return new Promise(resolve => {
            conn.query(`SELECT c.quantity, p.id AS product_id, p.name, p.price, p.category_id, p.description, c.updated_at FROM cart c LEFT JOIN product p ON c.product_id = p.id WHERE username = '${username}' ORDER BY ${order}${limit}`, (err, data) => {
                if (err) throw err;
                resolve([username, data])
            })
        })
    },
    addCart: async (username, data) => {
        for (const x in data) {
            if(await checkExist(x)) {
            const qty = await getQuantity(x)
                if (qty == undefined) {
                    conn.query(`INSERT INTO cart (username, product_id, quantity) VALUES ('${username}', '${x}', '${data[x]}')`, (err, data) => {
                        if (err) throw err;
                    })
                } else {
                    conn.query(`UPDATE cart SET quantity = '${parseFloat(qty.quantity) + parseFloat(data[x])}' WHERE username = '${username}' AND product_id = '${x}'`, (err, data) => {
                        if (err) throw err;
                    })
                }
            }
        }
        return new Promise(resolve => {
            resolve('Finish')
        })
    },
    reduceCart: async (username, data) => {
        for (const x in data) {
            const qty = await getQuantity(x)
            if (qty != undefined) {
                if (qty.quantity - data[x] <= 0) {
                    conn.query(`DELETE FROM cart WHERE product_id = '${x}'`, err => {
                        if (err) throw err;
                    })
                } else {
                    conn.query(`UPDATE cart SET quantity = '${parseFloat(qty.quantity) - parseFloat(data[x])}' WHERE username = '${username}' AND product_id = '${x}'`, err => {
                        if (err) throw err;
                    })
                }
            }
        }
        return new Promise(resolve => {
            resolve('Finish')
        })
    },
    checkout: async (username) => {
        const cartList = await getCartList(username)
        for (const x in cartList) {
            const historyList = await getHistoryList(username, cartList[x].product_id)
            const stock = await checkStock(cartList[x].product_id, cartList[x].quantity)
            if (stock !== false) {
                if (historyList == undefined) {
                    conn.query(`INSERT INTO history (username, product_id, quantity) VALUES ('${username}', '${cartList[x].product_id}', '${cartList[x].quantity}')`, err => {
                        if (err) throw err;
                    })
                } else {
                    conn.query(`UPDATE history SET quantity = '${parseFloat(historyList.quantity) + parseFloat(cartList[x].quantity)}' WHERE id = '${historyList.id}'`, err => {
                        if (err) throw err;
                    })
                }
                conn.query(`UPDATE product SET stock = ${stock} WHERE id = '${cartList[x].product_id}'`, err => {
                    if (err) throw err;
                })
            }
        }
        conn.query(`DELETE FROM cart WHERE username = '${username}'`, err => {
            if (err) throw err;
        })
        return new Promise(resolve => {
            resolve('Finish')
        })
    }
}