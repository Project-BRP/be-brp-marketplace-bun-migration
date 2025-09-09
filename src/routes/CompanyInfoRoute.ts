import { Hono } from 'hono';
import { CompanyInfoController } from '../controllers';
import { authMiddleware, roleMiddleware } from '../middlewares';
import { Role } from '../constants';

export const companyInfoRoute = new Hono();

companyInfoRoute.post(
  '/',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  CompanyInfoController.createCompanyInfo,
);
companyInfoRoute.patch(
  '/',
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  CompanyInfoController.updateCompanyInfo,
);
companyInfoRoute.get('/', CompanyInfoController.getCompanyInfo);
