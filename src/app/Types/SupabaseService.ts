import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';


export interface User {
    id?: number,
    location: any,
    username: string,
    email : string,
    name : string,
    lastNname : string,
    number : number,
    address :  string,
    photo : string,
    created_at : any ,
    password : string
}

export interface WaterSources {

    id?: number,
    location: any, 
    name : string,   
    address : string,
    isPotable : boolean,
    available : boolean,
    created_at : any,
    photo : string,
    description : string

}

export interface Forms {

    id?: number,
    username : string,   
    WaterSourcesName : string,
    created_at : any,
    location : any,
    photo: string,
    address : string,
    description: string,
    is_potable: boolean,
    WaterSourceType: string,
    approved: boolean
}


export interface UserType {
    id?: number,
    admin_role : boolean,
    user_role : boolean
}

export default class DatabaseService {
    private supabase: SupabaseClient;
    
    private SUPABASE_URL= environment.SUPABASE_URL
    private SUPABASE_KEY= environment.SUPABASE_KEY

   
    
    constructor() {

        const supabaseUrl = this.SUPABASE_URL;
        const supabaseKey = this.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Las variables de entorno SUPABASE_URL y SUPABASE_KEY deben estar definidas en el archivo .env');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async insertUser(newUser: User, location: Location): Promise<any> {
        try {
            // Insert location first
            const { data: insertedLocation, error: locationError } = await this.supabase
                .from('locations')
                .insert(location)
                .select('*');

            if (locationError) {
                throw locationError;
            } else {
                // Access the ID of the inserted location record
                // Assign the location ID to the new user
                newUser.location = insertedLocation[0].id;
                // Insert the new user
                const { data: insertedUser, error: userError } = await this.supabase
                    .from('users')
                    .insert(newUser)
                    .select();

                if (userError) {
                    throw userError;
                }

                console.log('User inserted:', insertedUser);
                return insertedUser[0].id;
            }
        } catch (error) {
            console.error('Error inserting user:', error);
        }
    }

    async updateUser(userId: number, updatedUser: User): Promise<any> {
        try {
            const { data: updatedUserData, error: updateError } = await this.supabase
                .from('users')
                .update(updatedUser)
                .eq('id', userId)
                .select();

            if (updateError) {
                throw updateError;
            }

            console.log('User updated:', updatedUserData);
            return updatedUserData;
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }

    async deleteUser(userId: number): Promise<any> {
        try {
            const { data: deletedUserData, error: deleteError } = await this.supabase
                .from('users')
                .delete()
                .eq('id', userId)
                .select();

            if (deleteError) {
                throw deleteError;
            }

            console.log('User deleted:', deletedUserData);
            return deletedUserData;
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }

    async insertWaterSource(newSource: WaterSources): Promise<any> {
        try {
            const { data: insertedSource, error: sourceError } = await this.supabase
                .from('watersources')
                .insert(newSource)
                .select();

            if (sourceError) {
                throw sourceError;
            }

            console.log('Water source inserted:', insertedSource);
            return insertedSource[0].id;
        } catch (error) {
            console.error('Error inserting water source:', error);
        }
    }

    async updateWaterSource(sourceId: number, updatedSource: WaterSources): Promise<any> {
        try {
            const { data: updatedSourceData, error: updateError } = await this.supabase
                .from('watersources')
                .update(updatedSource)
                .eq('id', sourceId)
                .select();

            if (updateError) {
                throw updateError;
            }

            console.log('Water source updated:', updatedSourceData);
            return updatedSourceData;
        } catch (error) {
            console.error('Error updating water source:', error);
        }
    }

    async deleteWaterSource(sourceId: number): Promise<any> {
        try {
            const { data: deletedSourceData, error: deleteError } = await this.supabase
                .from('watersources')
                .delete()
                .eq('id', sourceId)
                .select();

            if (deleteError) {
                throw deleteError;
            }

            console.log('Water source deleted:', deletedSourceData);
            return deletedSourceData;
        } catch (error) {
            console.error('Error deleting water source:', error);
        }
    }

    async insertForm(newForm: Forms): Promise<any> {
        try {
            const { data: insertedForm, error: formError } = await this.supabase
                .from('forms')
                .insert(newForm)
                .select();

            if (formError) {
                throw formError;
            }

            console.log('Form inserted:', insertedForm);
            return insertedForm[0].id;
        } catch (error) {
            console.error('Error inserting form:', error);
        }
    }

    async updateForm(formId: number, updatedForm: Forms): Promise<any> {
        try {
            const { data: updatedFormData, error: updateError } = await this.supabase
                .from('forms')
                .update(updatedForm)
                .eq('id', formId)
                .select();

            if (updateError) {
                throw updateError;
            }

            console.log('Form updated:', updatedFormData);
            return updatedFormData;
        } catch (error) {
            console.error('Error updating form:', error);
        }
    }

    async deleteForm(formId: number): Promise<any> {
        try {
            const { data: deletedFormData, error: deleteError } = await this.supabase
                .from('forms')
                .delete()
                .eq('id', formId)
                .select();

            if (deleteError) {
                throw deleteError;
            }

            console.log('Form deleted:', deletedFormData);
            return deletedFormData;
        } catch (error) {
            console.error('Error deleting form:', error);
        }
    }

    async insertUserType(newUserType: UserType): Promise<any> {
        try {
            const { data: insertedUserType, error: userTypeError } = await this.supabase
                .from('user_type')
                .insert(newUserType)
                .select();

            if (userTypeError) {
                throw userTypeError;
            }

            console.log('User type inserted:', insertedUserType);
            return insertedUserType[0].id;
        } catch (error) {
            console.error('Error inserting user type:', error);
        }
    }

    async updateUserType(userTypeId: number, updatedUserType: UserType): Promise<any> {
        try {
            const { data: updatedUserTypeData, error: updateError } = await this.supabase
                .from('user_type')
                .update(updatedUserType)
                .eq('id', userTypeId)
                .select();

            if (updateError) {
                throw updateError;
            }

            console.log('User type updated:', updatedUserTypeData);
            return updatedUserTypeData;
        } catch (error) {
            console.error('Error updating user type:', error);
        }
    }

    async deleteUserType(userTypeId: number): Promise<any> {
        try {
            const { data: deletedUserTypeData, error: deleteError } = await this.supabase
                .from('user_type')
                .delete()
                .eq('id', userTypeId)
                .select();

            if (deleteError) {
                throw deleteError;
            }

            console.log('User type deleted:', deletedUserTypeData);
            return deletedUserTypeData;
        } catch (error) {
            console.error('Error deleting user type:', error);
        }
    }


    async getUsers() {
        const { data: users, error } = await this.supabase
          .from('users')
          .select('*');
      
        if (error) {
          throw error;
        }
      
        console.log('Users retrieved:', users);
        return users; // Trust Supabase types
    }
 
    async getWaterSources() {
      try {
        const { data: waterSources, error } = await this.supabase
          .from('watersources')
          .select('*');
    
        if (error) {
          throw error;
        }
        return waterSources;
      } catch (error) {
        console.error('Error retrieving water sources:', error);
        return error;
      }
    }
    
    async getForms() {
      try {
        const { data: forms, error } = await this.supabase
          .from('forms')
          .select('*');
    
        if (error) {
          throw error;
        }
    
        console.log('Forms retrieved:', forms);
        return forms;
      } catch (error) {
        console.error('Error retrieving forms:', error);
        return error;
      }
    }
    
    async getUserTypes() {
      try {
        const { data: userTypes, error } = await this.supabase
          .from('user_type')
          .select('*');
    
        if (error) {
          throw error;
        }
    
        console.log('User types retrieved:', userTypes);
        return userTypes;
      } catch (error) {
        console.error('Error retrieving user types:', error);
        return error;
      }
    }
}











