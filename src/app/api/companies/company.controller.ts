import { NextRequest, NextResponse } from 'next/server'
import { CompanyService } from './company.service'
import { companyCreateSchema, companyUpdateSchema } from '@/lib/validations'
import { z } from 'zod'

export class CompanyController {
  static async getCompanies(): Promise<NextResponse> {
    try {
      const companies = await CompanyService.getAllCompanies()
      return NextResponse.json(companies)
    } catch (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }
  }

  static async getCompanyById(id: number): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid company ID' },
          { status: 400 }
        )
      }

      const company = await CompanyService.getCompanyById(id)
      
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(company)
    } catch (error) {
      console.error('Error fetching company:', error)
      return NextResponse.json(
        { error: 'Failed to fetch company' },
        { status: 500 }
      )
    }
  }

  static async createCompany(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = companyCreateSchema.parse(body)
      
      // Extrair userId do token de autenticação (assumindo que será passado)
      const userId = (request as any).user?.id
      
      const company = await CompanyService.createCompany(validatedData, userId)
      
      return NextResponse.json(company, { status: 201 })
    } catch (error) {
      console.error('Error creating company:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      )
    }
  }

  static async updateCompany(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid company ID' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = companyUpdateSchema.parse(body)
      
      // Extrair userId do token de autenticação
      const userId = (request as any).user?.id
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      const company = await CompanyService.updateCompany(id, validatedData, userId)
      
      return NextResponse.json(company)
    } catch (error) {
      console.error('Error updating company:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid data', details: error.errors },
          { status: 400 }
        )
      }

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to update company' },
        { status: 500 }
      )
    }
  }

  static async deleteCompany(id: number, userId: number): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid company ID' },
          { status: 400 }
        )
      }

      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const company = await CompanyService.deleteCompany(id, userId)
      
      return NextResponse.json(company)
    } catch (error) {
      console.error('Error deleting company:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to delete company' },
        { status: 500 }
      )
    }
  }

  static async getCompanyUsers(id: number, userId: number): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid company ID' },
          { status: 400 }
        )
      }

      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const users = await CompanyService.getCompanyUsers(id, userId)
      
      return NextResponse.json(users)
    } catch (error) {
      console.error('Error fetching company users:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch company users' },
        { status: 500 }
      )
    }
  }

  static async getCompanyLimits(id: number, userId: number): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid company ID' },
          { status: 400 }
        )
      }

      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Verificar se usuário tem acesso à empresa
      const hasAccess = await CompanyService.userHasCompanyAccess(id, userId)
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      const limits = await CompanyService.validateCompanyLimits(id)
      
      return NextResponse.json(limits)
    } catch (error) {
      console.error('Error fetching company limits:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch company limits' },
        { status: 500 }
      )
    }
  }
}