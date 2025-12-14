import express from "express";
import verifyController from '../controllers/verifyController.js'
import batchController from '../controllers/batchController.js'

const router = express.Router()

router.post('/', verifyController)
router.post('/batch', batchController)

export default router