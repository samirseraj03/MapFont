import { Injectable } from '@angular/core';
import { SupabaseClientService } from '../data/supabase.client';
import { User, UserType } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class UserRepository {
  constructor(private client: SupabaseClientService) {}

  private get supabase() {
    return this.client.supabase;
  }

  async insertUser(newUser: User): Promise<any> {
    const { data, error } = await this.supabase.from('users').insert(newUser).select();
    if (error) { throw error; }
    return data[0].id;
  }

  async updateUser(userId: string, updatedUser: Partial<User>): Promise<any> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updatedUser)
      .eq('autencationUserID', userId)
      .select();
    if (error) { throw error; }
    return data;
  }

  async deleteUser(userId: number): Promise<any> {
    const { data, error } = await this.supabase.from('users').delete().eq('id', userId).select();
    if (error) { throw error; }
    return data;
  }

  async getUsers() {
    const { data, error } = await this.supabase.from('users').select('*');
    if (error) { throw error; }
    return data;
  }

  async getUser(authUserId: string) {
    const { data, error } = await this.supabase.from('users').select('*').eq('autencationUserID', authUserId);
    if (error) { throw error; }
    return data;
  }

  async getUserName(authUserId: string) {
    const { data, error } = await this.supabase.from('users').select('username').eq('autencationUserID', authUserId);
    if (error) { throw error; }
    return data;
  }

  async userExistsInDB(authUserId: string): Promise<boolean> {
    const { data, error } = await this.supabase.from('users').select('id').eq('autencationUserID', authUserId).limit(1);
    if (error || !data || data.length === 0) return false;
    return true;
  }

  async insertUserType(newUserType: UserType): Promise<any> {
    const { data, error } = await this.supabase.from('usertype').insert(newUserType).select();
    if (error) { throw error; }
    return data[0].id;
  }

  async updateUserType(userTypeId: number, updatedUserType: Partial<UserType>): Promise<any> {
    const { data, error } = await this.supabase.from('usertype').update(updatedUserType).eq('id', userTypeId).select();
    if (error) { throw error; }
    return data;
  }

  async deleteUserType(userTypeId: number): Promise<any> {
    const { data, error } = await this.supabase.from('usertype').delete().eq('id', userTypeId).select();
    if (error) { throw error; }
    return data;
  }

  async getUserTypes() {
    const { data, error } = await this.supabase.from('usertype').select('*');
    if (error) { throw error; }
    return data;
  }

  async getUserType(authUserId: string): Promise<any[]> {
    const { data, error } = await this.supabase.from('usertype').select('*').eq('autencationUserID', authUserId);
    if (error) { throw error; }
    return data || [];
  }
}
