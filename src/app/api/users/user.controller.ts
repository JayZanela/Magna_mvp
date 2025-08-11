import { NextRequest, NextResponse } from 'next/server'
import { UserService } from './user.service'
import { userCreateSchema, userUpdateSchema } from '@/lib/validations'
import { z } from 'zod'

export class UserController {
  static async getUsers(): Promise<NextResponse> {
    try {
      const users = await UserService.getAllUsers()
      return NextResponse.json(users)
    } catch (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  }

  static async getUserById(id: number): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 400 }
        )
      }

      const user = await UserService.getUserById(id)
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(user)
    } catch (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      )
    }
  }

  static async createUser(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const validatedData = userCreateSchema.parse(body)
      
      const user = await UserService.createUser(validatedData)
      
      return NextResponse.json(user, { status: 201 })
    } catch (error) {
      console.error('Error creating user:', error)
      
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
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
  }

  static async updateUser(id: number, request: NextRequest): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const validatedData = userUpdateSchema.parse(body)
      
      const user = await UserService.updateUser(id, validatedData)
      
      return NextResponse.json(user)
    } catch (error) {
      console.error('Error updating user:', error)
      
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
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }
  }

  static async deleteUser(id: number): Promise<NextResponse> {
    try {
      if (!id || isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid user ID' },
          { status: 400 }
        )
      }

      const user = await UserService.deleteUser(id)
      
      return NextResponse.json(user)
    } catch (error) {
      console.error('Error deleting user:', error)

      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }
  }
}