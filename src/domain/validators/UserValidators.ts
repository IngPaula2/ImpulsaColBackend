export class UserValidators {
    // Validación de email (debe tener formato correcto con @)
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validación de contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
    static isValidPassword(password: string): boolean {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    // Validación de nombre completo (solo letras y espacios, mínimo 3 caracteres)
    static isValidFullName(fullName: string): boolean {
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;
        return nameRegex.test(fullName);
    }

    // Validación de tipo de documento (CC, CE, TI, PP)
    static isValidDocumentType(documentType: string): boolean {
        const validTypes = ['CC', 'CE', 'TI', 'PP'];
        return validTypes.includes(documentType);
    }

    // Validación de número de documento (solo números, entre 6 y 12 dígitos)
    static isValidDocumentNumber(documentNumber: string): boolean {
        const documentRegex = /^\d{6,12}$/;
        return documentRegex.test(documentNumber);
    }

    // Validación de teléfono (formato colombiano, 10 dígitos)
    static isValidPhone(phone: string): boolean {
        const phoneRegex = /^3\d{9}$/;
        return phoneRegex.test(phone);
    }

    // Validación de dirección (alfanumérico con espacios y #)
    static isValidAddress(address: string): boolean {
        const addressRegex = /^[a-zA-Z0-9\s#\-]{5,100}$/;
        return addressRegex.test(address);
    }

    // Validación de ciudad y departamento (solo letras y espacios)
    static isValidCityOrDepartment(name: string): boolean {
        const cityRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
        return cityRegex.test(name);
    }

    // Validación de fecha de nacimiento (debe ser mayor de 18 años)
    static isValidBirthDate(birthDate: Date): boolean {
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 >= 18;
        }
        
        return age >= 18;
    }

    // Método para validar todos los campos de una vez
    static validateUserData(userData: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validaciones requeridas
        if (!userData.email || !this.isValidEmail(userData.email)) {
            errors.push('El email no es válido');
        }

        if (!userData.password || !this.isValidPassword(userData.password)) {
            errors.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
        }

        // Validaciones opcionales (solo si el campo está presente)
        if (userData.full_name && !this.isValidFullName(userData.full_name)) {
            errors.push('El nombre completo solo debe contener letras y espacios (mínimo 3 caracteres)');
        }

        if (userData.document_type && !this.isValidDocumentType(userData.document_type)) {
            errors.push('El tipo de documento debe ser CC, CE, TI o PP');
        }

        if (userData.document_number && !this.isValidDocumentNumber(userData.document_number)) {
            errors.push('El número de documento debe tener entre 6 y 12 dígitos');
        }

        if (userData.phone && !this.isValidPhone(userData.phone)) {
            errors.push('El teléfono debe ser un número válido de 10 dígitos comenzando con 3');
        }

        if (userData.address && !this.isValidAddress(userData.address)) {
            errors.push('La dirección debe contener caracteres válidos');
        }

        if (userData.city && !this.isValidCityOrDepartment(userData.city)) {
            errors.push('La ciudad debe contener solo letras y espacios');
        }

        if (userData.department && !this.isValidCityOrDepartment(userData.department)) {
            errors.push('El departamento debe contener solo letras y espacios');
        }

        if (userData.birth_date && !this.isValidBirthDate(new Date(userData.birth_date))) {
            errors.push('Debe ser mayor de 18 años');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
} 