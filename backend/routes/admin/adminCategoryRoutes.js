const express = require('express');
const {
  create, update, remove, listAll,
} = require('../../controllers/admin/adminCategoryController');
const validate = require('../../middleware/validateMiddleware');
const { createCategorySchema, updateCategorySchema } = require('../../validators/categoryValidator');

const router = express.Router();

router.get('/', listAll);
router.post('/', validate(createCategorySchema), create);
router.put('/:id', validate(updateCategorySchema), update);
router.delete('/:id', remove);

module.exports = router;
