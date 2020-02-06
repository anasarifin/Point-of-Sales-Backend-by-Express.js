const category = require("../models/category");

module.exports = {
	getCategory: (req, res) => {
		category.getCategory().then(result => {
			res.json({ total_categories: result.length, category_list: result });
		});
	},
	insertCategory: (req, res) => {
		const name = { name: req.body.name };
		category.insertCategory(name).then(result => {
			res.json(result);
		});
	},
	updateCategory: (req, res) => {
		const id = req.params.id;
		const name = { name: req.body.name };
		category.updateCategory(id, name).then(result => {
			res.json(result);
		});
	},
	deleteCategory: (req, res) => {
		const id = req.params.id;
		category.deleteCategory(id).then(result => {
			res.json(result);
		});
	},
};
