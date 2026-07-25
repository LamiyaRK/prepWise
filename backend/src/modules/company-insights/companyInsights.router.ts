import { Router } from 'express'
import { getCompanies, getCompany } from './companyInsights.controller'

const router = Router()

router.get('/', getCompanies)
router.get('/:company', getCompany)

export default router
