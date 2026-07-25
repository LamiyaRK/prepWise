import { Request, Response } from 'express'
import { listCompanies, getCompanyInsights } from './companyInsights.service'

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const companies = await listCompanies(search)
    res.json(companies)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getCompany = async (req: Request, res: Response) => {
  try {
    const company = decodeURIComponent(String(req.params.company))
    const insights = await getCompanyInsights(company)
    res.json(insights)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
}
