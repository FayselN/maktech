const express = require('express');
const {
  create, update, remove, listAll, addScreenshots, deleteScreenshot, getById,
} = require('../../controllers/admin/adminAppController');
const validate = require('../../middleware/validateMiddleware');
const { upload } = require('../../middleware/uploadMiddleware');
const { createAppSchema, updateAppSchema } = require('../../validators/appValidator');

const router = express.Router();

router.get('/', listAll);
router.get('/:id', getById);
router.post('/', validate(createAppSchema), create);
router.put('/:id', validate(updateAppSchema), update);
router.delete('/:id', remove);
router.post('/:id/screenshots', upload.array('screenshots', 10), addScreenshots);
router.delete('/:id/screenshots/:screenshotId', deleteScreenshot);

module.exports = router;
