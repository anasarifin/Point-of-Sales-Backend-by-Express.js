const history = require("../models/history");

function helper(data) {
	const json = {};
	json.total_transaction_count = data.length;
	json.total_item_sold = data.reduce((sum, x) => {
		return (sum += 1 * x.quantity);
	}, 0);
	json.total_income = data.reduce((sum, x) => {
		return (sum += x.price * x.quantity);
	}, 0);
	json.sold_item_list = data;
	return json;
}

module.exports = {
	getHistory: (req, res) => {
		history.getHistory(req.query).then(result => {
			result.forEach(x => {
				x.purchased_date = x.updated_at;
				delete x.updated_at;
			});
			res.json(helper(result));
		});
	},
};
